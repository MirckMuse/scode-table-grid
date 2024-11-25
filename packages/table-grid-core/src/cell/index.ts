import type { ColKey, ColState } from "../col";
import type { RowKey, RowState } from "../row";

export interface Box {
  width: number;

  height: number;
}

export interface CellMeta extends Box {
  row_key: RowKey;

  col_key: ColKey;
}

// 高度怎么算？？虚拟滚动的情况下，跨分页、展开行的情况下，怎么展示。展开行优于合并行？
export interface MergedCellMeta extends CellMeta {
  x: number;

  y: number;

  row_span: number;

  col_span: number;
}

export class Cell {
  constructor(
    readonly row_state: RowState,
    readonly col_state: ColState,
    readonly meta: CellMeta,
  ) {}

  get height(): number {
    return this.meta.height;
  }

  get width(): number {
    return this.meta.width;
  }
}

// TODO: 当配置存在合并行时，需要使用该类
export class MergedCell {
  constructor(readonly meta: MergedCellMeta) {}

  // TODO:
  get height() {
    return 56;
  }

  // TODO:
  get width() {
    return 56;
  }
}
