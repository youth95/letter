/**
 * @module Shapes
 */


import { Shape } from "./Shape";
import { R, putImageSource } from "../R";
import { RectPos, isInRect, Path } from "../planimetry";
import { ModifyAbleShape } from "./ModifyAbleShape";

/**
 * 图像
 */
export class ImageShape extends ModifyAbleShape {
    public moveUp(n: number): void {
        this.pos = [this.pos[0], this.pos[1] - n, this.pos[2], this.pos[3]];
        this.syncValue();
    }
    public moveDown(n: number): void {
        this.pos = [this.pos[0], this.pos[1] + n, this.pos[2], this.pos[3]];
        this.syncValue();
    }
    public moveLeft(n: number): void {
        this.pos = [this.pos[0] - n, this.pos[1], this.pos[2], this.pos[3]];
        this.syncValue();
    }
    public moveRight(n: number): void {
        this.pos = [this.pos[0] + n, this.pos[1], this.pos[2], this.pos[3]];
        this.syncValue();
    }
    constructor(
        protected image: CanvasImageSource,
        protected pos: RectPos,
    ) {
        super();
        this.syncValue();
    }

    private syncValue() {
        const [x, y, w, h] = this.pos;
        super.setValue([
            [x, y],
            [x + w, y],
            [x, y + h],
            [x + w, y + h],
        ]);
    }

    public setValue(v:Path){
        super.setValue(v);
        const [p0, , , p3] = v;
        const [x, y] = p0;
        const w = p3[0] - x;
        const h = p3[1] - y;
        this.pos = [x, y, w, h];
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