import { matrixMultiply } from "./element";

describe('element', () => {
    it('matrixMultiply ', () => {
        expect(matrixMultiply(
            matrixMultiply(
                [[1, 2, 3, 4, 5, 6], 3],
                [[1, 2, 3, 4, 5, 6], 2]
            ),
            [[1, 2, 3, 4, 5, 6], 3],
        )).toEqual(matrixMultiply(
            [[1, 2, 3, 4, 5, 6], 3],
            matrixMultiply(
                [[1, 2, 3, 4, 5, 6], 2],
                [[1, 2, 3, 4, 5, 6], 3],
            ),

        ))
    });
});