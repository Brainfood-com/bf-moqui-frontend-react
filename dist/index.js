import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import _Object$defineProperty from "@babel/runtime-corejs3/core-js/object/define-property";
import _Object$defineProperties from "@babel/runtime-corejs3/core-js/object/define-properties";
import _Object$getOwnPropertyDescriptors from "@babel/runtime-corejs3/core-js/object/get-own-property-descriptors";
import _forEachInstanceProperty from "@babel/runtime-corejs3/core-js/instance/for-each";
import _Object$getOwnPropertyDescriptor from "@babel/runtime-corejs3/core-js/object/get-own-property-descriptor";
import _filterInstanceProperty from "@babel/runtime-corejs3/core-js/instance/filter";
import _Object$getOwnPropertySymbols from "@babel/runtime-corejs3/core-js/object/get-own-property-symbols";
import _Object$keys from "@babel/runtime-corejs3/core-js/object/keys";
import _extends from "@babel/runtime-corejs3/helpers/extends";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _JSON$stringify from "@babel/runtime-corejs3/core-js/json/stringify";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import _slicedToArray from "@babel/runtime-corejs3/helpers/slicedToArray";

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); if (enumerableOnly) symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { var _context; _forEachInstanceProperty(_context = ownKeys(source, true)).call(_context, function (key) { _defineProperty(target, key, source[key]); }); } else if (_Object$getOwnPropertyDescriptors) { _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)); } else { var _context2; _forEachInstanceProperty(_context2 = ownKeys(source)).call(_context2, function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } } return target; }

import isEqual from 'lodash/isEqual';
import React from 'react';
import CancelablePromise from 'cancelable-promise';
import Auth from 'bf-auth-frontend-react';

var _ref = function () {
  var moquiBaseResolve;
  var moquiBasePromise = new _Promise(function (resolve, reject) {
    moquiBaseResolve = resolve;
  });
  return [moquiBasePromise, moquiBaseResolve];
}(),
    _ref2 = _slicedToArray(_ref, 2),
    moquiBase = _ref2[0],
    setMoquiBase = _ref2[1];

export { moquiBase, setMoquiBase };
export function moquiApi(path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var currentMoquiToken;

  function applyMoquiToken(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        moquiBase = _ref4[0],
        moquiToken = _ref4[1];

    if (moquiToken === currentMoquiToken) {
      return moquiBase;
    }

    console.log('moquiToken', moquiToken);
    return fetch(moquiBase + '/bf-auth/connect', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: _JSON$stringify({
        authorization: moquiToken
      }),
      mode: 'cors',
      credentials: 'include'
    }).then(function (response) {
      return moquiBase;
    });
  }

  return new CancelablePromise(function (resolve, reject) {
    _Promise.all([moquiBase, Auth.getToken('moqui')]).then(applyMoquiToken).then(function (moquiBase) {
      var _options$headers = options.headers,
          headers = _options$headers === void 0 ? {} : _options$headers;
      return fetch(moquiBase + path, _objectSpread({}, options, {
        headers: _objectSpread({}, headers),
        mode: 'cors',
        credentials: 'include'
      }));
    }).then(resolve, reject);
  }).then(function (response) {
    return response.json();
  });
}
export function withModelApi() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var extractKey = options.extractKey,
      fetchModel = options.fetchModel,
      processModel = options.processModel;
  return function (Component) {
    return function ModelApiWrapper(props) {
      var _React$useState = React.useState(undefined),
          _React$useState2 = _slicedToArray(_React$useState, 2),
          key = _React$useState2[0],
          setKey = _React$useState2[1];

      var _React$useState3 = React.useState(null),
          _React$useState4 = _slicedToArray(_React$useState3, 2),
          model = _React$useState4[0],
          setModel = _React$useState4[1];

      var _React$useState5 = React.useState(true),
          _React$useState6 = _slicedToArray(_React$useState5, 2),
          isLoading = _React$useState6[0],
          setIsLoading = _React$useState6[1];

      var _React$useState7 = React.useState(null),
          _React$useState8 = _slicedToArray(_React$useState7, 2),
          pipeline = _React$useState8[0],
          setPipeline = _React$useState8[1];

      var newKey = extractKey(props);

      if (!isEqual(key, newKey)) {
        setKey(newKey);

        if (pipeline) {
          pipeline.cancel();
        }

        if (newKey !== undefined) {
          if (!isLoading) {
            setIsLoading(true);
          }

          setPipeline(fetchModel(newKey).then(processModel).then(setModel).then(function () {
            return setIsLoading(false);
          }, function () {
            return setIsLoading(false);
          }));
        } else {
          setPipeline(null);
        }
      }

      return React.createElement(Component, _extends({}, props, model, {
        isLoading: isLoading
      }));
    };
  };
}
//# sourceMappingURL=index.js.map