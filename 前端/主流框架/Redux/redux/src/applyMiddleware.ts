import compose from './compose'
import { Middleware, MiddlewareAPI } from './types/middleware'
import { AnyAction } from './types/actions'
import { StoreEnhancer, StoreCreator, Dispatch } from './types/store'
import { Reducer } from './types/reducers'

export default function applyMiddleware(): StoreEnhancer
export default function applyMiddleware<Ext1, S>(
  middleware1: Middleware<Ext1, S, any>
): StoreEnhancer<{ dispatch: Ext1 }>
export default function applyMiddleware<Ext1, Ext2, S>(
  middleware1: Middleware<Ext1, S, any>,
  middleware2: Middleware<Ext2, S, any>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 }>
export default function applyMiddleware<Ext1, Ext2, Ext3, S>(
  middleware1: Middleware<Ext1, S, any>,
  middleware2: Middleware<Ext2, S, any>,
  middleware3: Middleware<Ext3, S, any>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 }>
export default function applyMiddleware<Ext1, Ext2, Ext3, Ext4, S>(
  middleware1: Middleware<Ext1, S, any>,
  middleware2: Middleware<Ext2, S, any>,
  middleware3: Middleware<Ext3, S, any>,
  middleware4: Middleware<Ext4, S, any>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 }>
export default function applyMiddleware<Ext1, Ext2, Ext3, Ext4, Ext5, S>(
  middleware1: Middleware<Ext1, S, any>,
  middleware2: Middleware<Ext2, S, any>,
  middleware3: Middleware<Ext3, S, any>,
  middleware4: Middleware<Ext4, S, any>,
  middleware5: Middleware<Ext5, S, any>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 & Ext5 }>
export default function applyMiddleware<Ext, S = any>(
  ...middlewares: Middleware<any, S, any>[]
): StoreEnhancer<{ dispatch: Ext }>

/**
 * @description  注册中间件
 * @param middlewares  中间件参数
 */
export default function applyMiddleware(
  ...middlewares: Middleware[]
): StoreEnhancer<any> {
  // createStore 中 enhancer 的执行 传入的 createStore方法 
  return (createStore: StoreCreator) => <S, A extends AnyAction>(
    reducer: Reducer<S, A>, ...args: any[]
  ) => {
    const store = createStore(reducer, ...args)

    let dispatch: Dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }

    // 中间件执行 将 getState  dispatch 带入
    // thunk 返回的是 
    // return next => {
    //   return action => {
    //     if (typeof action === 'function') {
    //       return action(dispatch, getState, extraArgument);
    //     }
    //     return next(action);
    //   }
    // }

    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    dispatch = compose<typeof dispatch>(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
