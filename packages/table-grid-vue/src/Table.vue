<template>
  <div ref="tableRef" :class="tableClass">
    <InternalTable ref="internalTable" v-bind="props"></InternalTable>
  </div>
</template>

<script lang="ts" setup>
import type { TableProps, TableSlots, InternalTableRef, TableEmit } from "./typing";
import { useStateProvide } from "./hooks";
import InternalTable from "./components/InternalTable.vue";
import { shallowRef, computed, watchEffect } from "vue";

defineOptions({
  name: "STable",
});

const props = withDefaults(defineProps<TableProps>(), {
  prefixCls: "s-table",
  bordered: false,
  rowChildrenName: "children",
});

const slot = defineSlots<TableSlots>();

const emit = defineEmits<TableEmit>()

const { tableRef, tableState, updateColumns } = useStateProvide({ props, slot });

watchEffect(() => {
  updateColumns(props.columns ?? []);
});

watchEffect(() => {
  tableState.update_dataset(props.dataSource ?? []);
})

const internalTable = shallowRef<InternalTableRef>();

const tableClass = computed(() => [props.prefixCls]);
</script>
