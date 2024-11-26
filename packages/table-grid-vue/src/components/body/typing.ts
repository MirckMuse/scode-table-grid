import type { ColKey, RawData, RowKey } from "@scode/table-grid-core";
import type { BodyCellInheritProps, TableColumn } from "../../typing";

export interface TableBodyCellProps extends BodyCellInheritProps {
  prefixCls: string;

  column: TableColumn;

  record: RawData;

  rowIndex: number;

  rowKey: RowKey;

  colKey: ColKey;

  deep: number;

  indentSize?: string | number;

  isMergedCell?: boolean;
}