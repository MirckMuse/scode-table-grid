import type { ColKey, TableColumn as CoreTableColumn, IViewport } from "@scode/table-grid-core";
import type { ComputedRef, InjectionKey, ShallowRef } from "vue";
import type { TableColumn, TableProps } from "../typing";

import { TableState, uuid } from "@scode/table-grid-core";
import { noop } from "es-toolkit";
import { computed, inject, provide, shallowRef } from "vue";

const TableStateKey: InjectionKey<ITableContext> = Symbol("__table_state__");

export interface ITableContext {
  tableState: ShallowRef<TableState>;

  tableProps: Partial<TableProps>;

  isNestDataSource: ComputedRef<boolean>;

  mapToColumn: (colKey: ColKey) => TableColumn;
}

const DefaultViewport: IViewport = { width: 1920, height: 900 };

export function useStateProvide(props: TableProps) {
  const tableRef = shallowRef<HTMLElement>();

  // 创建表格状态。
  const _createTableState = (): TableState => {
    return TableState.create({
      config: {},
      viewport: DefaultViewport,
    });
  };

  const tableState = shallowRef<TableState>(_createTableState());


  const _columnMap = new Map();
  function updateColumns(columns: TableColumn[]) {
    _columnMap.clear();

    const _process = (columns: TableColumn[]): CoreTableColumn[] => {
      const _columns: CoreTableColumn[] = [];
      for (const column of columns) {
        const colKey = column.key ?? uuid();
        _columnMap.set(colKey, column);
        const _column: CoreTableColumn = {
          key: colKey,
          width: column.width,
          col_span: column.colSpan,
          fixed: column.fixed,
          children: column.children ? _process(column.children) : undefined
        }

        _columns.push(_column);
      }

      return _columns;
    }

    tableState.value.update_columns(_process(columns));
  }

  // 是否存在嵌套数据源
  const isNestDataSource = computed(() => {
    const { dataSource = [], rowChildrenName = "children" } = props;

    return dataSource.some(rawData => {
      const children = rawData?.[rowChildrenName];

      return Array.isArray(children) && children.length;
    });
  });

  provide(TableStateKey, {
    tableState: tableState as ShallowRef<TableState>,
    tableProps: props,
    isNestDataSource,
    mapToColumn: (colKey: ColKey) => _columnMap.get(colKey)
  });

  return {
    tableRef,
    tableState,
    updateColumns
  };
}

export function useStateInject() {
  return inject(TableStateKey, {
    tableState: shallowRef(),
    tableProps: {},
    isNestDataSource: computed(() => false),

    mapToColumn: noop as any
  });
}
