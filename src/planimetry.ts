import { eqT, range } from "./utils";
/**
 * 矩形坐标 x,y,w,h
 */
export type RectPos = [number, number, number, number];
/**
 * 2d图像点
 * 
 * 由左至右 xy
 */
export type Point = [number, number];
/**
 * 多边形的原始值表示
 */
export type Polygon = Point[];
/**
 * 路径的原始值表示
 */
export type Path = Polygon;
/**
 * 圆 圆心 半径
 */
export type Circle = [Point, number];

/**
 * 直线的一般式 A B C
 */
export type Line = [number, number, number];

/**
 * 通过两点求一个直线表达式
 * 
 * @param p1 点1
 * @param p2 点2
 */
export function towPointLine(p1: Point, p2: Point): Line {
    /*
        A=Y2-Y1=p2[1]-p1[1]
        B=X1-X2=p1[0]-p2[0]
        C=X2*Y1-X1*Y2=p2[0]*p1[1]-p1[0]*p2[1]
     */
    return [p2[1] - p1[1], p1[0] - p2[0], p2[0] * p1[1] - p1[0] * p2[1]];
}

/**
 * 计算两个点之间的距离
 * @param p1 点1
 * @param p2 点2
 */
export function towPointDis(p1: Point, p2: Point): number {
    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
}

/**
 * 直线函数化
 * @param line 直线
 */
export function linefn(line: Line) {
    return function linef(p: Point) {
        return line[0] * p[0] + line[1] * p[1] + line[2];
    }
}

/**
 * 判断点1与点2是否在直线的同侧 包含再线上的点
 * @param line 直线
 * @param p1 点1
 * @param p2 点2
 */
export function isIpsilateral(line: Line, p1: Point, p2: Point) {
    const lf = linefn(line);
    return lf(p1) * lf(p2) >= 0;
}

/**
 * 判断多个点是否在线的同一侧
 * @param line 线
 * @param ps 点集合
 */
export function isIpsilaterals(line: Line, ...ps: Point[]) {
    const lf = linefn(line);
    let p = ps[0];
    for (const t of ps)
        if (lf(t) !== 0) {
            p = t;
            break;
        }
    for (let i = 0; i < ps.length; i++)
        if (lf(p) * lf(ps[i]) < 0) {
            return false;
        }
    return true;
}

/**
 * 判断一个点是否再三角形内或边缘
 * @param triangle 三角形
 * @param point 点
 */
export function isInTriangle(triangle: Polygon, point: Point): boolean {
    return [
        [0, 1, 2],
        [0, 2, 1],
        [2, 1, 0]
    ].map(i => isIpsilateral(
        towPointLine(triangle[i[0]], triangle[i[1]]),
        triangle[i[2]],
        point
    )).every(eqT);
}

/**
 * 判断一个点是否在凸多边形内或边缘
 * @param polygon 多边形
 * @param point 点
 */
export function isInPolygon(polygon: Polygon, point: Point): boolean {
    const p = polygon[0];
    for (let i = 1; i < polygon.length - 1; i++) {
        const a = polygon[i];
        const b = polygon[i + 1];
        if (isInTriangle([p, a, b], point)) {
            return true;
        }
    }
    return false;
}

/**
 * 判断一个多边形是否为凸多边形
 * @param polygon 多边形
 */
export function isConvex(polygon: Polygon): boolean {
    if (polygon.length === 3) {   // 三角形必然是凸的
        return true;
    }
    const disList = range(polygon.length)
        .map(i => [i, (i + 1) % polygon.length])
        .map(is => towPointLine(polygon[is[0]], polygon[is[1]]));
    return disList.every(line => isIpsilaterals(line, ...polygon)); // 所有内角均为钝角的多边形为凸多边形
}

/**
 * 获取点集合的矩形坐标
 * @param points 点集合
 */
export function getPointsRect(points: Path): RectPos {
    if (points.length === 0) {
        return [0, 0, 0, 0];
    }
    let minx = points[0][0], miny = points[0][1], maxx = points[0][0], maxy = points[0][1];
    for (const p of points) {
        const [x, y] = p;
        if (x > maxx) {
            maxx = x;
        }
        if (x < minx) {
            minx = x;
        }
        if (y > maxy) {
            maxy = y;
        }
        if (y < miny) {
            miny = y;
        }
    }
    return [0, 0, Math.abs(minx - maxx), Math.abs(miny - maxy)];

}

/**
 * 判断点是否在矩形区域内
 * @param rect 矩形区域
 * @param p 点
 */
export function isInRect(rect: RectPos, p: Point): boolean {
    const [x, y, w, h] = rect;
    const [x0, y0] = p;
    return x0 >= x && x0 <= x + w && y0 >= y && y0 <= y + h;
}

/**
 * 返回点所在的第一个矩形区域
 * @param rects 多个矩形区域
 * @param p 点
 */
export function isInRects(rects: RectPos[], p: Point): number {
    return rects.findIndex(item => isInRect(item, p));
}

/**
 * 复制一个路径
 * @param src 源
 */
export function copyPath(src: Path): Path {
    const path: Path = [];
    src.forEach((item: Point) => path.push([item[0], item[1]]));
    return path;
}