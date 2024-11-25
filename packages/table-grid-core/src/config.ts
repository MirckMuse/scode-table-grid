import type { RawData } from "./row";
import type { GetRowKey } from "./types";
import { uuid } from "./shared";
import { isNil } from "es-toolkit";

// 默认获取唯一 key 的逻辑
const DefaultGetRowKey: GetRowKey = (() => {
  const cache = new WeakMap();

  // 防止用户传递的数据没有 id
  return (raw_data: RawData) => {
    let key = raw_data?.["id"];

    if (isNil(key) || key === "") {
      key = cache.get(raw_data) || uuid();
      cache.set(raw_data, key);
    }

    return String(key);
  };
})();

export interface ITableDefaultConfig {
  // 列相关信息的配置项
  col_width: number;

  col_height: number;

  col_children_key: string;

  col_key_split_word: string;

  // 行相关信息的配置项
  row_width: number;

  /**
   * @description 行高。1. 固定行高时会使用该参数，2. 没有初始化的行，会默认使用该参数做高度计算。
   */
  row_height: number;

  row_children_key: string;

  row_expand_split_word: string;

  get_row_key: GetRowKey;

  // 其他参数
  get_row_virtual_buffer: (viewport_row_length: number) => number;

  scroll_to_top_after_change: boolean;
}

export const DefaultConfig: ITableDefaultConfig = {
  // 列相关信息的配置项
  col_width: 120,
  col_height: 52,
  col_key_split_word: "__$$__",
  col_children_key: "children",

  // 行相关信息的配置项
  row_width: 120,
  row_height: 52,
  row_children_key: "children",
  row_expand_split_word: "__$RowExpand$__",

  get_row_key: DefaultGetRowKey,

  // 默认取可视数据一半的数据量作为 buffer
  get_row_virtual_buffer: (length: number) => Math.ceil(length / 2),

  scroll_to_top_after_change: true,
};
