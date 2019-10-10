import { bresenhamLien } from './raster';
import { index2pos } from './utils';
describe('raster', () => {
    it('bresenhamLien', () => {
        expect(bresenhamLien(10, 10, [0, 0], [1, 1]).map(n => index2pos(n, 10))).toEqual([[0, 0], [1, 0], [1, 1]]);
        expect(bresenhamLien(10, 10, [0, 0], [0, 1]).map(n => index2pos(n, 10))).toEqual([[0,0],[0,1]]);
        expect(bresenhamLien(10, 10, [0, 0], [2, 5]).map(n => index2pos(n, 10))).toEqual([[0,0],[1,0],[2,1],[2,5]]);
    });
});