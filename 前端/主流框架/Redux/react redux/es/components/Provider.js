import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ReactReduxContext } from './Context';
import Subscription from '../utils/Subscription';

function Provider(_ref) {
  var store = _ref.store,
      context = _ref.context,
      children = _ref.children;
  // 从contetx中获取管理的值  当store改变的时候 contextValue 也就改变
  var contextValue = useMemo(function () {
    // 实例化 subscription 其中模拟的就是redux的状态管理方式
    var subscription = new Subscription(store); // subscription.onStateChange = notify() {}

    subscription.onStateChange = subscription.notifyNestedSubs;
    return {
      store: store,
      subscription: subscription
    };
  }, [store]); // 返回上一次的状态    

  var previousState = useMemo(function () {
    return store.getState();
  }, [store]); // 管理两个状态  当上一个的状态 previousState 发生了改变 或者  contextValue 在 store 改变的前提下进行改变
  // 一般情况下store注册后 引用地址不会改变了 
  // 当上一个状态发生改变 执行

  useEffect(function () {
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

  var Context = context || ReactReduxContext;
  return React.createElement(Context.Provider, {
    value: contextValue
  }, children);
}

Provider.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }),
  context: PropTypes.object,
  children: PropTypes.any
};
export default Provider;