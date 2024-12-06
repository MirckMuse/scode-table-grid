import type { AddEventListenerHandle, ColKey } from "@scode/table-grid-core";
import { addEventListener } from "@scode/table-grid-core";
import { useContext, useRef, useState, type MouseEventHandler } from "react";
import { StateContext } from "../context";
import classNames from "classnames";

interface ResizeHolderProps {
  prefixCls: string;

  colKey: ColKey;
}

type EventName = {
  start: keyof HTMLElementEventMap;
  move: keyof HTMLElementEventMap;
  stop: keyof HTMLElementEventMap;
}

const MouseEventName: EventName = {
  start: "mousedown",
  move: "mousemove",
  stop: "mouseup"
};


export default function (props: ResizeHolderProps) {
  const { prefixCls, colKey } = props;

  const { mapToColumn, handleResizeColumn } = useContext(StateContext);

  const holderRef = useRef<HTMLDivElement>(null);

  const [isDragging, setDragging] = useState(false);

  const resizeHolderClass = classNames({
    [prefixCls + "-resizeHolder"]: true,
    dragging: isDragging,
  });

  let dragMoveHandle: AddEventListenerHandle | null = null;
  let dragEndHandle: AddEventListenerHandle | null = null;
  let parentOffsetWidth = 0;
  let startX = 0;

  const { minWidth: _minWidth, maxWidth: _maxWidth } = mapToColumn(colKey) ?? {};
  const minWidth = "number" != typeof _minWidth || Number.isNaN(_minWidth) ? 50 : _minWidth;
  const maxWidth = "number" != typeof _maxWidth || Number.isNaN(_maxWidth) ? Infinity : _maxWidth;

  function createResizeHandle($event: MouseEvent, eventNameMap: EventName) {
    $event.stopPropagation?.();
    destory();
    document.body.style.cursor = "col-resize";

    setDragging(true);
    parentOffsetWidth = holderRef.current?.parentElement?.offsetWidth ?? 0;

    startX = $event.pageX;
    dragMoveHandle = addEventListener(document.documentElement, eventNameMap.move, handleDragMove);
    dragEndHandle = addEventListener(document.documentElement, eventNameMap.stop, handleDragEnd)
  }

  function processDrag($event: DragEvent) {
    let pageX = $event.pageX ?? 0;
    pageX = Math.min(pageX, window.screen.availWidth)
    const offsetX = startX - pageX;
    const adjustedWidth = Math.min(
      Math.max(parentOffsetWidth - offsetX, minWidth),
      maxWidth,
    );

    // TODO:
    handleResizeColumn(props.colKey, adjustedWidth)
  }

  function handleDragMove($event: DragEvent) {
    processDrag($event);
  }

  function handleDragEnd($event: DragEvent) {
    setDragging(false);
    destory();
    processDrag($event);
    document.body.style.cursor = "default";
  }

  function destory() {
    dragMoveHandle?.remove();
    dragEndHandle?.remove();
  }

  const handleMousedown: MouseEventHandler<HTMLDivElement> = ($event) => {
    createResizeHandle($event as unknown as MouseEvent, MouseEventName)
  }

  return (
    <div ref={holderRef} className={resizeHolderClass} onMouseDown={handleMousedown}>
    </div>
  );
}