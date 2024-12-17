<template>
  <div style="padding: 24px;">
    <STable :columns="tableColumns" :data-source="dataSource" style="height: 600px;" :bordered="true"></STable>
  </div>
</template>

<script lang="ts" setup>
import STable from "@scode/table-grid-vue";
import { TableColumn } from "@scode/table-grid-vue";
import { ref } from "vue";
import { randomInt } from "es-toolkit"

const dataSource = ref(Array(100).fill(0).map((_, i) => {
  return { name: `姓名` + i, age: randomInt(18, 50), sex: "难" };
}))


const tableColumns: TableColumn[] = [
  { title: '列 0', dataIndex: "name", width: 120, fixed: true },
  { title: '列 1', dataIndex: "age", resizable: true },
  // {
  //   title: "分组列",
  //   children: [
  //     { title: '列 2', dataIndex: "age" },
  //     { title: '列 3', dataIndex: "sex" }
  //   ]
  // },

  { title: '列 2', dataIndex: "age", sorter: true },
  { title: '列 3', dataIndex: "sex", },
  { title: '列 4', dataIndex: "sex", width: 200 },
  { title: '列 5', dataIndex: "sex", width: 200 },
  { title: '列 6', dataIndex: "sex", width: 200 },
  { title: '列 7', dataIndex: "sex", width: 200 },
  { title: '列 8', dataIndex: "sex", width: 200 },
  { title: '列 9', dataIndex: "sex", width: 200 },
]


</script>
