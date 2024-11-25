<template>
  <div ref="rowRef" :data-row-index="index" :data-row-key="rowKey">
    <BodyCell v-for="column in columns" :key="column.key" :data-col-key="column.key" :deep="meta?.deep ?? 0"></BodyCell>
  </div>
</template>

<script lang="ts" setup>
import type { Option, RawData, RowKey, RowMeta } from '@scode/table-grid-core';
import type { TableColumn } from 'src/typing';
import BodyCell from "./cell.vue";
import { shallowRef } from 'vue';

interface BodyRowProps {
  prefixCls: string;

  rowKey: RowKey;

  meta: Option<RowMeta>;

  index: number;

  columns: TableColumn[];

  record: RawData;

  grid: number[];

  isHover?: boolean;
}

defineProps<BodyRowProps>();

const rowRef = shallowRef<HTMLElement>();
</script>
