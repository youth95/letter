import { createCanvasContext2d } from "./utils";
import { R, putPath, putCircle, putImage } from "./element";
import { renderControlPoint, renderXRod, renderYRod, renderRgba } from "./widget";
import { Path, Point, Circle, towPointDis, isInRects, RectPos, copyPath, TransformMatrix, createTransformMatrix } from "./planimetry";

/**
 * 绑定保存和退出函数
 * @param save 保存函数
 * @param quit 退出函数
 */
export function bindWindowKeyBoardSaveAndQuit(save: () => void, quit: () => void) {
    const keypressHandler = (e: KeyboardEvent) => {
        if (e.keyCode === 115) {   // s
            save();
            window.removeEventListener('keypress', keypressHandler);
        } else if (e.keyCode === 113) {   // q
            quit();
            window.removeEventListener('keypress', keypressHandler);
        }
    }
    window.addEventListener('keypress', keypressHandler);
}

export interface Instance {
    wrap: HTMLDivElement;
    baseCtx: CanvasRenderingContext2D;
}

/**
 * 挂载编辑器
 * @param root 待挂载容器
 */
export function mount(root: string | Element): Instance {
    const baseCtx = createCanvasContext2d();
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.fontSize = '0';
    baseCtx.canvas.style.position = 'absolute';
    wrap.appendChild(baseCtx.canvas);
    if (typeof root === 'string') {
        const rdom = document.getElementById(root);
        if (rdom) {
            rdom.appendChild(wrap);
        }
    } else {
        root.appendChild(wrap);
    }


    return {
        wrap,
        baseCtx
    };
}

/**
 * 设置实例画布尺寸
 * @param instance 编辑器实例
 * @param width 宽度
 * @param height 高度
 */
export function setSize(instance: Instance, width: number, height: number) {
    instance.baseCtx.canvas.width = width;
    instance.baseCtx.canvas.height = height;
    instance.wrap.style.width = width + 'px';
    instance.wrap.style.height = height + 'px';
}

/**
 * 开始一个绘图
 * @param instance 编辑器实例
 */
function drawStart(instance: Instance): CanvasRenderingContext2D {
    const { baseCtx, wrap } = instance;
    const ctx = createCanvasContext2d();
    ctx.canvas.width = baseCtx.canvas.width;
    ctx.canvas.height = baseCtx.canvas.height;
    ctx.canvas.style.position = 'absolute';
    wrap.appendChild(ctx.canvas);
    return ctx;
}

/**
 * 结束一个绘图
 * @param ctx 需要结束的上下文
 */
function drawEnd(ctx: CanvasRenderingContext2D) {
    ctx.canvas.remove();
}


/**
 * 画一条线
 * @param instance 编辑器实例
 */
export function drawLine(instance: Instance): Promise<Path | null> {
    return new Promise((resolve, reject) => {
        const ctx = drawStart(instance);
        const { offsetTop, offsetLeft } = ctx.canvas;
        let p0: number[] | null = null;
        const mousedownHandler = (e: MouseEvent) => {
            if (p0 === null) {
                p0 = [e.offsetX - offsetLeft, e.offsetY - offsetTop];
            } else {
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                const path: Path = [[p0[0], p0[1]], [e.offsetX - offsetLeft, e.offsetY - offsetTop]];
                drawEnd(ctx);
                resolve(path);
                return;
            }
        }
        const mousemoveHandler = (e: MouseEvent) => {
            if (p0 !== null) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.beginPath();
                ctx.moveTo(p0[0], p0[1]);
                ctx.lineTo(e.offsetX - offsetTop, e.offsetY - offsetLeft);
                ctx.stroke();
            }
        }
        ctx.canvas.addEventListener('mousedown', mousedownHandler);
        ctx.canvas.addEventListener('mousemove', mousemoveHandler);
    });
}

/**
 * 编辑一条线
 * @param instance 编辑器实例
 * @param path 需要修改的路径
 */
export function modifyLine(instance: Instance, srcPath: Path): Promise<Path | null> {
    const path = copyPath(srcPath);
    return new Promise((resolve, reject) => {
        const { baseCtx } = instance;
        const ctx = drawStart(instance);
        let cps: RectPos[] = [];
        let active = false;
        const render = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'red';
            putPath(path)(ctx);
            cps = renderControlPoint(path)(ctx);
        }
        render();
        let activeI = -1;
        const mousedownHandler = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if (ctx.canvas.style.cursor === 'move') {
                activeI = isInRects(cps, [x, y]);
                active = true;
            }

        }
        const mouseupHandler = (e: MouseEvent) => {
            if (ctx.canvas.style.cursor === 'move') {
                active = false;
            }

        }
        const mousemoveHandler = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if (active) {
                path[activeI] = [x, y];
                render();
                return;
            }
            const i = isInRects(cps, [x, y]);
            if (i !== -1) {
                ctx.canvas.style.cursor = 'move';
            } else if (active === false) {
                ctx.canvas.style.cursor = 'default';
            }

        }
        ctx.canvas.addEventListener('mousedown', mousedownHandler);
        ctx.canvas.addEventListener('mouseup', mouseupHandler);
        ctx.canvas.addEventListener('mousemove', mousemoveHandler);

        bindWindowKeyBoardSaveAndQuit(() => {
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            const pPath = putPath(path);
            // pPath(baseCtx);
            drawEnd(ctx);
            resolve(path);
        }, () => {
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawEnd(ctx);
            resolve(null);
        });
    });
}

/**
 * 渲染图元集合
 * @param instance 编辑器实例
 * @param shapes 图元集合
 */
export function renderShapes(instance: Instance, ...shapes: R[]) {
    shapes.forEach(r => r(instance.baseCtx));
}

/**
 * 清空画布
 * @param instance 编辑器实例
 */
export function clear(instance: Instance) {
    instance.baseCtx.clearRect(0, 0, instance.baseCtx.canvas.width, instance.baseCtx.canvas.height);
}

/**
 * 画一个多边形
 * @param instance 编辑器实例
 */
export function drawPolygon(instance: Instance): Promise<Path | null> {
    return new Promise((resolve, reject) => {
        const ctx = drawStart(instance);
        let plist: Point[] = [];
        const mousedownHandler = (e: MouseEvent) => {
            if (e.button === 0) {
                plist.push([e.offsetX, e.offsetY]);
                mousemoveHandler(e);
            }
        }
        const render = (x?: number, y?: number) => {
            ctx.clearRect(0, 0, instance.baseCtx.canvas.width, instance.baseCtx.canvas.height);
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

        bindWindowKeyBoardSaveAndQuit(() => {
            ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            render();
            drawEnd(ctx);
            resolve(plist);
        }, () => {
            ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawEnd(ctx);
            resolve(null);
        });
        ctx.canvas.addEventListener('contextmenu', contextmenuHandler);
        ctx.canvas.addEventListener('mousedown', mousedownHandler);
        ctx.canvas.addEventListener('mousemove', mousemoveHandler);
    });
}

/**
 * 编辑一个多边形
 * @param instance 编辑器实例
 * @param path 路径
 */
export function modifyPolygon(instance: Instance, srcPath: Path): Promise<Path | null> {
    const path = copyPath(srcPath);
    return new Promise((resolve, reject) => {
        const ctx = drawStart(instance);
        let cps: RectPos[] = [];
        let active = false;
        const render = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'red';
            putPath(path, true)(ctx);
            cps = renderControlPoint(path)(ctx);
        }
        render();
        let activeI = -1;
        const mousedownHandler = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if (ctx.canvas.style.cursor === 'move') {
                activeI = isInRects(cps, [x, y]);
                active = true;
            }

        }
        const mouseupHandler = (e: MouseEvent) => {
            if (ctx.canvas.style.cursor === 'move') {
                active = false;
            }

        }
        const mousemoveHandler = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if (active) {
                path[activeI] = [x, y];
                render();
                return;
            }
            const i = isInRects(cps, [x, y]);
            if (i !== -1) {
                ctx.canvas.style.cursor = 'move';
            } else if (active === false) {
                ctx.canvas.style.cursor = 'default';
            }

        }
        ctx.canvas.addEventListener('mousedown', mousedownHandler);
        ctx.canvas.addEventListener('mouseup', mouseupHandler);
        ctx.canvas.addEventListener('mousemove', mousemoveHandler);

        bindWindowKeyBoardSaveAndQuit(() => {
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            drawEnd(ctx);
            resolve(path);
        }, () => {
            ctx.canvas.removeEventListener('mousedown', mousedownHandler);
            ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawEnd(ctx);
            resolve(null);
        });
    });
}

/**
 * 画一个圆
 * @param instance 编辑器实例
 */
export function drawCircle(instance: Instance): Promise<Circle | null> {
    return new Promise((resolve, reject) => {
        const ctx = drawStart(instance);
        let circle: Circle | null = null;
        const mousedownHandler = (e: MouseEvent) => {
            if (e.button === 0) {
                if (circle === null) {
                    circle = [[e.offsetX, e.offsetY], 0];
                } else {
                    ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    circle = [[circle[0][0], circle[0][1]], towPointDis([circle[0][0], circle[0][1]], [e.offsetX, e.offsetY])];
                    drawEnd(ctx);
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

export enum EShape {
    Line,
    Path,
    Ploygon,
    Circle,
    Image,
}

export interface Shape {
    type: EShape,
    r: R,
    data: Path | Circle | HTMLImageElement,
    zindex: number,
}

export interface EditorOptions {
    /**
     * 挂载点
     */
    el: HTMLDivElement | string;

    /**
     * 是否显示标尺
     */
    isShowRod?: boolean;

    /**
     * 是否显示透明背景
     */
    isShowRgba?: boolean;
}

export class EditorNavigator {
    constructor(private editor: Editor, private realRectPos: RectPos, private sx: number, private sy: number) { }

    private bind() {

    }

    public render() {
        const ctx = createCanvasContext2d();
        ctx.canvas.width = this.realRectPos[2] * this.sx;
        ctx.canvas.height = this.realRectPos[3] * this.sy;
        ctx.scale(this.sx, this.sy);
        this.editor.beforeR.forEach(r => r(ctx));
        this.editor.shapes.forEach(item => item.r(ctx));
        ctx.resetTransform();
        ctx.beginPath();
        const [x, y, w, h] = this.editor.pos;
        const rw = w * this.sx;
        const rh = h * this.sy;
        ctx.strokeRect(x * this.sx, y * this.sy, rw, rh);
        ctx.stroke();

        ctx.canvas.onclick = (e: MouseEvent) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.scale(this.sx, this.sy);
            this.editor.beforeR.forEach(r => r(ctx));
            this.editor.shapes.forEach(item => item.r(ctx));
            ctx.resetTransform();

            ctx.beginPath();
            const { offsetX, offsetY } = e;
            const x = offsetX;
            const y = offsetY;
            ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);
            ctx.stroke();
            this.editor.setCenter(-((x - rw / 2) / this.sx), -((y - rh / 2) / this.sy));
        };
        return ctx;
        // this.editor.afterR.forEach(r => r(ctx));
    }
}

export class Editor {
    private instance: Instance;
    public afterR: R[] = [];
    public beforeR: R[] = [];
    public shapes: Shape[] = [];
    private autoZIndex: number = 0;
    private rectPos: RectPos = [0, 0, 100, 100];

    private cache: CanvasRenderingContext2D = createCanvasContext2d();

    constructor(options: EditorOptions) {
        this.instance = mount(options.el);
        if (options.isShowRod) {
            this.afterR.push(renderXRod);
            this.afterR.push(renderYRod);
        }
        if (options.isShowRgba) {
            this.beforeR.push(renderRgba);
        }
    }

    public setSize(width: number, height: number) {
        this.rectPos = [this.rectPos[0], this.rectPos[1], width, height];
        setSize(this.instance, width, height);
        this.cache.canvas.width = width;
        this.cache.canvas.height = width;
    }

    public setCenter(x: number, y: number) {
        this.rectPos = [x, y, this.rectPos[2], this.rectPos[3]];
        this.render();
    }

    public createEditorNavigator(realRectPos: RectPos, sx: number, sy: number) {
        return new EditorNavigator(this, realRectPos, sx, sy);
    }

    public get pos() {
        return this.rectPos;
    }

    public async drawALine() {
        const l = await drawLine(this.instance);
        if (l) {
            const nl = await modifyLine(this.instance, l);
            const [x, y] = this.rectPos;
            if (nl) {
                const t: Path = nl.map((p:Point) => [p[0] - x, p[1] - y])
                this.shapes.push({
                    r: putPath(t),
                    type: EShape.Line,
                    data: t,
                    zindex: this.autoZIndex++
                });
                this.render();
            }
        }
    }

    public async drawAPolygon() {
        const ply = await drawPolygon(this.instance);
        if (ply) {
            const nply = await modifyPolygon(this.instance, ply);
            if (nply) {
                this.shapes.push({
                    r: putPath(nply, true),
                    type: EShape.Ploygon,
                    data: nply,
                    zindex: this.autoZIndex++,
                });
                this.render();
            }
        }
    }

    public async drawACircle() {
        const c = await drawCircle(this.instance);
        if (c) {
            this.shapes.push({
                r: putCircle(c),
                type: EShape.Circle,
                data: c,
                zindex: this.autoZIndex++,
            })
            this.render();
        }
    }

    public putImage(image: HTMLImageElement) {
        this.shapes.push({
            r: putImage(image),
            data: image,
            type: EShape.Image,
            zindex: this.autoZIndex++,
        });
        this.render();
    }

    public putPath(path: Path) {
        this.shapes.push({
            r: putPath(path),
            data: path,
            type: EShape.Path,
            zindex: this.autoZIndex++
        });
        this.render();
    }

    public putPaths(paths: Path[]) {
        paths.forEach(path => this.shapes.push({
            r: putPath(path),
            data: path,
            type: EShape.Path,
            zindex: this.autoZIndex++
        }));
        this.render();
    }

    public bindKeyBoard() {
        window.addEventListener('keypress', this.keypressHandler);
    }

    public unbindKeyBoard() {
        window.removeEventListener('keypress', this.keypressHandler);
    }

    private keypressHandler = (e: KeyboardEvent) => {
        switch (e.key) {
            case '1': this.drawALine(); break;
            case '2': this.drawAPolygon(); break;
            case '3': this.drawACircle(); break;
        }
    }

    private renderAllSahpes() {
        this.shapes.forEach(item => item.r(this.instance.baseCtx));
        this.shapes.forEach(item => item.r(this.cache));
    }

    /**
     * 合成shapes
     * @param w 宽度
     * @param h 高度
     */
    public composeShapes(w: number, h: number): CanvasRenderingContext2D {
        const ctx = createCanvasContext2d();
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        this.shapes.forEach(item => item.r(ctx));
        return ctx;
    }

    private render() {
        this.beforeR.forEach(r => r(this.instance.baseCtx));
        this.instance.baseCtx.translate(this.pos[0], this.pos[1]);
        this.renderAllSahpes();
        this.instance.baseCtx.resetTransform();
        this.afterR.forEach(r => r(this.instance.baseCtx));
    }
}



/**
 * 创建一个编辑器
 * @param root 挂载点
 */
export function createEditor(options: EditorOptions) {
    return new Editor(options);
}
