/**
 * @module Shapes
 */

/**
 * 图形
 */

import { PathShape } from "./PathShape";
import { R, putPath } from "../R";
import { isInPolygon } from "../planimetry";

/**
 * 多边形
 */
export class PloygonShape extends PathShape {
    /**
     * 是否填充该多边形
     */
    public isFilled: boolean = false;
    public render: R = (ctx: CanvasRenderingContext2D) => {
        putPath(this.paths, true)(ctx);
        if (this.isFilled) {
            ctx.fill();
        }
    };

    public inRegion(p: [number, number]): boolean {
        return isInPolygon(this.paths, p);
    }
}