/**
 * @module AAA
 */

import { Shape } from "./shapes/Shape";
import { Point } from "./planimetry";
import { EventNames, ViewPortMouseEvent } from "./handler/MouseEventHandler";

/**
 * 渲染引擎
 */
export class Engine {

    constructor(public ctx: CanvasRenderingContext2D) { }

    /**
     * 图形池
     */
    private shapePool: Shape[] = [];

    /**
     * 添加图形
     * @param shape 图形
     */
    public add(shape: Shape) {
        this.shapePool.push(shape);
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
            if (shape.inRegion(point)) {
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
                    if (shape.onMouseMove(vev))
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
}