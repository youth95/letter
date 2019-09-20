import { range, map, pos2index, rowIndex, colorChannel, mergeColorChannel, colIndex, countArray, addArray, addArrays, copyArrayElements, chunk, createCanvasContext2d } from "./utils";

describe('utils', () => {
  it('should range', () => {
    expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(range(0)).toEqual([]);
    expect(range(-1)).toEqual([]);
    expect(() => range(Infinity)).toThrow();
  });
  it('should crange', () => {
    expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should map', () => {
    expect(map(v => v + 1, range(10))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should pos2index', () => {
    expect(pos2index(1, 0, 10)).toEqual(1);
    expect(pos2index(0, 1, 10)).toEqual(10);
    expect(pos2index(0, 0, 0)).toEqual(0);
  });

  it('should rowIndex', () => {
    expect(rowIndex(10, 1)).toEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
  });

  it('should colorChannel', () => {
    const imageData = new ImageData(4, 4);
    const chs = colorChannel(imageData);
    expect(imageData).toEqual(mergeColorChannel(chs, imageData.width))
  });

  it('should rowIndex', () => {
    expect(colIndex(10, 1)).toEqual([[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]);
  });

  it('should countArray', () => {
    expect(countArray([1, 2, 3, 4, 3, 2, 10])).toEqual(new Map(
      [
        [1, 1],
        [2, 2],
        [3, 2],
        [4, 1],
        [10, 1],
      ]
    ));
  });

  it('should addArray', () => {
    expect(addArray([1, 1, 1], [2, 2, 2])).toEqual([3, 3, 3]);
  });

  it('should addArrays', () => {
    expect(addArrays([1,1,1],[2,2,2],[3,3,3])).toEqual([6,6,6]);
  });

  it('should copyArrayElements', () => {
    expect(copyArrayElements(3,[1,2,3])).toEqual([1,1,1,2,2,2,3,3,3]);
  });

  it('should chunk', () => {
    expect(chunk(1,[1,1,1])).toEqual([[1],[1],[1]]);
    expect(chunk(2,[1,1,1])).toEqual([[1,1],[1]]);
  });

  it('createCanvasContext2d',() => {
    expect(createCanvasContext2d()).toBeDefined();
  })

});