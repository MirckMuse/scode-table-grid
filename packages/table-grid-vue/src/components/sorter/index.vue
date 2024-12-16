<template>
  <span :class="prefixCls + '__sorter'" @click="processSorter">
    <slot>
      <svg class="s-icon remixicon" data-v-898927e4="" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        fill="currentColor" width="24px" height="24px">
        <path id="ascend" d="M18 9 12 3 6 9H18Z"></path>
        <path id="descend" d="M18 15 12 21 6 15H18Z"></path>
      </svg>
    </slot>
  </span>
</template>

<script lang="ts" setup>
import type { SorterState } from '@scode/table-grid-core';


interface ITableSortProps {
  prefixCls: string;

  sorterState?: SorterState;

  processSorter?: () => void;
}

defineProps<ITableSortProps>()
</script>