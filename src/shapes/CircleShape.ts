/**
 * @module Shapes
 */

/**
 * 图形
 */

import { Shape } from "./Shape";
import { R, putCircle } from "../R";
import { Circle, towPointDis, Path } from "../planimetry";
import { ModifyAbleShape } from "./ModifyAbleShape";

/**
 * 圆
 */
export class CircleShape extends ModifyAbleShape {
    /**
     * 是否填充这个圆形
     */
    public isFilled: boolean = false;

    public moveUp(n: number): void {
        this.circle = [[this.circle[0][0], this.circle[0][1] - n], this.circle[1]];
        this.syncValue();
    }

    public moveDown(n: number): void {
        this.circle = [[this.circle[0][0], this.circle[0][1] + n], this.circle[1]];
        this.syncValue();
    }

    public moveLeft(n: number): void {
        this.circle = [[this.circle[0][0] - n, this.circle[0][1]], this.circle[1]];
        this.syncValue();
    }

    public moveRight(n: number): void {
        this.circle = [[this.circle[0][0] + n, this.circle[0][1]], this.circle[1]];
        this.syncValue();
    }

    constructor(
        public circle: Circle
    ) {
        super();
        this.syncValue();
    }

    public setValue(v:Path){
        super.setValue(v);
        const [p0,p1] = v;
        const [x,y] = p0;
        const r = towPointDis(p0,p1);
        this.circle = [[x,y],r];
    }

    private syncValue(){
        const [[x, y], r] = this.circle;
        super.setValue([
            [x, y],
            [x + r, y],
        ]);
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