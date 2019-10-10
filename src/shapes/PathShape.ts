/**
 * @module Shapes
 */

/**
 * 图形
 */

import { R, putPath } from "../R";
import { Shape } from "./Shape";
import { Path } from "../planimetry";
import { sliding } from "../utils";
import { LineShape } from "./LineShape";
import { ModifyAbleShape } from "./ModifyAbleShape";

/**
 * 路径
 */
export class PathShape extends ModifyAbleShape {
    public moveUp(n: number): void {
        this.paths = this.paths.map(point => [point[0], point[1] + n]);
    }
    public moveDown(n: number): void {
        this.paths = this.paths.map(point => [point[0], point[1] - n]);
    }
    public moveLeft(n: number): void {
        this.paths = this.paths.map(point => [point[0] + n, point[1]]);
    }
    public moveRight(n: number): void {
        this.paths = this.paths.map(point => [point[0] - n, point[1]]);
    }

    constructor(
        paths: Path
    ) {
        super();
        this.setValue(paths);
    }

    public get paths(): Path {
        return this.valueOf();
    }

    public set paths(path: Path) {
        this.setValue(path);
    }

    public render: R = (ctx: CanvasRenderingContext2D) => {
        putPath(this.paths)(ctx);
    };

    public inRegion(p: [number, number]): boolean {
        const t = sliding(2, this.paths);
        return t.some(item => LineShape.inRegion(item[0], item[1], p));
    }
}
