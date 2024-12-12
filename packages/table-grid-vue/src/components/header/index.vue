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

import { useHeaderScroll, useStateInject } from "../../hooks";
import { computed, shallowRef } from 'vue';
import HeaderCells from "./cells.vue";

const props = defineProps<TableHeaderProps>()

const { tableState, tableProps, mapToColumn, scroll, layoutGrid } = useStateInject();

const { headerRef: tableHeaderCenterRef } = useHeaderScroll();

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
  const { last_left_col_keys = [] } = tableState || {};
  return !!last_left_col_keys.length;
});
const leftColumnsClass = computed(() => {
  const { prefixCls } = props;
  const { prefixCls: _prefixCls } = tableProps;
  return {
    [`${_prefixCls}-fixedLeft`]: true,
    [`${prefixCls}__inner-fixedLeft`]: true,
    shadow: scroll.value.left > 0
  };
});
const leftColumnsStyle = computed<StyleValue>(() => {
  const style: StyleValue = {};
  const colState = tableState.get_col_state()

  const deepest = colState.get_deepest() + 1;

  style.gridTemplateRows = "repeat(" + deepest + ", 52px)";
  style.gridTemplateColumns = layoutGrid.col.left
    .map(_w => _w + 'px')
    .join(' ');

  return style;
});

// 中间表头
const centerColumnsClass = computed(() => {
  const { prefixCls } = props;
  return {
    [`${prefixCls}__inner-center`]: true
  };
});
const centerColumnsStyle = computed<StyleValue>(() => {
  const style: StyleValue = {};
  const colState = tableState.get_col_state()

  const deepest = colState.get_deepest() + 1;

  const { left, center } = layoutGrid.col;

  style.paddingLeft = left.reduce((aw, w) => aw + w, 0) + 'px';
  style.gridTemplateRows = "repeat(" + deepest + ", 52px)";
  style.transform = `translateX(${-scroll.value.left}px)`
  style.gridTemplateColumns = center.map(_w => _w + 'px').join(' ');

  return style;
});

// 右侧表头
const tableHeaderRightRef = shallowRef<HTMLElement>();
const rightColumnsVisible = computed(() => !!tableState.last_right_col_keys.length);
const rightColumnsClass = computed(() => []);
const rightColumnsStyle = computed<StyleValue>(() => {
  return {}
});
</script>