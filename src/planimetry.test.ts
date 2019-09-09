import { towPointLine, towPointDis, linefn, isIpsilateral, isInTriangle, isInPolygon, isConvex, getPointsRect } from "./planimetry";

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
        expect(getPointsRect([[1, 1]])).toEqual([0, 0, 0, 0]);
        expect(getPointsRect([[1, 1], [1, 2]])).toEqual([0, 0, 0, 1]);
        expect(getPointsRect([[1, 1], [-2, 3], [2, -7]])).toEqual([0, 0, 4, 10]);
    });
});