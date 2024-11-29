<template>
  <div ref="tableHeaderRef" :class="tableHeaderClass" :style="tableHeaderStyle">
    <div :class="prefixCls + '__inner'">
      <div v-if="leftColumnsVisible" ref="tableHeaderLeftRef" :class="leftColumnsClass" :style="leftColumnsStyle">
        <HeaderCells :prefix-cls="prefixCls" :col-keys="tableState.last_left_col_keys"
          :flatten-col-keys="tableState.left_col_keys" :map-to-column="mapToColumn">
        </HeaderCells>
      </div>

      <div ref="tableHeaderCenterRef" :class="centerColumnsClass" :style="centerColumnsStyle">
        <HeaderCells :prefix-cls="prefixCls" :col-keys="tableState.last_center_col_keys"
          :flatten-col-keys="tableState.center_col_keys" :map-to-column="mapToColumn" type="center">
        </HeaderCells>
      </div>

      <div v-if="rightColumnsVisible" ref="tableHeaderRightRef" :class="rightColumnsClass" :style="rightColumnsStyle">
        <HeaderCells :prefix-cls="prefixCls" :col-keys="tableState.last_right_col_keys"
          :flatten-col-keys="tableState.right_col_keys" :map-to-column="mapToColumn">
        </HeaderCells>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { StyleValue } from "vue";
import type { TableHeaderProps } from "./typing";

import { useStateInject } from "../../hooks";
import { computed, shallowRef } from 'vue';
import HeaderCells from "./cells.vue";

const props = defineProps<TableHeaderProps>()

const { tableState, mapToColumn } = useStateInject();

// 表头
const tableHeaderRef = shallowRef<HTMLElement>();
const tableHeaderClass = computed(() => {
  const { prefixCls } = props;
  return [prefixCls];
});
const tableHeaderStyle = computed<StyleValue>(() => {
  return {};
});

// 左侧表头
const tableHeaderLeftRef = shallowRef<HTMLElement>();
const leftColumnsVisible = computed(() => {
  const { last_left_col_keys = [] } = tableState.value || {};
  return !!last_left_col_keys.length;
});
const leftColumnsClass = computed(() => {
  const { prefixCls } = props;
  return {
    [`s-table-fixedLeft`]: true,
    [`${prefixCls}__inner-fixedLeft`]: true,
    shadow: tableState.value.scroll.left > 0
  };
});
const leftColumnsStyle = computed<StyleValue>(() => {
  const style: StyleValue = {};
  const colState = tableState.value.get_col_state()

  const deepest = colState.get_deepest() + 1;

  const { last_left_col_keys, config } = tableState.value;

  style.gridTemplateRows = "repeat(" + deepest + ", 52px)";
  style.gridTemplateColumns = last_left_col_keys
    .map(colKey => {
      return (colState.get_meta(colKey)?.width ?? config.col_width) + 'px';
    })
    .join(' ');

  return style;
});

// 中间表头
const tableHeaderCenterRef = shallowRef<HTMLElement>();
const centerColumnsClass = computed(() => {
  const { prefixCls } = props;
  return {
    [`${prefixCls}__inner-center`]: true
  };
});
const centerColumnsStyle = computed<StyleValue>(() => {
  const style: StyleValue = {};
  const colState = tableState.value.get_col_state()

  const deepest = colState.get_deepest() + 1;

  const { last_left_col_keys, last_center_col_keys, config ,scroll} = tableState.value;

  style.paddingLeft = colState.get_reduce_width(last_left_col_keys) +'px';
  style.gridTemplateRows = "repeat(" + deepest + ", 52px)";
  style.transform = `translateX(${-scroll.left}px)`
  style.gridTemplateColumns = last_center_col_keys
    .map(colKey => {
      return (colState.get_meta(colKey)?.width ?? config.col_width) + 'px';
    })
    .join(' ');

  return style;
});

// 右侧表头
const tableHeaderRightRef = shallowRef<HTMLElement>();
const rightColumnsVisible = computed(() => !!tableState.value.last_right_col_keys.length);
const rightColumnsClass = computed(() => []);
const rightColumnsStyle = computed<StyleValue>(() => {
  return {}
});
</script>