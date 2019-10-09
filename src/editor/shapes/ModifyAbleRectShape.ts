import { RectShape } from "../../shapes/RectShape";
import { RectPos } from "../../planimetry";
import { ViewPortMouseEvent } from "../../handler/MouseEventHandler";

// TODO 需要覆盖修改逻辑
export class ModifyAbleRectShape extends RectShape {
  constructor(rectPos: RectPos) {
    super(rectPos, false);
  }
}