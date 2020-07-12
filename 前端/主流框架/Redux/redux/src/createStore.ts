import $$observable from 'symbol-observable'
import {
  Store,
  PreloadedState,
  StoreEnhancer,
  Dispatch,
  Observer,
  ExtendState
} from './types/store'
import { Action } from './types/actions'
import { Reducer } from './types/reducers'
import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

export default function createStore<
  S,
  A extends Action,
  Ext = {},
  StateExt = never
>(
  reducer: Reducer<S, A>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext


export default function createStore<
  S,
  A extends Action,
  Ext = {},
  StateExt = never
>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext

/**
 * @desc 创建store
 * @param reducer   combineReducer 返回的一个方法
 * @param preloadedState 
 * @param enhancer 
 */
export default function createStore<S, A extends Action, Ext = {}, StateExt = never>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S> | StoreEnhancer<Ext, StateExt>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext {
  // 条件一：第二个参数 preloadedState 是方法 且 第三个参数 enhancer 是方法
  // 条件二：第三个参数 enhancer 是方法 且 第四个参数是方法
  // 满足其中一个条件 抛出错误
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
      'createStore(). This is not supported. Instead, compose them ' +
      'together to a single function.'
    )
  }

  // 第二个参数 preloadedState 是方法，第三个参数 不存在
  // 则第三个参数 enhancer 赋值为第二个参数的值
  // 第二个参数的值置为 undefined
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState as StoreEnhancer<Ext, StateExt>
    preloadedState = undefined
  }

  // 第二个参数存在时，则进入
  if (typeof enhancer !== 'undefined') {
    // 第二个参数的不是方法
    // 一般来说，第二个参数是 compose(applyMiddleware(中间件))
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // 将自身的方法传入，在进行二次执行
    // enhancer => applyMiddleware 执行中间件函数
    // applyMiddleware 先 return 一个方法，其中参数是 createStore 
    // 紧接着继续 return 一个方法，接受参数为 reducer ， ...arg 等同于第二次传入的值 reducer preloadedState 
    // 第二次执行 createStore 函数自身 createStore(reducer, preloadedState) , 此时的preloadedState为undefined
    return enhancer(createStore)(reducer, preloadedState as PreloadedState<
      S
    >) as Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext
  }

  // reducer 是combineReducer 返回的一个方法，
  // 其中具有所有的reducer集合
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }


  let currentReducer = reducer
  // 第二次执行 createStore 该自身函数，preloadedState === undefined
  // 只有两个参数的情况下，第三个参数不存在时，初始值 preloadedState === undefined
  let currentState = preloadedState as S
  // 方法数组 或者 空数组类型
  let currentListeners: (() => void)[] | null = []

  let nextListeners = currentListeners
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 获取当前的state值
  function getState(): S {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState as S
  }

  // 订阅
  function subscribe(listener: () => void) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe from a ' +
        'component and invoke store.getState() in the callback to access the latest state. ' +
        'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
          'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

  // dispatch 
  function dispatch(action: A) {

    if (!isPlainObject(action)) {
      // 操作必须是纯对象使用自定义中间件进行异步操作。
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 执行 combineReducers 中返回的方法 combination 
      // 拿到的是一个 key为reducer的key，值为initState的初始值
      currentState = currentReducer(currentState, action)
    } finally {
      // 不管有无异常都执行该操作
      isDispatching = false
    }

    // 来源于 react-redux provider
    const listeners = (currentListeners = nextListeners)

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  function replaceReducer<NewState, NewActions extends A>(
    nextReducer: Reducer<NewState, NewActions>
  ): Store<ExtendState<NewState, StateExt>, NewActions, StateExt, Ext> & Ext {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    // TODO: do this more elegantly
    ; ((currentReducer as unknown) as Reducer<
      NewState,
      NewActions
    >) = nextReducer

    // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.
    dispatch({ type: ActionTypes.REPLACE } as A)
    // change the type of the store by casting it to the new store
    return (store as unknown) as Store<
      ExtendState<NewState, StateExt>,
      NewActions,
      StateExt,
      Ext
    > &
      Ext
  }

  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer: unknown) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          const observerAsObserver = observer as Observer<S>
          if (observerAsObserver.next) {
            observerAsObserver.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // 执行一次默认的default action匹配 保存初始值 initState
  dispatch({ type: ActionTypes.INIT } as A)

  const store = ({
    dispatch: dispatch as Dispatch<A>,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  } as unknown) as Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext
  return store
}
