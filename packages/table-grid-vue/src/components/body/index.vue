<template>
  <div :class="tableBodyPrefixCls" ref="tableBodyRef">
    
    <div :class="tableBodyPrefixCls + '__inner'" :style="tableBodyInnerStyle" ref="tableBodyInnerRef">
      <div v-if="isEmpty" :class="tableBodyPrefixCls + '__empty'">
        <component :is="Empty"></component>
      </div>

      <template v-else>
        <div v-if="bodyLeftVisible" ref="tableBodyLeftRef" :class="bodyLeftClass" :style="bodyLeftStyle">
          <BodyRows :col-keys="bodyLeftColKeys" :grid="bodyLeftGrid" v-bind="commonRowProps"></BodyRows>
        </div>


        <div ref="tableBodyCenterRef" :class="bodyCenterClass" :style="bodyCenterStyle">
          <div ref="beforeHandler" class="beforeHandler"></div>
          <BodyRows :col-keys="bodyCenterColKeys" :grid="bodyCenterGrid" v-bind="commonRowProps"></BodyRows>
          <div ref="afterHandler" class="afterHandler"></div>
        </div>

        <div v-if="bodyRightVisible" ref="tableBodyRightRef" :class="bodyRightClass" :style="bodyRightStyle">
          <BodyRows :col-keys="bodyRightColKeys" :grid="[]" v-bind="commonRowProps"></BodyRows>
        </div>
      </template>
    </div>

    <Scrollbar v-if="!isEmpty" :prefix-cls="scrollbarPrefixCls" :state="scrollState" :vertical="true"
      :client="viewport.height" :content="tableState.content_box.height" v-model:scroll="scroll.top" @update:scroll="updateScroll">
    </Scrollbar>
    <Scrollbar :prefix-cls="scrollbarPrefixCls" :state="scrollState" :client="viewport.width" :content="tableState.content_box.width" v-model:scroll="scroll.left" @update:scroll="updateScroll"></Scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { createLockedRequestAnimationFrame, type RawData } from '@scode/table-grid-core';
import type { StyleValue } from 'vue';

import { computed, onMounted, onUnmounted, reactive, shallowRef, triggerRef } from 'vue';
import { useStateInject, useBodyScroll } from '../../hooks';
import { useOverrideInject } from '../context/OverrideContext';
import Scrollbar from "../scrollbar/index.vue";
import BodyRows from "./rows.vue";

interface TableBodyProps {
  prefixCls: string;
}

defineProps<TableBodyProps>()


// 能在这一层收集的信息，就全部放在这里
const { Empty } = useOverrideInject();

const { tableProps, tableState, isNestDataSource } = useStateInject();

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

const { scroll, bodyRef: tableBodyInnerRef  }= useBodyScroll();

const updateScroll = createLockedRequestAnimationFrame(() => {
  Object.assign(tableState.value.scroll, scroll.value);
});

const contentBox = computed(() => tableState.value.content_box);

const tableBodyInnerStyle = computed(() => {
  return {}
});


const offsetTop = computed(() => {
  const first_raw_data = dataSource.value[0];

  return first_raw_data ? tableState.value.get_row_state().get_y(first_raw_data) : 0;
});

const gridTemplateRows = shallowRef<number[]>([]);

function resetGridTemplateRows() {
  gridTemplateRows.value = tableState.value.get_row_heights(dataSource.value);

  if(tableState.value.content_box.height !== contentBox.value.height){
    triggerRef(contentBox)
  }
}
resetGridTemplateRows();

// 左侧固定列
const tableBodyLeftRef = shallowRef<HTMLElement>();
const bodyLeftColKeys = computed(() => tableState.value?.last_left_col_keys ?? []);
const bodyLeftGrid = computed<number[]>(() =>{
  const colState = tableState.value.get_col_state();
  const { config, last_left_col_keys } = tableState.value;

  return last_left_col_keys.map(colKey => colState.get_meta(colKey)?.width ?? config.col_width);
})
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
const bodyCenterColKeys = computed(() => tableState.value?.last_center_col_keys ?? []);
const bodyCenterGrid = computed<number[]>(() => {
  const colState = tableState.value.get_col_state();
  const { config, last_center_col_keys } = tableState.value;

  return last_center_col_keys.map(colKey => colState.get_meta(colKey)?.width ?? config.col_width);
});
const bodyCenterClass = computed(() => {

  return {
    [`${tableBodyPrefixCls.value}__inner-center`]: true,
  }
});
const bodyCenterStyle = computed<StyleValue>(() => {
  const { last_left_col_keys } = tableState.value;

  const rows = [0].concat(gridTemplateRows.value).concat([0]);

  const paddingLeft = tableState.value.get_col_state().get_reduce_width(last_left_col_keys);

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
const bodyRightColKeys = computed(() => tableState.value?.last_right_col_keys ?? []);
const bodyRightVisible = computed(() => !!bodyRightColKeys.value.length);
const bodyRightClass = computed(() => {
  const { viewport, content_box } = tableState.value;

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

const viewport = computed(() => {
  const _view = tableState.value.viewport;
  return {
    width: _view.width,
    height: _view.height,
  }
})

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
  tableState.value.update_row_cells_size(metas);

  resetGridTemplateRows();
}

const $cellResize = new MutationObserver(updateCellSizes)
dataSource.value = tableState.value.get_viewport_dataset();
const $scrollObserver = new IntersectionObserver(() => {
  dataSource.value = tableState.value.get_viewport_dataset();
}, { threshold: 0, rootMargin: "10%" })

const $resize = new ResizeObserver((entry) => {
  const el = entry[0];
  const { width, height } = el.contentRect;
  tableState.value.update_viewport({ width, height });
  triggerRef(tableState);
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