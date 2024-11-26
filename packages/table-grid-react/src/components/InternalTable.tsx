import { useContext, useRef } from "react";
import type { TableProps } from "../typing";
import { OverrideContext } from "./context/OverrideContext";
import { isObject } from "es-toolkit/compat";
import classnames from "classnames";

export function InternalTable(props: TableProps) {
  const { prefixCls, pagination, bordered } = props;

  const { Spin, Pagination } = useContext(OverrideContext);

  const tableInternalRef = useRef<HTMLDivElement>(null);

  const tableClass = classnames({
    [`${prefixCls}-internal`]: true,
    [`${prefixCls}-bordered`]: bordered,
  });


  // 分页
  const paginationVisible = !!pagination;
  const paginationPosition = isObject(pagination) ? pagination.vertical ?? "bottom" : "bottom"

  return (
    <Spin prefixCls={prefixCls!}>
      <>
        {paginationVisible && paginationPosition === 'top' ? Pagination : null}
        <div ref={tableInternalRef} className={tableClass}>

        </div>
        {paginationVisible && paginationPosition === 'bottom' ? Pagination : null}
      </>
    </Spin>
  )
}