import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Engine } from './Engine';
import { CircleShape, ImageShape } from './shapes';
describe('engine', () => {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    let index = 0;
    const dump = () => writeFileSync(join(__dirname, `../tmp/engine_${index++}.png`), canvas.toBuffer('image/png'));

    it('add,remove,move', async () => {
        const app = new Engine(ctx);
        const c0 = new CircleShape([[50, 50], 50]);
        app.remove(new CircleShape([[50, 50], 50]));
        app.add(c0);
        app.render();
        dump();
        c0.drawState = {
            strokeStyle: 'red'
        };
        app.render();
        dump();
        const c1 = new CircleShape([[60, 60], 50]);
        app.add(c1);
        app.render();
        dump();
        app.remove(c0);
        app.render(true);
        dump();
        app.add(c0);
        c0.moveUp(20);
        app.render(true);
        dump();
        c0.moveDown(20);
        app.render(true);
        dump();
        c0.moveLeft(20);
        app.render(true);
        dump();
        c0.moveRight(20);
        app.render(true);
        dump();
        c0.visable = false;
        app.render(true);
        dump();
        expect(c0.inRegion([0, 0])).toEqual(false);
        expect(c0.inRegion([50, 0])).toEqual(true);
        expect(c0.inRegion([50, 50])).toEqual(true);
        c0.visable = true;
        c0.isFilled = true;
        app.render(true);
        dump();
        c0.drawState = {
            fillStyle: 'red',
        }
        app.render(true);
        dump();
    })
});