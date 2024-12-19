<script setup lang="ts">
import BodyCell from "./cell.vue";
import type {
	ColKey,
	MergedCellMeta,
	TableState,
} from "@scode/table-grid-core";
import type { BodyCellInheritProps, TableColumn } from "../../typing";

interface MergedCellProps extends BodyCellInheritProps {
	prefixCls: string;

	meta: MergedCellMeta;

	tableState: TableState;

	mapToColumn: (colKey: ColKey) => TableColumn;
}

const { meta, tableState } = defineProps<MergedCellProps>();

const rowState = tableState.get_row_state();

const rowMeta = rowState.get_meta_by_row_key(meta.row_key);
const record = rowState.get_raw_data_by_row_key(meta.row_key);
</script>

<template>
  <BodyCell
    v-bind="$props"
    :class="prefixCls + '-cell__merged'"
    :style="{ top: meta.y + 'px', left: meta.x + 'px', width: meta.width + 'px', height: meta.height + 'px' }"
    :column="mapToColumn(meta.col_key)"
    :record="record"
    :row-index="rowMeta.index"
    :row-key="meta.row_key"
    :col-key="meta.colKey"
    :data-col-key="meta.colKey"
    :data-row-key="meta.row_key ?? ''"
    :deep="rowMeta.deep ?? 0"
  />
</template>
