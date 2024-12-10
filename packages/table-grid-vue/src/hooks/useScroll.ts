import type { TableState } from "@scode/table-grid-core";
import type { ShallowRef, InjectionKey } from "vue";
import { onMounted, ref, provide, shallowRef, inject } from "vue";
import { useStateInject } from "./useState";

interface IScroll {
  headerRef: ShallowRef<HTMLElement | undefined>,
  bodyRef: ShallowRef<HTMLElement | undefined>,
}

const ScrollKey: InjectionKey<IScroll> = Symbol("__scroll__");

export function useScroll(tableState: TableState) {
  const headerRef = shallowRef<HTMLElement>();
  const bodyRef = shallowRef<HTMLElement>();

  provide(ScrollKey, {
    headerRef,
    bodyRef,
  })
}

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

const DefaultScroll = {
  headerRef: shallowRef(),
  bodyRef: shallowRef(),
  scroll: ref({ top: 0, left: 0 }),
}

export function useBodyScroll() {
  const { bodyRef } = inject(ScrollKey, DefaultScroll);

  const { tableState, updateScroll } = useStateInject();

  function processWheel($event: WheelEvent) {
    $event.preventDefault();

    const { deltaX, deltaY } = $event;

    const [optimizeX, optimizeY] = optimizeScrollXY(deltaX, deltaY);

    const { left, top } = tableState.scroll;

    updateScroll({
      left: left + optimizeX,
      top: top + optimizeY
    });
  }

  onMounted(() => {
    if (!bodyRef.value) return;

    bodyRef.value.addEventListener("wheel", processWheel, { passive: false })
  });

  return { bodyRef }
}

export function useHeaderScroll() {
  const { headerRef } = inject(ScrollKey, DefaultScroll);

  const { tableState, updateScroll } = useStateInject();

  function processWheel($event: WheelEvent) {
    $event.preventDefault();

    const { deltaX } = $event;

    const { left } = tableState.scroll;

    updateScroll({ left: left + deltaX })
  }

  onMounted(() => {
    if (!headerRef.value) return;

    headerRef.value.addEventListener("wheel", processWheel, { passive: false });
  })

  return { headerRef }
}
