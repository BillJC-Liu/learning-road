type Func0<R> = () => R
type Func1<T1, R> = (a1: T1) => R
type Func2<T1, T2, R> = (a1: T1, a2: T2) => R
type Func3<T1, T2, T3, R> = (a1: T1, a2: T2, a3: T3, ...args: any[]) => R

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for the
 * resulting composite function.
 *
 * @param funcs The functions to compose.
 * @returns A function obtained by composing the argument functions from right
 *   to left. For example, `compose(f, g, h)` is identical to doing
 *   `(...args) => f(g(h(...args)))`.
 */
export default function compose(): <R>(a: R) => R

export default function compose<F extends Function>(f: F): F

/* two functions */
export default function compose<A, R>(f1: (b: A) => R, f2: Func0<A>): Func0<R>
export default function compose<A, T1, R>(
  f1: (b: A) => R,
  f2: Func1<T1, A>
): Func1<T1, R>
export default function compose<A, T1, T2, R>(
  f1: (b: A) => R,
  f2: Func2<T1, T2, A>
): Func2<T1, T2, R>
export default function compose<A, T1, T2, T3, R>(
  f1: (b: A) => R,
  f2: Func3<T1, T2, T3, A>
): Func3<T1, T2, T3, R>

/* three functions */
export default function compose<A, B, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func0<A>
): Func0<R>
export default function compose<A, B, T1, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func1<T1, A>
): Func1<T1, R>
export default function compose<A, B, T1, T2, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func2<T1, T2, A>
): Func2<T1, T2, R>
export default function compose<A, B, T1, T2, T3, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func3<T1, T2, T3, A>
): Func3<T1, T2, T3, R>

/* four functions */
export default function compose<A, B, C, R>(
  f1: (b: C) => R,
  f2: (a: B) => C,
  f3: (a: A) => B,
  f4: Func0<A>
): Func0<R>
export default function compose<A, B, C, T1, R>(
  f1: (b: C) => R,
  f2: (a: B) => C,
  f3: (a: A) => B,
  f4: Func1<T1, A>
): Func1<T1, R>
export default function compose<A, B, C, T1, T2, R>(
  f1: (b: C) => R,
  f2: (a: B) => C,
  f3: (a: A) => B,
  f4: Func2<T1, T2, A>
): Func2<T1, T2, R>
export default function compose<A, B, C, T1, T2, T3, R>(
  f1: (b: C) => R,
  f2: (a: B) => C,
  f3: (a: A) => B,
  f4: Func3<T1, T2, T3, A>
): Func3<T1, T2, T3, R>

/* rest */
export default function compose<R>(
  f1: (b: any) => R,
  ...funcs: Function[]
): (...args: any[]) => R
export default function compose<R>(...funcs: Function[]): (...args: any[]) => R
export default function compose(...funcs: Function[]) {
  // compose(applyMiddleware(thunkMiddleware, reduxLogger))
  // 该语句的执行顺序是 compose() 先执行，其中的参数只有 applyMiddleware 一个
  // 所以 funcs.length === 1 ==> true
  // 所以返回 funcs[0] 也就是 applyMiddleware(thunkMiddleware, reduxLogger)
  // 然后再走外层的 createStore 进行执行中间件的注册

  // 无中间件时
  if (funcs.length === 0) {
    return <T>(arg: T) => arg
  }
  // 当中间件只有一个的时候
  if (funcs.length === 1) {
    return funcs[0]
  }

  // 多个中间件时
  return funcs.reduce(function (a, b) {
    return function (...args: any) {
      console.log("args:", args);
      return a(b(...args))
    }
  })
}
