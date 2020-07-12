"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useReduxContext = useReduxContext;

var _react = require("react");

var _invariant = _interopRequireDefault(require("invariant"));

var _Context = require("../components/Context");

function useReduxContext() {
  var contextValue = (0, _react.useContext)(_Context.ReactReduxContext);
  (0, _invariant["default"])(contextValue, 'could not find react-redux context value; please ensure the component is wrapped in a <Provider>');
  return contextValue;
}