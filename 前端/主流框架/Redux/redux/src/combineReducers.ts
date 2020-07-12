import { Reducer } from './types/reducers'
import { AnyAction, Action } from './types/actions'
import ActionTypes from './utils/actionTypes'
import warning from './utils/warning'
import isPlainObject from './utils/isPlainObject'
import {
  ReducersMapObject,
  StateFromReducersMapObject,
  ActionFromReducersMapObject
} from './types/reducers'
import { CombinedState } from './types/store'

function getUndefinedStateErrorMessage(key: string, action: Action) {
  const actionType = action && action.type
  const actionDescription =
    (actionType && `action "${String(actionType)}"`) || 'an action'

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}

function getUnexpectedStateShapeWarningMessage(
  inputState: object,
  reducers: ReducersMapObject,
  action: Action,
  unexpectedKeyCache: { [key: string]: true }
) {
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer'

  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }

  if (!isPlainObject(inputState)) {
    const match = Object.prototype.toString
      .call(inputState)
      .match(/\s([a-z|A-Z]+)/)
    const matchType = match ? match[1] : ''
    return (
      `The ${argumentName} has unexpected type of "` +
      matchType +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (action && action.type === ActionTypes.REPLACE) return

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

// 初始值的错误判断
function assertReducerShape(reducers: ReducersMapObject) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    // 执行一个走default 的 action，返回初始state
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    // 初始值为undefined则报错
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined. If you don't want to set a value for this reducer, ` +
        `you can use null instead of undefined.`
      )
    }

    // 执行reducer，返回的值为undefined 则报错，
    // 与上面的不同，因为有可能定义的initState 为undefined
    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}


export default function combineReducers<S>(
  reducers: ReducersMapObject<S, any>
): Reducer<CombinedState<S>>
export default function combineReducers<S, A extends Action = AnyAction>(
  reducers: ReducersMapObject<S, A>
): Reducer<CombinedState<S>, A>
export default function combineReducers<M extends ReducersMapObject<any, any>>(
  reducers: M
): Reducer<
  CombinedState<StateFromReducersMapObject<M>>,
  ActionFromReducersMapObject<M>
>

// combineReducers 将所有的reducers进行一个整合
export default function combineReducers(reducers: ReducersMapObject) {

  // 拿到所有reducer的key 字符串数组
  const reducerKeys: string[] = Object.keys(reducers)
  const finalReducers: ReducersMapObject = {}

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    // 开发环境下 如果reducer 是undefined 则报错
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    // 将入参reducers 对象进行一个转移，而不是直接拿到它的引用
    // 类似于  finalReducers = reducers 
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }


  const finalReducerKeys: string[] = Object.keys(finalReducers)


  let unexpectedKeyCache: { [key: string]: true }
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  // interface Error {
  //   stack?: string;
  // }
  let shapeAssertionError: Error
  // 触发所有的 reducer ，执行default 进行 initState 错误判断
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }


  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction
  ) {
    console.log('action:', action)

    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      // 红色警告
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState: StateFromReducersMapObject<typeof reducers> = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      // 方法的本身
      const reducer = finalReducers[key]
      // 遍历所有的reducer 进行匹配 
      // 初始值为undefined
      const previousStateForKey = state[key]
      // 返回reducer中 的初始值
      // action => { type: "@@redux/initsdadasd" } 无法匹配到
      // 拿到 state  previousStateForKey为undefined时 返回的是reducer中的初始值
      const nextStateForKey = reducer(previousStateForKey, action)


      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }

      // nextState 对象，key为reducer的key值，value是state
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}
