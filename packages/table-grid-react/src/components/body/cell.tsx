import type { ColKey, RawData, RowKey, Option } from "@scode/table-grid-core";
import type { TableColumn } from "../../typing"
import { useRef } from "react";
import classNames from "classnames";
import { isNil } from "es-toolkit";
import { get } from "es-toolkit/compat";

interface TableCellProps {
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

function getText(column: TableColumn, record: RawData): Option<unknown> {
  if (!column?.dataIndex) return null;

  if (isNil(record)) return null;

  return get(record, column?.dataIndex, null);
}

export default function (props: TableCellProps) {
  const { prefixCls, column, record, rowIndex, rowKey, deep, indentSize, isMergedCell } = props;
  const cellPrefixCls = prefixCls + "-cell";

  const cellRef = useRef<HTMLDivElement>(null);
  const cellClass = classNames({
    [cellPrefixCls]: true,
    [cellPrefixCls + "__merged"]: isMergedCell
  });

  const cellInnerRef = useRef<HTMLDivElement>(null);
  const cellInnerClass = classNames({
    [cellPrefixCls + "__inner"]: true,
  });

  const text = getText(column, record);

  return (
    <div ref={cellRef} className={cellClass}>
      <div ref={cellInnerRef} className={cellInnerClass}>
        {text}
      </div>
    </div>
  )
}