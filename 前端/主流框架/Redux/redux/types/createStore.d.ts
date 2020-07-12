import { Store, PreloadedState, StoreEnhancer, ExtendState } from './types/store';
import { Action } from './types/actions';
import { Reducer } from './types/reducers';
export default function createStore<S, A extends Action, Ext = {}, StateExt = never>(reducer: Reducer<S, A>, enhancer?: StoreEnhancer<Ext, StateExt>): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext;
export default function createStore<S, A extends Action, Ext = {}, StateExt = never>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>, enhancer?: StoreEnhancer<Ext, StateExt>): Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext;
