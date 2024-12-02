import type { ColKey, RawData } from "@scode/table-grid-core";
import BodyRow from "./row";
import { useContext } from "react";
import { StateContext } from "../context";

interface BodyRowsProps {
  prefixCls: string;

  dataSource: RawData[];

  colKeys: ColKey[];

  grid: number[];

  isNestDataSource?: boolean;
}


export default function (props: BodyRowsProps) {
  const { dataSource, colKeys, grid, prefixCls } = props;
  const { tableState, mapToColumn } = useContext(StateContext);

  const getRowKey = tableState.config.get_row_key;
  const rowState = tableState.get_row_state();

  const columns = colKeys.map(colKey => {
    return {
      colKey,
      column: mapToColumn(colKey)
    }
  });

  function renderRow(record: RawData) {
    const rowKey = getRowKey(record);
    const rowMeta = rowState.get_meta_by_row_key(rowKey);
    return <BodyRow prefixCls={prefixCls} key={rowKey} rowKey={rowKey} meta={rowMeta} index={rowMeta?.index ?? -1} record={record} columns={columns} grid={grid}></BodyRow>
  }

  return (
    <>
      {dataSource.map(record => renderRow(record))}
    </>
  );
}