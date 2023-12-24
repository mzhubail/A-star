import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';


type Mode = 'Change Block' | 'Change Start' | 'Change Goal' | 'Simulation';

type Coordinates = [number, number];

interface Node {
  x: number,
  y: number,
  fScore: number,
  gScore: number,
  cameFrom: Node | null,
  children: Node[],
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  grid: number[][] = [];
  A: AStar;
  mode: Mode = 'Change Block';

  constructor() {
    // let size = [10, 10];
    // for (let i = 0; i < size[0]; i++) {
    //   let row = [];
    //   for (let j = 0; j < size[1]; j++)
    //     row.push(0);
    //   this.grid.push(row);
    // }

    // Note that 1 represents obstacle and 0 represents a free block
    this.grid = [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    ];

    this.A = new AStar(
      this.grid,
      [0, 0],
      [this.grid[0].length - 1, this.grid.length - 1],
    );
  }

  log() {
    console.log(this.grid);
  }

  applyStep() {
    this.A.applyStep();
    this.mode = 'Simulation';
  }

  reset() {
    this.A = new AStar(this.grid, this.A.start, this.A.goal);
    this.mode = 'Change Block';
  }

  startMode() {
    this.mode = 'Change Start';
  }

  goalMode() {
    this.mode = 'Change Goal';
  }

  /* Functionality of clicking a block. */
  blockClicked(x: number, y: number) {
    if (this.mode == 'Simulation') {
      return;
    } else if (this.mode == 'Change Block') {
      this.grid[y][x] = this.grid[y][x] == 0 ? 1 : 0;
      this.A = new AStar(this.grid, this.A.start, this.A.goal);
    } else if (this.mode == 'Change Start') {
      this.A = new AStar(this.grid, [x, y], this.A.goal);
    } else if (this.mode == 'Change Goal') {
      this.A = new AStar(this.grid, this.A.start, [x, y]);
    }

    this.mode = 'Change Block';
  }

  /* Determine block color for interface */
  blockClass(x: number, y: number) {
    // Start node
    if (x == this.A.start[0] && y == this.A.start[1])
      return 'start-node';

    // Goal node
    if (x == this.A.goal[0] && y == this.A.goal[1])
      return 'goal-node';

    // Next node to discover
    if (this.A.currentPath[0].x === x && this.A.currentPath[0].y === y)
      return 'next-node';

    // Current path
    if (findNode([x, y], this.A.currentPath))
      return 'current-path';


    if (findNode([x, y], this.A.open_list))
      return 'open-node';
    if (findNode([x, y], this.A.closed_list))
      return 'closed-node';

    // Obstacles and free nodes
    return this.grid[y][x] === 0
      ? 'free'
      : 'obstacle-node';
  }


  /* Sorts a list of nodes.  Used in the interface for open list */
  sortNodesList(list: Node[]) {
    const _list = [...list];
    _list.sort((a, b) => {
      if (a.fScore > b.fScore)
        return 1;
      else if (a.fScore < b.fScore)
        return -1;
      else
        return 0;
    });
    return _list;
  }

  formatNode(n: Node): string {
    const { x, y, fScore, gScore } = n;
    return `\{ (${x}, ${y})  |  g = ${gScore}  |  f = ${fScore} \}`;
  }
}


class AStar {
  open_list: Node[] = [];
  closed_list: Node[] = [];

  currentPath!: Node[];

  // Upper limits on x and y values, based on the size of the grid
  xLim: number;
  yLim: number;
  foundGoal: boolean = false;

  constructor(
    public grid: number[][],
    public start: Coordinates,
    public goal: Coordinates,
  ) {
    this.xLim = this.grid[0].length - 1;
    this.yLim = this.grid.length - 1;

    // Push start node
    this.open_list.push({
      x: start[0],
      y: start[1],
      gScore: 0,
      fScore: this.hValue(start),
      cameFrom: null,
      children: [],
    });
    this.updateCurrentPath();
  }


  public applyStep() {
    if (this.open_list.length === 0 || this.foundGoal)
      return;
    const currentNode = this.popLowestFScore(this.open_list)

    if (this.isGoal(currentNode)) {
      alert('Goal Found');
      this.foundGoal = true;
      return;
    }

    this.neighboursOf(currentNode).forEach(neighbour => {
      const newGScore = currentNode.gScore + 1;

      let nNode;

      // Search in open list
      if (nNode = findNode(neighbour, this.open_list)) {
        // If the new path is cheaper than the current best path to nNode
        if (newGScore < nNode.gScore) {
          nNode.gScore = newGScore;
          nNode.fScore = newGScore + this.hValue(nNode);

          removeFromChildren(nNode, nNode.cameFrom);
          nNode.cameFrom = currentNode;

          currentNode.children.push(nNode);
        }
      }
      // Search in closed list
      else if (nNode = findNode(neighbour, this.closed_list)) {
        // If the new path is cheaper than the current best path to nNode
        if (newGScore < nNode.gScore) {
          console.log('In closed list', nNode, 'with better path');

          removeFromChildren(nNode, nNode.cameFrom);
          nNode.cameFrom = currentNode;

          updateNodeAndChildren(nNode.gScore - newGScore, nNode);
        }
      }
      else {
        // Note that the neighbour is added to the beginning of the open_list.
        // Thus when nodes have the same f-score the search prefers newly
        // introduced nodes.
        const node = {
          x: neighbour[0],
          y: neighbour[1],
          gScore: newGScore,
          fScore: newGScore + this.hValue(neighbour),
          // Set the current node as the parent
          cameFrom: currentNode,
          children: [],
        };

        this.open_list.unshift(node);
        currentNode.children.push(node);
      }
    });

    this.closed_list.push(currentNode);
    this.updateCurrentPath();
  }


  /* Remove the node with the lowest f-score from the list.
   *
   * Returns the node.
   */
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


  /* Returns the node with the lowest f-score from the list.
   *
   * Returns the node.
   */
  public getLowestFScore(l: Node[]) {
    let min = l[0], ind = 0;
    l.forEach((node, index) => {
      if (node.fScore < min.fScore) {
        min = node;
        ind = index;
      }
    });
    return min;
  }


  /* Calculate h-value vased on manhattan distance */
  public hValue(p: Coordinates | Node) {
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


  /* Find neighbours of a given node.
   *
   * Note that all values retured are withing the constraints of the grid and
   * are not obstracles.
   */
  public neighboursOf(p: Node): Coordinates[] {
    const { x, y } = p;
    let n: Coordinates[] = [];

    if (x > 0)
      n.push([x - 1, y]);
    if (x < this.xLim)
      n.push([x + 1, y]);
    if (y > 0)
      n.push([x, y - 1]);
    if (y < this.yLim)
      n.push([x, y + 1]);

    // Filter out obstacles
    n = n.filter(([x, y]) => this.grid[y][x] === 0);

    return n;
  }


  /* Check goal node */
  private isGoal(p: Node) {
    const [x, y] = this.goal;
    return p.x === x && p.y === y;
  }


  private updateCurrentPath() {
    let head = this.getLowestFScore(this.open_list);
    const path = [head];
    while (head.cameFrom !== null) {
      path.push(head.cameFrom);
      head = head.cameFrom;
    }

    this.currentPath = path;
  }


  public hasNoNextStep(): boolean {
    return this.open_list.length === 0 || this.foundGoal;
  }
}



/* Search for given coordinate withing a list, and return the node
  * corresponding to it.
  */
function findNode(p: Coordinates, l: Node[]): Node | undefined {
  const [targetX, targetY] = p;
  return l.find(node => targetX === node.x && targetY === node.y);
}

function removeFromChildren(targetNode: Node, l: Node | null) {
  const { x, y } = targetNode;
  if (!l)
    return;
  l.children = l.children.filter(node => x !== node.x || y !== node.y);
  return;
}

function updateNodeAndChildren(delta: number, n: Node) {
  // Update node
  n.gScore -= delta;
  n.fScore -= delta;

  // Update children
  n.children.forEach(childNode => {
    updateNodeAndChildren(delta, childNode);
  });
}
