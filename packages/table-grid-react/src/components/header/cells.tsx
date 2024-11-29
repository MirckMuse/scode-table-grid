import type { CSSProperties } from "react";
import type { TableHeaderCellsProps } from "./typing";
import type { TableColumnEllipsisObject } from "../../typing"

import { useContext } from "react";
import { StateContext } from "../context";
import HeaderCell from "./cell";

export default function (props: TableHeaderCellsProps) {
  const { flattenColKeys, mapToColumn, prefixCls } = props;

  const { tableState } = useContext(StateContext);

  const colState = tableState.get_col_state();


  const columnBinds = flattenColKeys.reduce<any[]>((binds, colKey) => {
    const column = mapToColumn(colKey);
    if (typeof column.colSpan === "number" && column.colSpan <= 0) {
      return binds
    }

    const style: CSSProperties = {};
    const meta = colState.get_meta(colKey);
    const dataset: any = {};
    if (meta) {
      const {
        row_span = 1,
        col_span = 1,
        is_leaf,
        key
      } = meta;
      dataset["data-col-key"] = key;
      style.gridColumn = `span ${col_span}`;
      style.gridRow = `span ${row_span}`;

      if (is_leaf) {
        dataset["data-isLeaf"] = "true"
      }
    }

    binds.push({
      column,
      style,
      colKey,
      ellipsis: column.ellipsis as TableColumnEllipsisObject | undefined,
      prefixCls: prefixCls,
      ...dataset
    });

    return binds;
  }, []);

  return (
    <>
      {columnBinds.map(bind => {
        return <HeaderCell key={bind.colKey} {...bind}></HeaderCell>
      })}
    </>
  );
}