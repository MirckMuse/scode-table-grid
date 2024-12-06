import { type TableState, type Scroll, createLockedRequestAnimationFrame } from "@scode/table-grid-core";
import type { Ref, ShallowRef, InjectionKey } from "vue";
import { onMounted, ref, provide, shallowRef, inject } from "vue";
import { useStateInject } from "./useState";

interface IScroll {
  headerRef: ShallowRef<HTMLElement | undefined>,
  bodyRef: ShallowRef<HTMLElement | undefined>,
  scroll: Ref<Scroll>,
}

const ScrollKey: InjectionKey<IScroll> = Symbol("__scroll__");

export function useScroll(tableState: ShallowRef<TableState>) {
  const headerRef = shallowRef<HTMLElement>();
  const bodyRef = shallowRef<HTMLElement>();
  const scroll = ref(tableState.value.scroll);

  provide(ScrollKey, {
    headerRef,
    bodyRef,
    scroll,
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
  const { bodyRef, scroll } = inject(ScrollKey, DefaultScroll);

  const { tableState } = useStateInject();

  function processWheel($event: WheelEvent) {
    $event.preventDefault();

    animationWheel($event);
  }

  const animationWheel = createLockedRequestAnimationFrame(($event: WheelEvent) => {
    const { deltaX, deltaY } = $event;

    const [optimizeX, optimizeY] = optimizeScrollXY(deltaX, deltaY);

    const { left, top } = tableState.value.scroll;

    tableState.value.update_scroll({
      left: left + optimizeX,
      top: top + optimizeY
    });
    tableState.value.adjust_scroll();

    const _scroll = tableState.value.scroll;

    // 对比滚动条是否发生变化，减少页面渲染
    if (left === _scroll.left && top === _scroll.top) {
      return;
    }

    Object.assign(scroll.value, _scroll);
  });

  onMounted(() => {
    if (!bodyRef.value) return;

    bodyRef.value.addEventListener("wheel", processWheel, { passive: false })
  });

  return {
    bodyRef,
    scroll
  }
}

export function useHeaderScroll() {
  const { headerRef, scroll } = inject(ScrollKey, DefaultScroll);

  const { tableState } = useStateInject();

  function processWheel($event: WheelEvent) {
    $event.preventDefault();

    animationWheel($event);
  }

  const animationWheel = createLockedRequestAnimationFrame(($event: WheelEvent) => {
    const { deltaX } = $event;

    const { left } = tableState.value.scroll;

    tableState.value.update_scroll({ left: left + deltaX });
    tableState.value.adjust_scroll();

    const _scroll = tableState.value.scroll;

    // 对比滚动条是否发生变化，减少页面渲染
    if (left === _scroll.left) {
      return;
    }

    Object.assign(scroll.value, _scroll);
  });

  onMounted(() => {
    if (!headerRef.value) return;

    headerRef.value.addEventListener("wheel", processWheel, { passive: false });
  })

  return {
    headerRef,
    scroll
  }
}
