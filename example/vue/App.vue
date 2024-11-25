<template>
  <STable :columns="tableColumns" :data-source="dataSource" style="height: 600px;"></STable>
</template>

<script lang="ts" setup>
import STable from "@scode/table-grid-vue";
import { TableColumn } from "@scode/table-grid-vue";
import { ref } from "vue";

const dataSource = ref(Array(10).fill(0).map((_, i) => {
  return {
    name: `姓名` + i,
    age: 10 + i,
    sex: "难"
  }
}))


const tableColumns: TableColumn[] = [
  {
    title: '列 1',
    dataIndex: "name"
  },
  {
    title: '列 2',
    dataIndex: "age"
  },
  {
    title: '列 3',
    dataIndex: "sex"
  }
]


</script>
