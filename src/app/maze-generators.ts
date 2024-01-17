import { Coordinates } from './app.component';

export const generatorsList = {
  'Uniform Distribution': uniformDistributionMaze,
  'Distance Based': distanceBasedMaze,
  'Recursive Backtracking': recursiveBacktrackingMaze,
};

export function uniformDistributionMaze(width: number, height: number) {
  let newGrid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => (Math.random() < 0.3 ? 1 : 0)),
  );
  newGrid[0][0] = 0;
  newGrid[newGrid.length - 1][newGrid[0].length - 1] = 0;
  return newGrid;
}

export function distanceBasedMaze(width: number, height: number) {
  const maxDist = (height + width) / 2 - 1,
    minDist = 0;
  // console.log(maxDist, minDist);

  let newGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const merit = Math.min(
        mDistance([x, y], [0, 0]),
        mDistance([x, y], [width - 1, height - 1]),
      );
      const threshold = (merit - minDist) / (maxDist - minDist) / 2.5;

      // console.log(threshold);
      return Math.random() < threshold ? 1 : 0;
    }),
  );

  return newGrid;
}

export function recursiveBacktrackingMaze(width: number, height: number) {
  const gen = new rbGenerator(width, height);
  return gen.generateMaze();
}

export class rbGenerator {
  width: number;
  height: number;
  tree!: RBNode;
  closed_list!: Coordinates[];

  constructor(public _width: number, public _height: number) {
    if (_width % 2 == 0 || _height % 2 == 0) {
      alert('Both grid width and height have to be odd');
      throw new Error('Invalid dimensions');
    }
    this.width = Math.floor(_width / 2);
    this.height = Math.floor(_height / 2);
  }

  public generateMaze() {
    this.tree = { x: 0, y: 0, _children: [] };
    this.closed_list = [];
    const stack: RBNode[] = [this.tree];

    while (stack.length !== 0) {
      const current = stack[stack.length - 1];

      const neighbour = this.getRandomNeighbour(current.x, current.y);
      if (neighbour === null) {
        // console.log('Popped', current);
        stack.pop();
      } else {
        // console.log('Appending neighbour', neighbour);
        const [x, y] = neighbour;
        const node = {
          x: x,
          y: y,
          _children: [],
        };

        current._children.push(node);
        stack.push(node);
        this.closed_list.push([x, y]);
      }

      // if (neighbour) console.log(neighbour, this.tree);
    }

    let grid = Array.from({ length: this._height }, () =>
      Array.from({ length: this._width }, () => 1),
    );

    this.traverseTree(this.tree, (node, parent) => {
      const { x, y } = node;
      const _x = x + parent.x,
        _y = y + parent.y;
      grid[2 * y][2 * x] = 0;
      grid[_y][_x] = 0;
    });

    // Clear around goal and start nodes
    grid[0][0] = 0;
    grid[1][0] = 0;
    grid[0][1] = 0;
    grid[1][1] = 0;
    grid[this._width - 1][this._height - 1] = 0;
    grid[this._width - 2][this._height - 1] = 0;
    grid[this._width - 1][this._height - 2] = 0;
    grid[this._width - 2][this._height - 2] = 0;

    return grid;
  }

  traverseTree(head: RBNode, consume: (node: RBNode, parent: RBNode) => void) {
    head._children.forEach(node => {
      consume(node, head);
      this.traverseTree(node, consume);
    });
  }

  private getRandomNeighbour(x: number, y: number): Coordinates | null {
    let n: Coordinates[] = [];

    if (x > 0) {
      n.push([x - 1, y]);
    }
    if (x < this.width) {
      n.push([x + 1, y]);
    }
    if (y > 0) {
      n.push([x, y - 1]);
    }
    if (y < this.height) {
      n.push([x, y + 1]);
    }

    // Filter out visited points
    n = n.filter(p => !this.pointInClosedList(p));

    return n.length === 0 ? null : n[Math.floor(Math.random() * n.length)];
  }

  private pointInClosedList([x1, y1]: Coordinates): boolean {
    return (
      this.closed_list.findIndex(([x2, y2]) => x1 == x2 && y1 == y2) !== -1
    );
  }
}

interface RBNode {
  x: number;
  y: number;
  _children: RBNode[];
}

function mDistance([x1, y1]: Coordinates, [x2, y2]: Coordinates) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
