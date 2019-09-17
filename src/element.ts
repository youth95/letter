import { Polygon, Path, Circle } from "./planimetry";

export type R = (ctx: CanvasRenderingContext2D) => void;


export function putPath(path: Path,closed:boolean = false): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(...path[0]);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(...path[i]);
        }
        if(closed){
            ctx.closePath();
        }
        ctx.stroke();
    }
}

export function putCircle(circle: Circle): R {
    return (ctx: CanvasRenderingContext2D) => {
        const [[x, y], r] = circle;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}




export abstract class Element<T = any>  {
    abstract init(options: T): Promise<void> | void;
    abstract getCanvasPattern(): CanvasPattern;
    abstract isIn(p: Point): boolean;
    public pos: RectPos = [0, 0, 0, 0];

    public onMouseDown(e: MouseEvent) {
        console.log('click', e);
    }

    public isInRect(p: Point): boolean {
        const [x, y, w, h] = this.pos;
        return (p[0] >= x && p[0] <= x + w) && (p[1] >= y && p[1] <= y + h);
    }

    public fr(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.getCanvasPattern();
        console.log('render', this.getCanvasPattern());
        ctx.fillRect(...this.pos);
    }

    public sr(ctx: CanvasRenderingContext2D) {
        ctx.strokeRect(...this.pos);
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
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.src = options.url;
            this.image.onload = () => {
                if (this.image === null) {
                    reject(new Error('cont create image !'));
                    return;
                }
                this.canvasPattern = createCanvasContext2d().createPattern(this.image, 'no-repeat');
                this.pos = [0, 0, this.image.width, this.image.height];
                console.log(this.canvasPattern);
                resolve();
            }
            this.image.onerror = err => reject(err);
        });

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

export async function createBitMap(options: BitMapInitOptions): Promise<BitMap> {
    const bitMap = new BitMap();
    await bitMap.init(options);
    return bitMap;
}

export interface PloygonInitOptions {
    value: Path
}

class EPloygon extends Element<PloygonInitOptions>{
    private canvasPattern: CanvasPattern | null = null;
    private path: Path | null = null;
    public init(options: PloygonInitOptions): void | Promise<void> {
        const ctx = createCanvasContext2d();
        this.pos = getPointsRect(options.value);
        ctx.canvas.width = this.pos[2];
        ctx.canvas.height = this.pos[3];
        ctx.beginPath();
        const s = options.value[0];
        ctx.moveTo(...s);
        for (const p of options.value) {
            ctx.lineTo(...p);
        }
        ctx.closePath();
        ctx.stroke();
        this.path = options.value;
        this.canvasPattern = ctx.createPattern(ctx.canvas, 'no-repeat');
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

export function createPloygon(options: PloygonInitOptions): EPloygon {
    const ploygon = new EPloygon();
    ploygon.init(options);
    return ploygon;
}

class EPath extends Element<PloygonInitOptions>{
    private canvasPattern: CanvasPattern | null = null;
    private path: Path | null = null;
    public init(options: PloygonInitOptions): void | Promise<void> {
        const ctx = createCanvasContext2d();
        this.pos = getPointsRect(options.value);
        ctx.canvas.width = this.pos[2];
        ctx.canvas.height = this.pos[3];
        ctx.beginPath();
        const s = options.value[0];
        ctx.moveTo(...s);
        for (const p of options.value) {
            ctx.lineTo(...p);
        }
        ctx.stroke();
        this.path = options.value;
        this.canvasPattern = ctx.createPattern(ctx.canvas, 'no-repeat');
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


export function createPath(options: PloygonInitOptions): EPath {
    const path = new EPath();
    path.init(options);
    return path;
}

export interface CircleInitOptions {
    value: Circle
}

class ECircle extends Element<CircleInitOptions> {
    private value: Circle | null = null;
    private canvasPattern: CanvasPattern | null = null;
    init(options: CircleInitOptions): void | Promise<void> {
        const ctx = createCanvasContext2d();
        this.value = options.value;
        // this.pos = getPointsRect(options.value); // TODO
        ctx.canvas.width = this.pos[2];
        ctx.canvas.height = this.pos[3];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

export function putImage(image: HTMLImageElement): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(image, 0, 0);
    }
}
