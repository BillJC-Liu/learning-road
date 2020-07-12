"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Context = require("./Context");

var _Subscription = _interopRequireDefault(require("../utils/Subscription"));

function Provider(_ref) {
  var store = _ref.store,
      context = _ref.context,
      children = _ref.children;
  // 从contetx中获取管理的值  当store改变的时候 contextValue 也就改变
  var contextValue = (0, _react.useMemo)(function () {
    // 实例化 subscription 其中模拟的就是redux的状态管理方式
    var subscription = new _Subscription["default"](store); // subscription.onStateChange = notify() {}

    subscription.onStateChange = subscription.notifyNestedSubs;
    return {
      store: store,
      subscription: subscription
    };
  }, [store]); // 返回上一次的状态    

  var previousState = (0, _react.useMemo)(function () {
    return store.getState();
  }, [store]); // 管理两个状态  当上一个的状态 previousState 发生了改变 或者  contextValue 在 store 改变的前提下进行改变
  // 一般情况下store注册后 引用地址不会改变了 
  // 当上一个状态发生改变 执行

  (0, _react.useEffect)(function () {
    var subscription = contextValue.subscription; // 执行两个方法， subscription.onStateChange 
    // 执行一个callback

    subscription.trySubscribe();

    if (previousState !== store.getState()) {
      // notify(){}  其中没执行任何代码 
      // 上面执行了 trySubscribe() 更新了原来的 listeners 数组，用循坏将 losteners数组进行更新其中的状态
      subscription.notifyNestedSubs();
    } // 置为初始值


    return function () {
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;
    };
  }, [contextValue, previousState]); // 没传 context 的话基本就是react的context  
  // React.createContext(null)   { Provider , Consumer }

  var Context = context || _Context.ReactReduxContext;
  return _react["default"].createElement(Context.Provider, {
    value: contextValue
  }, children);
}

Provider.propTypes = {
  store: _propTypes["default"].shape({
    subscribe: _propTypes["default"].func.isRequired,
    dispatch: _propTypes["default"].func.isRequired,
    getState: _propTypes["default"].func.isRequired
  }),
  context: _propTypes["default"].object,
  children: _propTypes["default"].any
};
var _default = Provider;
exports["default"] = _default;