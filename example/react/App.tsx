import { Table, TableColumn } from "@scode/table-grid-react";

function App() {
  const dataSource = Array(100).fill(0).map((_, i) => {
    return { name: `姓名` + i, age: 10 + i, sex: "难" };
  });

  const tableColumns: TableColumn[] = [
    { title: '列 0', dataIndex: "name", width: 120, fixed: true },
    { title: '列 1', dataIndex: "name", resizable: true },
    // {
    //   title: "分组列",
    //   children: [
    //     { title: '列 2', dataIndex: "age" },
    //     { title: '列 3', dataIndex: "sex" }
    //   ]
    // },

    { title: '列 2', dataIndex: "age", },
    { title: '列 3', dataIndex: "sex", },
    { title: '列 4', dataIndex: "sex", width: 200 },
    { title: '列 5', dataIndex: "sex", width: 200 },
    { title: '列 6', dataIndex: "sex", width: 200 },
    { title: '列 7', dataIndex: "sex", width: 200 },
    { title: '列 8', dataIndex: "sex", width: 200 },
    { title: '列 9', dataIndex: "sex", width: 200 },
  ]

  return (
    <Table columns={tableColumns} dataSource={dataSource} style={{ height: "600px" }} bordered={true}></Table>
  )
}

export default App
