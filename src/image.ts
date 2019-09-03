import { colorChannel, rowIndex, colIndex, addArrays, mergeColorChannel } from './utils';

/**
 * 四通道颜色值
 * 
 * 由左至右 RGBA
 */
export type Color = [number, number, number, number];


/**
 * 获取图像内容的的外接矩形
 * @param img 图片数据
 * @param bgColor 背景颜色 可选
 */
export function minExternalReact(img: ImageData, bgColor: Color = [0, 0, 0, 0], ): [number, number, number, number] {
  const [R, G, B, A] = colorChannel(img);
  const { width, height } = img;
  const rows = rowIndex(width, height);
  const cols = colIndex(width, height);
  // 寻找上边缘
  let foundFlag = false;
  let sy = 0;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (const idx of row) {
      if (R[idx] !== bgColor[0] || G[idx] !== bgColor[1] || B[idx] !== bgColor[2] || A[idx] !== bgColor[3]) {
        sy = r;
        foundFlag = true;
        break;
      }
    }
    if (foundFlag) {
      break;
    }
  }
  // 寻找左边缘
  foundFlag = false;
  let sx = 0;
  for (let c = 0; c < cols.length; c++) {
    const col = cols[c];
    for (const idx of col) {
      if (R[idx] !== bgColor[0] || G[idx] !== bgColor[1] || B[idx] !== bgColor[2] || A[idx] !== bgColor[3]) {
        sx = c;
        foundFlag = true;
        break;

      }
    }
    if (foundFlag) {
      break;
    }
  }
  // 寻找下下边缘
  foundFlag = false;
  let sh = 0;
  for (let r = rows.length - 1; r > 0; r--) {
    const row = rows[r];
    for (const idx of row) {
      if (R[idx] !== bgColor[0] || G[idx] !== bgColor[1] || B[idx] !== bgColor[2] || A[idx] !== bgColor[3]) {
        sh = r - sy;
        foundFlag = true;
        break;
      }
    }
    if (foundFlag) {
      break;
    }
  }
  // 寻找右边缘
  foundFlag = false;
  let sw = 0;
  for (let c = cols.length - 1; c > 0; c--) {
    const col = cols[c];
    for (const idx of col) {
      if (R[idx] !== bgColor[0] || G[idx] !== bgColor[1] || B[idx] !== bgColor[2] || A[idx] !== bgColor[3]) {
        sw = c - sx;
        foundFlag = true;
        break;
      }
    }
    if (foundFlag) {
      break;
    }
  }
  // 返回 左上角 宽度 高度
  return [sx, sy, sw, sh];
}
/**
 * 图像灰化
 * @param img 输出图片
 */
export function grayscale(img: ImageData): ImageData {
  const g = addArrays(...colorChannel(img).slice(0, 3)).map(item => item / 3);
  return mergeColorChannel([g, g, g, g.map(() => 225)], img.width);
}

/**
 * 图像二值化
 * @param img 输入图片
 */
export function binarization(img: ImageData) {
  const g = addArrays(...colorChannel(img).slice(0, 3))
    .map(item => item / 3)
    .reduce((sum, item) => sum + item);
  const rp = Math.floor(g / img.width / img.height);  // 灰度平均值
  const r = addArrays(...colorChannel(img).slice(0, 3)).map(item => item > rp ? 225 : 0);
  return mergeColorChannel([r, r, r, r.map(() => 225)], img.width);
}

