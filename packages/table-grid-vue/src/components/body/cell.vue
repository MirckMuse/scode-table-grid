<script lang="ts">
import type { Option, RawData } from "@scode/table-grid-core";
import type { TableBodyCellProps } from "./typing";
import type { TableColumn } from "../../typing";
import type { StyleValue } from "vue";

import { shallowRef, defineComponent, h, isVNode } from 'vue';
import { useStateInject } from "../../hooks";
import { isNil } from "es-toolkit";
import { get, isObject } from "es-toolkit/compat";
import { toArray } from "@scode/table-grid-core";

// 放在组件外部是为了减少函数的创建
const isEmptyCell = (target: any) => false;

function getText(column: TableColumn, record: RawData): Option<unknown> {
  if (!column?.dataIndex) return null;

  if (isNil(record)) return null;

  return get(record, column?.dataIndex, null);
}

function showTitle(column: TableColumn) {
  const ellipsis = column?.ellipsis

  return isObject(ellipsis) ? ellipsis?.showTitle : !!ellipsis
}

function isValidVNode(target: unknown): boolean {
  if (!isVNode(target)) return true;

  return target.type !== Comment;
}

// TODO 渲染表格内容
function renderCustomCell(props: TableBodyCellProps, text: unknown, title: unknown): Option<any[]> {
  const { column, rowIndex, record } = props;

  const params = {
    text,
    record,
    column,
    index: rowIndex,
    title,
  };

  if (column.customRender) {
    return toArray(column.customRender(params));
  }

  const bodyCellVNodes = props.bodyCell?.(params);

  if (isNil(bodyCellVNodes)) return null;

  const validVNodes = toArray(bodyCellVNodes).filter(isValidVNode);

  return validVNodes.length ? validVNodes : null;
}


export default defineComponent<TableBodyCellProps>({
  name: "STableBodyCell",

  // FIXME: PROPS 定义的方式有点问题，需要减少人工配置成本
  props: ["prefixCls", "column", "record", "rowIndex", "rowKey", "colKey", "deep", "indentSize", "isMergedCell", "transformCellText", "bodyCell"],

  setup(props, { slots }) {
    const cellRef = shallowRef<HTMLElement>();
    const cellInnerRef = shallowRef<HTMLElement>();

    const { tableState } = useStateInject();

    return () => {
      const { transformCellText, column, record, rowIndex, rowKey, colKey, prefixCls, isMergedCell } = props;

      const cellPrefixCls = prefixCls + "-cell";

      const text = getText(column, record);

      const title = showTitle(column) ? text : undefined;

      const contentVNodes = renderCustomCell(props, text, title);

      const meta = isMergedCell ? tableState.get_merged_cell_meta(rowKey, colKey) : null;

      const scroll = tableState.scroll;

      const cellClass = {
        [cellPrefixCls]: true,
        [cellPrefixCls + "__merged"]: isMergedCell
        // TODO:
      }

      const cellStyle: StyleValue = {
      }
      if (meta) {
        cellStyle.transform = `translate(${meta.x - scroll.left}px, ${meta.y - scroll.top}px, 0)`;
      }

      const expandIcon = slots["expandIcon"]?.() ?? null;

      let children: unknown = contentVNodes ?? text;

      if (isEmptyCell(children)) {
        if (transformCellText) {
          children = transformCellText({
            text,
            column,
            record,
            index: rowIndex
          }) ?? null;
        } else {
          children = null;
        }
      }

      const cellInnerClass = {
        [cellPrefixCls + "__inner"]: true,
      }

      const cellInner = h(
        "div",
        { ref: cellInnerRef, class: cellInnerClass },
        ([expandIcon] as any[]).concat(children) as any[]
      );

      return h("div", { ref: cellRef, class: cellClass, style: cellStyle }, [cellInner]);
    }
  }
})
</script>