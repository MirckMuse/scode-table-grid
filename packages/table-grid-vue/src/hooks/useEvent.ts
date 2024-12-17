import type { InjectionKey } from "vue";
import { provide, inject } from "vue";

interface ITableEvent {
  resetDatasource?: () => void;
}

const TableEventKey: InjectionKey<{ event: ITableEvent }> = Symbol("__table_event__");

export function useEvent() {
  const event: ITableEvent = {};

  provide(TableEventKey, { event });

  return { event }
}

export function useEventInject() {
  return inject(TableEventKey, { event: {} });
}