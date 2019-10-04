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
 */
export class MouseEventHandler {
    constructor(private viewport: ViewPort) { }

    public bindMove() {
        this.viewport.engine.ctx.canvas.addEventListener('mousemove', e => {
            const ctx = this.viewport.engine.ctx;
            const { offsetTop, offsetLeft } = ctx.canvas;
            this.viewport.trigger([e.offsetX - offsetLeft, e.offsetY - offsetTop], 'move');
        });
    }

}