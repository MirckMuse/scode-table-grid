import type { TableColumn, TableProps } from "./typing";
import { useRef, useState, useEffect, type CSSProperties, useMemo } from "react";
import { InternalTable } from "./components/InternalTable";
import { StateContext } from "./components/context";
import { TableState, uuid, type ColKey, type TableColumn as CoreTableColumn } from "@scode/table-grid-core";


const DefaultTableProps: TableProps = {
  prefixCls: 's-table',
  bordered: false,
  rowChildrenName: "children"
};

function createColumnUtils(tableState: TableState) {
  const _columnMap = new Map();

  function updateColumns(columns: TableColumn[]) {
    _columnMap.clear();

    const _process = (columns: TableColumn[]): CoreTableColumn[] => {
      const _columns: CoreTableColumn[] = [];
      for (const column of columns) {
        const colKey = column.key ?? uuid();
        _columnMap.set(colKey, column);
        const _column: CoreTableColumn = {
          key: colKey,
          width: column.width,
          col_span: column.colSpan,
          fixed: column.fixed,
          children: column.children ? _process(column.children) : undefined
        }

        _columns.push(_column);
      }

      return _columns;
    }

    tableState.update_columns(_process(columns));
  }

  const mapToColumn = (colKey: ColKey) => _columnMap.get(colKey);

  return {
    updateColumns,
    mapToColumn
  }
}

export function Table(props: TableProps & { style?: CSSProperties }) {
  const { style, ...rest } = Object.assign({}, DefaultTableProps, props);

  const tableClass = [rest.prefixCls!].join(' ');

  const tableRef = useRef<HTMLDivElement>(null);

  // 看看未来这个这么支持
  const internalTable = useRef(null);

  const DefaultViewport = { width: 1920, height: 900 };

  const tableState = TableState.create({
    config: {},
    viewport: DefaultViewport,
  })

  const [viewport, setViewport] = useState(DefaultViewport);

  tableState.update_dataset(rest.dataSource ?? [])

  const $resize = new ResizeObserver((entry) => {
    const el = entry[0];
    const { width, height } = el.contentRect;
    tableState.update_viewport({ width, height });
    setViewport({ width, height });
  });

  const { updateColumns, mapToColumn } = createColumnUtils(tableState);
  updateColumns(props.columns ?? []);

  const StateContextValue = useMemo(() => {
    return {
      tableState,
      mapToColumn,
      viewport,
      tableProps: rest
    }
  }, [])

  useEffect(() => {
    console.log("mounted")
    if (tableRef.current) {
      $resize.observe(tableRef.current);
    }

    return () => {
      console.log("unmounted")
      $resize.disconnect();
    }
  }, [])

  return (
    <div ref={tableRef} className={tableClass} style={style}>
      {/* TODO: 需要整合逻辑到这里 */}
      <StateContext.Provider value={StateContextValue as any}>
        <InternalTable {...rest} ></InternalTable>
      </StateContext.Provider>
    </div>
  )
}