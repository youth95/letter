import { towPointLine, towPointDis, linefn, isIpsilateral, isInTriangle, isInPolygon, isConvex, getPointsRect, transform, createTransformMatrix, isIpsilaterals, copyPath, Path, isInRect, isInRects, RectPos, translate, scale } from "./planimetry";

describe('planimetry', () => {
    it("towPointLine", () => {
        expect(towPointLine([0, 0], [1, 1])).toEqual([1, -1, 0]);
        expect(towPointLine([0, 0], [1, 1])).toEqual(towPointLine([1, 1], [2, 2]));
        expect(towPointLine([0, 0], [0, 1])).toEqual(towPointLine([0, 1], [0, 2]));
        expect(towPointLine([0, 0], [1, 0])).toEqual(towPointLine([1, 0], [2, 0]));
    });

    it("towPointDis", () => {
        expect(towPointDis([0, 0], [0, 1])).toEqual(1);
        expect(towPointDis([0, 0], [0, 1])).toEqual(towPointDis([0, 1], [0, 2]));
        expect(towPointDis([0, 0], [1, 1])).toEqual(towPointDis([1, 1], [2, 2]));
    });

    it('linefn', () => {
        const f = linefn(towPointLine([0, 0], [1, 1]));
        expect(f([1, 1])).toEqual(0);
        expect(f([5, 5])).toEqual(0);
    });

    it('isIpsilateral', () => {
        expect(isIpsilateral([1, 1, 1], [0, 0], [1, 1])).toEqual(true);
        expect(isIpsilateral([1, 1, 1], [-1, 0], [0, -1])).toEqual(true);
        expect(isIpsilateral([1, 1, 1], [-1, 0], [0, 0])).toEqual(true);
        expect(isIpsilateral([1, 1, 1], [-2, -2], [-1, 0])).toEqual(true);
        expect(isIpsilateral([1, 1, 1], [-2, -2], [0, 0])).toEqual(false);
    });

    it('isInTriangle', () => {
        expect(isInTriangle([
            [0, 0],
            [0, 2],
            [2, 0],
        ], [1, 1])).toEqual(true);
        expect(isInTriangle([
            [0, 0],
            [0, 2],
            [2, 0],
        ], [5, 5])).toEqual(false);
    });

    it('isInPolygon', () => {
        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
        ], [0, 0])).toEqual(true);

        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [1, 1],
        ], [1, 0])).toEqual(false);

        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [1, 1],
        ], [0.5, 1.5])).toEqual(true);

        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
        ], [0, -2])).toEqual(false);
        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
            [0, -2],
        ], [0, -2])).toEqual(true);
        expect(isInPolygon([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
            [0, -2],
        ], [10, 10])).toEqual(false);
    });

    it('isConvex', () => {
        expect(isConvex([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
            [0, -2],
        ])).toEqual(true);
        expect(isConvex([
            [0, 0],
            [0, 2],
            [2, 0],
        ])).toEqual(true);
        expect(isConvex([
            [0, 0],
            [0, 2],
            [2, 0],
            [2, -2],
            [0, 2],
        ])).toEqual(false);
    });

    it('getPointsRect', () => {
        expect(getPointsRect([])).toEqual([0, 0, 0, 0]);
        expect(getPointsRect([[1, 1]])).toEqual([1, 1, 0, 0]);
        expect(getPointsRect([[1, 1], [1, 2]])).toEqual([1, 1, 0, 1]);
        expect(getPointsRect([[1, 1], [-2, 3], [2, -7]])).toEqual([-2, -7, 4, 10]);
    });

    it('isIpsilaterals', () => {
        expect(isIpsilaterals([1, 1, 2], [0, 0])).toEqual(true);
        expect(isIpsilaterals([1, 1, 2])).toEqual(true);
        expect(isIpsilaterals([1, 1, 0], [0, 0], [1, 1], [-1, 1], [1, -1], [-1, -1])).toEqual(false);
    });

    it('transform', () => {
        expect(transform(createTransformMatrix(), [0, 0])).toEqual([0, 0]);
        expect(transform(createTransformMatrix(), [-1, 0])).toEqual([-1, 0]);
        expect(transform(createTransformMatrix(), [0, -1])).toEqual([0, -1]);
        expect(transform(createTransformMatrix(), [1, 0])).toEqual([1, 0]);
        expect(transform(createTransformMatrix(), [1, 1])).toEqual([1, 1]);
        expect(transform(createTransformMatrix(), [-1, 1])).toEqual([-1, 1]);
        expect(transform(createTransformMatrix(), [-1, -1])).toEqual([-1, -1]);
    });

    it('copyPath', () => {
        const src: Path = [[0, 0], [1, 1]];
        expect(copyPath(src)).toEqual(src);
        const copy = copyPath(src);
        copy[1][0] = 2;
        expect(copyPath(src)).toEqual([[0, 0], [1, 1]]);
    });

    it('isInRect', () => {
        expect(isInRect([0, 0, 10, 10], [0, 0])).toEqual(true);
        expect(isInRect([0, 0, 10, 10], [10, 10])).toEqual(true);
        expect(isInRect([0, 0, 10, 10], [11, 11])).toEqual(false);
    });

    it('isInRects', () => {
        const rs: RectPos[] = [
            [0, 0, 10, 10],
            [-2, 8, 10, 10],
            [-3, 8, 20, 20],
        ]
        expect(isInRects(rs, [0, 0])).toEqual(0);
        expect(isInRects(rs, [10, 10])).toEqual(0);
        expect(isInRects(rs, [11, 11])).toEqual(2);
    })

    it('translate', () => {
        const m = createTransformMatrix();
        expect(transform(translate(m, 1), [0, 0])).toEqual([1, 0]);
        expect(transform(translate(m, 1, -1), [0, 0])).toEqual([1, -1]);
        expect(transform(translate(m, 1, -1), [0, 0])).toEqual([1, -1]);
        expect(transform(translate(m, 1, -1, 12), [0, 0])).toEqual([1, -1]);
        expect(transform(translate(m), [-1, 0])).toEqual([-1, 0]);
        expect(transform(translate(translate(m, -100), 100), [0, -1])).toEqual([0, -1]);
        expect(transform(translate(translate(m, -100), 100, 200), [0, -1])).toEqual([0, 199]);
    });

    it('scale', () => {
        const m = createTransformMatrix();
        expect(transform(scale(m, 1), [0, 0])).toEqual([0, 0]);
        expect(transform(scale(m, 1, -1), [0, 0])).toEqual([0, 0]);
        expect(transform(scale(m, 1, -1), [0, 0])).toEqual([0, 0]);
        expect(transform(scale(m, 1, -1, 12), [0, 0])).toEqual([0, 0]);
        expect(transform(scale(m), [-1, 0])).toEqual([-1, 0]);
        expect(transform(scale(scale(m, -100), 100), [0, -1])).toEqual([0, -1]);
        expect(transform(scale(scale(m, -100), 100, 200), [0, -1])).toEqual([0, -201]);
    })
});