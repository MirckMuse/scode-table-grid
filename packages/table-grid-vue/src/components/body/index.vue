<template>
  <div :class="tableBodyPrefixCls" ref="tableBodyRef">
    <div :class="tableBodyPrefixCls + '__inner'" ref="tableBodyInnerRef">
      <div v-if="isEmpty" :class="tableBodyPrefixCls + '__empty'">
        <component :is="Empty"></component>
      </div>

      <template v-else>
        <div v-if="bodyLeftVisible" ref="tableBodyLeftRef" :class="bodyLeftClass" :style="bodyLeftStyle">
          <BodyRows :col-keys="bodyLeftColKeys" :grid="[]" v-bind="commonRowProps"></BodyRows>
        </div>
        <div ref="tableBodyCenterRef" :class="bodyCenterClass" :style="bodyCenterStyle">
          <BodyRows :col-keys="bodyCenterColKeys" :grid="bodyCenterGrid" v-bind="commonRowProps"></BodyRows>
        </div>
        <div v-if="bodyRightVisible" ref="tableBodyRightRef" :class="bodyRightClass" :style="bodyRightStyle">
          <BodyRows :col-keys="bodyRightColKeys" :grid="[]" v-bind="commonRowProps"></BodyRows>
        </div>
      </template>
    </div>

    {{ tableState.content_box.height }}
    <Scrollbar v-if="!isEmpty" :prefix-cls="scrollbarPrefixCls" :state="scrollState" :vertical="true"
      :client="viewport.height" :content="tableState.content_box.height"
      v-model:scroll="tableState.scroll.top">
    </Scrollbar>
    <!-- <Scrollbar :prefix-cls="scrollbarPrefixCls" :state="scrollState"></Scrollbar> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, onUpdated, reactive, shallowRef, watch, watchEffect, type StyleValue } from 'vue';
import { useStateInject, useTableBodyScroll } from '../../hooks';
import { useOverrideInject } from '../context/OverrideContext';
import Scrollbar from "../scrollbar/index.vue";
import BodyRows from "./rows.vue";
import type { RawData } from '@scode/table-grid-core';
import { throttle } from 'es-toolkit';

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

const gridTemplateRows = computed(() => {
  return tableState.value
    .get_row_heights(dataSource.value)
    .map((height) => height + "px")
    .join(" ");
});

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

// watch(
//   () => ([
//     tableState.value.viewport,
//     tableState.value.scroll.top,
//   ]),
//   () => {
//     dataSource.value = tableState.value.get_viewport_dataset();
//   },
//   { immediate: true }
// );

watchEffect(() => {
  dataSource.value = tableState.value.get_viewport_dataset()
})

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

const throttleUpdateCellSizes = throttle(() => {
  const cells = Array.from(tableBodyRef.value?.querySelectorAll(".s-table-body-cell") ?? []) as HTMLElement[];
  const metas = cells.map(_elementToCellMeta);
  tableState.value.update_row_cells_size(metas);
}, 16);

onUpdated(() => {
  // TODO: 这里需要移除mergedCell
  throttleUpdateCellSizes();
});
</script>