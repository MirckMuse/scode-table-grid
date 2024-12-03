import type { ColKey, TableColumn as CoreTableColumn, IViewport } from "@scode/table-grid-core";
import type { ComputedRef, InjectionKey, ShallowRef } from "vue";
import type { TableColumn, TableProps } from "../typing";

import { TableState, createLockedRequestAnimationFrame, uuid } from "@scode/table-grid-core";
import { debounce, noop } from "es-toolkit";
import { computed, inject, provide, shallowRef, triggerRef } from "vue";

const TableStateKey: InjectionKey<ITableContext> = Symbol("__table_state__");

export interface ITableContext {
  tableState: ShallowRef<TableState>;

  tableProps: Partial<TableProps>;

  isNestDataSource: ComputedRef<boolean>;

  mapToColumn: (colKey: ColKey) => TableColumn;

  handleResizeColumn: (colKey: ColKey, new_width: number) => void;
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

  let userSelectState = {
    pre: "",
    isSet: false,
  };
  const revertTableUserSelect = debounce(() => {
    userSelectState.isSet = false;
    if (!tableRef.value) return;
    tableRef.value.style.userSelect = userSelectState.pre;
  }, 60);

  const animationUpdate = createLockedRequestAnimationFrame(() => {
    tableState.value.reset_content_box_width();

    triggerRef(tableState);
  });

  const handleResizeColumn = (colKey: ColKey, resizedWidth: number) => {
    if (!userSelectState.isSet && tableRef.value) {
      userSelectState.pre = tableRef.value.style.userSelect ?? "";
      userSelectState.isSet = true;
      tableRef.value.style.userSelect = "none";
    }

    // props.onResizeColumn?.(resizedWidth, column);
    revertTableUserSelect();

    const colState = tableState.value.get_col_state();

    if (colKey) {
      colState.update_col_width(colKey, resizedWidth);
    }

    animationUpdate();
  }

  provide(TableStateKey, {
    tableState: tableState as ShallowRef<TableState>,
    tableProps: props,
    isNestDataSource,
    mapToColumn: (colKey: ColKey) => _columnMap.get(colKey),
    handleResizeColumn
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
    mapToColumn: noop as any,
    handleResizeColumn: noop
  });
}
