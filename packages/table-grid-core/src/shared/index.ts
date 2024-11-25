export * from "./binary";

export * from "./uuid";

/**
 * 将传入的参数转换为数组
 * @param target - 需要转换的参数
 * @returns 转换后的数组
 */
export function toArray<T = any>(target: T): T[] {
  return Array.isArray(target) ? target : [target];
}