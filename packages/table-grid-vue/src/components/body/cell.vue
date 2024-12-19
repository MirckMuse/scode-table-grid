<script lang="ts">
import type { Option, RawData } from "@scode/table-grid-core";
import type { TableBodyCellProps } from "./typing";
import type { TableColumn } from "../../typing";
import type { StyleValue } from "vue";

import { shallowRef, defineComponent, h, isVNode } from "vue";
import { isNil } from "es-toolkit";
import { get, isObject } from "es-toolkit/compat";
import { toArray } from "@scode/table-grid-core";

// 放在组件外部是为了减少函数的创建
const isEmptyCell = (target: any) => false;

function getText(column: TableColumn, record: RawData): Option<unknown> {
	if (!column?.dataIndex) return null;

	if (isNil(record)) return null;

	return get(record, column?.dataIndex, null);
}

function showTitle(column: TableColumn) {
	const ellipsis = column?.ellipsis;

	return isObject(ellipsis) ? ellipsis?.showTitle : !!ellipsis;
}

function isValidVNode(target: unknown): boolean {
	if (!isVNode(target)) return true;

	return target.type !== Comment;
}

function renderCustomCell(
	props: TableBodyCellProps,
	text: unknown,
	title: unknown,
): Option<any[]> {
	const { column, rowIndex, record } = props;

	const params = {
		text,
		record,
		column,
		index: rowIndex,
		title,
	};

	if (column.customRender) {
		return toArray(column.customRender(params));
	}

	const bodyCellVNodes = props.renderBodyCell?.(params);

	if (isNil(bodyCellVNodes)) return null;

	const validVNodes = toArray(bodyCellVNodes).filter(isValidVNode);

	return validVNodes.length ? validVNodes : null;
}

export default defineComponent<TableBodyCellProps>({
	name: "STableBodyCell",

	// FIXME: PROPS 定义的方式有点问题，需要减少人工配置成本
	props: [
		"prefixCls",
		"column",
		"record",
		"rowIndex",
		"rowKey",
		"colKey",
		"deep",
		"indentSize",
		"isMergedCell",
		"transformCellText",
		"renderBodyCell",
	],

	setup(props, { slots }) {
		const cellRef = shallowRef<HTMLElement>();
		const cellInnerRef = shallowRef<HTMLElement>();

		return () => {
			const {
				transformCellText,
				column,
				record,
				rowIndex,
				prefixCls,
				isMergedCell,
			} = props;

			const cellPrefixCls = `${prefixCls}-cell`;
			if (isMergedCell) {
				return h("div", { class: cellPrefixCls });
			}

			const text = getText(column, record);

			const title = showTitle(column) ? text : undefined;

			const contentVNodes = renderCustomCell(props, text, title);

			const cellClass = {
				[cellPrefixCls]: true,
				[`${cellPrefixCls}__merged`]: isMergedCell,
				// TODO:
			};

			const cellStyle: StyleValue = {};

			const expandIcon = slots.expandIcon?.() ?? null;

			let children: unknown = contentVNodes ?? text;

			if (isEmptyCell(children)) {
				if (transformCellText) {
					children =
						transformCellText({
							text,
							column,
							record,
							index: rowIndex,
						}) ?? null;
				} else {
					children = null;
				}
			}

			const cellInnerClass = {
				[`${cellPrefixCls}__inner`]: true,
			};

			const cellInner = h(
				"div",
				{ ref: cellInnerRef, class: cellInnerClass },
				([expandIcon] as any[]).concat(children) as any[],
			);

			return h("div", { ref: cellRef, class: cellClass, style: cellStyle }, [
				cellInner,
			]);
		};
	},
});
</script>
