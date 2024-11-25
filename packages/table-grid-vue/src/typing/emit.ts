import type { RawData, RowKey, FilterState, SorterState } from "@scode/table-grid-core";

export type TableEmit = {
  // 分页、筛选、排序操作后均会调用 change 事件
  (e: "change", option: ChangeOption): void;
  (e: "change:pagination", option: PaginationOption): void;
  (e: "change:filter", option: FilterState[]): void;
  (e: "change:sort", option: SorterState[]): void;
  (e: "expand", expanded: boolean, record: RawData): void;
  (e: "update:expandedRowKeys", expandedRows: RowKey[]): void;
  (e: "expandedRowsChange", expandedRows: RowKey[]): void;
}

export interface ChangeOption {
  pagination: PaginationOption;

  filters?: FilterState[];

  sorter?: SorterState[];

  currentDataSource: RawData[];
}

export interface PaginationOption {
  page: number,

  size: number
}