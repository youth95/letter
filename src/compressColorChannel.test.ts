import { piRotateRight, createCompressColorChanel, getPoint, setPoint, rotateRightCompressColorChanel } from "./compressColorChannel";

describe('compressColorChannel', () => {
  
  it('should piRotateRight', () => {
    expect([
      0, 1, 2,
      3, 4, 5,
      6, 7, 8].map(item => piRotateRight(3, 3, item))).toEqual([
        6, 3, 0,
        7, 4, 1,
        8, 5, 2,
      ]);
    expect([
      0, 1,
      2, 3,].map(item => piRotateRight(2, 2, item))).toEqual([
        2, 0,
        3, 1
      ]);
    expect([0].map(item => piRotateRight(1, 1, item))).toEqual([0]);
    expect([0, 1, 2].map(item => piRotateRight(3, 1, item))).toEqual([0, 1, 2]);
    expect([0, 1, 2].map(item => piRotateRight(1, 3, item))).toEqual([2, 1, 0]);
  });

  it('should rotateRightCompressColorChanel', () => {
    const c = createCompressColorChanel(3, 3, 0);
    expect(() => createCompressColorChanel(0, 0)).toThrow();
    expect(getPoint(c, 0, 0)).toEqual([0,0]);
    setPoint(c, 0, 0);
    expect(() => setPoint(c, 3, 3)).toThrow();
    expect(() => getPoint(c, 3, 3)).toThrow();
    expect(c.ccps[0]).toEqual([0, 1]);
    rotateRightCompressColorChanel(c);
    expect(c.ccps[0]).toEqual([6, 1]);
    setPoint(c, 0, 0, 2);
    expect(getPoint(c, 0, 0)).toEqual([0, 2]);
    setPoint(c, 0, 0, 3);
    expect(getPoint(c, 0, 0)).toEqual([0, 3]);
  });
});