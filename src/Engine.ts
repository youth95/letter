import { Shape } from "./shapes/Shape";
import { ViewPortMouseEvent } from "./handler/MouseEventHandler";
import { Point } from "./planimetry";
import { ViewPort } from "./viewport";

/**
 * 渲染引擎
 */
export class Engine {

    constructor(public ctx: CanvasRenderingContext2D, public readonly viewPort: ViewPort) { }

    /**
     * 图形池
     */
    private shapePool: Shape[] = [];

    public getShape(zindex: number): Shape {
        const shape = this.shapePool.find(item => item.zindex === zindex);
        if (shape === undefined) {
            throw new Error(`cont found shape by zindex:${zindex}`);
        }
        return shape;
    }

    public get shapePoolSize() {
        return this.shapePool.length;
    }

    /**
     * 添加图形
     * @param shape 图形
     */
    public add(shape: Shape) {
        this.shapePool.push(shape);
        shape.setEngine(this);
    }

    public addSome(shapes: Shape[]) {
        shapes.forEach(shape => this.add(shape));
    }

    /**
     * 删除图形
     * @param shape 图形
     */
    public remove(shape: Shape) {
        const f = this.shapePool.findIndex(s => s === shape);
        if (f !== -1) {
            this.shapePool.splice(f, 1);
        }
    }

    public removeSome(shapes: Shape[]) {
        shapes.forEach(shape => this.remove(shape));
    }

    /**
     * 渲染所有图元,惰性,由用户手动调用,不会主动清空画布
     */
    public render(isClear?: boolean) {
        if (isClear) {
            this.clearAll();
        }
        this.shapePool.forEach(item => {
            if (item.visable) {
                item.renderAfterState(this.ctx);
            }
        });
    }

    /**
     * 清除画布
     */
    public clearAll() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * 触发视窗鼠标事件
     * @param vev 视窗鼠标事件
     */
    public trigger(vev: ViewPortMouseEvent): void {
        const { p: point, action } = vev;
        for (const shape of this.shapePool) {
            if (shape.inRegionAndSetEnterState(point)) {
                if (action === 'down') {
                    if (shape.onMouseDown(vev))
                        continue;
                    else
                        return;
                } else if (action === 'enter') {
                    if (shape.onMouseEnter(vev))
                        continue;
                    else
                        return;
                } else if (action === 'leave') {
                    if (shape.onMouseLeave(vev))
                        continue;
                    else
                        return;
                } else if (action === 'move') {
                    if (shape.isEnter) {
                        vev.action = 'enter';
                        shape.onMouseEnter(vev);
                    } else if (shape.isLeave) {
                        vev.action = 'leave';
                        shape.onMouseEnter(vev);
                    } else if (shape.onMouseMove(vev))
                        continue;
                    else
                        return;
                } else if (action === 'out') {
                    if (shape.onMouseOut(vev))
                        continue;
                    else
                        return;
                } else if (action === 'over') {
                    if (shape.onMouseOver(vev))
                        continue;
                    else
                        return;
                } else if (action === 'up') {
                    if (shape.onMouseUp(vev))
                        continue;
                    else
                        return;
                } else if (action === 'wheel') {
                    if (shape.onMouseWheel(vev))
                        continue;
                    else
                        return;
                } else {
                    throw new Error(`cont handler the mouse event ${vev.action}`);
                }
            }
        }
    }

    /**
     * 命中检测，返回所有被命中的shape的zIndex
     * @param p 检测点
     */
    public hitTest(p: Point): number[] {
        return this.shapePool
            .map((shape) => [shape.inRegion(p), shape])
            .filter(item => item[0])
            .map(item => (item[1] as Shape).zindex);
    }

    /**
     * 移除所有选中的shape
     */
    public removeSelected() {
        this.shapePool.filter(shape => shape.isSelected()).forEach(shape => shape.remove());
    }
}