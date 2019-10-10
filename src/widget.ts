import { createCanvasContext2d } from "./utils";
import { Path, RectPos } from "./planimetry";

const gctx = createCanvasContext2d();

const rodx = (gap: number): CanvasPattern => {
    gctx.lineWidth = 1;
    gctx.canvas.width = 10 * gap;
    gctx.canvas.height = 8;
    for (let i = 0; i < 10; i++) {
        if (i === 0) {
            gctx.moveTo(i * gap + 0.5, 0);
            gctx.lineTo(i * gap + 0.5, gctx.canvas.height);
            continue;
        }
        if (i === 5) {
            gctx.moveTo(i * gap + 0.5, gctx.canvas.height / 4);
            gctx.lineTo(i * gap + 0.5, gctx.canvas.height);
            continue;
        }
        gctx.moveTo(i * gap + 0.5, gctx.canvas.height / 2);
        gctx.lineTo(i * gap + 0.5, gctx.canvas.height);
    }
    gctx.moveTo(0, gctx.canvas.height);
    gctx.lineTo(gctx.canvas.width, gctx.canvas.height);
    gctx.stroke();
    const pattern = gctx.createPattern(gctx.canvas, 'repeat');
    if (pattern === null) {
        throw new Error('cont create canvas pattern !');
    }
    return pattern;
};

const rody = (gap: number): CanvasPattern => {
    gctx.lineWidth = 1;
    gctx.canvas.height = 10 * gap;
    gctx.canvas.width = 8;
    for (let i = 0; i < 10; i++) {
        if (i === 0) {
            gctx.moveTo(0, i * gap + 0.5);
            gctx.lineTo(gctx.canvas.width, i * gap + 0.5);
            continue;
        }
        if (i === 5) {
            gctx.moveTo(gctx.canvas.width / 4, i * gap + 0.5);
            gctx.lineTo(gctx.canvas.width, i * gap + 0.5);
            continue;
        }
        gctx.moveTo(gctx.canvas.width / 2, i * gap + 0.5);
        gctx.lineTo(gctx.canvas.width, i * gap + 0.5);
    }
    gctx.moveTo(gctx.canvas.width, 0);
    gctx.lineTo(gctx.canvas.width, gctx.canvas.height);
    gctx.stroke();
    const pattern = gctx.createPattern(gctx.canvas, 'repeat');
    if (pattern === null) {
        throw new Error('cont create canvas pattern !');
    }
    return pattern;
};

const agb = () => {
    gctx.canvas.height = 16;
    gctx.canvas.width = 16;
    gctx.fillStyle = '#aaa';
    gctx.fillRect(0, 0, 8, 8);
    gctx.fillRect(8, 8, 8, 8);
    gctx.fillStyle = '#999';
    gctx.fillRect(8, 0, 8, 8);
    gctx.fillRect(0, 8, 8, 8);
    const pattern = gctx.createPattern(gctx.canvas, 'repeat');
    if (pattern === null) {
        throw new Error('cont create canvas pattern !');
    }
    return pattern;
}

export const rect8 = (() => {
    gctx.canvas.height = 8;
    gctx.canvas.width = 8;
    gctx.fillStyle = '#000';
    gctx.fillRect(0, 0, 8, 8);
    const pattern = gctx.createPattern(gctx.canvas, 'repeat');
    if (pattern === null) {
        throw new Error('cont create canvas pattern !');
    }
    return pattern;
})();


export function renderXRod(ctx: CanvasRenderingContext2D, gap: number = 4) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ctx.canvas.width, 8);
    ctx.fillStyle = rodx(gap);
    ctx.fillRect(0, 0, ctx.canvas.width, 8);
}

export function renderYRod(ctx: CanvasRenderingContext2D, gap: number = 4) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 8, ctx.canvas.height);
    ctx.fillStyle = rody(gap);
    ctx.fillRect(0, 0, 8, ctx.canvas.height);
}

export function renderRgba(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = agb();
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function renderControlPoint(path: Path) {
    return (ctx: CanvasRenderingContext2D): RectPos[] => {
        ctx.fillStyle = '#000';
        return path.map(p => {
            const [x, y] = p;
            const rect: RectPos = [x - 2, y - 2, 4, 4];
            ctx.fillRect(...rect);
            return rect;
        });
    }
}

export function renderControlBoard(path: Path) {
    return (ctx: CanvasRenderingContext2D): RectPos[] => {
        return renderControlBoard(path)(ctx);
    }
}