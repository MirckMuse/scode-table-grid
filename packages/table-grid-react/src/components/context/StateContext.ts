import type { ColKey, IViewport } from "@scode/table-grid-core";
import type { TableColumn, TableProps } from "../../typing"

import { TableState } from "@scode/table-grid-core";
import { createContext } from "react";
import { noop } from "es-toolkit";

type MapToColumn = (colKey: ColKey) => TableColumn;

interface IStateContext {
  tableState: TableState;

  tableProps: TableProps;

  isNestDataSource: boolean;

  viewport: IViewport,

  mapToColumn: (colKey: ColKey) => TableColumn;

  handleResizeColumn: (colKey: ColKey, new_width: number) => void;
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
  viewport: { width: 1960, height: 900 },
  isNestDataSource: false,
  mapToColumn: noop as unknown as MapToColumn,
  handleResizeColumn: noop
});
