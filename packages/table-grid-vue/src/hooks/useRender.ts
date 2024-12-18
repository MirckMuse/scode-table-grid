import type { BodyCellRender, ExpandedRowRender, TableProps, TableSlots } from "../typing";
import type { InjectionKey } from "vue";
import { provide, inject } from "vue";

export interface ITableRender {
  renderBodyCell?: BodyCellRender;

  renderExpandedRow?: ExpandedRowRender;
}

const TableRenderKey: InjectionKey<ITableRender> = Symbol("__table_render__");


export function useRender(props: TableProps, slot: TableSlots) {
  provide(TableRenderKey, {
    renderBodyCell: props.bodyCell ?? slot.bodyCell,
    renderExpandedRow: props.expandedRow ?? slot.expandedRow
  });
}

export function useRenderInject() {
  return inject(TableRenderKey, {});
}