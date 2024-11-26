import type { TableState } from "@scode/table-grid-core";
import { throttle } from "es-toolkit";
import { nextTick, onMounted, triggerRef, type Ref, type ShallowRef } from "vue";

export const optimizeScrollXY = (
  x: number,
  y: number,
  ratio: number = 1,
): [number, number] => {
  // 调参工程师
  const ANGLE = 2;
  const angle = Math.abs(x / y);

  // 经过滚动优化之后的 x, y
  const deltaX = angle <= 1 / ANGLE ? 0 : x;
  const deltaY = angle > ANGLE ? 0 : y;

  return [deltaX * ratio, deltaY * ratio];
};

export function useTableBodyScroll(
  tableInnerBody: ShallowRef<HTMLElement | undefined>,
  tableState: ShallowRef<TableState>,
) {

  // 处理 body 的滚动事件
  const throttleUpdateScroll = throttle((deltaX: number, deltaY) => {
    const [optimizeX, optimizeY] = optimizeScrollXY(deltaX, deltaY);

    const scroll = Object.assign({}, tableState.value.scroll);

    const new_scroll = {
      top: scroll.top + optimizeY,
      left: scroll.left + optimizeX
    }
    tableState.value.update_scroll(new_scroll);
    tableState.value.adjust_scroll();

    const _scroll = tableState.value.scroll;

    // 对比滚动条是否发生变化，减少页面渲染
    if (scroll.left === _scroll.left && scroll.top === _scroll.top) {
      return;
    }
    triggerRef(tableState);
  }, 16);

  const processWheel = ($event: WheelEvent) => {
    $event.preventDefault();
    const { deltaX, deltaY } = $event;

    throttleUpdateScroll(deltaX, deltaY)
  }

  onMounted(() => {
    if (!tableInnerBody.value) return;

    tableInnerBody.value.addEventListener("wheel", processWheel, { passive: false })
  })
}
