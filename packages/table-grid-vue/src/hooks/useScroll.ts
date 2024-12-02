import type { TableState } from "@scode/table-grid-core";
import type { ShallowRef } from "vue";
import { onMounted, ref, watch } from "vue";

// 优化 XY
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

export function useHeaderScroll(headerRef: ShallowRef<HTMLElement | undefined>, tableState: ShallowRef<TableState>) {

}

export function useBodyScroll(bodyRef: ShallowRef<HTMLElement | undefined>, tableState: ShallowRef<TableState>) {
  const scroll = ref(tableState.value.scroll);

  const processWheel = ($event: WheelEvent) => {
    $event.preventDefault();
    const { deltaX, deltaY } = $event;
    const [optimizeX, optimizeY] = optimizeScrollXY(deltaX, deltaY);
    const { top, left } = Object.assign({}, tableState.value.scroll);
    const new_scroll = {
      top: top + optimizeY,
      left: left + optimizeX
    }
    tableState.value.update_scroll(new_scroll);
    tableState.value.adjust_scroll();

    const _scroll = tableState.value.scroll;

    // 对比滚动条是否发生变化，减少页面渲染
    if (left === _scroll.left && top === _scroll.top) {
      return;
    }
    scroll.value = _scroll;
  }

  onMounted(() => {
    if (!bodyRef.value) return;

    bodyRef.value.addEventListener("wheel", processWheel, { passive: false })
  });

  return {
    scroll
  }
}
