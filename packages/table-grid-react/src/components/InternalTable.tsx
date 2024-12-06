import { useContext, useRef, useState } from "react";
import type { TableProps } from "../typing";
import { OverrideContext } from "./context/OverrideContext";
import { isObject } from "es-toolkit/compat";
import classnames from "classnames";
import { TableHeader } from "./header"
import TableBody from "./body"
import { StateContext } from "./context";

export function InternalTable(props: TableProps) {
  const { prefixCls = "s-table", pagination, bordered } = props;

  const { Spin, Pagination } = useContext(OverrideContext);

  const tableInternalRef = useRef<HTMLDivElement>(null);

  const tableClass = classnames({
    [`${prefixCls}-internal`]: true,
    [`${prefixCls}-bordered`]: bordered,
  });

  // 分页
  const paginationVisible = !!pagination;
  const paginationPosition = isObject(pagination) ? pagination.vertical ?? "bottom" : "bottom";

  const { tableState, viewport } = useContext(StateContext);

  const [dataSource, setDataSource] = useState(() => tableState.get_viewport_dataset());

  function updateDataSource() {
    setDataSource(tableState.get_viewport_dataset());
  }

  return (
    <Spin prefixCls={prefixCls!}>
      <>
        {paginationVisible && paginationPosition === 'top' ? Pagination : null}
        <div ref={tableInternalRef} className={tableClass}>
          <TableHeader prefixCls={prefixCls + "-header"}></TableHeader>
          <TableBody prefixCls={prefixCls} dataSource={dataSource} updateDataSource={updateDataSource}></TableBody>
        </div>
        {paginationVisible && paginationPosition === 'bottom' ? Pagination : null}
      </>
    </Spin>
  )
}