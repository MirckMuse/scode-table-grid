import type { ColKey, ColState } from "../col";
import type { RowKey, RowState } from "../row";
import type { Box, Option } from "../types";

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

export class Cell {
	constructor(
		readonly row_state: RowState,
		readonly col_state: ColState,
		readonly meta: CellMeta,
	) {}

	get height(): number {
		return this.meta.height;
	}

	get width(): number {
		return this.meta.width;
	}
}

// TODO: 当配置存在合并行时，需要使用该类
export class MergedCell {
	constructor(readonly meta: MergedCellMeta) {}

	// TODO:
	get height() {
		return 56;
	}

	// TODO:
	get width() {
		return 56;
	}
}

type CellStateXMap = Map<ColKey, Map<RowKey, MergedCellMeta>>;
type CellStateYMap = Map<RowKey, Map<ColKey, MergedCellMeta>>;

// TODO: 可能需要考虑一堆数据的批量更新
export class CellState {
	// col -> row -> meta：用于批量更新 x
	protected state_x: CellStateXMap = new Map();
	// row -> col -> meta: 用于批量更新 y
	protected state_y: CellStateYMap = new Map();

	has(col_key: ColKey, row_key: RowKey): boolean {
		if (this.state_x.has(col_key)) {
			return this.state_x.get(col_key).has(row_key);
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
