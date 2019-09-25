import { Shape } from "../shapes/Shape";
import { Point } from "../planimetry";

export type EventNames = 'down' | 'enter' | 'leave' | 'move' | 'out' | 'over' | 'up' | 'wheel';
export interface MouseEvent {
    p: Point
}
/**
 * 鼠标事件管理器
 */
export class MouseEventHandler {
    
}