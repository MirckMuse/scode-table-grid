<template>
  <HeaderCell v-for="bind in columnBinds" v-bind="bind" :key="bind.colKey" :processSorter="processSorter"></HeaderCell>
</template>

<script lang="ts" setup>
import type { StyleValue } from "vue";
import { computed } from "vue";
import { useStateInject, useSorterInject } from "../../hooks";
import type { TableColumnEllipsisObject } from "../../typing";
import HeaderCell from "./cell.vue";
import type { TableHeaderCellsProps } from "./typing";

defineOptions({
  name: "STableHeaderCells"
});

const props = defineProps<TableHeaderCellsProps>();

const { tableState } = useStateInject();

const { sorterStates, processSorter } = useSorterInject();

const col_state = tableState.get_col_state();

const columnBinds = computed(() => {
  const { flattenColKeys, mapToColumn, prefixCls } = props;

  return flattenColKeys.reduce<any[]>((binds, colKey) => {
    const column = mapToColumn(colKey);

    if (typeof column.colSpan === "number" && column.colSpan <= 0) {
      return binds
    }

    const style: StyleValue = {};
    const meta = col_state.get_meta(colKey);
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

    const sorterState = sorterStates.value.find(state => state.col_key === colKey);

    binds.push({
      column,
      style,
      colKey,
      ellipsis: column.ellipsis as TableColumnEllipsisObject | undefined,
      prefixCls: prefixCls,
      sorterState,
      ...dataset
    });
    return binds;
  }, []);
});
</script>