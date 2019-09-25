/**
 * @module Shapes
 */


import { Shape } from "./Shape";
import { R, putImageSource } from "../R";
import { RectPos, isInRect } from "../planimetry";

/**
 * 图像
 */
export class ImageShape extends Shape {
    public moveUp(n: number): void {
        this.pos = [this.pos[0], this.pos[1] - n, this.pos[2], this.pos[3]];
    }
    public moveDown(n: number): void {
        this.pos = [this.pos[0], this.pos[1] + n, this.pos[2], this.pos[3]];
    }
    public moveLeft(n: number): void {
        this.pos = [this.pos[0] - n, this.pos[1], this.pos[2], this.pos[3]];
    }
    public moveRight(n: number): void {
        this.pos = [this.pos[0] + n, this.pos[1], this.pos[2], this.pos[3]];
    }
    constructor(
        protected image: CanvasImageSource,
        protected pos: RectPos,
    ) {
        super();
    }

    public render: R = (ctx: CanvasRenderingContext2D) => {
        putImageSource(this.image, this.pos)(ctx);
    };

    public inRegion(p: [number, number]): boolean {
        return isInRect(this.pos, p);
    }

    public static fetchFromUrl(url: string): Promise<ImageShape> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(new ImageShape(img, [0, 0, img.width, img.height]));
            img.onerror = err => reject(err);
        });
    }

    public fetchFromUrl(url: string): Promise<ImageShape> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(this);
            img.onerror = err => reject(err);
        });
    }

}