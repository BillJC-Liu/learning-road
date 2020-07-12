'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $$observable = _interopDefault(require('symbol-observable'));

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
const randomString = () => Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.');
const ActionTypes = {
    INIT: `@@redux/INIT${randomString()}`,
    REPLACE: `@@redux/REPLACE${randomString()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;
}

function createStore(reducer, preloadedState, enhancer) {
    if ((typeof preloadedState === 'function' && typeof enhancer === 'function') ||
        (typeof enhancer === 'function' && typeof arguments[3] === 'function')) {
        throw new Error('It looks like you are passing several store enhancers to ' +
            'createStore(). This is not supported. Instead, compose them ' +
            'together to a single function.');
    }
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
    }
    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('Expected the enhancer to be a function.');
        }
        // 一般情况下，第二个参数是中间件 compose 进行管理
        return enhancer(createStore)(reducer, preloadedState);
    }
    // reducer 是combineReducer 返回的一个方法，
    // 其中具有所有的reducer集合
    if (typeof reducer !== 'function') {
        throw new Error('Expected the reducer to be a function.');
    }
    let currentReducer = reducer;
    // 只有两个参数的情况下 初始值 preloadedState === undefined
    console.log("preloadedState:", preloadedState);
    let currentState = preloadedState;
    let currentListeners = [];
    let nextListeners = currentListeners;
    let isDispatching = false;
    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }
    function getState() {
        if (isDispatching) {
            throw new Error('You may not call store.getState() while the reducer is executing. ' +
                'The reducer has already received the state as an argument. ' +
                'Pass it down from the top reducer instead of reading it from the store.');
        }
        return currentState;
    }
    function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Expected the listener to be a function.');
        }
        if (isDispatching) {
            throw new Error('You may not call store.subscribe() while the reducer is executing. ' +
                'If you would like to be notified after the store has been updated, subscribe from a ' +
                'component and invoke store.getState() in the callback to access the latest state. ' +
                'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
        }
        let isSubscribed = true;
        ensureCanMutateNextListeners();
        nextListeners.push(listener);
        return function unsubscribe() {
            if (!isSubscribed) {
                return;
            }
            if (isDispatching) {
                throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' +
                    'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
            }
            isSubscribed = false;
            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
            currentListeners = null;
        };
    }
    function dispatch(action) {
        // 操作必须是纯对象使用自定义中间件进行异步操作。
        if (!isPlainObject(action)) {
            throw new Error('Actions must be plain objects. ' +
                'Use custom middleware for async actions.');
        }
        if (typeof action.type === 'undefined') {
            throw new Error('Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?');
        }
        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions.');
        }
        try {
            isDispatching = true;
            currentState = currentReducer(currentState, action);
        }
        finally {
            isDispatching = false;
        }
        const listeners = (currentListeners = nextListeners);
        console.log("listeners :", listeners[0], currentListeners[0], nextListeners[0]);
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }
        return action;
    }
    function replaceReducer(nextReducer) {
        if (typeof nextReducer !== 'function') {
            throw new Error('Expected the nextReducer to be a function.');
        }
        currentReducer = nextReducer;
        // This action has a similiar effect to ActionTypes.INIT.
        // Any reducers that existed in both the new and old rootReducer
        // will receive the previous state. This effectively populates
        // the new state tree with any relevant data from the old one.
        dispatch({ type: ActionTypes.REPLACE });
        // change the type of the store by casting it to the new store
        return store;
    }
    function observable() {
        const outerSubscribe = subscribe;
        return {
            /**
             * The minimal observable subscription method.
             * @param observer Any object that can be used as an observer.
             * The observer object should have a `next` method.
             * @returns An object with an `unsubscribe` method that can
             * be used to unsubscribe the observable from the store, and prevent further
             * emission of values from the observable.
             */
            subscribe(observer) {
                if (typeof observer !== 'object' || observer === null) {
                    throw new TypeError('Expected the observer to be an object.');
                }
                function observeState() {
                    const observerAsObserver = observer;
                    if (observerAsObserver.next) {
                        observerAsObserver.next(getState());
                    }
                }
                observeState();
                const unsubscribe = outerSubscribe(observeState);
                return { unsubscribe };
            },
            [$$observable]() {
                return this;
            }
        };
    }
    dispatch({ type: ActionTypes.INIT });
    const store = {
        dispatch: dispatch,
        subscribe,
        getState,
        replaceReducer,
        [$$observable]: observable
    };
    return store;
}

/**
 * Prints a warning in the console if it exists.
 *
 * @param message The warning message.
 */
function warning(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
    }
    /* eslint-enable no-console */
    try {
        // This error was thrown as a convenience so that if you enable
        // "break on all exceptions" in your console,
        // it would pause the execution at this line.
        throw new Error(message);
    }
    catch (e) { } // eslint-disable-line no-empty
}

function getUndefinedStateErrorMessage(key, action) {
    const actionType = action && action.type;
    const actionDescription = (actionType && `action "${String(actionType)}"`) || 'an action';
    return (`Given ${actionDescription}, reducer "${key}" returned undefined. ` +
        `To ignore an action, you must explicitly return the previous state. ` +
        `If you want this reducer to hold no value, you can return null instead of undefined.`);
}
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    const reducerKeys = Object.keys(reducers);
    const argumentName = action && action.type === ActionTypes.INIT
        ? 'preloadedState argument passed to createStore'
        : 'previous state received by the reducer';
    if (reducerKeys.length === 0) {
        return ('Store does not have a valid reducer. Make sure the argument passed ' +
            'to combineReducers is an object whose values are reducers.');
    }
    if (!isPlainObject(inputState)) {
        const match = Object.prototype.toString
            .call(inputState)
            .match(/\s([a-z|A-Z]+)/);
        const matchType = match ? match[1] : '';
        return (`The ${argumentName} has unexpected type of "` +
            matchType +
            `". Expected argument to be an object with the following ` +
            `keys: "${reducerKeys.join('", "')}"`);
    }
    const unexpectedKeys = Object.keys(inputState).filter(key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
    unexpectedKeys.forEach(key => {
        unexpectedKeyCache[key] = true;
    });
    if (action && action.type === ActionTypes.REPLACE)
        return;
    if (unexpectedKeys.length > 0) {
        return (`Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
            `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
            `Expected to find one of the known reducer keys instead: ` +
            `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`);
    }
}
function assertReducerShape(reducers) {
    Object.keys(reducers).forEach(key => {
        const reducer = reducers[key];
        const initialState = reducer(undefined, { type: ActionTypes.INIT });
        if (typeof initialState === 'undefined') {
            throw new Error(`Reducer "${key}" returned undefined during initialization. ` +
                `If the state passed to the reducer is undefined, you must ` +
                `explicitly return the initial state. The initial state may ` +
                `not be undefined. If you don't want to set a value for this reducer, ` +
                `you can use null instead of undefined.`);
        }
        if (typeof reducer(undefined, {
            type: ActionTypes.PROBE_UNKNOWN_ACTION()
        }) === 'undefined') {
            throw new Error(`Reducer "${key}" returned undefined when probed with a random type. ` +
                `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
                `namespace. They are considered private. Instead, you must return the ` +
                `current state for any unknown actions, unless it is undefined, ` +
                `in which case you must return the initial state, regardless of the ` +
                `action type. The initial state may not be undefined, but can be null.`);
        }
    });
}
function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    for (let i = 0; i < reducerKeys.length; i++) {
        const key = reducerKeys[i];
        if (process.env.NODE_ENV !== 'production') {
            if (typeof reducers[key] === 'undefined') {
                warning(`No reducer provided for key "${key}"`);
            }
        }
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    // This is used to make sure we don't warn about the same
    // keys multiple times.
    let unexpectedKeyCache;
    if (process.env.NODE_ENV !== 'production') {
        unexpectedKeyCache = {};
    }
    let shapeAssertionError;
    try {
        assertReducerShape(finalReducers);
    }
    catch (e) {
        shapeAssertionError = e;
    }
    return function combination(state = {}, action) {
        if (shapeAssertionError) {
            throw shapeAssertionError;
        }
        if (process.env.NODE_ENV !== 'production') {
            const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
            if (warningMessage) {
                warning(warningMessage);
            }
        }
        let hasChanged = false;
        const nextState = {};
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i];
            // 方法的本身
            const reducer = finalReducers[key];
            const previousStateForKey = state[key];
            // 返回reducer中 的初始值
            // action => { type: "@@redux/initsdadasd" } 无法匹配到
            const nextStateForKey = reducer(previousStateForKey, action);
            console.log("key:", key); // "testReducer"
            console.log("state:", state); // {}
            console.log("reducer:", reducer); //  testReducer 方法
            console.log("previousStateForKey:", previousStateForKey); // {}[key] => undefined
            console.log("nextStateForKey:", nextStateForKey);
            if (typeof nextStateForKey === 'undefined') {
                const errorMessage = getUndefinedStateErrorMessage(key, action);
                throw new Error(errorMessage);
            }
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        hasChanged =
            hasChanged || finalReducerKeys.length !== Object.keys(state).length;
        return hasChanged ? nextState : state;
    };
}

function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args));
    };
}
function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch);
    }
    if (typeof actionCreators !== 'object' || actionCreators === null) {
        throw new Error(`bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
            `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`);
    }
    const boundActionCreators = {};
    for (const key in actionCreators) {
        const actionCreator = actionCreators[key];
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
        }
    }
    return boundActionCreators;
}

function compose(...funcs) {
    if (funcs.length === 0) {
        // infer the argument type so it is usable in inference down the line
        return (arg) => arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function applyMiddleware(...middlewares) {
    return (createStore) => (reducer, ...args) => {
        console.log("applyMiddleware:", ...args);
        const store = createStore(reducer, ...args);
        let dispatch = () => {
            throw new Error('Dispatching while constructing your middleware is not allowed. ' +
                'Other middleware would not be applied to this dispatch.');
        };
        const middlewareAPI = {
            getState: store.getState,
            dispatch: (action, ...args) => dispatch(action, ...args)
        };
        const chain = middlewares.map(middleware => middleware(middlewareAPI));
        dispatch = compose(...chain)(store.dispatch);
        return {
            ...store,
            dispatch
        };
    };
}

// functions
/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */
function isCrushed() { }
if (process.env.NODE_ENV !== 'production' &&
    typeof isCrushed.name === 'string' &&
    isCrushed.name !== 'isCrushed') {
    warning('You are currently using minified code outside of NODE_ENV === "production". ' +
        'This means that you are running a slower development build of Redux. ' +
        'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
        'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
        'to ensure you have the correct code for your production build.');
}

exports.__DO_NOT_USE__ActionTypes = ActionTypes;
exports.applyMiddleware = applyMiddleware;
exports.bindActionCreators = bindActionCreators;
exports.combineReducers = combineReducers;
exports.compose = compose;
exports.createStore = createStore;
