import { createCanvasContext2d } from "./utils";
import { R, putPath, putCircle } from "./element";
import { renderXRod, renderYRod, renderRgba, renderControlPoint } from "./widget";
import { Path, Polygon, Point, Circle, towPointDis, isInRect, isInRects, RectPos, copyPath } from "./planimetry";

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

export class Editor {
    private static instance: Editor | null = null;
    private wrap: HTMLDivElement | null = null;
    private constructor() { }
    private ctx = createCanvasContext2d();
    private autoIndex = 0;
    private paths: Map<string, [Path, R]> = new Map();

    private shapes: R[] = [];
    private beforeWidgets: R[] = [
        renderRgba,
    ];
    private afterWidgets: R[] = [
        renderXRod,
        renderYRod,
    ];

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

    /**
     * 渲染所有图元
     */
    public render() {
        this.renderContext(this.ctx);
    }

    private renderContext(ctx: CanvasRenderingContext2D) {
        // 清除画布
        this.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // 前置部件
        this.beforeWidgets.forEach(r => r(ctx));
        // 追加图元
        this.shapes.forEach(r => r(ctx));
        // 后置部件
        this.afterWidgets.forEach(r => r(ctx));
    }

    public renderAllShapes() {
        this.shapes.forEach(r => r(this.ctx));
    }

    /**
     * 渲染空场景
     */
    public renderEmptyScene() {
        const t = this.shapes;
        this.shapes = [];
        this.render();
        this.shapes = t;
    }

    /**
     * 设置场景宽高
     * @param width 宽度
     * @param height 高度
     */
    public setSceneSize(width: number, height: number) {
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;
        this.render();
    }

    /**
     * 获取快照
     */
    public snapshot(): CanvasPattern {
        const ctx = createCanvasContext2d();
        ctx.canvas.width = this.ctx.canvas.width;
        ctx.canvas.height = this.ctx.canvas.height;
        this.shapes.forEach(r => r(ctx));
        const pat = this.ctx.createPattern(ctx.canvas, 'no-repeat');
        if (pat === null) {
            throw new Error('cont create pat!');
        }
        return pat;
    }

    /**
     * 画一路径
     */
    public drawLine(): Promise<string | null> {
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
                    const path: Path = [[p0[0], p0[1]], [e.offsetX, e.offsetY]];
                    const pathR = putPath(path);
                    this.appendShape(pathR);// 添加图元
                    const id = `path${this.autoIndex++}`;
                    this.paths.set(id, [path, pathR]);
                    resolve(id);
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
     * 修改一条线段
     * @param id 线的id
     */
    public modifyLine(id: string) {
        return new Promise((resolve, reject) => {
            const line = this.paths.get(id);
            if (!line) {
                throw new Error('cont find line by id ' + id);
            }

            const ctx = this.drawStart();
            let cps: RectPos[] = [];
            let active = false;
            let path: Path = [];
            const [, r] = line;
            const shapeIndex = this.shapes.findIndex(item => item === r);
            this.shapes.splice(shapeIndex, 1);
            this.render();
            const render = () => {
                const [pat] = line;
                path = pat;
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
                this.shapes.splice(shapeIndex, 0, pPath);
                this.paths.set(id, [path, pPath]);
                this.render();
                this.drawEnd(ctx);
                resolve(true);
            }, () => {
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                this.drawEnd(ctx);
                resolve(true);
            });
        });
    }

    /**
     * 画一个多边形
     */
    public drawPolygon(): Promise<string | null> {
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

            bindWindowKeyBoardSaveAndQuit(() => {
                ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                render();
                this.drawEnd(ctx);
                const pathR = putPath(plist, true);
                this.appendShape(pathR);// 添加图元
                const id = `path${this.autoIndex++}`;
                this.paths.set(id, [plist, pathR]);
                resolve(id);
            }, () => {
                ctx.canvas.removeEventListener('contextmenu', contextmenuHandler);
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                this.drawEnd(ctx);
                resolve(null);
            });
            ctx.canvas.addEventListener('contextmenu', contextmenuHandler);
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 编辑一个多边形
     * @param id 多边形id
     */
    public modifyPolygon(id: string) {
        return new Promise((resolve, reject) => {
            const line = this.paths.get(id);
            if (!line) {
                throw new Error('cont find line by id ' + id);
            }

            const ctx = this.drawStart();
            let cps: RectPos[] = [];
            let active = false;
            let path: Path = [];
            const [, r] = line;
            const shapeIndex = this.shapes.findIndex(item => item === r);
            this.shapes.splice(shapeIndex, 1);
            this.render();
            const render = () => {
                const [pat] = line;
                path = pat;
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
                const pPath = putPath(path);
                this.shapes.splice(shapeIndex, 0, pPath);
                this.paths.set(id, [path, pPath]);
                this.render();
                this.drawEnd(ctx);
                resolve(true);
            }, () => {
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                this.drawEnd(ctx);
                resolve(false);
            });
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
            const ctx = this.drawStart();
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX, e.offsetY];
                } else {
                    this.drawEnd(ctx);
                    this.shapes.unshift((ctx: CanvasRenderingContext2D) => ctx.translate(e.offsetX - p0![0], e.offsetY - p0![1]));
                    this.shapes.push((ctx: CanvasRenderingContext2D) => ctx.resetTransform());
                    this.render();
                    resolve(true);
                    return;
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    this.renderEmptyScene();
                    ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    ctx.save();
                    ctx.translate(e.offsetX - p0[0], e.offsetY - p0[1]);
                    // this.renderContext(ctx);
                    this.shapes.forEach(r => r(ctx));
                    ctx.restore();
                    this.afterWidgets.forEach(r => r(ctx));
                }
            }
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
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

export interface Instance {
    wrap: HTMLDivElement;
    baseCtx: CanvasRenderingContext2D;
}

export function mount(root: string): Instance {
    const baseCtx = createCanvasContext2d();
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.fontSize = '0';
    baseCtx.canvas.style.position = 'absolute';
    wrap.appendChild(baseCtx.canvas);
    const rdom = document.getElementById(root);
    if (rdom) {
        rdom.appendChild(wrap);
    }
    return {
        wrap,
        baseCtx
    };
}

export function setSize(instance: Instance, width: number, height: number) {
    instance.baseCtx.canvas.width = width;
    instance.baseCtx.canvas.height = height;
}

/**
 * 开始一个绘图
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
        let p0: number[] | null = null;
        const mousedownHandler = (e: MouseEvent) => {
            if (p0 === null) {
                p0 = [e.offsetX, e.offsetY];
            } else {
                ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                drawEnd(ctx);
                const path: Path = [[p0[0], p0[1]], [e.offsetX, e.offsetY]];
                resolve(path);
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

export function clear(instance: Instance) {
    instance.baseCtx.clearRect(0, 0, instance.baseCtx.canvas.width, instance.baseCtx.canvas.height);
}