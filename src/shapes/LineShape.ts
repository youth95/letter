import { R, putPath } from "../R";
import { Point, towPointDis } from "../planimetry";
import { Shape } from "./Shape";
import {ModifyAbleShape} from './ModifyAbleShape';

/**
 * 线段
 */
export class LineShape extends ModifyAbleShape {
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
    constructor(start: Point, end: Point) {
        super();
        this.setValue([start,end]);
    }

    public get start(){
        return this.valueOf()[0];
    }

    public set start(p:Point){
        const tmp = this.valueOf();
        tmp[0] = p;
        this.setValue(tmp);
    }

    public get end(){
        return this.valueOf()[1];
    }

    public set end(p:Point){
        const tmp = this.valueOf();
        tmp[1] = p;
        this.setValue(tmp);
    }

    public render: R = (ctx: CanvasRenderingContext2D) => {
        putPath([this.start, this.end])(ctx);
    };

    public static inRegion(start: Point, end: Point, p: Point): boolean {
        const l0 = towPointDis(p, start);
        const l1 = towPointDis(p, end);
        const dis = towPointDis(start, end);
        return Math.round(l0 + l1 ) === Math.round(dis);
    }

    public inRegion(p: [number, number]): boolean {
        return LineShape.inRegion(this.start, this.end, p);
    }
}
