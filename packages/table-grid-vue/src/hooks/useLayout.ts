import type { ColKey, TableState } from "@scode/table-grid-core";
import { reactive, shallowRef } from "vue";
import { throttle } from "es-toolkit";

export interface RowLayoutGrid {
  header: number[];

  body: number[];
}

export interface ColLayoutGrid {
  left: number[];

  center: number[];

  right: number[];
}

export interface LayoutGrid {
  row: RowLayoutGrid;

  col: ColLayoutGrid;
}


const DefaultColLayoutGrid: ColLayoutGrid = { left: [], center: [], right: [] };
const DefaultRowLayoutGrid: RowLayoutGrid = { header: [], body: [] };
export const DefaultLayoutGrid: LayoutGrid = {
  row: DefaultRowLayoutGrid,
  col: DefaultColLayoutGrid,
};

export const useLayout = (tableState: TableState) => {
  const rowLayoutGrid = shallowRef<RowLayoutGrid>(DefaultRowLayoutGrid);
  const colLayoutGrid = shallowRef<ColLayoutGrid>(DefaultColLayoutGrid);

  const layoutGrid = reactive({
    row: rowLayoutGrid,
    col: colLayoutGrid,
  });
  const { config } = tableState;

  const colState = tableState.get_col_state();

  const _getWidth = (colKey: ColKey) => colState.get_meta(colKey)?.width ?? config.col_width;

  const updateColLayoutGrid = throttle(() => {
    const { last_left_col_keys, last_center_col_keys, last_right_col_keys } = tableState;

    colLayoutGrid.value = {
      left: last_left_col_keys.map(_getWidth),
      center: last_center_col_keys.map(_getWidth),
      right: last_right_col_keys.map(_getWidth)
    }
  }, 16);

  updateLayoutGrid()

  function updateRowLayoutGrid() {
  }

  function updateLayoutGrid() {
    updateColLayoutGrid();
    updateRowLayoutGrid();
  }

  return { layoutGrid, updateLayoutGrid, updateColLayoutGrid, updateRowLayoutGrid };
}
