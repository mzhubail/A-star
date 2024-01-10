import { Coordinates } from './app.component';

export const generatorsList = {
  'Uniform Distribution': uniformDistributionMaze,
  'Distance Based': distanceBasedMaze,
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

function mDistance([x1, y1]: Coordinates, [x2, y2]: Coordinates) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
