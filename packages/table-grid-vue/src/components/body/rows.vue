<template>
  <BodyRow v-for="rowData in rowDataSource" :key="rowData.rowKey" :row-key="rowData.rowKey" :meta="rowData.meta"
    :index="rowData.meta?.index ?? -1" :record="rowData.record" :columns="columns" :grid="grid"
    :prefix-cls="prefixCls" />
</template>

<script lang="ts" setup>
import type { RawData } from "@scode/table-grid-core";
import type { TableColumn } from "../../typing";
import BodyRow from "./row.vue";
import { useStateInject } from "../../hooks";
import { computed } from "vue";

interface BodyRowsProps {
  prefixCls: string;

  dataSource: RawData[];

  columns: TableColumn[];

  grid: number[];

  isNestDataSource: boolean;
}

const props = defineProps<BodyRowsProps>();

const { tableState } = useStateInject();

const getRowKey = tableState.value.config.get_row_key;
const rowState = tableState.value.get_row_state();


const rowDataSource = computed(() => {
  return (props.dataSource ?? []).map((rawData) => {
    const rowKey = getRowKey(rawData);
    const rowMeta = rowState.get_meta_by_row_key(rowKey);

    return {
      rowKey,
      meta: rowMeta,
      record: rawData
    }
  });
});

</script>
