// 执行applyMiddleware 注册中间件时可传入的参数，在action执行时的第三个参数
function createThunkMiddleware(extraArgument) {
  // 源码
  // return ({ dispatch, getState }) => (next) => (action) => {
  //   if (typeof action === 'function') {
  //     return action(dispatch, getState, extraArgument);
  //   }
  //   return next(action);
  // };

  // 等同于以下写法，方便理解
  // 
  return ({ dispatch, getState }) => {
    return next => {
      return action => {
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }
        return next(action);
      }
    }
  };
}

const thunk = createThunkMiddleware();

thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
