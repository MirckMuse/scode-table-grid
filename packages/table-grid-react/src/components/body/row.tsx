import type { ColKey, Option, RawData, RowKey, RowMeta } from "@scode/table-grid-core";
import type { TableColumn } from "../../typing";
import { useRef } from "react";
import TableCell from "./cell";

type ColumnWrapper = { colKey: ColKey, column: TableColumn };

interface TableRowProps {
  prefixCls: string;

  rowKey: RowKey;

  meta: Option<RowMeta>;

  index: number;

  columns: ColumnWrapper[];

  record: RawData;

  grid: number[];

  isHover?: boolean;
}

export default function (props: TableRowProps) {
  const { prefixCls, rowKey, meta, index, columns, record, grid } = props;

  const rowRef = useRef<HTMLDivElement>(null);
  const rowStyle = {
    gridTemplateColumns: grid.map(w => w + 'px').join(" ")
  }

  function renderCell({ colKey, column }: ColumnWrapper) {
    return <TableCell prefixCls={prefixCls} key={colKey} column={column} record={record} rowIndex={index} rowKey={rowKey} colKey={colKey} deep={meta?.deep ?? 0}></ TableCell>
  }

  return (
    <div className={prefixCls + "-row"} ref={rowRef} style={rowStyle} data-row-index={index} data-row-key={rowKey}>
      {columns.map(column => renderCell(column))}
    </div>
  )
}