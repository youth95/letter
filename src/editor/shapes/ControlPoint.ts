import { RectShape } from "../../shapes/RectShape";
import { ViewPortMouseEvent } from "../../handler/MouseEventHandler";

export class ControlPoint extends RectShape {
  public onMouseEnter(e:ViewPortMouseEvent){
    e.viewport.engine.ctx.canvas.style.cursor = 'move';
    return false;
  }

  public onMouseLeave(e:ViewPortMouseEvent){
    e.viewport.engine.ctx.canvas.style.cursor = 'default';
    return false;
  }
}