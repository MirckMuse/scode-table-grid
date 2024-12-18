import type { RawData } from "@scode/table-grid-core";
import type { TableColumn } from ".";

export interface BodyCellRenderOption {
  title: any;
  column: TableColumn;
  text: unknown;
  record: RawData;
  index: number
}

// 表体单元格插槽
export type BodyCellRender = (option: BodyCellRenderOption) => unknown;

// 展开行的插槽
export type ExpandedRowRender = (record: RawData, index: number, indent: number, expanded: boolean) => unknown;

export interface TableSlots {
  // 格式化单元格
  bodyCell?: BodyCellRender;

  expandedRow?: ExpandedRowRender;
}
