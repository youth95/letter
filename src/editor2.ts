import { ViewPort } from "./viewport";
import { createCanvasContext2d } from "./utils";
import { createTransformMatrix, Path } from "./planimetry";
import { Shape, PathShape } from "./shapes";

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

    constructor() {
        this.viewport = new ViewPort({
            width: 1024,
            height: 768,
            ctx: createCanvasContext2d(),
            transformMatrix: createTransformMatrix(),
        })
    }

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
        dom.appendChild(this.viewport.engine.ctx.canvas);
        this.mountRoot = dom;
    }

    private drawShape(drawFn: (viewport: ViewPort, finish: (shape: Shape) => void) => void, autoCancel: boolean = true) {
        if (!this.mountRoot) {
            throw new Error('editor must mounted to a dom');
        }
        const nview = this.viewport.clone();
        const canvas = nview.engine.ctx.canvas;
        canvas.style.position = 'absolute';
        this.mountRoot.appendChild(canvas);

        const clean = () => {
            canvas.remove();
            if (autoCancel) {
                window.removeEventListener('keydown', escHandler);
            }
            // TODO 模式处理
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
        if (autoCancel) {
            window.addEventListener('keydown', escHandler);
        }
    }

    public drawLine() {
        this.drawShape((viewport: ViewPort, finish) => {
            const ctx = viewport.engine.ctx;
            const { offsetTop, offsetLeft } = ctx.canvas;
            let p0: number[] | null = null;
            const mousedownHandler = (e: MouseEvent) => {
                if (p0 === null) {
                    p0 = [e.offsetX - offsetLeft, e.offsetY - offsetTop];
                } else {
                    // fininsh
                    ctx.canvas.removeEventListener('mousedown', mousedownHandler);
                    ctx.canvas.removeEventListener('mousemove', mousemoveHandler);
                    const path: Path = [[p0[0], p0[1]], [e.offsetX - offsetLeft, e.offsetY - offsetTop]];
                    finish(new PathShape(path));
                    this.drawLine();    // 递归继续
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
        })
    }
}