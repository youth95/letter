import { Shape } from './Shape';
import { RectPos, isInRect } from '../planimetry';
import { putRect } from '../R';
export class RectShape extends Shape {
  constructor(
    public rectPos: RectPos
  ) {
    super();
  }
  public render: import("../R").R = (ctx: CanvasRenderingContext2D) => {
    putRect(this.rectPos)(ctx);
  };

  public inRegion(p: [number, number]): boolean {
    return isInRect(this.rectPos, p);
  }
  public moveUp(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x, y - n, w, h];
  }
  public moveDown(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x, y + n, w, h];
  }
  public moveLeft(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x - n, y, w, h];
  }
  public moveRight(n: number): void {
    const [x, y, w, h] = this.rectPos;
    this.rectPos = [x + n, y - n, w, h];
  }


}