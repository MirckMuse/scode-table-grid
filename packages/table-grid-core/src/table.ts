import type { RawData, RowKey } from "./row";
import type { ColKey, ColMeta } from "./col";
import type { ITableDefaultConfig } from "./config";
import type {
  Option,
  Viewport,
  Scroll,
  Pagination,
  TableColumn,
} from "./types";
import type { Box, CellMeta, MergedCell, MergedCellMeta } from "./cell";

import { RowState } from "./row";
import { DefaultConfig } from "./config";
import { groupBy } from "es-toolkit";
import { ColState } from "./col";

// 表格状态的配置项目
export interface ITableStateOption {
  config: Option<Partial<ITableDefaultConfig>>;

  // 固定行高
  fixed_row_height: boolean;

  expand_all_rows: boolean;

  expand_row_keys: RowKey[];

  pagination: boolean | Pagination;

  // 必传字段。
  viewport: Viewport;
}

// 必传属性
type RequiredProperties = "viewport";

type InternalTableStateOption = Omit<ITableStateOption, RequiredProperties>;

// 外部必传参数
type RequiredTableStateOption = Pick<ITableStateOption, RequiredProperties>;

type TableStateOption = Partial<InternalTableStateOption> &
  RequiredTableStateOption;

type DefaultInternalTableStateOption = Omit<InternalTableStateOption, "config">;

const DefaultTableOption: DefaultInternalTableStateOption = {
  fixed_row_height: false,
  expand_all_rows: false,
  expand_row_keys: [],

  pagination: false,
};

// 表格状态
export class TableState {
  // 可视区域相关的参数
  viewport: Viewport = { width: 1920, height: 900 };;
  // 内容尺寸的相关参数
  content_box: Box = { width: 0, height: 0 };

  update_viewport(viewport: Partial<Viewport>) {
    this.viewport = Object.assign({}, this.viewport, viewport);
  }

  // 滚动的相关 facet
  scroll: Scroll = { top: 0, left: 0 };

  update_scroll(scroll: Partial<Scroll>) {
    this.scroll = Object.assign({}, this.scroll, scroll);
  }

  config: ITableDefaultConfig;

  option: Omit<ITableStateOption, "config">;

  protected row_state;
  protected col_state;

  static create(option: TableStateOption): TableState {
    return new TableState(option);
  }

  constructor(option: TableStateOption) {
    const { config, ...rest } = option || {};

    // 初始化配置
    this.config = Object.assign({}, DefaultConfig, config || {});
    this.option = Object.assign({}, DefaultTableOption, rest || {});

    this.row_state = new RowState(this);
    this.col_state = new ColState(this);
  }

  get_row_state() {
    return this.row_state;
  }

  get_col_state() {
    return this.col_state;
  }

  /** ==========   操作行状态的动作   ========== */
  /** ==========  操作cell状态的动作  ========== */

  // 操作数据行单元格的尺寸
  update_row_cells_size(cells: CellMeta[]) {
    const grouped_cells = groupBy(cells, (item) => item.row_key);

    for (const row_key of Object.keys(grouped_cells)) {
      const items = grouped_cells[row_key];

      const row_height = Math.max(...items.map((item) => item.height));

      this.row_state.update_row_height_by_row_key(row_key, row_height);
    }
  }

  update_col_width(col_key: ColKey, width: number) {
    this.col_state.update_col_width(col_key, width);
  }

  // 渲染时，判断该单元格是不是合并的单元格。
  is_merged_cell(row_key: RowKey, col_key: ColKey): boolean {
    return true;
  }

  get_merged_cell_meta(row_key: RowKey, col_key: ColKey): MergedCellMeta {
    throw new Error("TODO:")
  }

  /** ========== 操作 dataset 的动作 ========== */

  /**
   * @description 默认的滚动行为、数据更新、筛选、排序、分页后重置 scroll 的行为。
   */
  protected default_scroll_behavior() {
    if (this.config.scroll_to_top_after_change) {
      this.scroll.top = 0;
    }
  }

  // 更新数据集
  update_dataset(dataset: RawData[]) {
    this.default_scroll_behavior();

    this.content_box.height = dataset.length * this.config.row_height;

    this.row_state.update_dataset(dataset);

    /**
     * 1. 筛选
     * 2. 排序
     * 3. 展开
     * 4. 分页
     */

    // 重置内容高度
    const { display_dataset, display_dataset_y } = this.row_state;
    const last_index = display_dataset.length - 1;
    const last_raw_data = display_dataset[last_index];
    const content_height =
      display_dataset_y[last_index] +
      this.row_state.get_row_height_by_raw_data(last_raw_data);
    this.content_box.height = content_height;
  }

  // 更新筛选项
  update_filter() {
    this.default_scroll_behavior();
  }

  // 更新排序
  update_sorter() {
    this.default_scroll_behavior();
  }

  // 更新分页
  update_pagination(pagination: Partial<Pagination>) {
    this.default_scroll_behavior();

    this.row_state.dataset.update_pagination(pagination);
  }

  // 更新展开行
  update_expand_rows(expandedRowKeys: RowKey[]) {
    // TODO: 需要考虑区分树形结构和外挂的展开块
  }

  // 获取所有展开列
  get_all_expand_row_keys(): RowKey[] {
    return this.row_state.get_all_expand_keys();
  }

  get_viewport_dataset(): RawData[] {
    return this.row_state.get_virtual_dataset(this.viewport, this.scroll);
  }

  get_row_heights(raw_datas: RawData[]): number[] {
    return raw_datas.map((raw_data) =>
      this.row_state.get_row_height_by_raw_data(raw_data),
    );
  }

  /** ==========   操作列相关的动作   ========== */
  // 左侧
  left_col_keys: ColKey[] = [];
  last_left_col_keys: ColKey[] = [];

  // 中间
  center_col_keys: ColKey[] = [];
  last_center_col_keys: ColKey[] = [];

  // 右侧
  right_col_keys: ColKey[] = [];
  last_right_col_keys: ColKey[] = [];
  get_viewport_columns(): TableColumn[] {
    return this.col_state.get_virtual_columns(this.viewport, this.scroll);
  }

  update_columns(columns: TableColumn[]) {
    this.col_state.update_columns(columns);

    const all_metas = this.col_state.get_all_meta();

    const _meta_to_col_key = (col_meta: ColMeta) => col_meta.key;
    const _sort = (prev: ColMeta, next: ColMeta) =>
      prev.deep === next.deep ? prev.sort - next.sort : prev.deep - next.deep;

    const _process = (metas: ColMeta[]) => {
      const col_keys = metas.sort(_sort).map(_meta_to_col_key);
      const last_col_keys = metas
        .filter((meta) => meta.is_leaf)
        .sort((a, b) => a.sort - b.sort)
        .map(_meta_to_col_key);
      return [col_keys, last_col_keys];
    };

    const [left_col_keys, last_left_col_keys] = _process(
      all_metas.filter((meta) => meta.fixed === "left"),
    );
    this.left_col_keys = left_col_keys;
    this.last_left_col_keys = last_left_col_keys;

    const [right_col_keys, last_right_col_keys] = _process(
      all_metas.filter((meta) => meta.fixed === "right"),
    );
    this.right_col_keys = right_col_keys;
    this.last_right_col_keys = last_right_col_keys;

    const [center_col_keys, last_center_col_keys] = _process(
      all_metas.filter((meta) => !meta.fixed).sort((a, b) => a.sort - b.sort),
    );
    this.center_col_keys = center_col_keys;
    this.last_center_col_keys = last_center_col_keys;

    const col_state = this.col_state;

    const _update_span = (col_key: ColKey) => {
      const meta = col_state.get_meta(col_key);
      if (!meta) return;

      const children = col_state.get_children_meta(col_key);

      if (children?.length) {
        meta.col_span = children.reduce((prev, next) => {
          return (next.col_span ?? 1) + prev;
        }, 0);
      }

      if (meta.is_leaf) {
        meta.row_span = col_state.get_deepest() + 1 - (meta.deep ?? 0);
      }
    };

    this.left_col_keys.forEach(_update_span);
    this.right_col_keys.forEach(_update_span);
    this.center_col_keys.forEach(_update_span);
  }

  // 更新莫一列的宽度
  update_column_width(col_key: ColKey, new_width: number) {
    this.col_state.update_col_width(col_key, new_width);

    // TODO: 需要重置其他列的宽度。
  }

  get is_empty(): boolean {
    return !!this.row_state.display_dataset?.length;
  }
}