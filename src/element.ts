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

class Polygon extends Element implements IElement {
    type: CElementType = CElementType.Polygon;
    public state: CPolygonState = CPolygonState.static;

    private paths: Path = [];
    constructor() {
        super();
        this.bindEventListener();
    }

    private bindEventListener() {
        this.ctx.canvas.addEventListener('contextmenu', e => {
            if (this.state === CPolygonState.beginDraw) {
                this.paths.pop();
                this.paths.pop();
                this.render();
                e.stopPropagation();
                e.preventDefault();
                this.state = CPolygonState.endDraw;
                const rc = minExternalReact(this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height));
                const imgD = this.ctx.getImageData(...rc);
                this.clear();
                this.ctx.canvas.width = rc[2];
                this.ctx.canvas.height = rc[3];
                this.ctx.putImageData(imgD,0,0);
                this.move(rc[0],rc[1]);
            }
        });
        this.ctx.canvas.addEventListener('mousedown', e => {
            const x = e.offsetX - this.ctx.canvas.offsetLeft;
            const y = e.offsetY - this.ctx.canvas.offsetTop;
            if (this.state === CPolygonState.beginDraw) {
                this.paths.push([x, y]);
                this.render();
            } else if (this.state === CPolygonState.static) {
                this.state = CPolygonState.beginDraw;
                this.paths.push([x, y]);
                this.render();
            }

        });

        this.ctx.canvas.addEventListener('mousemove', e => {
            const x = e.offsetX - this.ctx.canvas.offsetLeft;
            const y = e.offsetY - this.ctx.canvas.offsetTop;
            if (this.state === CPolygonState.beginDraw) {
                if (this.paths.length > 1) {
                    this.paths.pop();
                }
                this.paths.push([x, y]);
                this.render();
            }
        });

    }

    private draw() {
        this.ctx.beginPath();
        const plen = this.paths.length;
        this.ctx.moveTo(...this.paths[0]);
        for (let i = 1; i < plen; i++) {
            this.ctx.lineTo(...this.paths[i]);
        }
        this.ctx.lineTo(...this.paths[0]);
        this.ctx.stroke();
        // this.ctx.fill();
    }

    render(): void {
        this.clear();
        this.draw();
    }


}

export interface PolygonEditPanelOptions {
    width: number;
    height: number;
}

export function createPolygonEditPanel(option: PolygonEditPanelOptions): Polygon {
    const polygon = new Polygon();
    polygon.ctx.canvas.width = option.width;
    polygon.ctx.canvas.height = option.height;
    polygon.ctx.canvas.style.backgroundColor = 'rgba(255,255,255,0.33)';
    return polygon;
}