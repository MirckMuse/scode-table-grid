import type { RawData, RowKey } from "./row";
import type { ColKey } from "./col";

export interface Box {
  width: number;

  height: number;
}


// 获取行数据的 key
export type GetRowKey = (raw_data: RawData) => RowKey;

/// 参考 rust 的 Option
export type Option<T> = T | null | undefined;

export type Noop = () => void;

// 窗口可视区域
export interface IViewport extends Box {
}

// 滚动距离
export interface Scroll {
  top: number;

  left: number;
}

export interface Pagination {
  page: number;

  size: number;

  total: number;
}

// ================ 列配置 ================
export type Fixed = "left" | "right";

export type TableColumnSorter = boolean | ((a: RawData, b: RawData) => number);

export type TableColumnFilterValue = string | number;

// 表头筛选项的配置
export interface TableColumnFilter {
  value?: string[];

  onFilter?: (search: string[], row: RawData) => boolean;
}

/**
 * 表格列配置，key 和dataIndex 至少有一个必填
 */
export interface TableColumn {
  key: ColKey;

  width?: number;

  // 合并单元格
  col_span?: Option<number>;

  fixed?: boolean | Fixed;

  children?: TableColumn[];

  // 排序相关, TODO: 要不要整合在一块呢？？
  sorter?: TableColumnSorter;
  sortOrder?: string | null;
  sortDirections?: [string, string];

  filter?: TableColumnFilter;
}

export enum SorterDirection {
  Ascend = 'ascend',
  Descend = 'descend',
}

export interface SorterState {
  colKey: ColKey;

  direction?: SorterDirection;
}

// 筛选状态
export interface FilterState {
  // 列的 key
  colKey: ColKey;

  // 筛选值
  filterKeys?: TableColumnFilterValue[];

  // TODO: 待确认
  forceFilter?: boolean;
}
