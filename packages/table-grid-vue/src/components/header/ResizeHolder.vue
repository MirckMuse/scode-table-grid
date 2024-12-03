<template>
  <div ref="holderRef" :class="cls" @mousedown="handleMousedown"></div>
</template>

<script lang="ts" setup>
import type { AddEventListenerHandle, ColKey } from '@scode/table-grid-core';
import { addEventListener } from '@scode/table-grid-core';
import { useStateInject } from '../../hooks';
import { computed, ref, shallowRef } from 'vue';

interface ResizeHolderProps {
  prefixCls: string;

  colKey: ColKey;
}

const props = defineProps<ResizeHolderProps>();

const { mapToColumn, handleResizeColumn } = useStateInject();

const holderRef = shallowRef<HTMLElement>()

const isDragging = ref(false);

const cls = computed(() =>({
  [props.prefixCls + "-resizeHolder"]: true,
  dragging: isDragging.value,
}));

type EventName = {
  start: keyof HTMLElementEventMap;
  move: keyof HTMLElementEventMap;
  stop: keyof HTMLElementEventMap;
}

const MouseEventName: EventName = {
  start: "mousedown",
  move: "mousemove",
  stop: "mouseup"
};


let dragMoveHandle: AddEventListenerHandle | null = null;
let dragEndHandle: AddEventListenerHandle | null = null;
let parentOffsetWidth = 0;
let startX = 0;
const minWidth = computed(() => {
  const { minWidth: _minWidth } = mapToColumn(props.colKey) ?? {};

  return "number" != typeof _minWidth || Number.isNaN(_minWidth) ? 50 : _minWidth;
});

const maxWidth = computed(() => {
  const { maxWidth: _maxWidth } = mapToColumn(props.colKey) ?? {};

  return "number" != typeof _maxWidth || Number.isNaN(_maxWidth) ? Infinity : _maxWidth;
})

function createResizeHandle($event: MouseEvent, eventNameMap: EventName) {
  $event.stopPropagation?.();
  destory();
  document.body.style.cursor = "col-resize";
  isDragging.value = true;
  parentOffsetWidth = holderRef.value?.parentElement?.offsetWidth ?? 0;

  startX = $event.pageX;
  dragMoveHandle = addEventListener(document.documentElement, eventNameMap.move, handleDragMove);
  dragEndHandle = addEventListener(document.documentElement, eventNameMap.stop, handleDragEnd)
}

function processDrag($event: DragEvent) {
  let pageX = $event.pageX ?? 0;
  pageX = Math.min(pageX, window.screen.availWidth)
  const offsetX = startX - pageX;
  const adjustedWidth = Math.min(
    Math.max(parentOffsetWidth - offsetX, minWidth.value),
    maxWidth.value,
  );

  handleResizeColumn(props.colKey, adjustedWidth)
}

function handleDragMove($event: DragEvent) {
  processDrag($event);
}

function handleDragEnd($event: DragEvent) {
  isDragging.value = false;
  destory();
  processDrag($event);
  document.body.style.cursor = "default";
}

function destory() {
  dragMoveHandle?.remove();
  dragEndHandle?.remove();
}

function handleMousedown($event: MouseEvent) {
  createResizeHandle($event, MouseEventName)
}
</script>