import { useContext, useRef, type CSSProperties } from "react";
import type { TableBodyProps } from "./typing";
import BodyRows from "./rows"

import classNames from "classnames";
import { OverrideContext, StateContext } from "../context";

export default function (props: TableBodyProps) {
  const { prefixCls, dataSource } = props;
  const tableBodyPrefixCls = prefixCls + "-body";

  const { Empty } = useContext(OverrideContext);
  const { tableState } = useContext(StateContext);

  const tableBodyRef = useRef<HTMLDivElement>(null);
  const tableBodyClass = classNames({
    [tableBodyPrefixCls]: true
  });

  // 内部
  const tableBodyInnerRef = useRef<HTMLDivElement>(null);

  const isEmpty = !dataSource.length;

  let empty = null;
  let bodyContent = null;

  const scroll = tableState.scroll;

  if (isEmpty) {
    empty = <Empty prefixCls={prefixCls}></Empty>;
  } else {
    const gridTemplateRows = tableState.get_row_heights(dataSource);

    const offsetTop = (() => {
      const first_raw_data = dataSource[0];
      return first_raw_data ? tableState.get_row_state().get_y(first_raw_data) : 0;
    })();

    const { last_center_col_keys, config } = tableState;
    const colState = tableState.get_col_state();

    const bodyCenterClass = classNames({
      [`${tableBodyPrefixCls}__inner-center`]: true,
    });
    const bodyCenterStyle = (() => {
      const { last_left_col_keys } = tableState;
      const rows = [0].concat(gridTemplateRows).concat([0]);
      const paddingLeft = tableState.get_col_state().get_reduce_width(last_left_col_keys);

      return {
        paddingLeft: (paddingLeft) + 'px',
        paddingTop: offsetTop + 'px',
        transform: `translate(${-scroll.left}px, ${-scroll.top}px)`,
        gridTemplateRows: rows.map((height) => height + "px").join(" ")
      };
    })();

    const bodyCenterGrid = last_center_col_keys.map(colKey => colState.get_meta(colKey)?.width ?? config.col_width);


    bodyContent = <>
      <div className={bodyCenterClass} style={bodyCenterStyle}>
        <div className="beforeHandler"></div>
        <BodyRows prefixCls={tableBodyPrefixCls} colKeys={last_center_col_keys} dataSource={dataSource} grid={bodyCenterGrid}></BodyRows>
        <div className="afterHandler"></div>
      </div>
    </>
  }
  return (
    <div className={tableBodyClass} ref={tableBodyRef}>
      <div className={tableBodyPrefixCls + "__inner"} ref={tableBodyInnerRef}>
        {empty}
        {bodyContent}
      </div>
    </div>
  )
}