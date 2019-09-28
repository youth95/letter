/**
 * @module Shapes
 */

/**
 * 图形
 */

import { R } from "../R";
import { Point } from "../planimetry";
import { DefaultMouseEvent } from "../handler/DefaultMouseEvent";

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

export abstract class Shape extends DefaultMouseEvent {
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

    public drawState: DrawState | null = null;

    /**
     * 构造函数
     */
    constructor() {
        super();
        this.zindex = Shape.autoIndex++;
    }

    public renderAfterState: R = (ctx: CanvasRenderingContext2D) => {
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
    public abstract render: R;

    /**
     * 判断目标点是否在该图形区域内
     * @param p 目标点
     */
    public abstract inRegion(p: Point): boolean;

    /**
     * 向上移动
     * @param n 像素量
     */
    public abstract moveUp(n: number): void;

    /**
     * 向下移动
     * @param n 像素量
     */
    public abstract moveDown(n: number): void;

    /**
     * 向左移动
     * @param n 像素量
     */
    public abstract moveLeft(n: number): void;

    /**
     * 向右移动
     * @param n 像素量
     */
    public abstract moveRight(n: number): void;
}

