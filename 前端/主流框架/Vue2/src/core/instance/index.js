import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // 注入_init 方法
stateMixin(Vue) //  写入gettter 和 setter
eventsMixin(Vue) // 写入 $on $once  $off  $emit 
lifecycleMixin(Vue) // 写入 _update $forceUpdate $destory 
renderMixin(Vue) // 写入 $nextTick  _render 函数式组件

export default Vue
