/**
 * @module AAA
 */

import { Shape } from "./shapes/Shape";

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
}