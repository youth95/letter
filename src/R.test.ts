import { createCanvas } from 'canvas';
import { putPath, putCircle, putImageSource, putPattern } from './R';
import { writeFileSync } from 'fs';
import { join } from 'path';
describe('R', () => {
    it('putPath', () => {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        putPath([[0, 0], [100, 100]])(ctx);
        const p0 = canvas.toBuffer();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        putPath([[100, 100], [0, 0]])(ctx);
        const p1 = canvas.toBuffer();
        expect(p0).toEqual(p1);
    });

    it('putPath closed', () => {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        putPath([[0, 0], [100, 100], [0, 100]], true)(ctx);
        const p0 = canvas.toBuffer();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        putPath([[0, 100], [100, 100], [0, 0]], true)(ctx);
        const p1 = canvas.toBuffer();
        expect(p0).toEqual(p1);
    });

    it('putCircle', () => {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        putCircle([[0, 0], 10])(ctx);
        const p0 = canvas.toBuffer();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        putCircle([[0, 0], 10])(ctx);
        const p1 = canvas.toBuffer();
        writeFileSync(join(__dirname, '../tmp/putCircle_0.png'), canvas.toBuffer('image/png'));
        expect(p0).toEqual(p1);
    });

    it('putImageSource', () => {
        const canvas = createCanvas(100, 100);
        const canvas2 = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        putCircle([[10, 10], 5])(ctx);
        putImageSource(ctx.canvas)(canvas2.getContext('2d'));
        expect(canvas2.toBuffer()).toEqual(canvas.toBuffer());
    });

    it('putPattern', () => {
        const canvas = createCanvas(100, 100);
        const canvas2 = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        putCircle([[10, 10], 5])(ctx);
        const pat = ctx.createPattern(ctx.canvas);
        putPattern([0,0],{
            width: 100,
            height: 100,
            pattern: pat,
        })(canvas2.getContext('2d'));
        expect(canvas2.toBuffer()).toEqual(canvas.toBuffer());
    });
});