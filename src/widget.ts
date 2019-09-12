import { createCanvasContext2d } from "./utils";

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