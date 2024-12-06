import type { TableHeaderCellProps } from "./typing";
import type { CSSProperties } from "react";
import { useRef } from "react";
import classNames from "classnames";
import ResizeHolder from "./ResizeHolder";

export default function (props: TableHeaderCellProps) {
  const { prefixCls, colKey, column, width, ellipsis } = props;

  const cellPrefixCls = prefixCls + "-cell";

  const cellRef = useRef<HTMLDivElement>(null);
  const cellClass = classNames({
    [cellPrefixCls]: true,
    // TODO:
  });
  const cellStyle: CSSProperties = {};

  // 表格内部
  const cellInnerRef = useRef<HTMLDivElement>(null);
  const cellInnerClass = classNames({});

  // FIXME:
  const text = column.title;
  // 列宽调整 holder
  const resizeHolder = column.resizable ? <ResizeHolder prefixCls={cellPrefixCls} colKey={colKey}></ResizeHolder> : null;

  return (
    <div ref={cellRef} className={cellClass} style={cellStyle}>
      <div ref={cellInnerRef} className={cellInnerClass}>
        <>
          {text}
          {resizeHolder}
        </>
      </div>
    </div>
  )
}