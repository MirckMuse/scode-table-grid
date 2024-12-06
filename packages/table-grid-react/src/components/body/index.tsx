import type { TableBodyProps } from "./typing";

import { useContext, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { OverrideContext, StateContext } from "../context";
import BodyRows from "./rows";
import Scrollbar from "../scrollbar";
import { createLockedRequestAnimationFrame } from "@scode/table-grid-core";
import { optimizeScrollXY } from "../hooks/useScroll";

export default function (props: TableBodyProps) {
  const { prefixCls, dataSource, updateDataSource } = props;
  const tableBodyPrefixCls = prefixCls + "-body";

  const { Empty } = useContext(OverrideContext);
  const { tableState, tableProps } = useContext(StateContext);

  const tableBodyRef = useRef<HTMLDivElement>(null);
  const tableBodyClass = classNames({
    [tableBodyPrefixCls]: true
  });

  // 内部
  const tableBodyInnerRef = useRef<HTMLDivElement>(null);

  const beforeHandler = useRef<HTMLDivElement>(null);
  const afterHandler = useRef<HTMLDivElement>(null);

  const isEmpty = !dataSource.length;

  let empty = null;
  let bodyContent = null;

  const [scroll, setScroll] = useState(tableState.scroll);

  const { viewport, content_box } = tableState;

  if (isEmpty) {
    empty = <Empty prefixCls={prefixCls}></Empty>;
  } else {
    const gridTemplateRows = tableState.get_row_heights(dataSource);

    const offsetTop = (() => {
      const first_raw_data = dataSource[0];
      return first_raw_data ? tableState.get_row_state().get_y(first_raw_data) : 0;
    })();

    const {
      last_left_col_keys,
      last_center_col_keys,
      last_right_col_keys,
      config,
    } = tableState;
    const colState = tableState.get_col_state();

    let fixedLeftBody = null;

    if (last_left_col_keys.length) {
      const bodyLeftClass = classNames({
        [`${tableBodyPrefixCls}__inner-fixedLeft`]: true,
        [`${tableProps.prefixCls}-fixedLeft`]: true,
        shadow: scroll.left > 0
      })
      const bodyLeftStyle = (() => {
        return {
          paddingTop: offsetTop + 'px',
          transform: `translate(0, ${-scroll.top}px)`,
          gridTemplateRows: gridTemplateRows.map((height) => height + "px").join(" ")
        }
      })();
      const bodyLeftGrid = last_left_col_keys.map(colKey => colState.get_meta(colKey)?.width ?? config.col_width);

      fixedLeftBody = (
        <div className={bodyLeftClass} style={bodyLeftStyle}>
          <BodyRows key="fixedLeft" prefixCls={tableBodyPrefixCls} colKeys={last_left_col_keys} dataSource={dataSource} grid={bodyLeftGrid}></BodyRows>
        </div>
      )
    }

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


    let fixedRightBody = null;

    bodyContent = <>
      {fixedLeftBody}
      <div className={bodyCenterClass} style={bodyCenterStyle}>
        <div className="beforeHandler" ref={beforeHandler}></div>
        <BodyRows prefixCls={tableBodyPrefixCls} colKeys={last_center_col_keys} dataSource={dataSource} grid={bodyCenterGrid}></BodyRows>
        <div className="afterHandler" ref={afterHandler}></div>
      </div>
      {fixedRightBody}
    </>
  }

  const scrollbarPrefixCls = tableProps.prefixCls + "-scrollbar";
  const scrollState = (() => {
    const {
      mode = "always",
      position = "inner",
      size = 6,
    } = tableProps.scroll ?? {};

    return { mode, position, size };
  })();
  const verticalScrollbar = <Scrollbar prefixCls={scrollbarPrefixCls} client={viewport.height} content={content_box.height} scroll={scroll.top} state={scrollState} vertical={true}></Scrollbar>
  const horizontalScrollbar = <Scrollbar prefixCls={scrollbarPrefixCls} client={viewport.width} content={content_box.width} scroll={scroll.left} state={scrollState}></Scrollbar>

  const animationWheel = createLockedRequestAnimationFrame(($event: WheelEvent) => {
    const { deltaX, deltaY } = $event;

    const [optimizeX, optimizeY] = optimizeScrollXY(deltaX, deltaY);

    const { left, top } = tableState.scroll;

    tableState.update_scroll({
      left: left + optimizeX,
      top: top + optimizeY
    });
    tableState.adjust_scroll();

    const _scroll = tableState.scroll;

    // 对比滚动条是否发生变化，减少页面渲染
    if (left === _scroll.left && top === _scroll.top) {
      return;
    }

    setScroll(Object.assign({}, scroll, _scroll));
  });

  function processWheel($event: WheelEvent) {
    $event.preventDefault();

    animationWheel($event);
  }

  const $scrollObserver = new IntersectionObserver(() => { updateDataSource() }, { threshold: 0, rootMargin: "50%" })

  useEffect(() => {
    tableBodyInnerRef.current?.addEventListener("wheel", processWheel, { passive: false });
    if (beforeHandler.current) {
      $scrollObserver.observe(beforeHandler.current)
    }

    if (afterHandler.current) {
      $scrollObserver.observe(afterHandler.current)
    }

    return () => {
      tableBodyInnerRef.current?.removeEventListener("wheel", processWheel);
      $scrollObserver.disconnect();
    }
  });

  return (
    <div className={tableBodyClass} ref={tableBodyRef}>
      <div className={tableBodyPrefixCls + "__inner"} ref={tableBodyInnerRef}>
        {empty}
        {bodyContent}
      </div>

      {verticalScrollbar}
      {horizontalScrollbar}
    </div>
  )
}