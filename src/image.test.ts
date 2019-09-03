import { minExternalReact, grayscale, binarization, } from "./image";
import { pos2index, range } from "./utils";

describe('algo', () => {
  it('should minExternalReact', () => {
    const imageData = new ImageData(3, 3);
    imageData.data[pos2index(1, 1, 4) * 4 - 1] = 1;
    expect(minExternalReact(imageData)).toEqual([1, 1, 0, 0])
    const imageData2 = new ImageData(3, 3);
    range(imageData2.data.length).forEach(v => {
      imageData2.data[v] = 3;
    })
    imageData2.data[pos2index(1, 1, 4) * 4 - 1] = 1;
    expect(minExternalReact(imageData2, [3, 3, 3, 3])).toEqual([1, 1, 0, 0])
    const imageData3 = new ImageData(3, 3);
    expect(minExternalReact(imageData3)).toEqual([0, 0, 0, 0])
  });
  it('should grayscale', () => {
    const imageData = new ImageData(3, 3);
    imageData.data[0] = 12;
    expect(grayscale(imageData)).not.toEqual(imageData);
  });
  it('should binarization', () => {
    const input = new Uint8ClampedArray([
      0, 0, 0, 225, 4, 5, 6, 225,
      1, 2, 3, 225, 4, 5, 6, 225,
    ]);
    const output = new Uint8ClampedArray([
      0, 0, 0, 225, 225, 225, 225, 225,
      225, 225, 225, 225, 225, 225, 225, 225,
    ]);
    expect(binarization(new ImageData(input, 2, 2))).toEqual(new ImageData(output, 2, 2))
  });
});