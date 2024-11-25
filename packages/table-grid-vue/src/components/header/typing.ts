import type { ColKey } from "@scode/table-grid-core";
import type { TableColumn, TableColumnEllipsisObject } from "../../typing";

export interface TableHeaderProps {
  prefixCls: string;
}

export interface TableHeaderCellsProps {
  prefixCls: string;

  colKeys: ColKey[];

  flattenColKeys: ColKey[];

  mapToColumn: (colKeys: ColKey) => TableColumn;

  type?: string;
}

export interface TableHeaderCellProps {
  prefixCls: string;

  colKey: ColKey;

  column: TableColumn;

  width?: string | number;

  ellipsis?: TableColumnEllipsisObject;
}