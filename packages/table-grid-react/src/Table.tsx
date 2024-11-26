import type { TableProps } from "./typing";
import { useRef, type CSSProperties } from "react";
import { InternalTable } from "./components/InternalTable";
import { StateContext } from "./components/context";


const DefaultTableProps: TableProps = {
  prefixCls: 's-table',
  bordered: false,
  rowChildrenName: "children"
};

export function Table(props: TableProps & { style?: CSSProperties }) {
  const { style, ...rest } = Object.assign({}, props, DefaultTableProps);

  const tableClass = [rest.prefixCls!].join(' ');

  const tableRef = useRef<HTMLDivElement>(null);

  // 看看未来这个这么支持
  const internalTable = useRef(null);

  return (
    <div ref={tableRef} className={tableClass} style={style}>
      {/* TODO: 需要整合逻辑到这里 */}
      <StateContext.Provider value={{} as any}>
        <InternalTable {...rest} ></InternalTable>
      </StateContext.Provider>
    </div>
  )
}