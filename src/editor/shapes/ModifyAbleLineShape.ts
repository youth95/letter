import { LineShape } from '../../shapes'
import { ViewPortMouseEvent } from '../../handler/MouseEventHandler';
import { RectPos } from '../../planimetry';
import { ControlPoint } from './ControlPoint';
export class ModifyAbleLineShape extends LineShape {
  private controlPoints: ControlPoint[] = [];
  public onMouseDown(e: ViewPortMouseEvent): boolean {
    if (!this.controlPoints.length) {
      this.controlPoints = [this.start, this.end].map(p => {
        const [x, y] = p;
        const rect: RectPos = [x - 2, y - 2, 4, 4];
        return new ControlPoint(rect);
      });
      this.drawState = {
        strokeStyle: 'red',
        fillStyle: 'red',
      };
      e.viewport.engine.addSome(this.controlPoints);
      e.viewport.engine.clearAll();
      e.viewport.engine.render();
    } else {
      // 选中的情况下
    }
    return false;
  }

  /**
   * 取消选中
   */
  public unSelect() {
    this.controlPoints.forEach(shape => shape.remove());
    this.controlPoints = [];
    this.drawState = {
      strokeStyle: '#000',
      fillStyle: '#000',
    };
    
  }
}