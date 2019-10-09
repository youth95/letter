import { TransformMatrix, Point, transform } from './planimetry';
import { EventNames, ViewPortMouseEvent, MouseEventHandler } from './handler/MouseEventHandler';
import { Engine } from './Engine';
import { createCanvasContext2d } from './utils';
import { Shape } from './shapes';

/**
 * 视窗选项
 */
export interface ViewPortOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  transformMatrix: TransformMatrix;
}

/**
 * 视窗类
 */
export class ViewPort {
  private readonly ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private transformMatrix: TransformMatrix;
  public readonly engine: Engine;
  public mouseEventHandler: MouseEventHandler = new MouseEventHandler(this);
  public viewports:ViewPort[] = [];

  public appendViewPort = (viewport: ViewPort) => {
    this.viewports.push(viewport);
  };

  public removeAllViewPort = () => {
    this.viewports = [];
  }

  constructor(options: ViewPortOptions) {
    this.ctx = options.ctx;
    this.width = options.width;
    this.height = options.height;
    this.transformMatrix = options.transformMatrix;
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
    const [
      a, c, e,
      b, d, f,
    ] = this.transformMatrix;
    this.ctx.setTransform(a, b, c, d, e, f);
    this.engine = new Engine(this.ctx,this);
    this.mouseEventHandler.bind();  // 绑定事件
  }

  /**
   * 触发一个鼠标事件
   * @param p 点
   * @param action 时间名称
   */
  public trigger(p: Point, action: EventNames) {
    const vev: ViewPortMouseEvent = this.transformEvent(action, p);
    this.engine.trigger(vev);
  }

  /**
   * 克隆一个空白的viewport,此viewport的ctx是新的，其宽度与高度和当前侧viewport一致，且transformMatrix对象共享。
   */
  public clone(): ViewPort {
    return new ViewPort({
      width: this.width,
      height: this.height,
      transformMatrix: this.transformMatrix,
      ctx: createCanvasContext2d()
    });
  }

  public cloneAndCopyAShape(shape: Shape): ViewPort {
    const nv = this.clone();
    nv.engine.add(shape);
    return nv;
  }

  public cloneAndCopyAShapeByIndex(index: number): ViewPort {
    const shape = this.engine.getShape(index);
    return this.cloneAndCopyAShape(shape);
  }

  /**
   * 将物理点转换为抽象点
   * @param ev 事件名
   * @param p (0,0) 至 (width,height) 的点
   */
  public transformEvent(ev: EventNames, p: Point): ViewPortMouseEvent {
    const np = transform(this.transformMatrix, p);
    return {
      p: np,
      action: ev,
      viewport: this,
    };
  }


}