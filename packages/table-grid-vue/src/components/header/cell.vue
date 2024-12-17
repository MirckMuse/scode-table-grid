<template>
  <div :class="cellClass" :title="title">
    <div :class="cellInnerClass" :style="cellInnerStyle">
      <CellInner :col-key="colKey" :column="column" :ellipsis="ellipsis"></CellInner>
      <div v-if="column.sorter || column.filter" :class="cellPrefixClass + '__append'">
        <Sorter v-if="column.sorter" :prefix-cls="cellPrefixClass" :process-sorter="_processSorter"
          :sorter-state="sorterState"></Sorter>
      </div>
    </div>
    <ResizeHolder v-if="column.resizable" :col-key="colKey" :prefix-cls="cellPrefixClass"></ResizeHolder>
  </div>
</template>

<script lang="ts" setup>
import type { TableHeaderCellProps } from "./typing";

import { computed } from 'vue';
import ResizeHolder from "./ResizeHolder.vue";
import CellInner from "./inner.vue";
import Sorter from "../sorter/index.vue";
import { renderColumnTitle } from "./shared";

const props = defineProps<TableHeaderCellProps>();

const cellPrefixClass = props.prefixCls + "-cell";
const cellClass = [cellPrefixClass];

// 单元格内部
const cellInnerClass = computed(() => {
  const { ellipsis } = props;
  return {
    [`${cellPrefixClass}-inner`]: true,
    [`${cellPrefixClass}-inner-ellipsis`]: !!ellipsis
  }
});

const cellInnerStyle = computed(() => {
  const { column } = props;
  return { textAlign: column.align };
});

const title = computed(() => {
  const { column, ellipsis } = props;
  return ellipsis?.showTitle ? renderColumnTitle(column) as string : undefined;
});

function _processSorter() {
  const { processSorter, colKey } = props;

  processSorter(colKey)
}
</script>