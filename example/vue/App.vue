<template>
	<div style="padding: 24px;">
		<STable style="height: 600px;" :columns="tableColumns" :data-source="dataSource" :bordered="true"
			:custom-row="customRow" :row-class-name="rowClassName">
		</STable>
	</div>
</template>

<script lang="ts" setup>
import STable, { type BodyCellRenderOption } from "@scode/table-grid-vue";
import type { TableColumn } from "@scode/table-grid-vue";
import { ref } from "vue";
import { randomInt } from "es-toolkit";

const dataSource = ref(
	Array(100)
		.fill(0)
		.map((_, i) => {
			return { name: `姓名${i}`, age: randomInt(18, 50), sex: "难" + i };
		}),
);

function renderBodyCell(option: BodyCellRenderOption) {
	return String(option.text) + 1;
}

function customRow(_: any, index: number) {
	if (index === 50) {
		return {
			style: "background: red",
		};
	}
}

function rowClassName(_: any, index: number) {
	if (index === 1) {
		return "blue";
	}
}

const tableColumns = ref<TableColumn[]>([
	{ title: "列 0", dataIndex: "name", width: 120, fixed: true },
	{
		title: "列 1",
		dataIndex: "sex",
		resizable: true,
		customCell({ index }) {
			if (index === 0) {
				return { colSpan: 2, rowSpan: 2 };
			}
		},
	},
	{ title: "列 2", dataIndex: "age", sorter: true },
	{ title: "列 3", dataIndex: "sex" },
	{ title: "列 4", dataIndex: "sex", width: 200 },
	{ title: "列 5", dataIndex: "sex", width: 200 },
	{ title: "列 6", dataIndex: "sex", width: 200 },
	{ title: "列 7", dataIndex: "sex", width: 200 },
	{ title: "列 8", dataIndex: "sex", width: 200 },
	{ title: "列 9", dataIndex: "sex", width: 200 },
]);
</script>

<style>
.blue {
	background-color: blue;
	color: #FFF;
}
</style>
