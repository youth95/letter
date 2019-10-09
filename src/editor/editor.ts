import { ViewPort } from "../viewport";
import { createCanvasContext2d } from "../utils";
import { createTransformMatrix, Point, towPointDis, Path } from "../planimetry";
import { Shape, CircleShape, PloygonShape, ImageShape } from "../shapes";
import { ModifyAbleLineShape } from "./shapes";
import { EventNames } from "../handler/MouseEventHandler";
import { ModifyAbleRectShape } from "./shapes/ModifyAbleRectShape";
import { putCircle } from "../R";

export interface TwoDrawContext {
    sPoint: Point;
    ePoint: Point;
    viewport: ViewPort;
    finish: (shape: Shape) => void;
}

export interface SomeDrawContext extends TwoDrawContext {
    path: Path;
}

/**
 * 模式
 */
export enum Mode {
    /**
     * 移动
     */
    Move,

    /**
     * 缩放
     */
    Zoom,

    /**
     * 选择图元
     */
    SelectShape,

    /**
     * 移动图元
     */
    MoveShape,

    /**
     * 手动绘制一个图形
     */
    DrawShape,
}

/**
 * 编辑器类
 */
export class Editor {
    public readonly viewport: ViewPort;

    public mode: Mode = Mode.Move;

    private mountRoot: HTMLElement | null = null;

    private drawCanvas: HTMLCanvasElement | null = null;


    constructor() {
        this.viewport = new ViewPort({
            width: 1024,
            height: 768,
            ctx: createCanvasContext2d(),
            transformMatrix: createTransformMatrix(),
        })
    }

    /**
     * 挂载
     * @param root 挂载的根节点
     */
    public mount(root: string | HTMLElement) {
        let dom: HTMLElement | null = null;
        if (typeof root === 'string') {
            const rdom = document.getElementById(root);
            if (rdom) {
                dom = rdom;
            } else {
                throw new Error(`cont find mounted dom by id:${root}`);
            }
        } else {
            dom = root;
        }
        dom.style.position = 'relative';
        dom.style.fontSize = '0';
        this.viewport.engine.ctx.canvas.style.position = 'absolute';
        // 覆盖 viewport 的 appendViewPort 方法
        const appendViewPort = this.viewport.appendViewPort;
        this.viewport.appendViewPort = (v: ViewPort) => {
            v.engine.ctx.canvas.style.position = 'absolute';
            dom!.appendChild(v.engine.ctx.canvas);
            appendViewPort(v);
        }
        // 覆盖 viewport 的 removeAllViewPort 方法
        const removeAllViewPort = this.viewport.removeAllViewPort;
        this.viewport.removeAllViewPort = () => {
            this.viewport.viewports.forEach(v => v.engine.ctx.canvas.remove());
            removeAllViewPort();
        }

        dom.appendChild(this.viewport.engine.ctx.canvas);
        this.mountRoot = dom;
        // TODO 需要options来控制其是否需要拖入图片
        this.dropImage();
    }

    /**
     * 绘制一个图形
     * @param drawFn 绘图函数
     * @param autoCancel 是否自动取消
     */
    private drawShape(drawFn: (viewport: ViewPort, finish: (shape: Shape) => void) => void, autoCancel: boolean = true) {
        if (!this.mountRoot) {
            throw new Error('editor must mounted to a dom');
        }
        const nview = this.viewport.clone();
        const canvas = this.drawCanvas = nview.engine.ctx.canvas;
        canvas.style.position = 'absolute';
        this.mountRoot.appendChild(canvas);

        const clean = () => {
            if (this.drawCanvas) {
                this.drawCanvas.remove();
                window.removeEventListener('keydown', escHandler);
                // TODO 模式处理
                return this.drawShape(drawFn, autoCancel);
            }
        }

        const finish = (shape: Shape) => {
            this.viewport.engine.add(shape);
            this.viewport.engine.clearAll();
            this.viewport.engine.render();
            clean();
        };
        drawFn(nview, finish);

        // 绑定取消按键
        const escHandler = (event: KeyboardEvent) => {
            if (event.keyCode == 27) {   // 退出键
                clean();
            }
        };
        window.addEventListener('keydown', escHandler);
    }

    /**
     * 通过两次鼠标点击绘制一个图形
     * @param endDraw 第二次点击时候调用
     * @param moveDraw 第一次点击与第二次点击的鼠标移动过程中调用
     */
    private twoClickDraw(endDraw: (tdctx: TwoDrawContext) => void, moveDraw: (tdctx: TwoDrawContext) => void) {
        this.drawShape((viewport: ViewPort, finish) => {
            const ctx = viewport.engine.ctx;
            const { offsetTop, offsetLeft } = ctx.canvas;
            let p0: number[] | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX - offsetLeft, e.offsetY - offsetTop];
                } else {
                    const sPoint: Point = [p0[0], p0[1]];    // 起始点
                    const ePoint: Point = [e.offsetX - offsetLeft, e.offsetY - offsetTop];   // 结束点
                    endDraw({
                        sPoint,
                        ePoint,
                        viewport,
                        finish,
                    });
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    const sPoint: Point = [p0[0], p0[1]];    // 起始点
                    const ePoint: Point = [e.offsetX - offsetLeft, e.offsetY - offsetTop];   // 结束点
                    moveDraw({
                        sPoint,
                        ePoint,
                        viewport,
                        finish,
                    });
                }
            }
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
        });
    }

    /**
     * 通过连续点击绘制一个图形
     */
    private someClickDraw(first: (sdctx: SomeDrawContext) => void, then: (sdctx: SomeDrawContext) => void, move: (sdctx: SomeDrawContext) => void, drawFinish: (sdctx: SomeDrawContext) => void) {
        this.drawShape((viewport: ViewPort, finish) => {
            const ctx = viewport.engine.ctx;
            const { offsetTop, offsetLeft } = ctx.canvas;
            let p0: Point | null = null;
            const path: Point[] = [];
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX - offsetLeft, e.offsetY - offsetTop];
                    path.push(p0);
                    // first click
                    first({
                        sPoint: p0,
                        ePoint: p0,
                        finish,
                        viewport,
                        path,
                    });
                } else {
                    // const sPoint: Point = [p0[0], p0[1]];    // 起始点
                    const ePoint: Point = [e.offsetX - offsetLeft, e.offsetY - offsetTop];   // 结束点
                    path.push(ePoint);
                    // then click
                    then({
                        sPoint: p0,
                        ePoint: ePoint,
                        finish,
                        viewport,
                        path,
                    });
                }
            }
            const mousemoveHandler = (e: MouseEvent) => {
                if (p0 !== null) {
                    // const sPoint: Point = [p0[0], p0[1]];    // 起始点
                    const ePoint: Point = [e.offsetX - offsetLeft, e.offsetY - offsetTop];   // 结束点
                    const order = path.concat([ePoint]);
                    // move
                    move({
                        sPoint: p0,
                        ePoint: ePoint,
                        finish,
                        viewport,
                        path: order,
                    });
                }
            }
            const finishHandler = (e: KeyboardEvent) => {
                if (e.keyCode === 13) {
                    drawFinish({
                        sPoint: p0!,
                        ePoint: p0!,
                        finish,
                        viewport,
                        path: [],
                    });
                    window.removeEventListener('keypress', finishHandler);
                }
            }
            ctx.canvas.addEventListener('mousedown', mousedownHandler);
            ctx.canvas.addEventListener('mousemove', mousemoveHandler);
            window.addEventListener('keypress', finishHandler);
        });
    }

    /**
     * 开始画直线
     */
    public drawLine() {
        this.twoClickDraw(
            (tdc: TwoDrawContext) => {
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                const line = new ModifyAbleLineShape([s[0], s[1]], [e[0], e[1]]);
                tdc.finish(line);
            },
            (tdc: TwoDrawContext) => {
                const ctx = tdc.viewport.engine.ctx;
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.beginPath();
                ctx.moveTo(s[0], s[1]);
                ctx.lineTo(e[0], e[1]);
                ctx.stroke();
            },
        );
    }

    /**
     * 开始画矩形
     */
    public drawRect() {
        this.twoClickDraw(
            (tdc: TwoDrawContext) => {
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                const shape = new ModifyAbleRectShape([s[0], s[1], e[0] - s[0], e[1] - s[1]]);
                tdc.finish(shape);
            },
            (tdc: TwoDrawContext) => {
                const ctx = tdc.viewport.engine.ctx;
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.beginPath();
                ctx.strokeRect(s[0], s[1], e[0] - s[0], e[1] - s[1]);
            },
        );
    }

    /**
     * 开始画圆
     */
    public drawCircle() {
        this.twoClickDraw(
            (tdc: TwoDrawContext) => {
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                const r = towPointDis(s, e);
                const shape = new CircleShape([[Math.round((s[0] + e[0]) / 2), Math.round((s[1] + e[1]) / 2)], r]);
                tdc.finish(shape);
            },
            (tdc: TwoDrawContext) => {
                const ctx = tdc.viewport.engine.ctx;
                const s = tdc.sPoint;
                const e = tdc.ePoint;
                const r = towPointDis(s, e);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                putCircle([[Math.round((s[0] + e[0]) / 2), Math.round((s[1] + e[1]) / 2)], r])(ctx);
            },
        );
    }

    /**
     * 开始画多边形
     */
    public drawPloygon() {
        const ploygon = new PloygonShape([]);
        this.someClickDraw(
            sdctx => {
                sdctx.viewport.engine.add(ploygon);
                // sdctx.viewport.engine.ctx.moveTo(...sdctx.sPoint);
            },
            sdctx => {

            },
            sdctx => {
                ploygon.setValue(sdctx.path);
                sdctx.viewport.engine.render(true);
            },
            sdctx => {
                const d = ploygon.valueOf();
                d.pop();
                ploygon.setValue(d);
                sdctx.finish(ploygon);
            },
        );
    }

    /**
     * 开始选择图形
     */
    public selectShape() {
        const h = (ename: EventNames) => (ev: MouseEvent) => {
            const offsetLeft = this.viewport.engine.ctx.canvas.offsetLeft;
            const offsetTop = this.viewport.engine.ctx.canvas.offsetTop;
            const offsetX = ev.offsetX;
            const offsetY = ev.offsetY;
            this.viewport.trigger([offsetX - offsetLeft, offsetY - offsetTop], ename);
        };
        this.viewport.engine.ctx.canvas.addEventListener('mousedown', h('down'));
        this.viewport.engine.ctx.canvas.addEventListener('mousemove', h('move'));
    }



    /**
     * 移除所有选中的shape
     */
    public removeAllSelected() {
        this.viewport.engine.removeSelected();
        this.viewport.engine.clearAll();
        this.viewport.engine.render();
    }

    private dropImage() {
        const preventDefault = (ev:DragEvent) => ev.preventDefault();
        document.addEventListener('drop', (ev: DragEvent) => {
            ev.preventDefault();
            const transfer = ev.dataTransfer;
            if(transfer){
                const reader = new FileReader();
                const f = transfer.files.item(0);
                if(f && f.type){
                    const d = reader.readAsDataURL(f);
                    reader.onloadend = async () => {
                        if(reader.result){
                            const ishape = await ImageShape.fetchFromUrl(reader.result as string);
                            this.viewport.engine.add(ishape);
                            this.viewport.engine.render(true);
                        }
                    }
                    
                }
                
                
            }
        });
        document.addEventListener('drag',preventDefault);
        document.addEventListener('dragend',preventDefault);
        document.addEventListener('dragenter',preventDefault);
        document.addEventListener('dragleave',preventDefault);
        document.addEventListener('dragover',preventDefault);
    }


    /**
     * 清除绘制层
     */
    public cleanDrawCanvas() {
        if (this.drawCanvas) {
            this.drawCanvas.remove();
            this.drawCanvas = null;
        }
        this.viewport.removeAllViewPort();
    }
}