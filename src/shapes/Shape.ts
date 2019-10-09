/**
 * @module Shapes
 */

/**
 * 图形
 */

import { R } from "../R";
import { Point, copyPath, TransformMatrix, createTransformMatrix, isInPolygon } from "../planimetry";
import { DefaultMouseEvent } from "../handler/DefaultMouseEvent";
import { Engine } from "../Engine";

export interface HitAble {
    /**
     * 判断目标点是否在该图形区域内
     * @param p 目标点
     */
    inRegion(p: Point): boolean;
}

export interface SelectedAble {
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
}

export interface DrawState {
    direction?: CanvasDirection;
    font?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    filter?: string;
    globalAlpha?: number;
    globalCompositeOperation?: string;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: ImageSmoothingQuality;
    lineCap?: CanvasLineCap;
    lineDashOffset?: number;
    lineJoin?: CanvasLineJoin;
    lineWidth?: number;
    miterLimit?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;

}

export class Shape extends DefaultMouseEvent implements HitAble, SelectedAble {


    /**
     * 表示当前是否进入了该shape
     */
    public isEnter: boolean = false;

    /**
     * 表示当前是否离开了该shape
     */
    public isLeave: boolean = false;

    /**
     * 自增id
     */
    public static autoIndex: number = 0;

    /**
     * 对象id
     */
    public readonly zindex: number;

    /**
     * 当前图像是否可见
     */
    public visable: boolean = true;

    protected engine: Engine | null = null;

    public drawState: DrawState | null = null;

    private selected: boolean = false;

    public transformMatrix: TransformMatrix = createTransformMatrix();

    public isSelected(): boolean {
        return this.selected;
    }
    public select(): void {
        this.selected = true;
    }
    public unSelect(): void {
        this.selected = false;
    }

    public setEngine(engine: Engine) {
        this.engine = engine;
    }

    public remove() {
        if (this.engine) {
            this.engine.remove(this);
        }
    }

    /**
     * 构造函数
     */
    constructor() {
        super();
        this.zindex = Shape.autoIndex++;
    }

    public renderAfterState: R = (ctx: CanvasRenderingContext2D) => {
        const [
            a, c, e,
            b, d, f,
        ] = this.transformMatrix
        ctx.setTransform(a, b, c, d, e, f);
        if (this.drawState) {
            ctx.save();
            this.drawState.direction && (ctx.direction = this.drawState.direction);
            this.drawState.font && (ctx.font = this.drawState.font);
            this.drawState.textAlign && (ctx.textAlign = this.drawState.textAlign);
            this.drawState.textBaseline && (ctx.textBaseline = this.drawState.textBaseline);
            this.drawState.fillStyle && (ctx.fillStyle = this.drawState.fillStyle);
            this.drawState.strokeStyle && (ctx.strokeStyle = this.drawState.strokeStyle);
            this.drawState.filter && (ctx.filter = this.drawState.filter);
            this.drawState.globalAlpha && (ctx.globalAlpha = this.drawState.globalAlpha);
            this.drawState.globalCompositeOperation && (ctx.globalCompositeOperation = this.drawState.globalCompositeOperation);
            this.drawState.imageSmoothingEnabled && (ctx.imageSmoothingEnabled = this.drawState.imageSmoothingEnabled);
            this.drawState.imageSmoothingQuality && (ctx.imageSmoothingQuality = this.drawState.imageSmoothingQuality);
            this.drawState.lineCap && (ctx.lineCap = this.drawState.lineCap);
            this.drawState.lineDashOffset && (ctx.lineDashOffset = this.drawState.lineDashOffset);
            this.drawState.lineJoin && (ctx.lineJoin = this.drawState.lineJoin);
            this.drawState.lineWidth && (ctx.lineWidth = this.drawState.lineWidth);
            this.drawState.miterLimit && (ctx.miterLimit = this.drawState.miterLimit);
            this.drawState.shadowBlur && (ctx.shadowBlur = this.drawState.shadowBlur);
            this.drawState.shadowColor && (ctx.shadowColor = this.drawState.shadowColor);
            this.drawState.shadowOffsetX && (ctx.shadowOffsetX = this.drawState.shadowOffsetX);
            this.drawState.shadowOffsetY && (ctx.shadowOffsetY = this.drawState.shadowOffsetY);
            this.render(ctx);
            ctx.restore();
        } else {
            this.render(ctx);
        }
    };

    /**
     * 渲染函数
     */
    public render: import("../R").R = () => {};

    public inRegion(p: [number, number]): boolean {
        const isIn = isInPolygon(this.valueOf(), p);
        return isIn;
    }

    public inRegionAndSetEnterState(p: Point): boolean {
        const isIn = this.inRegion(p);
        if (isIn) {
            if (!this.isEnter) {
                this.isEnter = true;
                this.isLeave = false;
            }
        } else {
            if (this.isEnter) {
                this.isEnter = false;
                this.isLeave = true;
            }
        }

        return isIn;
    };

    /**
     * 向上移动
     * @param n 像素量
     */
    public moveUp(n: number): void {
        this.setValue(this.valueOf().map(point => [point[0], point[1] + n]));
    }

    /**
     * 向下移动
     * @param n 像素量
     */
    public moveDown(n: number): void {
        this.setValue(this.valueOf().map(point => [point[0], point[1] - n]));
    }

    /**
     * 向左移动
     * @param n 像素量
     */
    public moveLeft(n: number): void {
        this.setValue(this.valueOf().map(point => [point[0] + n, point[1]]));
    }

    /**
     * 向右移动
     * @param n 像素量
     */
    public moveRight(n: number): void {
        this.setValue(this.valueOf().map(point => [point[0] - n, point[1]]));
    }

    private value: Point[] = [];

    /**
     * 设置原始值
     * @param value 控制点
     */
    public setValue(value: Point[]): void {
        this.value = value;
    }

    /**
     * 获取原始值
     */
    public valueOf(): Point[] {
        return copyPath(this.value);
    };
}


