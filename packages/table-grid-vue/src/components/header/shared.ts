import type { TableColumn } from "../../typing";

export function renderColumnTitle(column: TableColumn) {
  return typeof column.title === "function"
    ? column.title()
    : column.title;
}
