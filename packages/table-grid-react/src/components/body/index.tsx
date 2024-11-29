import { useContext, useRef } from "react";
import type { TableBodyProps } from "./typing";

import classNames from "classnames";
import { OverrideContext } from "../context";

export default function (props: TableBodyProps) {
  const { prefixCls, dataSource } = props;
  const tableBodyPrefixCls = prefixCls + "-body";

  const { Empty } = useContext(OverrideContext);

  const tableBodyRef = useRef<HTMLDivElement>(null);
  const tableBodyClass = classNames({
    [tableBodyPrefixCls]: true
  });

  // 内部
  const tableBodyInnerRef = useRef<HTMLDivElement>(null);

  const isEmpty = !!dataSource.length;

  return (
    <div className={tableBodyClass} ref={tableBodyRef}>
      <div className={tableBodyPrefixCls + "__inner"} ref={tableBodyInnerRef}>
        {isEmpty ? null : <Empty prefixCls={prefixCls}></Empty>}
      </div>
    </div>
  )
}