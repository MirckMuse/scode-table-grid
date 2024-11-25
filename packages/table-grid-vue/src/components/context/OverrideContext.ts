import type { DefineComponent, InjectionKey, VNode } from "vue";
import { inject, provide, defineComponent, h } from "vue";

const OverrideKey: InjectionKey<IOverride> = Symbol("__override_key__");

interface SpinProps {
  spinning: boolean;

  tip: string | VNode;

  delay: number;
}

interface PaginationProps {
  // TODO: 分页的参数
  a: string;
}

export interface IOverride {
  Spin?: DefineComponent<any, any, any>;

  Pagination?: DefineComponent;

  Empty?: DefineComponent;
}

function useOverrideProvide(props: IOverride) {
  provide(OverrideKey, props);
}

const DefaultSpin = defineComponent({
  name: "SSpin",

  setup(props, { slots }) {
    return () => {
      return h(
        "div",
        { class: "s-table-spin" },
        {
          default: () => slots['default']?.()
        }
      )
    }
  }
})

export function useOverrideInject() {
  return inject(OverrideKey, {
    Spin: DefaultSpin
  });
}

export const OverrideContext = defineComponent<IOverride>({
  name: "STableOverrideContext",

  inheritAttrs: false,

  setup(props, { slots }) {
    useOverrideProvide(props);

    return () => slots["default"]?.();
  },
});
