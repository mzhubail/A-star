// Seeds
// Proper maze generation
//    - Add deforming code
//    - Add hunt algorithm
// Number of iterations
// Cost of best path

export function somethingMaze(width: number, height: number) {
  const maxDist = height + width - 2,
    minDist = distance([0, 0], [height - 1, width - 1]);
  // console.log(maxDist, minDist);

  const tList: number[] = [];
  let newGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const merit =
        distance([x, y], [0, 0]) + distance([x, y], [width - 1, height - 1]);
      const threshold = (merit - minDist) / (maxDist - minDist);
      // console.log([x, y], merit);
      tList.push(merit);

      // console.log(threshold);
      return Math.random() < threshold ? 1 : 0;
      return Math.random() < 0.3 ? 1 : 0;
    }),
  );
  console.log(
    tList.reduce((x, y) => Math.min(x, y)),
    tList.reduce((x, y) => Math.max(x, y)),
  );

  return newGrid;
}

    // grid = grid.map(row =>
    //   row.map(block => {
    //     if (block === 0) {
    //       return Math.random() < 0.9 ? 0 : 1;
    //     } else {
    //       return Math.random() < 0.75 ? 1 : 0;
    //     }
    //   }),
    // );
