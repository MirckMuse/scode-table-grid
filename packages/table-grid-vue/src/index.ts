import type { App } from "vue";
import Table from "./Table.vue";
import "./style/index.less";

export * from "./typing";

Table["install"] = (app: App) => {
  app.component(Table.name || "STable", Table);
};

export default Table;
