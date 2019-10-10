import { LineShape } from ".";
import { ControlPoint } from "../editor/shapes/ControlPoint";
import { ViewPortMouseEvent } from "../handler/MouseEventHandler";
import { Point, getPointsRect } from "../planimetry";
import { SelectAbleShape } from "./SelectAbleShape";
import { ViewPort } from "../viewport";
import { Shape } from "./Shape";
import { putPath } from "../R";

export enum ModifyKind {
  MoveAndModifyControlPoint,
  Zoom,
}

/**
 * 可编辑图形
 */
export class ModifyAbleShape extends SelectAbleShape {
  private controlPoints: ControlPoint[] = [];
  // 默认认为用户选中图形是为了改变控制点和移动
  private kind: ModifyKind = ModifyKind.MoveAndModifyControlPoint;

  private cleanEvent: () => void = () => { };

  public onUnSelected() {
    this.controlPoints.forEach(shape => shape.remove());
    this.controlPoints = [];
  }

  private modifyValue() {
    const newViewPort: ViewPort = this.engine!.viewPort;
    this.controlPoints = ControlPoint.genControlPoint(this.valueOf());
    newViewPort.engine.addSome(this.controlPoints);
    let lp: Point | null = null;  // 上一次点击的点
    let cp: ControlPoint | null = null;  // 点击到的控制点
    const mousedown = (ev: MouseEvent) => {
      const { offsetTop, offsetLeft } = newViewPort.engine.ctx.canvas;
      const [x, y] = [ev.offsetX - offsetLeft, ev.offsetY - offsetTop];
      const vev = newViewPort.transformEvent('move', [x, y]);
      const result = newViewPort.engine.hitTest(vev.p);
      if (result.length !== 0) {
        lp = [x, y];  // 记录本次点击
        const shape = result.map(zi => newViewPort.engine.getShape(zi));
        const cps = shape.filter(item => item instanceof ControlPoint);
        if (cps.length) {
          cp = cps[0] as ControlPoint;
        }
      }
    };

    const mousemoveHandler = (ev: MouseEvent) => {
      if (lp === null) {
        return;
      }
      const { offsetTop, offsetLeft } = newViewPort.engine.ctx.canvas;
      const [x, y] = [ev.offsetX - offsetLeft, ev.offsetY - offsetTop];
      if (cp === null) {  // 移动
        const [dx, dy] = [lp[0] - x, lp[1] - y];
        const newValue: Point[] = this.valueOf().map(point => ([point[0] - dx, point[1] - dy]));
        this.setValue(newValue);
        this.controlPoints.forEach(shape => shape.remove());
        this.controlPoints = ControlPoint.genControlPoint(this.valueOf());
        newViewPort.engine.addSome(this.controlPoints);
        newViewPort.engine.render(true);
        lp = [x, y];
      } else {  // 修改控制点位置
        const [dx, dy] = [lp[0] - x, lp[1] - y];
        const [ox, oy] = cp.rectPos;
        cp.setXY(ox - dx, oy - dy);
        const newValues = this.valueOf();
        newValues[cp.pathIndex] = [ox - dx, oy - dy];
        this.setValue(newValues);
        newViewPort.engine.render(true);
        lp = [x, y];
      }
    }
    const clean = () => {
      lp = null;
      cp = null;
    }
    newViewPort.engine.ctx.canvas.addEventListener('mousedown', mousedown);
    newViewPort.engine.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
    newViewPort.engine.ctx.canvas.addEventListener('mouseup', clean);
    newViewPort.engine.ctx.canvas.addEventListener('mouseleave', clean);

    // 覆盖清除事件的方法
    this.cleanEvent = () => {
      clean();
      newViewPort.engine.ctx.canvas.removeEventListener('mousedown', mousedown);
      newViewPort.engine.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
      newViewPort.engine.ctx.canvas.removeEventListener('mouseup', clean);
      newViewPort.engine.ctx.canvas.removeEventListener('mouseleave', clean);
    }

    window.addEventListener('keydown', this.ZKeyDown);
  }

  private modifyTransform() {
    const line = new Shape(); // 控制线

    this.controlPoints.forEach(shape => shape.remove());
    const padding = 10;
    const [x, y, w, h] = getPointsRect(this.valueOf());
    const pointX = ControlPoint.createPoint(x + w, y - padding, 0); // 横向控制点
    const pointY = ControlPoint.createPoint(x - padding, y + h, 0); // 纵向控制点
    const pointRotate = ControlPoint.createPoint(x + w + padding, y + h + padding, 0); // 旋转向控制点
    line.setValue([
      [x + w, y - padding],
      [x - padding, y - padding],
      [x - padding, y + h]
    ]);
    line.render = function (ctx: CanvasRenderingContext2D) {
      return putPath(this.valueOf(), false)(ctx);
    };
    this.engine!.addSome([line, pointX, pointY, pointRotate]);
    this.engine!.render(true);
    console.log('modifyTransform');
  }

  public onSelected(newViewPort: ViewPort, e: ViewPortMouseEvent) {
    if (this.kind === ModifyKind.MoveAndModifyControlPoint) {
      this.modifyValue();
    } else if (this.kind === ModifyKind.Zoom) {
      this.modifyTransform();
    }


  }

  private ZKeyDown = (ev: KeyboardEvent) => {
    if (ev.keyCode === 90) {  // z
      this.cleanEvent();
      this.engine!.render(true);
      if(this.kind === ModifyKind.MoveAndModifyControlPoint){
        // window.addEventListener('keydown', this.ZKeyDown);
        this.kind = ModifyKind.Zoom;
        this.modifyTransform();
      }else{
        // window.addEventListener('keydown', this.ZKeyDown);
        this.kind = ModifyKind.MoveAndModifyControlPoint;
        this.modifyValue();
      }
    }
  }

  /**
   * 取消选中
   */
  public unSelect() {
    this.controlPoints.forEach(shape => shape.remove());
    this.controlPoints = [];
    this.drawState = {
      strokeStyle: '#000',
    };
    super.unSelect();
    window.removeEventListener('keydown', this.ZKeyDown);
  }
}