import { RectShape } from "../../shapes/RectShape";
import { ViewPortMouseEvent } from "../../handler/MouseEventHandler";
import { RectPos, Point, isInPolygon } from "../../planimetry";
import { Shape } from "../../shapes";
import { R, putRect } from "../../R";
export class ControlPoint extends Shape {
  constructor(
    public rectPos: RectPos = [0,0,0,0],
    public filled: boolean = true,  // 是否填充
  ) {
    super();
    this.syncValue();
  }

  public syncValue(){
    const [x, y, w, h] = this.rectPos;
    this.setValue([
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ]);
  }


  public render: R = (ctx: CanvasRenderingContext2D) => {
    putRect(this.rectPos, this.filled)(ctx);
  };

  public inRegion(p: [number, number]): boolean {
    return isInPolygon(this.valueOf(),p)
  }
  public moveUp(n: number): void {
    let [x, y, w, h] = this.rectPos;
    this.rectPos = [x, y - n, w, h];
    this.syncValue();
  }
  public moveDown(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x, y + n, w, h];
    this.syncValue();
  }
  public moveLeft(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x - n, y, w, h];
    this.syncValue();
  }
  public moveRight(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x + n, y - n, w, h];
    this.syncValue();
  }
  public pathIndex = 0;

  public static genControlPoint(value:Point[]){
    return value.map((p,i) => {
      const [x, y] = p;
      const rect: RectPos = [x - 2, y - 2, 4, 4];
      const cp = new ControlPoint(rect);
      cp.pathIndex = i;
      return cp;
    });
  }

  public static createPoint(x:number,y:number,i:number){
    const rect: RectPos = [x - 2, y - 2, 4, 4];
    const cp = new ControlPoint(rect);
    cp.pathIndex = i;
    return cp;
  }

  public onMouseEnter(e:ViewPortMouseEvent){
    e.viewport.engine.ctx.canvas.style.cursor = 'move';
    return false;
  }

  public setXY(x:number,y:number){
    let [,, w, h] = this.rectPos;
    this.rectPos = [x, y, w, h];
    this.syncValue();
  }

  public onMouseLeave(e:ViewPortMouseEvent){
    e.viewport.engine.ctx.canvas.style.cursor = 'default';
    return false;
  }
}