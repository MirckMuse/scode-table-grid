import type { ColKey } from "../col";
import type { RowKey } from "../row";
import type { Box, Option } from "../types";
import type { TableState } from "../table";

export interface CellMeta extends Box {
	row_key: RowKey;

	col_key: ColKey;
}

// 高度怎么算？？虚拟滚动的情况下，跨分页、展开行的情况下，怎么展示。展开行优于合并行？
export interface MergedCellMeta extends CellMeta {
	x: number;

	y: number;

	row_span: number;

	col_span: number;
}

type CellStateXMap = Map<ColKey, Map<RowKey, MergedCellMeta>>;
type CellStateYMap = Map<RowKey, Map<ColKey, MergedCellMeta>>;

// TODO: 可能需要考虑一堆数据的批量更新
export class CellState {
	// col -> row -> meta：用于批量更新 x
	protected state_x: CellStateXMap = new Map();
	// row -> col -> meta: 用于批量更新 y
	protected state_y: CellStateYMap = new Map();

	protected table_state: TableState;

	constructor(table_state: TableState) {
		this.table_state = table_state;
	}

	has(col_key: ColKey, row_key: RowKey): boolean {
		if (this.state_x.has(col_key)) {
			return this.state_x.get(col_key)?.has(row_key) ?? false;
		}

		return false;
	}

	get_meta(col_key: ColKey, row_key: RowKey): Option<MergedCellMeta> {
		return this.state_x.get(col_key)?.get(row_key) ?? null;
	}

	update_meta(col_key: ColKey, row_key: RowKey, meta: MergedCellMeta) {
		const row = this.state_x.get(col_key) || new Map();
		row.set(row_key, meta);
		this.state_x.set(col_key, row);

		const col = this.state_y.get(row_key) || new Map();
		col.set(col_key, meta);
		this.state_y.set(row_key, col);
	}

	remove_meta(col_key: ColKey, row_key: RowKey) {
		const row = this.state_x.get(col_key);
		if (row) {
			row.delete(row_key);
			this.state_x.set(col_key, row);
		}

		const col = this.state_y.get(row_key);
		if (col) {
			col.delete(col_key);
			this.state_x.set(row_key, col);
		}
	}

	clear() {
		this.state_x.clear();
		this.state_y.clear();
	}

	values(): MergedCellMeta[] {
		const metas: MergedCellMeta[] = [];

		for (const _map of this.state_x.values()) {
			metas.push(..._map.values());
		}

		return metas;
	}

	get_col_keys() {
		return Array.from(this.state_x.keys());
	}

	reset_col() {
		const col_state = this.table_state.get_col_state();

		const col_keys = this.get_col_keys();

		for (const col_key of col_keys) {
			const start_x = col_state.get_x(col_key);

			for (const meta of this.state_x.get(col_key).values()) {
				const end_x = col_state.get_x(col_key, meta.col_span);
				meta.x = start_x;
				meta.width = end_x - start_x;
			}
		}
	}

	protected get_row_keys() {
		return Array.from(this.state_y.keys());
	}

	reset_row() {
		const row_state = this.table_state.get_row_state();

		const _get_y = (row_key: RowKey, offset = 0) => {
			const row_data = row_state.get_raw_data_by_row_key(row_key);

			if (!row_data) return 0;


			return row_state.get_y(row_data, offset);
		}


		const row_keys = this.get_row_keys();

		for (const row_key of row_keys) {
			const start_y = _get_y(row_key);

			for (const meta of this.state_y.get(row_key)?.values() ?? []) {
				const end_y = _get_y(row_key, meta.row_span);
				meta.y = start_y;
				meta.height = end_y - start_y;
			}
		}
	}

	update_x(col_key: ColKey, x: number) {
		const col = this.state_x.get(col_key);

		if (col) {
			for (const meta of col.values()) {
				meta.x = x;
			}
		}
	}

	update_y(row_key: RowKey, y: number) {
		const row = this.state_y.get(row_key);

		if (row) {
			for (const meta of row.values()) {
				meta.y = y;
			}
		}
	}
}
