/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false
  let proto = obj
  // while 循环，当条件不再为真时停止
  // 将proto的原型赋值给自身
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  // 返回boolean  obj的原型
  return Object.getPrototypeOf(obj) === proto
}
