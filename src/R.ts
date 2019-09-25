
/**
 * 图元函数,黑盒,免测试
 */
import { Path, Circle, Point, RectPos, } from "./planimetry";

/**
 * 图元
 */
export type R = (ctx: CanvasRenderingContext2D) => void;

/**
 * 图元切片
 */
export interface Pattern {
    width: number;
    height: number;
    pattern: CanvasPattern;
}

/**
 * 绘制一个图元切片
 * @param p 左上角点
 * @param pat 图元切片
 */
export function putPattern(p: Point, pat: Pattern): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.fillStyle = pat.pattern;
        ctx.fillRect(p[0], p[1], pat.width, pat.height);
        ctx.restore();
    }
}

/**
 * 生成路径图元
 * @param path 路径
 * @param closed 是否关闭路径
 */
export function putPath(path: Path, closed: boolean = false): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(...path[0]);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(...path[i]);
        }
        if (closed) {
            ctx.closePath();
        }
        ctx.stroke();
    }
}

/**
 * 生成圆图元
 * @param circle 圆
 */
export function putCircle(circle: Circle): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        const [[x, y], r] = circle;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

/**
 * 全画布渲染图像源
 * @param imageSource 图像源
 */
export function putImageSource(imageSource: CanvasImageSource, pos?: RectPos): R {
    return (ctx: CanvasRenderingContext2D) => {
        const [x, y, w, h] = pos || [0, 0, ctx.canvas.width, ctx.canvas.height];
        ctx.drawImage(imageSource, x, y, w, h);
    }
}
