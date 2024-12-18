<template>
  <BodyRow v-for="rowData in rowDataSource" :key="rowData.rowKey" :row-key="rowData.rowKey" :meta="rowData.meta"
    :index="rowData.index" :record="rowData.record" :columns="computedColumns" :grid="grid" :prefix-cls="prefixCls"
    :renderBodyCell="renderBodyCell" v-bind="genBind(rowData.record, rowData.index)" />
</template>

<script lang="ts" setup>
import type { ColKey, RawData } from "@scode/table-grid-core";
import type { CustomRow, RowClassName } from "../../typing";
import BodyRow from "./row.vue";
import { useStateInject, type ITableRender } from "../../hooks";
import { computed } from "vue";
import classNames from "classnames";

interface BodyRowsProps extends ITableRender {
  prefixCls: string;

  dataSource: RawData[];

  colKeys: ColKey[];

  grid: number[];

  isNestDataSource: boolean;

  customRow?: CustomRow;

  rowClassName?: RowClassName;
}

const props = defineProps<BodyRowsProps>();

const { customRow, rowClassName } = props;

function genBind(record: RawData, index: number) {
  const bind = customRow?.(record, index) || {};
  const classname = rowClassName?.(record, index) ?? "";
  bind.class = classNames(bind.class, classname);

  return bind;
}

const { tableState, mapToColumn } = useStateInject();

const getRowKey = tableState.config.get_row_key;
const rowState = tableState.get_row_state();

const computedColumns = computed(() => {
  return props.colKeys.map(colKey => {
    return {
      colKey,
      column: mapToColumn(colKey)
    }
  })
});


const rowDataSource = computed(() => {
  return (props.dataSource ?? []).map((rawData) => {
    const rowKey = getRowKey(rawData);
    const rowMeta = rowState.get_meta_by_row_key(rowKey);

    return {
      rowKey,
      meta: rowMeta,
      record: rawData,
      index: rowMeta?.index ?? -1
    }
  });
});

</script>
