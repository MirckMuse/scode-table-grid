import type { Box, ColKey, TableColumn as CoreTableColumn, IViewport, Scroll } from "@scode/table-grid-core";
import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { TableColumn, TableProps } from "../typing";

import { TableState, createLockedRequestAnimationFrame, uuid } from "@scode/table-grid-core";
import { debounce, noop } from "es-toolkit";
import { computed, inject, provide, reactive, ref, shallowRef } from "vue";
import { DefaultLayoutGrid, useLayout, type LayoutGrid } from "./useLayout";
import { useSorter } from "./useSorter";
import { useEvent } from "./useEvent";

const TableStateKey: InjectionKey<ITableContext> = Symbol("__table_state__");

export interface ITableContext {
  tableState: TableState;

  tableProps: Partial<TableProps>;

  isNestDataSource: ComputedRef<boolean>;

  mapToColumn: (colKey: ColKey) => TableColumn;

  handleResizeColumn: (colKey: ColKey, new_width: number) => void;

  scroll: Ref<Scroll>;
  updateScroll: (scroll: Partial<Scroll>) => void;
  hScrollbarVisible: ComputedRef<boolean>;
  vScrollbarVisible: ComputedRef<boolean>;

  viewport: Ref<IViewport>,
  updateViewport: (viewport: Partial<IViewport>) => void;

  contentBox: ComputedRef<Box>;

  layoutGrid: LayoutGrid;
}

const DefaultViewport: IViewport = { width: 1920, height: 900 };


// 创建表格状态。
const _createTableState = (): TableState => {
  return TableState.create({
    config: {},
    viewport: DefaultViewport,
  });
};

export function useStateProvide(props: TableProps) {
  const tableRef = shallowRef<HTMLElement>();

  const tableState = _createTableState();

  const { event } = useEvent();

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
          dataIndex: column.dataIndex,
          width: column.width,
          col_span: column.colSpan,
          fixed: column.fixed,
          children: column.children ? _process(column.children) : undefined
        }

        _columns.push(_column);
      }

      return _columns;
    }
    tableState.update_columns(_process(columns));

    updateLayoutGrid();
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

  const { layoutGrid, updateLayoutGrid, updateColLayoutGrid } = useLayout(tableState);

  useSorter(tableState, {
    resetScroll,
    resetDataSource: () => event.resetDatasource?.()
  });

  const animationUpdate = createLockedRequestAnimationFrame(() => {
    tableState.reset_content_box_width();

    updateColLayoutGrid();
  });

  const handleResizeColumn = (colKey: ColKey, resizedWidth: number) => {
    if (!userSelectState.isSet && tableRef.value) {
      userSelectState.pre = tableRef.value.style.userSelect ?? "";
      userSelectState.isSet = true;
      tableRef.value.style.userSelect = "none";
    }

    // props.onResizeColumn?.(resizedWidth, column);
    revertTableUserSelect();

    const colState = tableState.get_col_state();

    if (colKey) {
      colState.update_col_width(colKey, resizedWidth);
    }

    animationUpdate();
  }

  // 可见视图
  const viewport = ref({
    width: tableState.viewport.width,
    height: tableState.viewport.height
  });
  const animationUpdateViewport = createLockedRequestAnimationFrame((new_viewport: IViewport) => {
    tableState.update_viewport(new_viewport);
  });
  const updateViewport = (new_viewport: Partial<IViewport>) => {
    animationUpdateViewport(Object.assign(viewport.value, new_viewport));
  };

  // TODO: 内容高度, 一个计算的内容高度
  const contentBox = computed(() => tableState.content_box);

  // 滚动条
  const scroll = ref<Scroll>({ top: 0, left: 0 });
  const hScrollbarVisible = computed(() => contentBox.value.width > viewport.value.width);
  const vScrollbarVisible = computed(() => contentBox.value.height > viewport.value.height);
  const animationUpdateScroll = createLockedRequestAnimationFrame((new_scroll: Scroll) => {
    tableState.update_scroll(new_scroll);
    tableState.adjust_scroll();
  });
  const updateScroll = (new_scroll: Partial<Scroll>) => {
    animationUpdateScroll(Object.assign(scroll.value, new_scroll));
  };

  function resetScroll() {
    const { top, left } = tableState.scroll;
    scroll.value = { top, left }
  }

  provide(TableStateKey, {
    tableState: tableState,
    tableProps: props,
    isNestDataSource,
    mapToColumn: (colKey: ColKey) => _columnMap.get(colKey),
    handleResizeColumn,

    // 滚动条
    scroll, updateScroll, hScrollbarVisible, vScrollbarVisible,

    // 可视界面
    viewport, updateViewport,

    contentBox,

    layoutGrid
  });

  return {
    tableRef,
    tableState,
    updateColumns
  };
}

export function useStateInject() {
  return inject(TableStateKey, {
    tableState: _createTableState(),
    tableProps: {},
    isNestDataSource: computed(() => false),
    mapToColumn: noop as any,
    handleResizeColumn: noop,

    // 滚动
    scroll: ref({ top: 0, left: 0 }), updateScroll: noop,

    hScrollbarVisible: computed(() => false), vScrollbarVisible: computed(() => false),

    // 可见窗口
    viewport: ref(DefaultViewport), updateViewport: noop,

    contentBox: computed(() => DefaultViewport),

    layoutGrid: reactive(DefaultLayoutGrid),
  });
}
