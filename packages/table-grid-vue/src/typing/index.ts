import type { ColKey, RawData } from "@scode/table-grid-core";
import type { VNode } from "vue";
import type { TableSlots } from "./slot";

export * from "./emit";

export * from "./inherit";

export * from "./slot";

export type TablePaginationProps = {
  vertical?: "top" | "bottom";

  horizontal?: "left" | "right";

  // 当前分页位置
  current?: number;

  // 分页大小
  pageSize?: number;

  // 数据总量
  total?: number;
};

export interface InternalTableRef {
  // 暴露的事件
  event: any;
}

export type TransformCellText = (option: { text: any; column: TableColumn; record: RawData; index: number }) => any;

export interface TableScroll {
  position: "inner" | "outer";

  mode: "always" | "hover";

  size: number;
}

export interface TableProps extends TableSlots {
  prefixCls?: string;

  pagination?: Partial<TablePaginationProps> | boolean;

  bordered?: boolean;

  dataSource?: RawData[];

  rowChildrenName?: string;

  transformCellText?: TransformCellText;

  columns?: TableColumn[];

  scroll?: Partial<TableScroll>;

  customRow?: CustomRow;

  rowClassName?: RowClassName;
}

export type CustomRow = (record: RawData, index: number) => any;

export type RowClassName = (record: RawData, index: number) => string | undefined;

export type TableColumnAlign = "left" | "right" | "center";

export type TableColumnFixed = "left" | "right";

export type TableColumnTitle = string | (() => unknown);

export type TableColumnSorter = boolean | ((a: RawData, b: RawData) => number);

export type TableColumnEllipsisObject = {
  showTitle?: boolean;

  showTooltip?: boolean;
};

export type TableColumnEllipsis = boolean | TableColumnEllipsisObject;

interface CustomOption {
  record: RawData;

  index: number;

  column: Readonly<TableColumn>;
}

export interface CustomCellOption extends CustomOption { }

export type CustomCell = (option: CustomCellOption) => Record<string, any> & { colSpan?: number; rowSpan?: number };

export type BaseValue = string | number | boolean | undefined | null;

export type CustomRenderResult = BaseValue | VNode;

export interface CustomRenderOption extends CustomOption {
  text: unknown;
}

export type CustomRender = (
  option: CustomRenderOption,
) => CustomRenderResult | CustomRenderResult[] | undefined | null;

export type TableColumnFilterMode = "menu" | "tree";
export type TableColumnFilterSearchFn = (
  search: string,
  option: TableColumnFilterOption,
) => boolean;

export type TableColumnFilterSearch = boolean | TableColumnFilterSearchFn;

export type TableColumnFilterValue = string | number;

export interface TableColumnFilterOption {
  label: TableColumnFilterValue | VNode | (() => VNode);

  value: TableColumnFilterValue;

  title?: string;

  children?: TableColumnFilterOption[];
}
export interface TableColumnFilter {
  filtered?: boolean;

  filterDropdown?: VNode | ((props: TableColumnFilter) => VNode);

  open?: boolean;

  value?: string[];

  icon?: VNode | ((props: TableColumnFilter) => VNode);

  // 默认 tree
  mode?: TableColumnFilterMode;

  multiple?: boolean;

  search?: TableColumnFilterSearch;

  options?: TableColumnFilterOption[];

  onFilter?: (search: string, row: RawData) => boolean;

  onOpenChange?: (visible: boolean) => void;

  resetToDefaultFilteredValue?: boolean;

  defaultFilteredValue?: TableColumnFilterValue[];
}

/**
 * 表格列配置，key 和dataIndex 至少有一个必填
 */
export interface TableColumn<T = RawData> {
  key?: ColKey;

  dataIndex?: string;

  align?: TableColumnAlign;

  title?: TableColumnTitle;

  minWidth?: number;

  width?: number;

  maxWidth?: number;

  // 合并单元格
  colSpan?: number;

  ellipsis?: TableColumnEllipsis;

  fixed?: boolean | TableColumnFixed;

  resizable?: boolean;

  children?: TableColumn<T>[];

  /**
   * 是否可展开
   */
  expandable?: boolean;

  customCell?: CustomCell;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  customHeaderCell?: (column: TableColumn<T>) => Record<string, any>;

  customRender?: CustomRender;

  // 排序相关, TODO: 要不要整合在一块呢？？
  sorter?: TableColumnSorter;

  sortOrder?: string | null;
  sortDirections?: [string, string];
  showSorterTooltip?: boolean;

  filter?: TableColumnFilter;
}
