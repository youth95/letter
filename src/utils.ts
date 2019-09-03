export type PureParams = number | string | boolean;
export type PureFunction = (x: PureParams) => any;
export type PureNumberFunction = (x: number) => any;
export type colorChannels = [number[], number[], number[], number[]];

/**
 * 将输入参数为一个数值的纯函数缓存化，即多次f(x)只要x与上次传入的x相同则直接返回上次的结果,反之更新
 * @param fn 需要缓存的数字纯函数
 */
export const cacheLast = (fn: PureNumberFunction) => {
  let last: PureParams | null = null;
  let lastResult: any[] = [];
  return (arg: number) => {
    if (last && last === arg) {
      return lastResult;
    } else {
      last = arg;
      lastResult = fn(arg)
      return lastResult;
    }
  };
}

/**
 * 返回[0,1,2,3,...,n-1]
 * @param n 需要循环生成的数组长度
 */
export const range = (n: number): number[] => {
  if (n === Infinity) {
    throw new Error('too large');
  }
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(i);
  }
  return arr;
};

/**
 * range函数的缓存版本
 */
export const crange = cacheLast(range as PureFunction);

/**
 * Array.map 的函数式写法
 * @param callbackfn map的处理函数
 * @param t 需要处理的数组
 */
export const map = (callbackfn: (value: any, index: number, array: any[]) => any, t: any[]) => t.map(callbackfn);

/**
 * 分离ImageData中的4个通道
 * @param imageData 图像数据
 */
export function colorChannel({ data }: ImageData, ): colorChannels {
  const R = map(v => data[v * 4], crange(data.length / 4));
  const G = map(v => data[v * 4 + 1], crange(data.length / 4));
  const B = map(v => data[v * 4 + 2], crange(data.length / 4));
  const A = map(v => data[v * 4 + 3], crange(data.length / 4));
  return [R, G, B, A]
}

/**
 * 将数值数组1与数值数组2的各个相同下标的数值元素相加,返回长度为数组1长度的结果数组
 * @param arr1 数值数组1
 * @param arr2 数值数组2
 */
export function addArray(arr1: number[], arr2: number[]) {
  const reuslt = [];
  for (let i = 0; i < arr1.length; i++) {
    reuslt.push(arr1[i] + arr2[i]);
  }
  return reuslt;
}

/**
 * 将多个数值数组的值相加
 * @param v 多个数值数组
 */
export function addArrays(...v: number[][]) {
  return v.reduce((sum, item) => addArray(sum, item));
}

/**
 * 将arr数组的每个元素拷贝times次
 * @param times 拷贝次数
 * @param arr 原数组
 * @example
 * copyArrayElements(4,[1,2,3]); // [1,1,1,1,2,2,2,2,3,3,3,3]
 */
export function copyArrayElements(times: number, arr: number[]) {
  const result = [];
  for (const e of arr) {
    for (let i = 0; i < times; i++) {
      result.push(e);
    }
  }
  return result;
}

/**
 * 将arr数组分片为指定带下的chunks
 * @param size 分片的大小
 * @param arr 需要分片的数组
 * @example
 * chunk(4,[1]);    // [[1]]
 * chunk(4,[1,2,3,4,5]);    // [[1,2,3,4],[5]]
 * chunk(2,[1,2,3,4,5]);    // [[1,2],[3,4],[5]]
 */
export function chunk(size: number, arr: any[]) {
  const result: any[][] = [];
  let c: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    c.push(arr[i]);
    if (((i + 1) % size) === 0) {
      result.push(c);
      c = [];
    }
  }
  if (c.length !== 0) {
    result.push(c);
  }
  return result;
}
/**
 * 合并4个图像通道为一个图像数据
 * @param channels 通道数据集
 * @param width 输出图像的宽度
 */
export function mergeColorChannel(channels: colorChannels, width: number): ImageData {
  const [R, G, B, A] = channels;
  const reuslt: number[] = [];
  for (let i = 0; i < R.length; i++) {
    [R[i], G[i], B[i], A[i]].forEach(v => reuslt.push(Math.floor(v)));
  }
  const result = new ImageData(new Uint8ClampedArray(reuslt), width, R.length / width);
  return result;
}

/**
 * 通过画布上的横纵坐标计算出像素在实际的通道中的下标
 * @param x 横坐标
 * @param y 纵坐标
 * @param w 画布宽度
 */
export function pos2index(x: number, y: number, w: number) { return x + y * w; }

/**
 * 输出一个图像逐行访问的所有下标
 * @param w 图像的宽度
 * @param h 图像的高度
 * @example
 * rowIndex(2,2); // [[0,1],[2,3]]
 * rowIndex(2,3); // [[0,1],[2,3],[4,5]]
 * rowIndex(3,2); // [[0,1,2],[3,4,5]]
 */
export function rowIndex(w: number, h: number): number[][] { return chunk(w, crange(w * h)) }

/**
 * 输出一个图像逐列访问的所有下标
 * @param w 图像的宽度
 * @param h 图像的高度
 * @example
 * colIndex(2,2); // [[0,2],[1,3]]
 * colIndex(2,3); // [[0,2,4],[1,3,5]]
 * colIndex(3,2); // [[0,3],[1,4],[2,5]]
 */
export function colIndex(w: number, h: number) { return map(i => map(j => pos2index(i, j, w), crange(h)), crange(w)); }

/**
 * 统计数值数组arr中的相同数组出现的次数,返回一个map
 * @param arr 需要统计的数组
 */
export function countArray(arr: number[]):Map<number,number> {
  const result = new Map();
  for (const v of arr) {
    if (result.has(v)) {
      result.set(v, result.get(v) + 1);
    } else {
      result.set(v, 1);
    }
  }
  return result;
}

/**
 * 获取imageData中某个区域的内容
 * @param x 左上角横坐标
 * @param y 左上角纵坐标
 * @param w 宽度
 * @param h 高度
 * @param imageData 需要去图像数据的原始图像
 */
// export function getImage(x:number,y:number,w:number,h:number,imageData:ImageData):ImageData{
//   const rfs = rowIndex(w,h).map(v => v[0]);
//   // rfs.map(v => [v,range((w-x)*4)]).map(v => );

// }