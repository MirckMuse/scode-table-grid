import type { TableState } from "./table";
import type { Option, Scroll, TableColumn, IViewport } from "./types";

import { isNil, isNotNil } from "es-toolkit";

export type ColKey = string;

export type ColMetaFixed = false | "left" | "right";

export interface ColMeta {
  key: ColKey;

  width: number;

  height: number;

  deep: number;

  fixed: ColMetaFixed;

  col_span: number;

  row_span: number;

  sort: number;

  is_leaf: boolean;
}

export class ColState {
  protected table_state: TableState;

  protected col_key_map_meta = new Map<ColKey, ColMeta>();

  protected col_key_map_children = new Map<ColKey, ColKey[]>();

  protected col_key_map_parent = new Map<ColKey, Option<ColKey>>();

  protected col_key_map_column = new Map<ColKey, Option<TableColumn>>();

  protected seed = 0;

  constructor(table_state: TableState) {
    this.table_state = table_state;
  }

  protected init() {
    this.seed = 0;
    this.col_key_map_meta.clear();
    this.col_key_map_children.clear();
    this.col_key_map_parent.clear();
    this.col_key_map_column.clear();
  }

  protected create_meta(
    column: TableColumn,
    index: number,
    parent: Option<TableColumn>,
  ): ColMeta {
    const parent_col_meta = parent ? this.get_meta(parent.key) : null;
    const deep = (parent_col_meta?.deep ?? -1) + 1;
    const fixed = (column.fixed ? column.fixed : false) as ColMetaFixed;

    const { col_width, col_height } = this.table_state.config;

    return {
      key: column.key,
      width: column.width ?? col_width,
      height: col_height,
      deep,
      sort: ++this.seed,
      col_span: column.col_span ?? 1,
      row_span: 1,
      fixed: fixed && typeof column.fixed === "boolean" ? "left" : fixed,
      is_leaf: !column.children?.length,
    };
  }

  protected update_columns_meta(
    columns: TableColumn[],
    parent_column: Option<TableColumn>,
  ) {
    const parent_col_key = parent_column?.key;
    const chilren_col_keys: ColKey[] = [];

    columns.forEach((column, col_index) => {
      const col_meta = this.create_meta(column, col_index, parent_column);
      const col_key = col_meta.key;
      this.col_key_map_column.set(col_key, column);
      this.col_key_map_meta.set(col_key, col_meta);
      if (parent_col_key) {
        this.col_key_map_parent.set(col_key, parent_col_key);
        chilren_col_keys.push(col_key);
      }

      if (column.children?.length) {
        this.update_columns_meta(column.children, column);
      }
    });

    parent_col_key &&
      this.col_key_map_children.set(parent_col_key, chilren_col_keys);
  }

  update_columns(columns: TableColumn[]) {
    this.init();

    this.update_columns_meta(columns, null);
  }

  get_meta(col_key: ColKey): Option<ColMeta> {
    return this.col_key_map_meta.get(col_key);
  }

  get_column(col_key: ColKey): Option<TableColumn> {
    return this.col_key_map_column.get(col_key);
  }

  get_all_meta(): ColMeta[] {
    return Array.from(this.col_key_map_meta.values());
  }

  /**
   * 
   * @description 获取所有最深的，从 0 开始
   */
  get_deepest(): number {
    return Math.max(...this.get_all_meta().map((meta) => meta.deep));
  }

  get_height(): number {
    // FIXME: 需要计算真实高度
    return (this.get_deepest() + 1) * this.table_state.config.col_height;
  }

  // 获取列宽，用于表头、
  get_col_width(col_key: ColKey): number {
    const meta = this.get_meta(col_key);

    return meta?.width ?? this.table_state.config.col_width;
  }

  get_col_height(col_key: ColKey): number {
    const meta = this.get_meta(col_key);

    return meta?.height ?? this.table_state.config.col_height;
  }

  update_col_width(col_key: ColKey, width: number) {
    const meta = this.get_meta(col_key);

    if (!meta) return;
    meta.width = width;

    let parent_col_meta: Option<ColMeta> = this.get_parent_meta(col_key);

    const _process = (width: number, meta: ColMeta): number =>
      width + (meta.width ?? 0);

    while (parent_col_meta) {
      const children = this.get_children_meta(parent_col_meta.key) ?? [];
      parent_col_meta.width = children.reduce(_process, 0);

      parent_col_meta = this.get_parent_meta(parent_col_meta.key);
    }
  }

  update_col_height(col_key: ColKey, height: number) {
    const meta = this.get_meta(col_key);
    if (!meta) return;
    meta.height = height;

    // TODO: 高度的计算比较麻烦，需要考虑一下怎么确保高度保持一致。【row_span 为 1 的才能更新高度。其他则只是计算值】
  }

  get_parent_meta(col_key: ColKey): Option<ColMeta> {
    const parent_col_key = this.col_key_map_parent.get(col_key);

    return isNotNil(parent_col_key) ? this.get_meta(parent_col_key) : null;
  }

  get_children_meta(col_key: ColKey): Option<ColMeta[]> {
    const children_col_keys = this.col_key_map_children.get(col_key);
    if (isNil(children_col_keys)) return null;

    return children_col_keys.map((child_col_key) =>
      this.get_meta(child_col_key),
    ) as ColMeta[];
  }

  get_virtual_columns(viewport: IViewport, scroll: Scroll): TableColumn[] {
    return [];
  }
}
