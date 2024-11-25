import type { RawData } from "@scode/table-grid-core";
import type { TableColumn } from ".";

// 表体单元格插槽
export type BodyCellSlot = (option: { title: any; column: TableColumn; text: unknown; record: RawData; index: number }) => unknown;

export interface TableSlot {
  // 格式化单元格
  bodyCell?: BodyCellSlot;
}
