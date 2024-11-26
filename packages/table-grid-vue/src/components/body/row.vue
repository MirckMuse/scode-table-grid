<template>
  <div ref="rowRef" :class="prefixCls + '-row'" :style="rowStyle" :data-row-index="index" :data-row-key="rowKey">
    <BodyCell v-for="col in columns" :key="col.colKey" :prefix-cls="prefixCls" :column="col.column" :record="record"
      :row-index="index" :row-key="rowKey" :col-key="col.colKey" :data-col-key="col.colKey"
      :data-row-key="meta?.key ?? ''" :deep="meta?.deep ?? 0">
    </BodyCell>
  </div>
</template>

<script lang="ts" setup>
import type { ColKey, Option, RawData, RowKey, RowMeta } from '@scode/table-grid-core';
import type { TableColumn } from 'src/typing';
import BodyCell from "./cell.vue";
import { computed, shallowRef, type StyleValue } from 'vue';

interface BodyRowProps {
  prefixCls: string;

  rowKey: RowKey;

  meta: Option<RowMeta>;

  index: number;

  columns: { colKey: ColKey, column: TableColumn }[];

  record: RawData;

  grid: number[];

  isHover?: boolean;
}

const props = defineProps<BodyRowProps>();

const rowRef = shallowRef<HTMLElement>();

const rowStyle = computed(() => {
  const { grid } = props;
  const style: StyleValue = {
    gridTemplateColumns: grid.map(w => w + 'px').join(" ")
  };

  return style;
})
</script>
