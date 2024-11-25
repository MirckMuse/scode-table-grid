<template>
  <div :class="tableBodyPrefixCls" ref="tableBodyRef">
    <div :class="tableBodyPrefixCls + '__inner'" ref="tableBodyInnerRef">
      <div v-if="isEmpty" :class="tableBodyPrefixCls + '__empty'">
        <component :is="Empty"></component>
      </div>

      <template v-else>
        <div v-if="bodyLeftVisible" ref="tableBodyLeftRef" :class="bodyLeftClass" :style="bodyLeftStyle">
          <BodyRows :columns="bodyLeftColumns" v-bind="commonRowProps"></BodyRows>
        </div>
        <div ref="tableBodyCenterRef" :class="bodyCenterClass" :style="bodyCenterStyle">
          <BodyRows :columns="bodyCenterColumns" v-bind="commonRowProps"></BodyRows>
        </div>
        <div v-if="bodyRightVisible" ref="tableBodyRightRef" :class="bodyRightClass" :style="bodyRightStyle">
          <BodyRows :columns="bodyRightColumns" v-bind="commonRowProps"></BodyRows>
        </div>
      </template>
    </div>

    <Scrollbar :prefix-cls="scrollbarPrefixCls"></Scrollbar>
    <Scrollbar :prefix-cls="scrollbarPrefixCls"></Scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUpdated, reactive, shallowRef, watchEffect, type StyleValue } from 'vue';
import { useStateInject } from '../../hooks';
import { useOverrideInject } from '../context/OverrideContext';
import Scrollbar from "../scrollbar/index.vue";
import BodyRows from "./rows.vue";
import type { RawData } from '@scode/table-grid-core';

interface TableBodyProps {
  prefixCls: string;
}

defineProps<TableBodyProps>()


// 能在这一层收集的信息，就全部放在这里
const { Empty } = useOverrideInject();

const { tableProps, tableState, isNestDataSource } = useStateInject();

const dataSource = shallowRef<RawData[]>([]);

const tableBodyPrefixCls = computed(() => tableProps.prefixCls + "-body");
const scrollbarPrefixCls = computed(() => tableProps.prefixCls + "-scrollbar");

const tableBodyRef = shallowRef<HTMLElement>();
const tableBodyInnerRef = shallowRef<HTMLElement>();

const gridTemplateRows = computed(() => {
  return tableState.value
    .get_row_heights(dataSource.value)
    .map((height) => height + "px")
    .join(" ");
});

// 左侧固定列
const tableBodyLeftRef = shallowRef<HTMLElement>();
const bodyLeftColumns = computed(() => []);
const bodyLeftVisible = computed(() => !!bodyLeftColumns.value.length);
const bodyLeftClass = computed(() => {
  return {
    [`${tableBodyPrefixCls.value}__inner-fixedLeft`]: true,
    [`${tableProps.prefixCls}-fixedLeft`]: true,
    shadow: scroll.value.left > 0
  }
});
const bodyLeftStyle = computed<StyleValue>(() => {
  return {};
});

// 中间列
const tableBodyCenterRef = shallowRef<HTMLElement>();
const bodyCenterColumns = computed(() => []);
const bodyCenterClass = computed(() => {
  return {
    [`${tableBodyPrefixCls.value}__inner-center`]: true,
  }
});
const bodyCenterStyle = computed<StyleValue>(() => {
  const style: StyleValue = {
    gridTemplateRows: gridTemplateRows.value
  }
  
  return style;
});

// 右侧固定列
const tableBodyRightRef = shallowRef<HTMLElement>();
const bodyRightColumns = computed(() => []);
const bodyRightVisible = computed(() => !!bodyRightColumns.value.length);
const bodyRightClass = computed(() => {
  const { scroll, viewport, content_box } = tableState.value;

  const maxXMove = content_box.width - viewport.width;

  return {
    [`${tableBodyPrefixCls.value}__inner-fixedRight`]: true,
    [`${tableProps.prefixCls}-fixedRight`]: true,
    shadow: scroll.left < maxXMove
  }
});
const bodyRightStyle = computed<StyleValue>(() => {
  const style: StyleValue = {
    gridTemplateRows: gridTemplateRows.value
  }

  return style;
});

const scroll = computed(() => tableState.value.scroll);

const isEmpty = computed(() => !dataSource.value.length);

watchEffect(() => {
  dataSource.value = tableState.value.get_viewport_dataset();
});

const commonRowProps = reactive({
  dataSource: dataSource,
  isNestDataSource: isNestDataSource,
  prefixCls: tableBodyPrefixCls,
  grid: [], // TODO:
});

// onUpdated(() => {
//   tableBodyRef.value?.querySelector("")
// });
</script>