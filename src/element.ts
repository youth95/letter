import { Polygon, Path, Circle } from "./planimetry";

export type R = (ctx: CanvasRenderingContext2D) => void;


export function putPath(path: Path,closed:boolean = false): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(...path[0]);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(...path[i]);
        }
        if(closed){
            ctx.closePath();
        }
        ctx.stroke();
    }
}
export function putCircle(circle: Circle): R {
    return (ctx: CanvasRenderingContext2D) => {
        const [[x, y], r] = circle;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

export function putImage(image: HTMLImageElement): R {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(image, 0, 0);
    }
}
