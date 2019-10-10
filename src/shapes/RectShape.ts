import { Shape } from './Shape';
import { RectPos, isInRect, isInPolygon, Path, twoPathNotEqPoints } from '../planimetry';
import { putRect, putPath } from '../R';
import { ModifyAbleShape } from './ModifyAbleShape';
export class RectShape extends ModifyAbleShape {
  constructor(
    rectPos: RectPos,
    public filled: boolean = true,  // 是否填充
  ) {
    super();
    const [x, y, w, h] = rectPos;
    super.setValue([
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ]);
  }

  public render: import("../R").R = (ctx: CanvasRenderingContext2D) => {
    // putRect(this.rectPos, this.filled)(ctx);
    putPath(this.valueOf(), true)(ctx);
  };




}