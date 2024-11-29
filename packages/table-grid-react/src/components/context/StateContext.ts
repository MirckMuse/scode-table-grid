import { TableState, type ColKey, type Option } from "@scode/table-grid-core";
import { createContext } from "react";
import type { TableColumn, TableProps } from "../../typing"
import { noop } from "es-toolkit";

type MapToColumn = (colKey: ColKey) => TableColumn;

interface IStateContext {
  tableState: TableState;

  tableProps: TableProps;

  isNestDataSource: boolean;

  mapToColumn: (colKey: ColKey) => TableColumn;
}

// 创建表格状态。
const _createTableState = (): TableState => {
  return TableState.create({
    config: {},
    viewport: { width: 1920, height: 900 },
  });
};

export const StateContext = createContext<IStateContext>({
  tableState: _createTableState(),
  tableProps: {},
  isNestDataSource: false,
  mapToColumn: noop as unknown as MapToColumn
});
