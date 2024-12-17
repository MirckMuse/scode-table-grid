import { SorterDirection, type ColKey, type SorterState, type TableState } from "@scode/table-grid-core";
import { noop } from "es-toolkit";
import type { InjectionKey, Ref } from "vue";
import { ref, provide, inject } from "vue";

export interface ISorterInject {
  processSorter: (colKey: ColKey) => void;

  sorterStates: Ref<SorterState[]>;
}

const SorterInjectKey: InjectionKey<ISorterInject> = Symbol("__sorter__");

interface ISorterOption {
  resetScroll: () => void;

  resetDataSource: () => void;
}

export function useSorter(tableState: TableState, option: ISorterOption) {
  const sorterStates = ref<SorterState[]>([]);

  const processSorter = (colKey: ColKey) => {
    const sorterState = sorterStates.value.find(state => state.col_key === colKey);

    if (!sorterState) {
      // 无状态 -> 升序
      sorterStates.value.push({ col_key: colKey, direction: SorterDirection.Ascend });
    } else if (sorterState.direction === SorterDirection.Ascend) {
      // 升序 -> 降序
      sorterState.direction = SorterDirection.Descend;
    } else if (sorterState.direction === SorterDirection.Descend) {
      // 降序 -> 无状态
      sorterStates.value = sorterStates.value.filter(state => state.col_key !== colKey);
    }

    tableState.update_sorter_states(sorterStates.value);

    option.resetScroll();
    option.resetDataSource();
  }

  provide(SorterInjectKey, { processSorter, sorterStates });
}

export function useSorterInject() {
  return inject(SorterInjectKey, { processSorter: noop, sorterStates: ref([]) });
}