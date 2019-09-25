/**
 * @module Shapes
 */

/**
 * 图形
 */

import { Shape } from "./Shape";
import { R, putCircle } from "../R";
import { Circle, towPointDis } from "../planimetry";

/**
 * 圆
 */
export class CircleShape extends Shape {
    /**
     * 是否填充这个圆形
     */
    public isFilled: boolean = false;

    public moveUp(n: number): void {
        this.circle = [[this.circle[0][0], this.circle[0][1] - n], this.circle[1]];
    }

    public moveDown(n: number): void {
        this.circle = [[this.circle[0][0], this.circle[0][1] + n], this.circle[1]];
    }

    public moveLeft(n: number): void {
        this.circle = [[this.circle[0][0] - n, this.circle[0][1]], this.circle[1]];
    }

    public moveRight(n: number): void {
        this.circle = [[this.circle[0][0] + n, this.circle[0][1]], this.circle[1]];
    }

    constructor(
        public circle: Circle
    ) {
        super();
    }

    public render: R = (ctx: CanvasRenderingContext2D) => {
        putCircle(this.circle)(ctx);
        if (this.isFilled) {
            ctx.fill();
        }
    };

    public inRegion(p: [number, number]): boolean {
        return towPointDis(p, this.circle[0]) <= this.circle[1];
    }

}