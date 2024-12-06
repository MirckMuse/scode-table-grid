import { useContext, useRef, type CSSProperties } from "react";
import type { TableHeaderProps } from "./typing";
import classNames from "classnames";
import { StateContext } from "../context";
import HeaderCells from "./cells";

export function TableHeader(props: TableHeaderProps) {
  const { prefixCls } = props;

  const { tableState, tableProps, mapToColumn } = useContext(StateContext);

  const tableHeaderRef = useRef<HTMLDivElement>(null);
  const tableHeaderClass = classNames({
    [prefixCls]: true,
  });

  const { last_center_col_keys, last_left_col_keys, last_right_col_keys, config } = tableState;

  const colState = tableState.get_col_state();

  const tableHeaderStyle = {};

  // 表格中间
  const tableHeaderCenterRef = useRef<HTMLDivElement>(null);
  const centerColumnsClass = classNames({
    [`${prefixCls}__inner-center`]: true
  });
  const centerColumnsStyle = (() => {
    const deepest = colState.get_deepest() + 1;
    const { last_center_col_keys, config } = tableState;

    const style: CSSProperties = {};
    style.paddingLeft = colState.get_reduce_width(last_left_col_keys) + 'px';
    style.gridTemplateRows = "repeat(" + deepest + ", 52px)";
    style.gridTemplateColumns = last_center_col_keys
      .map(colKey => {
        return (colState.get_meta(colKey)?.width ?? config.col_width) + 'px';
      })
      .join(' ');

    return style;
  })();

  let fixedLeftHeader = null;

  if (last_left_col_keys.length) {
    const leftColumnsClass = classNames({
      [`${tableProps.prefixCls}-fixedLeft`]: true,
      [`${prefixCls}__inner-fixedLeft`]: true,
      // shadow: tableState.value.scroll.left > 0
    })

    const leftColumnsStyle = (() => {
      const deepest = colState.get_deepest() + 1;
      return {
        gridTemplateRows: "repeat(" + deepest + ", 52px)",
        gridTemplateColumns: last_left_col_keys
          .map(colKey => {
            return (colState.get_meta(colKey)?.width ?? config.col_width) + 'px';
          })
          .join(' ')
      };
    })();
    fixedLeftHeader = (
      <div className={leftColumnsClass} style={leftColumnsStyle}>
        <HeaderCells prefixCls={prefixCls} colKeys={last_left_col_keys} flattenColKeys={tableState.left_col_keys} mapToColumn={mapToColumn}></HeaderCells>
      </div>
    )
  }

  return (
    <div ref={tableHeaderRef} className={tableHeaderClass} style={tableHeaderStyle}>
      <div className={prefixCls + '__inner'}>

        {fixedLeftHeader}

        <div ref={tableHeaderCenterRef} className={centerColumnsClass} style={centerColumnsStyle}>
          <HeaderCells prefixCls={prefixCls} colKeys={tableState.last_center_col_keys} flattenColKeys={tableState.center_col_keys} mapToColumn={mapToColumn}></HeaderCells>
        </div>
      </div>
    </div>
  )
}