import { Layer } from "./layers";
import { rowIndex, colIndex } from "./utils";
import { Path } from "./planimetry";
import { minExternalReact } from "./image";

// TODO mock matrixMultiply 矩阵相乘

/**
 * 矩阵 元素值,矩阵宽度(矩阵的列数)
 */
export type Matrix = [number[], number];

export function matrixMultiply(matrix0: Matrix, matrix1: Matrix): Matrix {
    const [m0, width0] = matrix0;
    const [m1, width1] = matrix1;
    if (width0 !== m1.length / width1) {
        throw new Error(`not allow (${m0.length / width0},${width0})*(${m1.length / width1},${width1})`);
    }
    const matrix0RowIndexs = rowIndex(width0, m0.length / width0);
    const matrix1ColIndexs = colIndex(width1, m1.length / width1);
    const result: number[] = [];
    for (const rowI of matrix0RowIndexs) {
        for (const colI of matrix1ColIndexs) {
            const rowv = rowI.map(i => m0[i]);
            const colv = colI.map((i: number) => m1[i]);
            let v = 0;
            for (let i = 0; i < rowv.length; i++) {
                v += rowv[i] * colv[i];
            }
            result.push(v);
        }
    }
    return [result, width1];
}

export enum CElementType {
    BitMap,
    Path,
    Polygon,
    Circle,
}

export enum CPolygonState {
    /**
     * 开始编辑
     */
    beginDraw,
    /**
     * 结束编辑
     */
    endDraw,

    /**
     * 开始移动
     */
    beginMove,

    /**
     * 停止移动
     */
    endMove,

    /**
     * 静态
     */
    static,
}

export interface IElement {
    readonly type: CElementType;
    appendTo(layer: Layer): void;
    render(): void;
}

export class Element {

    public ctx: CanvasRenderingContext2D;
    public actionBoard: HTMLDivElement;
    public belong: Layer | null = null;
    private tMatrix: Matrix = [
        [1, 0, 0,
            0, 1, 0,
            0, 0, 1], 3];

    constructor() {
        const canvas = document.createElement('canvas');
        const actionBoard = document.createElement('div');
        actionBoard.appendChild(canvas);
        actionBoard.style.position = 'absolute';
        actionBoard.style.top = '0';
        actionBoard.style.left = '0';
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('canvas 创建失败');
        }
        this.ctx = ctx;
        this.actionBoard = actionBoard;
    }
    public appendTo(layer: Layer) {
        this.belong = layer;
        layer.appendElement(this);
    }

    public move(x: number, y: number) {
        this.tMatrix = matrixMultiply(this.tMatrix, [[
            1, 0, x,
            0, 1, y,
            0, 0, 1
        ], 3]);
        const [[a, c, e, b, d, f],] = this.tMatrix;
        this.actionBoard.style.transform = `matrix(${a},${b},${c},${d},${e},${f})`;
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }



    public transform() {
        const [[a, c, e, b, d, f],] = this.tMatrix;
        this.ctx.transform(a, b, c, d, e, f);
    }

    public resetTransform() {
        this.ctx.transform(0, 0, 0, 0, 0, 0);
    }




}

class BitMap extends Element implements IElement {
    type: CElementType = CElementType.BitMap;

    private imageData: ImageData | null = null;

    constructor() {
        super();
        this.bindEventListener();
    }


    private bindEventListener() {
        let active = false;
        let last: number[] = [0, 0];
        this.ctx.canvas.addEventListener('mousedown', (e) => {
            active = true;
            last[0] = e.x;
            last[1] = e.y;
        });
        const unActive = () => {
            active = false;
        }
        this.ctx.canvas.addEventListener('mouseup', unActive);
        this.ctx.canvas.addEventListener('mouseleave', unActive);
        this.ctx.canvas.addEventListener('mousemove', (e) => {
            if (active) {
                this.move(e.x - last[0], e.y - last[1]);
                last[0] = e.x;
                last[1] = e.y;
            }
        });

        let actionState = false;

        this.ctx.canvas.addEventListener('dblclick', () => {
            if (actionState === false) {
                this.actionBoard.style.border = 'dotted 1px #000';
                this.actionBoard.style.cursor = 'crosshair';
                this.actionBoard.style.padding = '1px';
                this.ctx.canvas.style.marginTop = '-2px';
                this.ctx.canvas.style.marginLeft = '-2px';
                actionState = true;
            } else {
                this.actionBoard.style.border = 'none';
                this.ctx.canvas.style.marginTop = '0';
                this.ctx.canvas.style.marginLeft = '0';
                actionState = false;
            }

        });

    }


    public setImageData(imageData: ImageData) {
        this.imageData = imageData;
    }

    public render(): void {
        if (this.imageData === null) {
            throw new Error('imageData is null')
        }
        this.ctx.clearRect(0, 0, this.imageData.width, this.imageData.height);
        this.ctx.canvas.style.transform = 'none';
        this.transform();
        this.ctx.putImageData(this.imageData, 0, 0);
        this.resetTransform();
    }

    public updateImageData() {
        const w = this.ctx.canvas.width;
        const h = this.ctx.canvas.height;
        this.imageData = this.ctx.getImageData(0, 0, w, h);
    }
}

export async function createBitMapFromUrl(url: string): Promise<BitMap> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const bitMap = new BitMap();
        img.onload = () => {
            const w = img.width;
            const h = img.height;
            bitMap.ctx.canvas.width = w;
            bitMap.ctx.canvas.height = h;
            bitMap.ctx.drawImage(img, 0, 0);
            bitMap.updateImageData();
            resolve(bitMap);
        }
        img.onerror = err => reject(err);
        img.src = url;
    })
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