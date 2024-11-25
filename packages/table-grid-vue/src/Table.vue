<template>
  <div ref="tableRef" :class="tableClass">
    <InternalTable ref="internalTable" v-bind="props"></InternalTable>
  </div>
</template>

<script lang="ts" setup>
import type { TableProps, InternalTableRef, TableEmit, TableColumn } from "./typing";
import { useStateProvide } from "./hooks";
import InternalTable from "./components/InternalTable.vue";
import { shallowRef, computed, watchEffect } from "vue";
import type { ColKey, TableColumn as CoreTableColumn } from "@scode/table-grid-core";
import { uuid } from "@scode/table-grid-core";

defineOptions({
  name: "STable",
});

const props = withDefaults(defineProps<TableProps>(), {
  prefixCls: "s-table",
  bordered: false,
  rowChildrenName: "children",
});

const emit = defineEmits<TableEmit>()

const { tableRef, tableState, updateColumns } = useStateProvide(props);

watchEffect(() => updateColumns(props.columns ?? []));
watchEffect(() => tableState.value.update_dataset(props.dataSource ?? []));

console.log(tableState.value);

const internalTable = shallowRef<InternalTableRef>();

const tableClass = computed(() => {
  return [props.prefixCls];
});
</script>
