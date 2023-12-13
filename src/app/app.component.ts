import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app';
  size = [10, 10];
  grid: number[][] = [];
  A: AStar;

  constructor() {
    // for (let i = 0; i < this.size[0]; i++) {
    //   let row = [];
    //   for (let j = 0; j < this.size[1]; j++)
    //     row.push(0);
    //   this.grid.push(row);
    // }
    this.grid = [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    ];


    this.A = new AStar(this.grid, [0, 0]);
    this.A.applyStep();
  }

  log() {
    console.log(this.grid);
  }

  applyStep() {
    this.A.applyStep();
  }

  /* Functionality of clicking a block. */
  blockClicked(x: number, y: number) {
    this.grid[y][x] = (this.grid[y][x] == 0) ? 1 : 0;
  }

  /* Determine block color for interface */
  blockColor(x: number, y: number) {
    // console.log(i,j, this.grid.length-1, this.grid[0].length-1,);
    if (x == 0 && y == 0)
      return 'cadetblue';
    if (
      x == this.grid[0].length - 1 &&
      y == this.grid.length - 1
    )
      return 'coral';

    if (this.A.findPoint([x, y], this.A.open_list))
      return 'lightgreen';
    if (this.A.findPoint([x, y], this.A.closed_list))
      return 'lightseagreen';

    return this.grid[y][x] === 0
      ? 'lightgray'
      : 'dimgray';
  }
}


class AStar {
  open_list: Node[] = [];
  closed_list: Node[] = [];
  // gScore: Map<Node, number> = new Map();
  goal: point;
  xLim: number;
  yLim: number;

  // nodesSet: Map<point, Node> = new Map();



  constructor(
    public grid: number[][],
    public start: point,
  ) {
    this.xLim = this.grid[0].length - 1;
    this.yLim = this.grid.length - 1;

    this.goal = [this.xLim, this.yLim];

    this.open_list.push({
      x: start[0],
      y: start[1],
      gScore: 0,
      fScore: this.hValue(start),
    });
  }

  public applyStep() {
    if (this.open_list.length === 0)
      return;
    const currentNode = this.popLowestFScore(this.open_list)

    if (this.isGoal(currentNode))
      alert('Goal Found');

    this.neighboursOf(currentNode).forEach(neighbour => {
      const newGScore = currentNode.gScore + 1;

      let nNode;

      // Search in open list
      if (nNode = this.findPoint(neighbour, this.open_list)) {
        console.log('In open list', nNode);
      }
      // Search in closed list
      else if (nNode = this.findPoint(neighbour, this.closed_list)) {
        console.log('In closed list', nNode);
      }
      else {
        this.open_list.unshift({
          x: neighbour[0],
          y: neighbour[1],
          gScore: newGScore,
          fScore: newGScore + this.hValue(neighbour),
        });
      }
    });

    this.closed_list.push(currentNode);
  }

  public popLowestFScore(l: Node[]) {
    let min = l[0], ind = 0;
    l.forEach((node, index) => {
      if (node.fScore < min.fScore) {
        min = node;
        ind = index;
      }
    });
    l.splice(ind, 1);
    return min;
  }

  public hValue(p: point | Node) {
    let x, y;
    if ('x' in p && 'y' in p) {
      x = p.x;
      y = p.y;
    } else {
      x = p[0];
      y = p[1];
    }
    return Math.abs(x - this.goal[0]) +
      Math.abs(y - this.goal[1]);
  }

  public neighboursOf(p: Node): point[] {
    const { x, y } = p;
    let n: point[] = [];
    if (x > 0)
      n.push([x - 1, y]);
    if (x < this.xLim)
      n.push([x + 1, y]);
    if (y > 0)
      n.push([x, y - 1]);
    if (y < this.yLim)
      n.push([x, y + 1]);

    n = n.filter(([x, y]) => this.grid[y][x] === 0);
    return n;
  }

  public isGoal(p: Node) {
    const [x, y] = this.goal;
    return p.x === x && p.y === y;
  }

  public findPoint(p: point, l: Node[]): Node | undefined {
    const [targetX, targetY] = p;
    return l.find(node => targetX === node.x && targetY === node.y);
  }
}

type point = [number, number];

interface Node {
  x: number,
  y: number,
  fScore: number,
  gScore: number,
}
// class Node {
//   constructor(
//     public x: number,
//     public y: number,
//     public fScore: number,
//     public gScore: number,
//   ) { }
// }
