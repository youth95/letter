import { pos2index } from "./utils";

/**
 * 被压缩的通道像素
 * 
 * 第一个值为像素下标,第二个值为通道值
 */
export type CompressChannelPixel = [number, number];

/**
 * 2d图像点
 * 
 * 由左至右 xy
 */
export type Point = [number, number];

/**
 * 压缩通道
 */
export interface CompressColorChannel {
  width: number;
  height: number;
  /**
   * 背景通道值
   */
  bgc: number;
  /**
   * 被压缩的通道像素值
   */
  ccps: CompressChannelPixel[];
}

/**
 * 创建一个空的画布通道
 * @param width 图像宽度
 * @param height 图像高度
 * @param bgc 背景值
 */
export function createCompressColorChanel(width: number, height: number, bgc: number = 0): CompressColorChannel {
  if (width <= 0 || height <= 0) {
    throw new Error('图像宽高均需要大于0');
  }
  return { width, height, bgc, ccps: [] };
}

/**
 * 设置一个压缩通道的通道值
 * @param compressColorChannel 压缩通道
 * @param x 横坐标
 * @param y 纵坐标
 * @param v 通道值
 */
export function setPoint(compressColorChannel: CompressColorChannel, x: number, y: number, v: number = 1): void {
  const idx = pos2index(x, y, compressColorChannel.width);
  if (idx > compressColorChannel.width * compressColorChannel.height) {
    throw new Error("setPoint 时数组下标越界");
  }
  const oi = compressColorChannel.ccps.findIndex(item => item[0] === idx);
  if(oi === -1){
    compressColorChannel.ccps.push([idx, v]);
  }else{
    compressColorChannel.ccps[oi][1] = v;
  }
}
/**
 * 获取一个通道的像素通道
 * @param compressColorChannel 压缩通道
 * @param x 横坐标
 * @param y 纵坐标
 */
export function getPoint(compressColorChannel: CompressColorChannel, x: number, y: number) : CompressChannelPixel {
  const idx = pos2index(x, y, compressColorChannel.width);
  if (idx > compressColorChannel.width * compressColorChannel.height) {
    throw new Error("setPoint 时数组下标越界");
  }
  const oi = compressColorChannel.ccps.findIndex(item => item[0] === idx);
  if(oi === -1){
    return [idx,compressColorChannel.bgc];
  }else{
    return compressColorChannel.ccps[oi];
  }
}

/**
 * 将一个点下标顺时针旋转90度
 * @param width 图像宽度
 * @param height 图像高度
 * @param idx 点下标
 * 
 * 推导过程
 * 
 * 1，2，3，
 * 4，5，6，
 * 7，8，9，
 * (3,3)
 *
 * 7，4，1，
 * 8，5，2，
 * 9，6，3，
 *
 * h = 3 w =3 
 * 1 -> 7 = 1+3*2 = ceil(x/h) + w*(h-(x%h || h)) = 1+3*2
 * 2 -> 4 = 1+3*1 = ceil(x/h) + w*(h-(x%h || h)) = 1+3*1
 * 3 -> 1 = 1+3*0
 * 4 -> 8 = 2+3*2
 * 5 -> 5 = 2+3*1
 * 6 -> 2 = 2+3*0
 * 7 -> 9 = 3+3*2
 * 8 -> 6 = 3+3*1
 * 9 -> 3 = 3+3*0
 *
 * 1,2,3,4
 * 5,6,7,8
 * (4,2)
 *
 * 5,1,
 * 6,2,
 * 7,3,
 * 8,4,
 *
 * 设 w = 4 h = 2 x表示原下标
 * 1 -> 5 = ceil(x/h) + w*(h-(x%h || h))
 * 2 -> 1 = ceil(x/h) + w*(h-(x%h || h))
 * 3 -> 6 = ceil(x/h) + w*(h-(x%h || h))
 * 4 -> 2 = ceil(x/h) + w*(h-(x%h || h))
 * 5 -> 7 = ceil(x/h) + w*(h-(x%h || h))
 * 6 -> 3 = ceil(x/h) + w*(h-(x%h || h))
 * 7 -> 8 = ceil(x/h) + w*(h-(x%h || h))
 * 8 -> 4 = ceil(x/h) + w*(h-(x%h || h))
 */
export function piRotateRight(width: number, height: number, idx: number) {
  return Math.ceil((idx+1) / height) + width * (height - ((idx+1) % height || height)) - 1;
}

/**
 * 将一个压缩通道向右旋转90度
 * @param compressColorChannel 压缩通道
 */
export function rotateRightCompressColorChanel(compressColorChannel: CompressColorChannel): void {
  compressColorChannel.ccps = compressColorChannel.ccps.map(item => [
    piRotateRight(compressColorChannel.width, compressColorChannel.height, item[0]),
    item[1]]);
}