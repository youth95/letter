import { Point, isInPolygon, Path, RectPos, getPointsRect } from "./planimetry";
import { createCanvasContext2d } from "./utils";





export abstract class Element<T = any> {
    abstract init(options: T): Promise<void> | void;
    abstract getCanvasPattern(): CanvasPattern;
    abstract isIn(p: Point): boolean;
    public pos: RectPos = [0, 0, 0, 0];

    public isInRect(p: Point): boolean {
        const [x, y, w, h] = this.pos;
        return isInPolygon([[x, y], [x + w, y + h]], p);
    }

    public fr(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.getCanvasPattern();
        ctx.fillRect(...this.pos);
    }

    public move(x: number, y: number) {
        this.pos[0] = x;
        this.pos[1] = y;
    }
}

export interface BitMapInitOptions {
    url: string
}

export class BitMap extends Element<BitMapInitOptions>{

    private image: HTMLImageElement | null = null;
    private canvasPattern: CanvasPattern | null = null;
    /**
     * 判断一个点是否在这个矩形区域中
     * @param p 需要判断的点
     */
    public isIn(p: Point): boolean {
        return this.isInRect(p);
    }
    public init(options: BitMapInitOptions): void | Promise<void> {
        this.image = new Image();
        this.image.src = options.url;
        if (this.image === null) {
            throw new Error('cont create image !');
        }
        this.canvasPattern = createCanvasContext2d().createPattern(this.image, 'no-repet');
    }
    public getCanvasPattern(): CanvasPattern {
        if (this.canvasPattern === null) {
            throw new Error('cont create canvas pattern !');
        }
        return this.canvasPattern;
    }



export interface PloygonInitOptions {
    path: Path
}

export class Ploygon extends Element<PloygonInitOptions>{
    private canvasPattern: CanvasPattern | null = null;
    private path: Path | null = null;
    public init(options: PloygonInitOptions): void | Promise<void> {
        const ctx = createCanvasContext2d();
        this.pos = getPointsRect(options.path);
        ctx.canvas.width = this.pos[2];
        ctx.canvas.height = this.pos[3];
        ctx.beginPath();
        const s = options.path[0];
        ctx.moveTo(...s);
        for (const p of options.path) {
            ctx.lineTo(...p);
        }
        ctx.closePath();
        ctx.stroke();
        this.path = options.path;
        this.canvasPattern = ctx.createPattern(ctx.canvas, 'no-repret');
    }
    public getCanvasPattern(): CanvasPattern {
        if (this.canvasPattern === null) {
            throw new Error('cont create canvas pattern !');
        }
        return this.canvasPattern;
    }
    public isIn(p: [number, number]): boolean {
        if (this.path === null)
            return false;
        return isInPolygon(this.path, p);
    }


}

export interface PloygonInitOptions {
    path: Path
}

export class Ploygon extends Element<PloygonInitOptions>{
    private canvasPattern: CanvasPattern | null = null;
    private path: Path | null = null;
    public init(options: PloygonInitOptions): void | Promise<void> {
        const ctx = createCanvasContext2d();
        this.pos = getPointsRect(options.path);
        ctx.canvas.width = this.pos[2];
        ctx.canvas.height = this.pos[3];
        ctx.beginPath();
        const s = options.path[0];
        ctx.moveTo(...s);
        for (const p of options.path) {
            ctx.lineTo(...p);
        }
        ctx.closePath();
        ctx.stroke();
        this.path = options.path;
        this.canvasPattern = ctx.createPattern(ctx.canvas, 'no-repret');
    }
    public getCanvasPattern(): CanvasPattern {
        if (this.canvasPattern === null) {
            throw new Error('cont create canvas pattern !');
        }
        return this.canvasPattern;
    }
    public isIn(p: [number, number]): boolean {
        if (this.path === null)
            return false;
        return isInPolygon(this.path, p);
    }


}