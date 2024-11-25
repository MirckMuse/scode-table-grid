import type { Viewport, TableColumn as CoreTableColumn, ColKey, Option } from "@scode/table-grid-core";
import type { InjectionKey, ComputedRef, Ref } from "vue";
import type { TableColumn, TableProps } from "../typing";

import { TableState, uuid } from "@scode/table-grid-core";
import { computed, provide, inject, onMounted, shallowRef, ref, onUnmounted } from "vue";
import { noop } from "es-toolkit";

const TableStateKey: InjectionKey<ITableContext> = Symbol("__table_state__");



export interface ITableContext {
  tableState: Ref<TableState>;

  tableProps: Partial<TableProps>;

  isNestDataSource: ComputedRef<boolean>;

  mapToColumn: (colKey: ColKey) => TableColumn;
}

const DefaultViewport: Viewport = { width: 1920, height: 900 };

export function useStateProvide(props: TableProps) {
  const tableRef = shallowRef<HTMLElement>();

  // 创建表格状态。
  const _createTableState = (): TableState => {
    return TableState.create({
      config: {},
      viewport: DefaultViewport,
    });
  };

  const tableState = ref<TableState>(_createTableState());

  const $resize = new ResizeObserver((entry) => {
    const el = entry[0];
    const { width, height } = el.contentRect;
    tableState.value.update_viewport({ width, height });
  });

  onMounted(() => {
    if (!tableRef.value) return;

    // 更新 viewport 尺寸
    const { clientWidth, clientHeight } = tableRef.value;
    tableState.value.update_viewport({
      width: clientWidth,
      height: clientHeight,
    });

    $resize.observe(tableRef.value);
  });

  onUnmounted(() => {
    if (tableRef.value) {
      $resize.unobserve(tableRef.value);
    }
    $resize.disconnect();
  })

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
    tableState: tableState as Ref<TableState>,
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
    tableState: ref(),
    tableProps: {},
    isNestDataSource: computed(() => false),

    mapToColumn: noop as any
  });
}
