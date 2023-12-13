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
    this.xLim = this.grid[0].length;
    this.yLim = this.grid.length;

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
    const currentNode = this.lowestFScore(this.open_list)

    if (this.isGoal(currentNode))
      alert('Goal Found');

    this.neighboursOf(currentNode).forEach(neighbour => {
      const
        newGScore = currentNode.gScore + 1;
      
      let nNode;

      if (nNode = this.findPoint(neighbour, this.open_list)) {
        console.log(nNode);
      }
      // if newGScore < neighbourNode.g
    });
  }

  public lowestFScore(l: Node[]) {
    let min = l[0];
    l.forEach(node => {
      if (node.fScore < min.fScore)
        min = node;
    });
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
    // const x: number, y: number = this.helper(p);
    // console.log(this.helper(p));
    const { x, y } = p;
    let n: point[] = [];
    if (x > 0)
      n.push([x - 1, y]);
    if (x < this.xLim)
      n.push([x + 1, y]);
    if (y > 0)
      n.push([x, y - 1]);
    if (y < this.xLim)
      n.push([x, y + 1]);

    // console.log(n);
    return n;
  }

  // private helper(p: point | Node): [number, number] {
  //   let x, y;
  //   if (p instanceof Node) {
  //     console.log('instance of node');
  //     x = p.x;
  //     y = p.y;
  //   } else {
  //     console.log('not instance of node');
  //     x = p[0];
  //     y = p[1];
  //   }
  //   return [x, y];
  // }

  public isGoal(p: Node) {
    const [x, y] = this.goal;
    return p.x === x && p.y === y;
  }

  public findPoint(p: point, l: Node[]): Node | undefined {
    console.log(p);
    const [targetX, targetY] = p;
    return l.find(node => targetX === node.x  && targetY === node.y);
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
