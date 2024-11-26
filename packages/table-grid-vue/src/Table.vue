<template>
  <div ref="tableRef" :class="tableClass">
    <InternalTable ref="internalTable" v-bind="props"></InternalTable>
  </div>
</template>

<script lang="ts" setup>
import type { TableProps, InternalTableRef, TableEmit } from "./typing";
import { useStateProvide } from "./hooks";
import InternalTable from "./components/InternalTable.vue";
import { shallowRef, computed, watchEffect, watch } from "vue";

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

watch(() => props.columns, () => {
  updateColumns(props.columns ?? []);
}, { immediate: true });

watch(() => props.dataSource, () => {
  tableState.value.update_dataset(props.dataSource ?? [])
}, { immediate: true });

const internalTable = shallowRef<InternalTableRef>();

const tableClass = computed(() => [props.prefixCls]);
</script>
