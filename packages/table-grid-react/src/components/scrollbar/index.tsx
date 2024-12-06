import { useRef, type CSSProperties } from "react";
import type { TableScroll } from "../../typing";
import classNames from "classnames";


export interface ScrollbarProps {
  state: Partial<TableScroll>;

  prefixCls: string;

  vertical?: boolean;

  client: number;

  content: number;

  scroll: number;

}

// 浏览器是向下取整的，会有 1px 的误差
const Pixel_Error_Buffer = 1;
const MIN_THUMB_SIZE = 16;

export default function (props: ScrollbarProps) {
  const { content, client } = props;

  if (content < client + Pixel_Error_Buffer) {
    return (<></>)
  }

  const { prefixCls, vertical, state, scroll } = props;
  const sizeKey = vertical ? 'height' : "width"
  const marginKey = vertical ? 'marginTop' : "marginLeft";

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollbarClass = classNames({
    [`${prefixCls}__track`]: true,
    ['vertical']: vertical,
    [`${state.position}`]: true
  });
  const scrollbarStyle = (() => {
    return {
      "--table-scroll-size": (state?.size ?? 6) + "px"
    } as CSSProperties;
  })();

  const ratio = client / content;

  // 计算后的滚动条尺寸
  const computedthumbSize = Math.max(ratio * props.client, 1);

  // 校准后的滚动条尺寸
  const thumbSize = Math.max(computedthumbSize, MIN_THUMB_SIZE);

  const thumbStyle = (() => {
    if (client === content) {
      return { [sizeKey]: "0px", [marginKey]: "0px" };
    }

    // 因为thumb有最小的尺寸，基于原有的比例计算出来的margin有偏差，需要校准一下
    const adjustOffset = scroll / (client - thumbSize) * (thumbSize - computedthumbSize);
    let offset = Math.max(ratio * (scroll - adjustOffset), 0);
    offset = Math.min(offset, client - thumbSize);

    // thumbSize 应该给个最小尺寸
    return {
      [sizeKey]: thumbSize + "px",
      [marginKey]: offset + "px",
    }
  })();

  return (
    <div ref={scrollRef} className={scrollbarClass} style={scrollbarStyle}>
      <div className={prefixCls + "__thumb"} style={thumbStyle}></div>
    </div >
  )
}