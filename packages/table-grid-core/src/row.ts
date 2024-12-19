import type { GetRowKey, Option, Scroll, IViewport } from "./types";
import type { TableState } from "./table";
import { TableDataset } from "./dataset";
import { isNotNil, memoize, type MemoizeCache } from "es-toolkit";
import { binaryFindIndexRange } from "./shared";

/// 原始行数据
export type RawData = Record<string, unknown>;

/// 行 key
export type RowKey = string;

export type UpdateRowDataCallback = (
	raw_data: RawData,
	index: number,
	deep: number,
	parent_row_key: Option<RowKey>,
) => void;

// 创建 compare 函数，高度。
const _create_compare = (target_y: number) => (y: number) => target_y - y;

export interface RowMeta {
	key: RowKey;

	index: number;

	deep: number;

	height: number;

	sort: string;

	expand_by?: RowKey[];
}

type GetHeight = (row_key: RowKey) => number;

//
export class RowState {
	// 负责数据管理
	dataset = new TableDataset(this);

	// 行高, 当固定行高时，则
	row_height: number;

	// 是否为固定行高的表格
	is_fixed_row_height: boolean;

	get_raw_children: (raw_data: RawData) => Option<RawData[]>;

	get_row_key: GetRowKey;

	// 根据行的 row_key 获取对应的行高
	get_row_height_by_row_key!: GetHeight & {
		cache: MemoizeCache<any, ReturnType<GetHeight>>;
	};

	// 获取虚拟的数据集
	get_virtual_dataset!: (viewport: IViewport, scroll: Scroll) => RawData[];

	private row_key_map_row_meta: Map<RowKey, RowMeta> = new Map();

	private raw_data_map_row_key: WeakMap<RawData, RowKey> = new WeakMap();

	private row_key_map_raw_data: Map<RowKey, RawData> = new Map();

	table_state: TableState;

	constructor(table_state: TableState) {
		this.table_state = table_state;

		const { config, option } = table_state;

		// 初始化参数
		this.is_fixed_row_height = option.fixed_row_height;
		this.row_height = config.row_height;
		const row_children_key = config.row_children_key;

		this.get_raw_children = (raw_data: RawData) => {
			const children = raw_data[row_children_key];
			if (Array.isArray(children)) {
				return children as RawData[];
			}
			return null;
		};

		this.get_row_key = config.get_row_key;

		// 初始化一些相关参数
		this.before_init();
	}

	protected before_init() {
		this.init_get_row_height();

		this.init_get_virtual_dataset();
	}

	// 初始化相关参数
	protected init() {
		this.row_key_map_row_meta.clear();
		this.raw_data_map_row_key = new WeakMap();
		this.row_key_map_raw_data.clear();
	}

	// 初始化获取行高的函数
	protected init_get_row_height() {
		this.get_row_height_by_row_key = this.is_fixed_row_height
			? memoize(() => this.row_height)
			: memoize((row_key: RowKey) => {
					const meta = this.get_meta_by_row_key(row_key);
					return meta?.height ?? this.row_height;
				});
	}

	protected init_get_virtual_dataset() {
		this.get_virtual_dataset = this.is_fixed_row_height
			? this.get_virtual_dataset_fixed_row_height
			: this.get_vritual_dataset_auto_row_height;
	}

	// 根据行的 key 获取元数据
	get_meta_by_row_key(row_key: RowKey): Option<RowMeta> {
		return this.row_key_map_row_meta.get(row_key) ?? null;
	}

	get_meta_by_raw_data(raw_data: RawData): Option<RowMeta> {
		const row_key = this.get_row_key_by_raw_data(raw_data);

		return this.get_meta_by_row_key(row_key);
	}

	display_dataset_y: number[] = [];
	display_dataset: RawData[] = [];

	get_y(raw_data: RawData, offset = 0): number {
		let index = this.display_dataset.findIndex((_raw) => _raw === raw_data);
		index = index + offset;

		const length = this.display_dataset_y.length;
		const height =
			index >= length
				? this.get_row_height_by_raw_data(this.display_dataset[length - 1])
				: 0;

		index = Math.min(index, this.display_dataset_y.length);
		index = Math.max(index, 0);

		return (this.display_dataset_y[index] ?? 0) + height;
	}

	update_dataset(raw_datas: RawData[]) {
		this.init();
		this.dataset.init();

		const get_row_key = this.get_row_key;
		const row_height = this.row_height;

		const _update_meta: UpdateRowDataCallback = (
			raw_data,
			index,
			deep,
			parent_row_key,
		) => {
			let expand_by: Option<RowKey[]> = undefined;

			const parent_meta = parent_row_key
				? this.get_meta_by_row_key(parent_row_key)
				: null;

			if (isNotNil(parent_meta)) {
				expand_by = parent_meta.expand_by ?? [];
				expand_by.push(parent_meta.key);
			}

			const row_key = get_row_key(raw_data);

			const row_meta: RowMeta = {
				key: row_key,
				index,
				deep,
				height: row_height,
				sort: `${deep}-${index}`,
				expand_by,
			};

			this.raw_data_map_row_key.set(raw_data, row_key);
			this.row_key_map_raw_data.set(row_key, raw_data);
			this.row_key_map_row_meta.set(row_key, row_meta);
		};

		this.dataset.process_dataset(raw_datas, _update_meta);

		this.display_dataset = this.dataset.get_display_dataset();

		this.reset_display_dataset_y();
	}

	// 重置展示数据的 y 的坐标
	reset_display_dataset_y() {
		let y = 0;
		const list: number[] = [];

		for (const raw_data of this.display_dataset) {
			list.push(y);
			y = y + this.get_row_height_by_raw_data(raw_data);
		}

		this.display_dataset_y = list;
	}

	// 获取所有展开后的 key 值
	get_all_expand_keys(): RowKey[] {
		const row_keys: RowKey[] = [];
		const metas = this.row_key_map_row_meta.values();
		for (const meta of metas) {
			row_keys.push(...(meta.expand_by ?? []));
		}

		return Array.from(new Set(row_keys));
	}

	// =================== 行高 =======================
	update_row_height_by_raw_data(raw_data: RawData, height: number) {
		const row_key = this.get_row_key_by_raw_data(raw_data);

		if (row_key) {
			this.update_row_height_by_row_key(row_key, height);
		}
	}

	update_row_height_by_row_key(row_key: RowKey, height: number): boolean {
		const meta = this.get_meta_by_row_key(row_key);

		if (!meta) {
			console.error(`[Error] Table Row: Can't find meta by: ${row_key}`);
			return false;
		}

		if (this.get_row_height_by_row_key(row_key) === height) {
			return false;
		}
		this.get_row_height_by_row_key.cache.delete(row_key);
		const is_change = meta.height !== height;
		meta.height = height;
		this.row_key_map_row_meta.set(row_key, meta);

		return is_change;
	}

	get_row_height_by_raw_data(raw_data: RawData): number {
		const row_key = this.get_row_key_by_raw_data(raw_data);

		return row_key ? this.get_row_height_by_row_key(row_key) : this.row_height;
	}

	// ============= 获取行数据 ===============
	get_row_key_by_raw_data(raw_data: RawData): Option<RowKey> {
		return this.raw_data_map_row_key.get(raw_data) ?? null;
	}

	// 校准 from 和 to;
	protected adjust_from_to(from: number, to: number): [number, number] {
		const buffer = this.table_state.config.get_row_virtual_buffer(to - from);
		const adjusted_from = Math.max(from - buffer, 0);
		const adjusted_to = Math.min(to + buffer, this.display_dataset.length - 1);
		return [adjusted_from, adjusted_to];
	}

	// 固定行高的可视数据计算
	protected get_virtual_dataset_fixed_row_height(
		viewport: IViewport,
		scroll: Scroll,
	): RawData[] {
		const row_height = this.row_height;
		const scroll_top = scroll.top;
		const viewport_height = viewport.height;

		let from = Math.floor(scroll_top / row_height);
		let to = Math.ceil(viewport_height / row_height) + from;

		[from, to] = this.adjust_from_to(from, to);
		return this.display_dataset.slice(from, to + 1);
	}

	// 不固定行高的可视数据计算
	protected get_vritual_dataset_auto_row_height(
		viewport: IViewport,
		scroll: Scroll,
	): RawData[] {
		const scroll_top = scroll.top;
		const viewport_height = viewport.height;

		let from = binaryFindIndexRange(
			this.display_dataset_y,
			_create_compare(scroll.top),
		);

		let to = from;
		const target = viewport_height + scroll_top;

		while (to < this.display_dataset_y.length) {
			if (target < this.display_dataset_y[to]) {
				break;
			}
			to++;
		}

		[from, to] = this.adjust_from_to(from, to);
		return this.display_dataset.slice(from, to + 1);
	}

	get_raw_data_by_row_key(row_key: RowKey): Option<RawData> {
		return this.row_key_map_raw_data.get(row_key) ?? null;
	}
}
