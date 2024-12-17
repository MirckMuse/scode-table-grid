import { isNil, memoize } from "es-toolkit";
import type { ColKey } from "../col";
import type { RawData, RowKey, RowState } from "../row";
import type { Option, Pagination, SorterState } from "../types";
import { SorterDirection } from "../types";
import { get } from "es-toolkit/compat";

enum CompareResult {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

// 目标是完成数据的筛选、排序、分页、展开的数据完成
// 展开数据比较麻烦，需要区分树形结构和展开行两种情况。

function get_sorter_rate(direction?: SorterDirection) {
  if (direction === SorterDirection.Ascend) {
    return 1;
  }
  if (direction === SorterDirection.Descend) {
    return -1;
  }

  return 0;
}

export class TableDataset {
  protected pagination: false | Pagination;

  protected dataset: RawData[];

  protected raw_dataset: RawData[];
  protected raw_row_keys: RowKey[] = [];
  protected raw_flatten_raw_keys: RowKey[] = [];
  protected raw_flatten_raw_datas: RawData[] = [];

  protected display_data: RawData[];

  protected row_state: RowState;

  protected sorter_states: SorterState[] = [];

  protected server = false;

  update_pagination(pagination: Partial<Pagination>) {
    this.pagination = Object.assign({}, this.pagination, pagination);
  }

  constructor(row_state: RowState) {
    this.row_state = row_state;
  }

  init() {
    // TODO:
  }

  // ================== Sorter State ==================
  update_sorter_states(sorter_states: SorterState[]) {
    this.sorter_states = sorter_states;

    this.process_display_dataset();
  }

  get_sorter_states(): SorterState[] {
    return this.sorter_states;
  }

  get_sorter_state(col_key: ColKey): Option<SorterState> {
    return this.sorter_states.find(state => state.col_key === col_key) ?? null;
  }

  get_display_dataset(): RawData[] {
    // 需要考虑分页
    return this.display_data || [];
  }

  // 处理数据集，
  process_dataset(
    raw_datas: RawData[],
    callback?: (
      raw_data: RawData,
      index: number,
      deep: number,
      parent_row_key: Option<RowKey>,
    ) => void,
  ) {
    this.raw_dataset = raw_datas;
    const get_row_key = this.row_state.get_row_key;
    this.raw_row_keys = raw_datas.map(get_row_key);

    this.flatten(raw_datas, 0, null, callback);

    this.process_display_dataset();
  }

  protected process_display_dataset_sorter(display_data: RawData[]) {
    const col_state = this.row_state.table_state.get_col_state();
    // TODO: 需要验证
    const _compare = memoize(({ prev, next }) => {
      if (!isNil(prev) && !isNil(next)) {
        if (typeof prev === "number" && typeof next === "number") {
          return prev - next;
        }

        if (typeof prev === "number" && typeof next === "string") {
          return CompareResult.Less;
        }
        // TODO: 字符串
      }
      if (isNil(prev) && isNil(next)) {
        return CompareResult.Equal;
      }
      if (isNil(prev)) {
        return CompareResult.Less;
      }
      return CompareResult.Greater;
    });
    const new_sorter_states = this.sorter_states.map(state => Object.assign({}, state, { column: col_state.get_column(state.col_key), rate: get_sorter_rate(state.direction) }));
    return display_data.sort((prev, next) => {
      for (const state of new_sorter_states) {
        const dataIndex = state.column?.dataIndex;

        if (!isNil(dataIndex)) {
          const compare_result = _compare({ prev: get(prev, dataIndex), next: get(next, dataIndex) })
          if (compare_result !== CompareResult.Equal) {
            return compare_result * state.rate;
          }
        }
      }
      return CompareResult.Equal;
    });
  }

  // 处理可见的数据集合【筛选、排序、展开、分页】
  process_display_dataset() {
    const need_copy = !!this.sorter_states.length;

    this.display_data = need_copy ? Array.from(this.raw_dataset) : this.raw_dataset;

    if (this.server) {
      // 如果是服务端的来源数据，则无需后续逻辑
      return;
    }
    // TODO: diff 对比筛选、排序、展开、分页、好减少数据处理过程

    if (this.sorter_states.length) {
      this.display_data = this.process_display_dataset_sorter(this.display_data);
    }
  }

  protected flatten(
    raw_datas: RawData[],
    deep: Option<number>,
    parent_row_key: Option<RowKey>,
    callback?: (
      raw_data: RawData,
      index: number,
      deep: number,
      parent_row_key: Option<RowKey>,
    ) => void,
  ) {
    for (let row_index = 0; row_index < raw_datas.length; row_index++) {
      const raw_data = raw_datas[row_index];
      const row_key = this.row_state.get_row_key(raw_data);
      this.raw_flatten_raw_keys.push(row_key);
      this.raw_flatten_raw_datas.push(raw_data);

      const _deep = deep ?? 0;

      callback?.(raw_data, row_index, _deep, parent_row_key);

      const children = this.row_state.get_raw_children(raw_data);

      if (children?.length) {
        this.flatten(children, _deep + 1, parent_row_key, callback);
      }
    }
  }
}
