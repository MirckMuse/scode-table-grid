<template>
  <div v-if="scrollbarVisible" ref="scrollRef" :class="scrollbarClass" :style="scrollbarStyle">
    <div :class="prefixCls + '__thumb'" :style="thumbStyle" @mousedown.stop="handleThumbMousedown"></div>
  </div>
</template>

<script lang="ts" setup>
import type { TableScroll } from '../../typing';
import { computed, shallowRef } from 'vue';


interface ScrollbarProps {

  state: Partial<TableScroll>;

  prefixCls: string;

  vertical?: boolean;

  client: number;

  content: number;
}

// 浏览器是向下取整的，会有 1px 的误差
const Pixel_Error_Buffer = 1;

const props = defineProps<ScrollbarProps>();

const scroll = defineModel("scroll", { type: Number, default: 0 });

const scrollRef = shallowRef<HTMLElement>();

const MIN_THUMB_SIZE = 16;

const sizeKey = props.vertical ? 'height' : "width"
const marginKey = props.vertical ? 'marginTop' : "marginLeft";

const ratio = computed(() => {
  const { client, content } = props;
  return client / content;
});

// 计算后的滚动条尺寸
const computedthumbSize = computed(() => Math.max(ratio.value * props.client, 1))

// 校准后的滚动条尺寸
const thumbSize = computed(() => Math.max(computedthumbSize.value, MIN_THUMB_SIZE));

const thumbStyle = computed(() => {
  let { client, content } = props;
  if (props.state?.position === 'inner') {
    // TODO: 交叉轴有的时候，才需要做减法
    // client = client - (props.state?.size ?? 6);
  }

  if (client === content) {
    return { [sizeKey]: "0px", [marginKey]: "0px" };
  }

  // 因为thumb有最小的尺寸，基于原有的比例计算出来的margin有偏差，需要校准一下
  const adjustOffset = scroll.value / (client - thumbSize.value) * (thumbSize.value - computedthumbSize.value);
  let offset = Math.max(ratio.value * (scroll.value - adjustOffset), 0);
  offset = Math.min(offset, client - thumbSize.value);

  // thumbSize 应该给个最小尺寸
  return {
    [sizeKey]: thumbSize.value + "px",
    [marginKey]: offset + "px",
  }
});

const scrollbarClass = computed(() => {
  const { prefixCls, vertical, state } = props;
  return {
    [`${prefixCls}__track`]: true,
    [`vertical`]: vertical,
    [`${state.position}`]: true,
  };
});

// 当内容大于容器高度时，滚动条显式
const scrollbarVisible = computed(() => {
  const { content, client } = props;
  return content > client + Pixel_Error_Buffer;
});

// 滚动条样式
const scrollbarStyle = computed(() => {
  const { state } = props;
  return {
    "--table-scroll-size": (state?.size ?? 6) + "px"
  }
});

const getPosition = (function (isVertical: boolean) {
  return isVertical
    ? ($event: MouseEvent) => $event.pageY
    : ($event: MouseEvent) => $event.pageX;
})(props.vertical);

const getTrackPosition = (function (isVertical: boolean) {
  return isVertical
    ? () => scrollRef.value?.getBoundingClientRect().top ?? 0
    : () => scrollRef.value?.getBoundingClientRect().left ?? 0
})(props.vertical);

let mousedownStartPagePosition = 0;
let userSelect = "";
let start_scroll = 0;

// 鼠标按下 thumb 时，记录了当前的位置
function handleThumbMousedown($event: MouseEvent) {
  mousedownStartPagePosition = getPosition($event);
  userSelect = document.body.style.userSelect;
  start_scroll = scroll.value;
  document.body.style.userSelect = 'none';
  document.addEventListener("mousemove", handleMousemove);
  document.addEventListener("mouseup", handleMouseup);
}

let interval: NodeJS.Timeout | null = null;

function cancelInterval() {
  interval && clearInterval(interval);
}

// 在滚动条轨道点击时，需要计算相对于track的整体比例，来计算滚动距离
function handleTrackMousedown($event: MouseEvent) {

  interval = setInterval(() => {
    handleTrackClick($event)
  }, 200);
}

defineExpose({
  cancelInterval,
  handleTrackMousedown
})

function handleTrackClick($event: MouseEvent) {
  const { client } = props;
  let mouseDownPosition = getPosition($event);
  let trackPosition = getTrackPosition();
  if (mouseDownPosition > trackPosition) {
    scroll.value = start_scroll + client;
  }
}
function handleMousemove($event: MouseEvent) {
  const { content, client } = props;
  const moveLength = getPosition($event) - mousedownStartPagePosition;

  // 移动距离需要处理比例 + 起始滚动距离
  let newScroll = moveLength / ratio.value + start_scroll;
  newScroll = Math.min(newScroll, content - client);
  newScroll = Math.max(newScroll, 0);
  scroll.value = newScroll;
}

function handleMouseup() {
  document.body.style.userSelect = userSelect;
  document.removeEventListener("mousemove", handleMousemove);
  document.removeEventListener("mouseup", handleMouseup);
}

</script>