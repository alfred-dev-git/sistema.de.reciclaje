declare module "density-clustering" {
  export class DBSCAN {
    run(
      dataset: number[][],
      eps: number,
      minPts: number
    ): number[][];
  }
}
