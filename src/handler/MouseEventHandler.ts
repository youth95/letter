import { Point } from "../planimetry";
import { ViewPort } from '../viewport';

export type EventNames = 'down' | 'enter' | 'leave' | 'move' | 'out' | 'over' | 'up' | 'wheel';
/**
 * ViewPort 鼠标事件
 */
export interface ViewPortMouseEvent {
    /**
     * 当前交互的鼠标点，是基于viewport中的TransformMatrix计算的
     */
    p: Point;

    /**
     * 鼠标事件名称
     */
    action: EventNames;

    /**
     * 视窗对象
     */
    viewport: ViewPort;
}
/**
 * 鼠标事件管理器
 * 
 * 处理鼠标事件队列，并补充额外事件。
 */
export class MouseEventHandler {

    private beforeViewPortEvent: ViewPortMouseEvent | null = null;
    private beforeHits: number[] = [];
    constructor(private viewport: ViewPort) { }

    private mousemoveHandler = (e: MouseEvent) => {
        const ctx = this.viewport.engine.ctx;
        const { offsetTop, offsetLeft } = ctx.canvas;
        const vev = this.viewport.transformEvent('move', [e.offsetX - offsetLeft, e.offsetY - offsetTop]);
        let hits = this.viewport.engine.hitTest(vev.p);
        hits = hits.slice(0, 1); //只取一个  TODO 不确定这样的逻辑设计是否合理
        // 处理level
        for (const hit of this.beforeHits) {
            try { // 可能存在之前的hit已经被移除
                const shape = this.viewport.engine.getShape(hit);
                if (!hits.includes(hit)) {
                    shape.onMouseLeave(vev);
                }
            } catch (error) {
                // 正常业务
            }
        }
        // 处理enter和move
        for (const hit of hits) {
            // 可能存在已经选的hit已经被移除
            try {
                const shape = this.viewport.engine.getShape(hit);
                if (!this.beforeHits.includes(hit)) {
                    shape.onMouseEnter(vev);
                } else {
                    shape.onMouseMove(vev);
                }
            } catch (error) {
                // 正常业务
            }

        }
        this.beforeHits = hits;
        this.beforeViewPortEvent = vev;
    }

    public bind() {
        this.viewport.engine.ctx.canvas.addEventListener('mousemove', this.mousemoveHandler);
    }

    public unbind() {
        this.viewport.engine.ctx.canvas.removeEventListener('mousemove', this.mousemoveHandler);
    }

}