import type { TransformCellText } from ".";
import type { BodyCellSlot } from "./slot";

// 从表体一直继承到单元格的属性
export interface BodyCellInheritProps {
  transformCellText?: TransformCellText;

  bodyCell?: BodyCellSlot;
}