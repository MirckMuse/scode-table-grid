<template>
  <div :class="tableBodyPrefixCls" ref="tableBodyRef">
    <div :class="tableBodyPrefixCls + '__inner'" ref="tableBodyInnerRef">
      <div v-if="isEmpty" :class="tableBodyPrefixCls + '__empty'">
        <component :is="Empty"></component>
      </div>

      <template v-else>
        <div v-if="bodyLeftVisible" ref="tableBodyLeftRef" :class="bodyLeftClass" :style="bodyLeftStyle">
          <div class="beforeHandler"></div>
          <BodyRows :col-keys="bodyLeftColKeys" :grid="[]" v-bind="commonRowProps"></BodyRows>
          <div class="afterHandler"></div>
        </div>

        <div ref="tableBodyCenterRef" :class="bodyCenterClass" :style="bodyCenterStyle">
          <div ref="beforeHandler" class="beforeHandler"></div>
          <BodyRows :col-keys="bodyCenterColKeys" :grid="bodyCenterGrid" v-bind="commonRowProps"></BodyRows>
          <div ref="afterHandler" class="afterHandler"></div>
        </div>

        <div v-if="bodyRightVisible" ref="tableBodyRightRef" :class="bodyRightClass" :style="bodyRightStyle">
          <div class="beforeHandler"></div>
          <BodyRows :col-keys="bodyRightColKeys" :grid="[]" v-bind="commonRowProps"></BodyRows>
          <div class="afterHandler"></div>
        </div>
      </template>
    </div>
    {{ viewport.height, tableState.content_box.height }}
    <Scrollbar v-if="!isEmpty" :prefix-cls="scrollbarPrefixCls" :state="scrollState" :vertical="true"
      :client="viewport.height" :content="tableState.content_box.height" v-model:scroll="tableState.scroll.top">
    </Scrollbar>
    <!-- <Scrollbar :prefix-cls="scrollbarPrefixCls" :state="scrollState"></Scrollbar> -->
  </div>
</template>

<script lang="ts" setup>
import type { RawData } from '@scode/table-grid-core';
import type { StyleValue } from 'vue';

import { computed, onMounted, onUnmounted, reactive, shallowRef, triggerRef, watchEffect } from 'vue';
import { useStateInject, useTableBodyScroll } from '../../hooks';
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
const tableBodyInnerRef = shallowRef<HTMLElement>();

useTableBodyScroll(tableBodyInnerRef, tableState);

const offsetTop = computed(() => {
  const first_raw_data = dataSource.value[0];

  return first_raw_data ? tableState.value.get_row_state().get_y(first_raw_data) : 0;
});

const gridTemplateRows = shallowRef();

function resetGridTemplateRows() {
  const heights = [0].concat(tableState.value.get_row_heights(dataSource.value));
  heights.push(0);

  gridTemplateRows.value = heights.map((height) => height + "px").join(" ");
}
resetGridTemplateRows();

// 左侧固定列
const tableBodyLeftRef = shallowRef<HTMLElement>();
const bodyLeftColKeys = computed(() => tableState.value?.last_left_col_keys ?? []);
const bodyLeftVisible = computed(() => !!bodyLeftColKeys.value.length);
const bodyLeftClass = computed(() => {
  const { scroll } = tableState.value;

  return {
    [`${tableBodyPrefixCls.value}__inner-fixedLeft`]: true,
    [`${tableProps.prefixCls}-fixedLeft`]: true,
    shadow: scroll.left > 0
  }
});
const bodyLeftStyle = computed<StyleValue>(() => {
  return {};
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
  const { scroll } = tableState.value;

  const style: StyleValue = {
    paddingTop: offsetTop.value + 'px',
    transform: `translate(${-scroll.left}px, ${-scroll.top}px)`,
    gridTemplateRows: gridTemplateRows.value
  }

  return style;
});

// 右侧固定列
const tableBodyRightRef = shallowRef<HTMLElement>();
const bodyRightColKeys = computed(() => tableState.value?.last_right_col_keys ?? []);
const bodyRightVisible = computed(() => !!bodyRightColKeys.value.length);
const bodyRightClass = computed(() => {
  const { viewport, content_box, scroll } = tableState.value;

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

const viewport = computed(() => {
  const _view = tableState.value.viewport;
  return {
    width: _view.width,
    height: _view.height,
  }
})

// const scroll = computed(() => tableState.value.scroll);

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
  const cells = Array.from(tableBodyRef.value?.querySelectorAll(".s-table-body-cell") ?? []) as HTMLElement[];
  const metas = cells.map(_elementToCellMeta);
  tableState.value.update_row_cells_size(metas);

  resetGridTemplateRows();
}

const $childrenChange = new MutationObserver(updateCellSizes)
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
    $childrenChange.observe(tableBodyInnerRef.value, { childList: true, subtree: true });
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
  $childrenChange.disconnect();
  $resize.disconnect();
  $scrollObserver.disconnect();
})
</script>