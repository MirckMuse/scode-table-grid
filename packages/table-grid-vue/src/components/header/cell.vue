<script lang="ts">
import type { TableHeaderCellProps } from "./typing";
import type { StyleValue, VNode } from 'vue';
import type { TableColumn } from "../../typing";

import { h, defineComponent } from 'vue';
import ResizeHolder from "./ResizeHolder.vue";
import Sorter from "../sorter/index.vue";

// 渲染用户配置的 title
function renderColumnTitle(column: TableColumn) {
  return typeof column.title === "function"
    ? column.title()
    : column.title;
}

export default defineComponent<TableHeaderCellProps>({
  name: "STableHeaderCell",

  props: ["prefixCls", "colKey", "column", "ellipsis"],

  setup(props) {
    const cellPrefixClass = props.prefixCls + "-cell";

    function renderHeaderCell(column: TableColumn) {
      const title = renderColumnTitle(column);

      const appendVNodes: VNode[] = [];

      // 渲染排序

      if (column.sorter) {
        appendVNodes.push(h(Sorter, { prefixCls: cellPrefixClass }))
      }

      // 渲染筛选

      if (appendVNodes.length) {
        const appendWrapper = h("div", { class: cellPrefixClass + "__append" }, appendVNodes);

        return h("div", { class: cellPrefixClass + "__append" }, [
          title,
          appendWrapper,
        ] as any[]);
      }

      return title;
    }

    return () => {
      const { ellipsis, column, colKey } = props;

      const cell = renderHeaderCell(column);

      const title = ellipsis?.showTitle ? cell : undefined;

      // 单元格内部
      const cellInnerClass = {
        [`${cellPrefixClass}-inner`]: true,
        [`${cellPrefixClass}-inner-ellipsis`]: !!ellipsis
      };
      const cellInnerStyle: StyleValue = {
        textAlign: column.align
      };

      const inner = h('div', { class: cellInnerClass, style: cellInnerStyle }, [
        cell,
      ] as any[]);

      // 列宽调整 holder
      const resizeHolder = column.resizable ? h(ResizeHolder, { prefixCls: cellPrefixClass, colKey: colKey }) : null;

      // 单元格
      const cellClass = [cellPrefixClass];
      return h('div', { class: cellClass, title }, [
        inner,
        resizeHolder
      ])

    }
  }
});
</script>