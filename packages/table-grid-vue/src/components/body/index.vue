<template>
  <div :class="tableBodyPrefixCls" ref="tableBodyRef">

    <div :class="tableBodyPrefixCls + '__inner'" :style="tableBodyInnerStyle" ref="tableBodyInnerRef">
      <div v-if="isEmpty" :class="tableBodyPrefixCls + '__empty'">
        <component :is="Empty"></component>
      </div>

      <template v-else>
        <div v-if="bodyLeftVisible" ref="tableBodyLeftRef" :class="bodyLeftClass" :style="bodyLeftStyle">
          <BodyRows :col-keys="bodyLeftColKeys" :grid="layoutGrid.col.left" v-bind="commonRowProps"></BodyRows>
        </div>


        <div ref="tableBodyCenterRef" :class="bodyCenterClass" :style="bodyCenterStyle">
          <div ref="beforeHandler" class="beforeHandler"></div>
          <BodyRows :col-keys="bodyCenterColKeys" :grid="layoutGrid.col.center" v-bind="commonRowProps"></BodyRows>
          <div ref="afterHandler" class="afterHandler"></div>
        </div>

        <div v-if="bodyRightVisible" ref="tableBodyRightRef" :class="bodyRightClass" :style="bodyRightStyle">
          <BodyRows :col-keys="bodyRightColKeys" :grid="layoutGrid.col.right" v-bind="commonRowProps"></BodyRows>
        </div>
      </template>
    </div>

    <Scrollbar v-if="!isEmpty" :prefix-cls="scrollbarPrefixCls" :state="scrollState" :vertical="true"
      :client="viewport.height" :content="contentBox.height" v-model:scroll="scroll.top" @update:scroll="updateScroll"
      :cross-visible="hScrollbarVisible">
    </Scrollbar>
    <Scrollbar :prefix-cls="scrollbarPrefixCls" :state="scrollState" :client="viewport.width"
      :content="contentBox.width" v-model:scroll="scroll.left" @update:scroll="updateScroll"
      :cross-visible="vScrollbarVisible"></Scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { type RawData } from '@scode/table-grid-core';
import type { StyleValue } from 'vue';

import { computed, onMounted, onUnmounted, reactive, shallowRef, triggerRef } from 'vue';
import { useStateInject, useBodyScroll, useEventInject } from '../../hooks';
import { useOverrideInject } from '../context/OverrideContext';
import Scrollbar from "../scrollbar/index.vue";
import BodyRows from "./rows.vue";

interface TableBodyProps {
  prefixCls: string;
}

defineProps<TableBodyProps>()


// 能在这一层收集的信息，就全部放在这里
const { Empty } = useOverrideInject();

const { event } = useEventInject();

const {
  tableProps, tableState, isNestDataSource,
  scroll, updateScroll: _updateScroll,

  hScrollbarVisible, vScrollbarVisible,
  viewport, updateViewport,

  contentBox,
  layoutGrid
} = useStateInject();

const updateScroll = () => _updateScroll(scroll.value);

const scrollState = computed(() => {
  const {
    mode = "always",
    position = "inner",
    size = 6,
  } = tableProps.scroll ?? {};
  return {
    mode,
    position,
    size,
  };
});

const dataSource = shallowRef<RawData[]>([]);

const tableBodyPrefixCls = computed(() => tableProps.prefixCls + "-body");
const scrollbarPrefixCls = computed(() => tableProps.prefixCls + "-scrollbar");

const tableBodyRef = shallowRef<HTMLElement>();
// const tableBodyInnerRef = shallowRef<HTMLElement>();

const { bodyRef: tableBodyInnerRef } = useBodyScroll();

const tableBodyInnerStyle = computed(() => {
  return {}
});


const offsetTop = computed(() => {
  const first_raw_data = dataSource.value[0];

  return first_raw_data ? tableState.get_row_state().get_y(first_raw_data) : 0;
});

const gridTemplateRows = shallowRef<number[]>([]);

function resetGridTemplateRows() {
  gridTemplateRows.value = tableState.get_row_heights(dataSource.value);

  if (tableState.content_box.height !== contentBox.value.height) {
    triggerRef(contentBox)
  }
}
resetGridTemplateRows();

// 左侧固定列
const tableBodyLeftRef = shallowRef<HTMLElement>();
const bodyLeftColKeys = computed(() => tableState?.last_left_col_keys ?? []);
const bodyLeftVisible = computed(() => !!bodyLeftColKeys.value.length);
const bodyLeftClass = computed(() => {
  return {
    [`${tableBodyPrefixCls.value}__inner-fixedLeft`]: true,
    [`${tableProps.prefixCls}-fixedLeft`]: true,
    shadow: scroll.value.left > 0
  }
});
const bodyLeftStyle = computed<StyleValue>(() => {
  const style: StyleValue = {
    paddingTop: offsetTop.value + 'px',
    transform: `translate(0, ${- scroll.value.top}px)`,
    gridTemplateRows: gridTemplateRows.value.map((height) => height + "px").join(" ")
  }

  return style;
});

// 中间列
const tableBodyCenterRef = shallowRef<HTMLElement>();
const bodyCenterColKeys = computed(() => tableState?.last_center_col_keys ?? []);
const bodyCenterClass = computed(() => {
  return {
    [`${tableBodyPrefixCls.value}__inner-center`]: true,
  }
});
const bodyCenterStyle = computed<StyleValue>(() => {
  const { last_left_col_keys } = tableState;

  const rows = [0].concat(gridTemplateRows.value).concat([0]);

  const paddingLeft = tableState.get_col_state().get_reduce_width(last_left_col_keys);

  const style: StyleValue = {
    paddingLeft: (paddingLeft) + 'px',
    paddingTop: (offsetTop.value) + 'px',
    transform: `translate(${-scroll.value.left}px, ${- scroll.value.top}px)`,
    gridTemplateRows: rows.map((height) => height + "px").join(" ")
  }

  return style;
});

// 右侧固定列
const tableBodyRightRef = shallowRef<HTMLElement>();
const bodyRightColKeys = computed(() => tableState?.last_right_col_keys ?? []);
const bodyRightVisible = computed(() => !!bodyRightColKeys.value.length);
const bodyRightClass = computed(() => {
  const { viewport, content_box } = tableState;

  const maxXMove = content_box.width - viewport.width;

  return {
    [`${tableBodyPrefixCls.value}__inner-fixedRight`]: true,
    [`${tableProps.prefixCls}-fixedRight`]: true,
    shadow: scroll.value.left < maxXMove
  }
});
const bodyRightStyle = computed<StyleValue>(() => {
  const style: StyleValue = {
    gridTemplateRows: gridTemplateRows.value.map((height) => height + "px").join(" ")
  }

  return style;
});

const isEmpty = computed(() => !dataSource.value.length);

const beforeHandler = shallowRef<HTMLElement>();
const afterHandler = shallowRef<HTMLElement>();
const commonRowProps = reactive({
  dataSource: dataSource,
  isNestDataSource: isNestDataSource,
  prefixCls: tableBodyPrefixCls,
});

// 元素转meta
const _elementToCellMeta = (el: HTMLElement) => {
  const { width, height } = el.getBoundingClientRect();
  const { rowKey: row_key = "", colKey: col_key = "" } = el.dataset;
  return { width, height, row_key, col_key };
}

const updateCellSizes = (mutationsList: MutationRecord[]) => {
  // 还可以优化，1.兼容性 2.不用获取全量 cell
  const cells = Array.from(tableBodyRef.value?.querySelectorAll(".s-table-body-cell") ?? []) as HTMLElement[];
  const metas = cells.map(_elementToCellMeta);
  tableState.update_row_cells_size(metas);

  resetGridTemplateRows();
}

event.resetDatasource = () => {
  dataSource.value = tableState.get_viewport_dataset();
}
onUnmounted(() => {
  event.resetDatasource = undefined;
})

const $cellResize = new MutationObserver(updateCellSizes)
dataSource.value = tableState.get_viewport_dataset();
const $scrollObserver = new IntersectionObserver(() => {
  dataSource.value = tableState.get_viewport_dataset();
}, { threshold: 0, rootMargin: "50%" })

const $resize = new ResizeObserver((entry) => {
  const el = entry[0];
  const { width, height } = el.contentRect;
  updateViewport({ width, height });
});

onMounted(() => {
  if (tableBodyInnerRef.value) {
    $cellResize.observe(tableBodyInnerRef.value, { childList: true, subtree: true });
  }

  if (tableBodyRef.value) {
    $resize.observe(tableBodyRef.value);
  }

  if (beforeHandler.value) {
    $scrollObserver.observe(beforeHandler.value)
  }

  if (afterHandler.value) {
    $scrollObserver.observe(afterHandler.value)
  }
});

onUnmounted(() => {
  $cellResize.disconnect();
  $resize.disconnect();
  $scrollObserver.disconnect();
})
</script>