<template>
  <component :is="Spin">
    <!-- 分页组件[顶部] -->
    <component v-if="paginationVisible && paginationPosition === 'top'" :is="Pagination"></component>

    <div ref="tableInternalRef" :class="tableClass">
      <TableHeader ref="tableHeaderRef" :prefix-cls="prefixCls + '-header'" :class="tableHeaderClass"></TableHeader>
      <TableBody ref="tableBodyRef" :prefix-cls="prefixCls + '-body'" :class="tableBodyClass"></TableBody>
    </div>

    <component v-if="paginationVisible && paginationPosition === 'bottom'" :is="Pagination"></component>
  </component>
</template>

<script lang="ts" setup>
import { isObject } from "es-toolkit/compat";
import type { TableProps } from "../typing"
import { useOverrideInject } from "./context/OverrideContext"
import { computed, onMounted, shallowRef } from "vue";
import { useStateInject } from "../hooks";
import TableHeader from "./header/index.vue"
import TableBody from "./body/index.vue"


defineOptions({
  name: "SInternalTable",
});

const props = defineProps<TableProps>();

const slots = defineSlots();

const { Spin, Pagination } = useOverrideInject();

const { tableState } = useStateInject();

const tableClass = computed(() => {
  const { prefixCls, bordered } = props;

  return {
    [`${prefixCls}-internal`]: true,
    [`${prefixCls}-bordered`]: bordered,
  }
});

const tableInternalRef = shallowRef<HTMLElement>();

// 表头
const tableHeaderRef = shallowRef<any>();
const tableHeaderClass = computed(() => {
  return {
  };
});

// 表体
const tableBodyRef = shallowRef<any>();
const tableBodyClass = computed(() => {
  const { prefixCls } = props;

  return {
    [`${prefixCls}-body`]: true,
  };
});

// 分页
const paginationVisible = computed(() => !!props.pagination);
const paginationPosition = computed(() => {
  const _pagination = props.pagination;
  return isObject(_pagination) ? _pagination.vertical ?? "bottom" : "bottom";
});

onMounted(()=>{
  console.log(tableBodyRef.value)
})
</script>
