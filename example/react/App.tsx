import { Table, TableColumn } from "@scode/table-grid-react";

function App() {
  const dataSource = Array(30).fill(0).map((_, i) => {
    return { name: `姓名` + i, age: 10 + i, sex: "难" };
  });

  const tableColumns: TableColumn[] = [
    { title: '列 1', dataIndex: "name" },
    // {
    //   title: "分组列",
    //   children: [
    //     { title: '列 2', dataIndex: "age" },
    //     { title: '列 3', dataIndex: "sex" }
    //   ]
    // },

    { title: '列 2', dataIndex: "age" },
    { title: '列 3', dataIndex: "sex" }
  ]

  return (
    <Table columns={tableColumns} dataSource={dataSource} style={{ height: "600px" }} bordered={true}></Table>
  )
}

export default App
