import { Point } from "./planimetry";
import { pos2index } from "./utils";

/**
 * Bresenham直线算法,返回命中下标
 * @param width 宽度
 * @param height 高度
 * @param p0 起始点
 * @param p1 结束点
 */
export function bresenhamLien(width: number, height: number, p0: Point, p1: Point): number[] {
    let [x1, y1] = p0,
        [x2, y2] = p1,
        yy = 0,
        dx = Math.abs(x1 - x1),
        dy = Math.abs(y1 - y1);
    if (dx < dy) {
        yy = 1;
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
        [dx, dy] = [dy, dx];
    }
    let ix = (x2 - x1) > 0 ? 1 : -1,
        iy = (y2 - y1) > 0 ? 1 : -1,
        cx = x1,
        cy = y1,
        n2dy = dy * 2,
        n2dydx = (dy - dx) * 2,
        d = dy * 2 - dx,
        result: Point[] = [[x1, y1]];

    if (yy) { // 如果直线与 x 轴的夹角大于 45 度
        while (cx != x2) {
            if (d < 0) {
                d += n2dy;
            } else {
                cy += iy;
                d += n2dydx;
            }
            result.push([cy, cx]);
            cx += ix;
        }
    } else { // 如果直线与 x 轴的夹角小于 45 度
        while (cx != x2) {
            if (d < 0) {
                d += n2dy;
            } else {
                cy += iy;
                d += n2dydx;
            }
            result.push([cy, cx]);
            cx += ix;
        }
    }
    result.push([x2,y2]);
    const max = width * height;
    return result
        .map(p => pos2index(p[0], p[1], width))
        .filter(i => i < max);
}