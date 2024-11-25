import type { RawData, RowKey, RowState } from "../row";
import type { Option, Pagination } from "../types";

// 目标是完成数据的筛选、排序、分页、展开的数据完成
// 展开数据比较麻烦，需要区分树形结构和展开行两种情况。

export class TableDataset {
  protected pagination: false | Pagination;

  protected dataset: RawData[];

  protected raw_dataset: RawData[];
  protected raw_row_keys: RowKey[] = [];
  protected raw_flatten_raw_keys: RowKey[] = [];
  protected raw_flatten_raw_datas: RawData[] = [];

  protected display_data: RawData[];

  protected row_state: RowState;

  update_pagination(pagination: Partial<Pagination>) {
    this.pagination = Object.assign({}, this.pagination, pagination);
  }

  constructor(row_state: RowState) {
    this.row_state = row_state;
  }

  init() {
    // TODO:
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

  // 处理可见的数据集合【筛选、排序、展开、分页】
  process_display_dataset() {
    // TODO:
    // diff 对比筛选、排序、展开、分页、好减少数据处理过程
    this.display_data = this.raw_dataset;
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
