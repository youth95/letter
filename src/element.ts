import { Path, Circle, } from "./planimetry";

/**
 * 图元
 */
export type R = (ctx: CanvasRenderingContext2D) => void;

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
        const [[x, y], r] = circle;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

/**
 * 生成图片图元
 * @param image 图像
 */
export function putImage(image: HTMLImageElement): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(image, 0, 0);
    }
}
