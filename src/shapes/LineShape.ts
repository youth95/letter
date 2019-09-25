/**
 * @module Shapes
 */

/**
 * 图形
 */

import { R, putPath } from "../R";
import { Point, towPointDis } from "../planimetry";
import { Shape } from "./Shape";

/**
 * 线段
 */
export class LineShape extends Shape {
    public moveUp(n: number): void {
        this.start = [this.start[0], this.start[1] - n];
        this.end = [this.end[0], this.end[1] - n];
    }
    public moveDown(n: number): void {
        this.start = [this.start[0], this.start[1] + n];
        this.end = [this.end[0], this.end[1] + n];
    }
    public moveLeft(n: number): void {
        this.start = [this.start[0] - n, this.start[1]];
        this.end = [this.end[0] - n, this.end[1]];
    }
    public moveRight(n: number): void {
        this.start = [this.start[0] + n, this.start[1]];
        this.end = [this.end[0] + n, this.end[1]];
    }
    constructor(public start: Point, public end: Point) {
        super();
    }

    public render: R = (ctx: CanvasRenderingContext2D) => {
        putPath([this.start, this.end])(ctx);
    };

    public static inRegion(start: Point, end: Point, p: Point): boolean {
        const l0 = towPointDis(p, start);
        const l1 = towPointDis(p, end);
        return towPointDis(start, end) == l0 + l1;
    }

    public inRegion(p: [number, number]): boolean {
        return LineShape.inRegion(this.start, this.end, p);
    }
}
