import { createCanvasContext2d } from "./utils";
import { Element, BitMap } from "./element";
import { renderXRod, renderYRod } from "./widget";
import { Path, Polygon, Point, Circle, towPointDis } from "./planimetry";

export interface LayerOptions {
    name?: string;
}


export interface LayerInfo {
    id: number;
    name: string;
}

export interface appendShapeAble {
    append(el: Element): Layer
}

class Layer implements LayerInfo {
    private els: Element[] = [];

    public append(el: Element<any>): Layer {

        this.els.push(el);
        return this;
    }

    public render(ctx: CanvasRenderingContext2D) {
        console.log('Layer.render',this.els);
        this.els.forEach(item => item.fr(ctx));
    }

    public onMouseDown(e: MouseEvent) {
        console.log('layer', e);
        const item = this.els.find(item => item.isIn([e.offsetX, e.offsetY]));
        console.log('item', item);
        if (item) {
            item.onMouseDown(e);
            return item;
        }
        return null;
    }

    constructor(
        public id: number,
        public name: string,
    ) { }
}




export class Editor implements appendShapeAble {
    private static instance: Editor | null = null;
    private static autoLayerId = 0;
    private sceneBackground: BitMap | null = null;
    private constructor() { }
    private ctx = createCanvasContext2d();
    private layersMapper = new Map<number, Layer>();
    private sceneWidth: number = 100;
    private sceneHeight: number = 100;
    private isShowRod: boolean = true;

    public static getInstance(): Editor {
        if (this.instance === null)
            this.instance = new Editor();
        return this.instance;
    }

    public addLayer(options?: LayerOptions): Layer {
        const id = Editor.autoLayerId++;
        if (!options) {
            const name = `default${id}`;
            this.layersMapper.set(id, new Layer(id, name));
        } else {
            this.layersMapper.set(id, new Layer(id, options.name || `default${id}`));
        }
        return this.layersMapper.get(id)!;
    }

    /**
     * 渲染所有图元
     */
    public render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 绘制底图
        if (this.sceneBackground) {
            const [, , w, h] = this.sceneBackground.pos;
            this.ctx.canvas.width = w;
            this.ctx.canvas.height = h;
            this.sceneBackground.fr(this.ctx);
        }
        // 绘制标尺
        if (this.isShowRod) {
            renderXRod(this.ctx);
            renderYRod(this.ctx);
        }
        // 重新绘制所有图元
        [...this.layersMapper.keys()].sort().forEach(i => this.layersMapper.get(i)!.render(this.ctx));
    }

    /**
     * 添加图园到默认层
     * @param el 图元
     */
    public append(el: Element<any>): Layer {
        if (this.layersMapper.size === 0) {
            this.addLayer();
        }
        const layer = this.layersMapper.get(Editor.autoLayerId - 1);
        layer!.append(el);
        return layer!;
    }

    public setSceneSize(width: number, height: number) {
        this.sceneWidth = width;
        this.sceneHeight = height;
        this.ctx.canvas.width = this.sceneWidth;
        this.ctx.canvas.height = this.sceneHeight;
    }

    // 设置底图
    /**
     * 设置底图
     * @param bitMap 底图
     */
    public setSceneBackground(bitMap: BitMap) {
        bitMap.pos = [8, 8, bitMap.pos[2], bitMap.pos[3]];
        this.sceneBackground = bitMap;
        this.setSceneSize(bitMap.pos[2], bitMap.pos[3]);
    }

    /**
     * 显示标尺
     */
    public showRod() {
        this.isShowRod = true;
        this.render();
    }

    /**
     * 隐藏标尺
     */
    public hideRod() {
        this.isShowRod = false;
        this.render();
    }

    /**
     * 获取快照
     */
    public snapshot(): CanvasPattern {
        const pat = this.ctx.createPattern(this.ctx.canvas, 'no-repeat');
        if (pat === null) {
            throw new Error('cont create pat!');
        }
        return pat;
    }

    /**
     * 画一条线
     */
    public async drawLine(): Promise<Path | null> {
        return new Promise((resolve, reject) => {
            const pat = this.snapshot();
            let p0: number[] | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX, e.offsetY];
                } else {
                    this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    resolve([[p0[0], p0[1]], [e.offsetX, e.offsetY]]);
                    return;
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.beginPath();
                    this.ctx.moveTo(p0[0], p0[1]);
                    this.ctx.lineTo(e.offsetX, e.offsetY);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            }
            this.ctx.canvas.addEventListener('mousedown', mousedownHandler);
            this.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 画一个多边形
     */
    public drawPolygon(): Promise<Polygon | null> {
        return new Promise((resolve, reject) => {
            const pat = this.snapshot();
            let plist: Point[] = [];
            const mousedownHandler = (e: MouseEvent) => {
                if (e.button === 0) {
                    plist.push([e.offsetX, e.offsetY]);
                    mousemoveHandler(e);
                }
            }
            const render = (x?: number, y?: number) => {
                this.ctx.fillStyle = pat;
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.ctx.beginPath();
                this.ctx.moveTo(...plist[0]);
                for (let i = 1; i < plist.length; i++)
                    this.ctx.lineTo(...plist[i]);
                if (x !== undefined && y !== undefined) {
                    this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (plist.length !== 0) {
                    render(e.offsetX, e.offsetY);
                }
            }
            const contextmenuHandler = (e: MouseEvent) => {
                if (plist.length > 1) {
                    plist.pop();
                    mousemoveHandler(e);
                }
                e.preventDefault();
            }

            const keypressHandler = (e: KeyboardEvent) => {
                if (e.keyCode === 115) {   // s
                    this.ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                    this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    window.removeEventListener('keypress', keypressHandler);
                    render();
                    resolve(plist);
                } else if (e.keyCode === 113) {   // q
                    this.ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                    this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    window.removeEventListener('keypress', keypressHandler);
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    resolve(null);
                }
            }
            this.ctx.canvas.addEventListener('contextmenu', contextmenuHandler);
            this.ctx.canvas.addEventListener('mousedown', mousedownHandler);
            this.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
            window.addEventListener('keypress', keypressHandler);
        });
    }

    /**
     * 画一个圆
     */
    public drawCircle(): Promise<Circle | null> {
        return new Promise((resolve, reject) => {
            const pat = this.snapshot();
            let circle: Circle | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (e.button === 0) {
                    if (circle === null) {
                        circle = [[e.offsetX, e.offsetY], 0];
                    } else {
                        this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                        this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                        circle = [[circle[0][0], circle[0][1]], towPointDis([circle[0][0], circle[0][1]], [e.offsetX, e.offsetY])];
                        resolve(circle);
                        return;
                    }
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (circle !== null) {
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    circle = [[circle[0][0], circle[0][1]], towPointDis([circle[0][0], circle[0][1]], [e.offsetX, e.offsetY])];
                    const [[x, y], r] = circle;
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
                    this.ctx.stroke();
                }
            }
            this.ctx.canvas.addEventListener('mousedown', mousedownHandler);
            this.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }


}