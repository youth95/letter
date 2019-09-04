/**
 * 图件接口
 */
export interface Element {

}

export class CElement implements Element {

    public ctx: CanvasRenderingContext2D;

    constructor() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('canvas 创建失败');
        }
        this.ctx = ctx;
    }
}

/**
 * 图位接口
 */
export interface BitMap extends Element {

}

/**
 * 圆接口
 */
export interface Circle extends Element {

}

/**
 * 路径接口
 */
export interface Path extends Element {

}

/**
 * 多边形接口
 */
export interface Polygon extends Element {

}

/**
 * 三角形接口
 */
export interface Triangle extends Polygon {

}

/**
 * 矩形接口
 */
export interface Rect extends Polygon {

}
