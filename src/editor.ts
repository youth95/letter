import { createCanvasContext2d } from "./utils";
import { Element, BitMap, R, putPath, putPloygon, putCircle } from "./element";
import { renderXRod, renderYRod, renderRgba } from "./widget";
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
        console.log('Layer.render', this.els);
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
    private wrap: HTMLDivElement | null = null;
    private constructor() { }
    private ctx = createCanvasContext2d();
    private layersMapper = new Map<number, Layer>();
    private sceneWidth: number = 100;
    private sceneHeight: number = 100;
    private isShowRod: boolean = true;


    private shapes: R[] = [];

    public mount(root: string) {
        this.render();
        const wrap = document.createElement('div');
        this.wrap = wrap;
        wrap.style.position = 'relative';
        wrap.style.fontSize = '0';
        this.ctx.canvas.style.position = 'absolute';
        wrap.appendChild(this.ctx.canvas);
        const rdom = document.getElementById(root);
        if (rdom) {
            rdom.appendChild(wrap);
        }
    }

    /**
     * 获取编辑器实例
     */
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
        // 绘制底部透明
        renderRgba(this.ctx);
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
        // [...this.layersMapper.keys()].sort().forEach(i => this.layersMapper.get(i)!.render(this.ctx));
        this.shapes.forEach(f => f(this.ctx));
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
    /**
     * 设置场景宽高
     * @param width 宽度
     * @param height 高度
     */
    public setSceneSize(width: number, height: number) {
        this.sceneWidth = width;
        this.sceneHeight = height;
        this.ctx.canvas.width = this.sceneWidth;
        this.ctx.canvas.height = this.sceneHeight;
    }

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
        this.hideRod();
        const pat = this.ctx.createPattern(this.ctx.canvas, 'no-repeat');
        this.showRod();
        if (pat === null) {
            throw new Error('cont create pat!');
        }
        return pat;
    }

    /**
     * 画一路径
     */
    public async drawLine(): Promise<Path | null> {
        return new Promise((resolve, reject) => {
            const ctx = this.drawStart();
            let p0: number[] | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX, e.offsetY];
                } else {
                    ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    this.drawEnd(ctx);
                    this.appendShape(putPath([[p0[0], p0[1]], [e.offsetX, e.offsetY]]));// 添加图元
                    resolve([[p0[0], p0[1]], [e.offsetX, e.offsetY]]);
                    return;
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.beginPath();
                    ctx.moveTo(p0[0], p0[1]);
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }
            }
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 画一个多边形
     */
    public drawPolygon(): Promise<Polygon | null> {
        return new Promise((resolve, reject) => {
            const ctx = this.drawStart();
            let plist: Point[] = [];
            const mousedownHandler = (e: MouseEvent) => {
                if (e.button === 0) {
                    plist.push([e.offsetX, e.offsetY]);
                    mousemoveHandler(e);
                }
            }
            const render = (x?: number, y?: number) => {
                ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                ctx.beginPath();
                ctx.moveTo(...plist[0]);
                for (let i = 1; i < plist.length; i++)
                    ctx.lineTo(...plist[i]);
                if (x !== undefined && y !== undefined) {
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
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
                    ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                    ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    window.removeEventListener('keypress', keypressHandler);
                    render();
                    this.drawEnd(ctx);
                    this.appendShape(putPloygon(plist));
                    resolve(plist);
                } else if (e.keyCode === 113) {   // q
                    ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                    ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    window.removeEventListener('keypress', keypressHandler);
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    this.drawEnd(ctx);
                    resolve(null);
                }
            }
            ctx.canvas.addEventListener('contextmenu', contextmenuHandler);
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
            window.addEventListener('keypress', keypressHandler);
        });
    }

    /**
     * 画一个圆
     */
    public drawCircle(): Promise<Circle | null> {
        return new Promise((resolve, reject) => {
            const ctx = this.drawStart();
            let circle: Circle | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (e.button === 0) {
                    if (circle === null) {
                        circle = [[e.offsetX, e.offsetY], 0];
                    } else {
                        ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                        ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                        circle = [[circle[0][0], circle[0][1]], towPointDis([circle[0][0], circle[0][1]], [e.offsetX, e.offsetY])];
                        this.drawEnd(ctx);
                        this.appendShape(putCircle(circle));
                        resolve(circle);
                        return;
                    }
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (circle !== null) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    circle = [[circle[0][0], circle[0][1]], towPointDis([circle[0][0], circle[0][1]], [e.offsetX, e.offsetY])];
                    const [[x, y], r] = circle;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 添加图元
     * @param r 图元函数
     */
    private appendShape(r: R): void {
        this.shapes.push(r);
        this.render();
    }
    /**
     * 开始一个绘图
     */
    private drawStart(): CanvasRenderingContext2D {
        const ctx = createCanvasContext2d();
        ctx.canvas.width = this.ctx.canvas.width;
        ctx.canvas.height = this.ctx.canvas.height;
        ctx.canvas.style.position = 'absolute';
        this.wrap!.appendChild(ctx.canvas);
        return ctx;
    }

    /**
     * 结束一个绘图
     * @param ctx 需要结束的上下文
     */
    private drawEnd(ctx: CanvasRenderingContext2D) {
        ctx.canvas.remove();
    }

    /**
     * 移动当前画布
     */
    public move(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let p0: number[] | null = null;
            const pat = this.snapshot();
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX, e.offsetY];
                } else {
                    this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    this.render();
                    resolve(true);
                    return;
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    renderRgba(this.ctx);

                    this.ctx.save();
                    this.ctx.translate(e.offsetX - p0[0], e.offsetY - p0[1]);
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.restore();
                    
                    renderXRod(this.ctx);
                    renderYRod(this.ctx);
                }
            }
            this.ctx.canvas.addEventListener('mousedown', mousedownHandler);
            this.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 缩放当前画布
     */
    public zoom(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let p0: number[] | null = null;
            const pat = this.snapshot();
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX, e.offsetY];
                } else {
                    this.ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    this.ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    return;
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.save();
                    this.ctx.scale(
                        (this.ctx.canvas.width - (e.offsetX - p0[0])) / this.ctx.canvas.width
                        , (this.ctx.canvas.height - (e.offsetY - p0[1])) / this.ctx.canvas.height);
                    this.ctx.fillStyle = pat;
                    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.restore();
                }
            }
            this.ctx.canvas.addEventListener('mousedown', mousedownHandler);
            this.ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

}