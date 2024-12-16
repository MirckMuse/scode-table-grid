<script lang="ts">
import type { ColKey } from "@scode/table-grid-core";
import type { TableColumn, TableColumnEllipsisObject } from "../../typing";
import { defineComponent, type PropType } from "vue";
import { renderColumnTitle } from "./shared";

export default defineComponent({
  name: "STableHeaderCellInner",

  props: {
    colKey: { type: String as PropType<ColKey> },

    column: { type: Object as PropType<TableColumn>, required: true },

    ellipsis: { type: Object as PropType<TableColumnEllipsisObject> }
  },

  setup(props, { }) {
    return () => {
      const { column } = props;

      return renderColumnTitle(column);
    }
  }
});
</script>