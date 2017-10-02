'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// TODO
// import SoxUtil from './sox_util';


var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _xml_util = require('./xml_util');

var _xml_util2 = _interopRequireDefault(_xml_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Data = function () {
  function Data(device, transducerValues) {
    _classCallCheck(this, Data);

    this.device = device;
    this.transducerValues = transducerValues;
  }

  _createClass(Data, [{
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getTransducerValues',
    value: function getTransducerValues() {
      return this.transducerValues;
    }
  }, {
    key: 'getRawValues',
    value: function getRawValues() {
      var vals = this.getTransducerValues();
      var ret = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = vals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var v = _step.value;

          var tid = v.getTransducerId();
          ret[tid] = v.getRawValue();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return ret;
    }
  }, {
    key: 'getTypedValues',
    value: function getTypedValues() {
      var vals = this.getTransducerValues();
      var ret = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = vals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var v = _step2.value;

          var tid = v.getTransducerId();
          ret[tid] = v.getTypedValue();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return ret;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      var tValues = this.transducerValues.map(function (tv) {
        return tv._getContentForXmlBuild();
      });
      return {
        device: {
          '$': {
            xmlns: 'http://jabber.org/protocol/sox'
          },
          transducerValue: tValues
        }
      };
    }
  }, {
    key: 'toXmlString',
    value: function toXmlString() {
      var builder = new _xml2js2.default.Builder({ renderOpts: { pretty: false } });
      var content = this._getContentForXmlBuild();
      var rawXmlStr = builder.buildObject(content);

      // remove <?xml ....?>
      var trimmedXmlStr = _xml_util2.default.removeXmlDeclaration(rawXmlStr);

      return trimmedXmlStr;
    }
  }, {
    key: 'appendToNode',
    value: function appendToNode(node) {
      var ret = node.c('data', { xmlns: 'http://jabber.org/protocol/sox' });

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.transducerValues[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var tv = _step3.value;

          ret.c('transducerValue', tv.getXmlAttrs()).up();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return ret;
    }
  }]);

  return Data;
}();

module.exports = Data;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYXRhLmpzIl0sIm5hbWVzIjpbIkRhdGEiLCJkZXZpY2UiLCJ0cmFuc2R1Y2VyVmFsdWVzIiwidmFscyIsImdldFRyYW5zZHVjZXJWYWx1ZXMiLCJyZXQiLCJ2IiwidGlkIiwiZ2V0VHJhbnNkdWNlcklkIiwiZ2V0UmF3VmFsdWUiLCJnZXRUeXBlZFZhbHVlIiwidFZhbHVlcyIsIm1hcCIsInR2IiwiX2dldENvbnRlbnRGb3JYbWxCdWlsZCIsInhtbG5zIiwidHJhbnNkdWNlclZhbHVlIiwiYnVpbGRlciIsIkJ1aWxkZXIiLCJyZW5kZXJPcHRzIiwicHJldHR5IiwiY29udGVudCIsInJhd1htbFN0ciIsImJ1aWxkT2JqZWN0IiwidHJpbW1lZFhtbFN0ciIsInJlbW92ZVhtbERlY2xhcmF0aW9uIiwibm9kZSIsImMiLCJnZXRYbWxBdHRycyIsInVwIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUdBO0FBQ0E7OztBQUhBOzs7O0FBSUE7Ozs7Ozs7O0lBR01BLEk7QUFFSixnQkFBWUMsTUFBWixFQUFvQkMsZ0JBQXBCLEVBQXNDO0FBQUE7O0FBQ3BDLFNBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7OztnQ0FFVztBQUNWLGFBQU8sS0FBS0QsTUFBWjtBQUNEOzs7MENBRXFCO0FBQ3BCLGFBQU8sS0FBS0MsZ0JBQVo7QUFDRDs7O21DQUVjO0FBQ2IsVUFBSUMsT0FBTyxLQUFLQyxtQkFBTCxFQUFYO0FBQ0EsVUFBSUMsTUFBTSxFQUFWO0FBRmE7QUFBQTtBQUFBOztBQUFBO0FBR2IsNkJBQWNGLElBQWQsOEhBQW9CO0FBQUEsY0FBWEcsQ0FBVzs7QUFDbEIsY0FBSUMsTUFBTUQsRUFBRUUsZUFBRixFQUFWO0FBQ0FILGNBQUlFLEdBQUosSUFBV0QsRUFBRUcsV0FBRixFQUFYO0FBQ0Q7QUFOWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU9iLGFBQU9KLEdBQVA7QUFDRDs7O3FDQUVnQjtBQUNmLFVBQUlGLE9BQU8sS0FBS0MsbUJBQUwsRUFBWDtBQUNBLFVBQUlDLE1BQU0sRUFBVjtBQUZlO0FBQUE7QUFBQTs7QUFBQTtBQUdmLDhCQUFjRixJQUFkLG1JQUFvQjtBQUFBLGNBQVhHLENBQVc7O0FBQ2xCLGNBQUlDLE1BQU1ELEVBQUVFLGVBQUYsRUFBVjtBQUNBSCxjQUFJRSxHQUFKLElBQVdELEVBQUVJLGFBQUYsRUFBWDtBQUNEO0FBTmM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFPZixhQUFPTCxHQUFQO0FBQ0Q7Ozs2Q0FFd0I7QUFDdkI7QUFDQSxVQUFJTSxVQUFVLEtBQUtULGdCQUFMLENBQXNCVSxHQUF0QixDQUEwQjtBQUFBLGVBQU1DLEdBQUdDLHNCQUFILEVBQU47QUFBQSxPQUExQixDQUFkO0FBQ0EsYUFBTztBQUNMYixnQkFBUTtBQUNOLGVBQUs7QUFDSGMsbUJBQU87QUFESixXQURDO0FBSU5DLDJCQUFpQkw7QUFKWDtBQURILE9BQVA7QUFRRDs7O2tDQUVhO0FBQ1osVUFBSU0sVUFBVSxJQUFJLGlCQUFPQyxPQUFYLENBQW1CLEVBQUVDLFlBQVksRUFBQ0MsUUFBUSxLQUFULEVBQWQsRUFBbkIsQ0FBZDtBQUNBLFVBQUlDLFVBQVUsS0FBS1Asc0JBQUwsRUFBZDtBQUNBLFVBQUlRLFlBQVlMLFFBQVFNLFdBQVIsQ0FBb0JGLE9BQXBCLENBQWhCOztBQUVBO0FBQ0EsVUFBSUcsZ0JBQWdCLG1CQUFRQyxvQkFBUixDQUE2QkgsU0FBN0IsQ0FBcEI7O0FBRUEsYUFBT0UsYUFBUDtBQUNEOzs7aUNBRVlFLEksRUFBTTtBQUNqQixVQUFNckIsTUFBTXFCLEtBQUtDLENBQUwsQ0FBTyxNQUFQLEVBQWUsRUFBRVosT0FBTyxnQ0FBVCxFQUFmLENBQVo7O0FBRGlCO0FBQUE7QUFBQTs7QUFBQTtBQUdqQiw4QkFBaUIsS0FBS2IsZ0JBQXRCLG1JQUF3QztBQUFBLGNBQTdCVyxFQUE2Qjs7QUFDdENSLGNBQUlzQixDQUFKLENBQU0saUJBQU4sRUFBeUJkLEdBQUdlLFdBQUgsRUFBekIsRUFBMkNDLEVBQTNDO0FBQ0Q7QUFMZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFPakIsYUFBT3hCLEdBQVA7QUFDRDs7Ozs7O0FBS0h5QixPQUFPQyxPQUFQLEdBQWlCL0IsSUFBakIiLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHhtbDJqcyBmcm9tICd4bWwyanMnO1xuXG4vLyBUT0RPXG4vLyBpbXBvcnQgU294VXRpbCBmcm9tICcuL3NveF91dGlsJztcbmltcG9ydCBYbWxVdGlsIGZyb20gJy4veG1sX3V0aWwnO1xuXG5cbmNsYXNzIERhdGEge1xuXG4gIGNvbnN0cnVjdG9yKGRldmljZSwgdHJhbnNkdWNlclZhbHVlcykge1xuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIHRoaXMudHJhbnNkdWNlclZhbHVlcyA9IHRyYW5zZHVjZXJWYWx1ZXM7XG4gIH1cblxuICBnZXREZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlO1xuICB9XG5cbiAgZ2V0VHJhbnNkdWNlclZhbHVlcygpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2R1Y2VyVmFsdWVzO1xuICB9XG5cbiAgZ2V0UmF3VmFsdWVzKCkge1xuICAgIGxldCB2YWxzID0gdGhpcy5nZXRUcmFuc2R1Y2VyVmFsdWVzKCk7XG4gICAgbGV0IHJldCA9IHt9O1xuICAgIGZvciAobGV0IHYgb2YgdmFscykge1xuICAgICAgbGV0IHRpZCA9IHYuZ2V0VHJhbnNkdWNlcklkKCk7XG4gICAgICByZXRbdGlkXSA9IHYuZ2V0UmF3VmFsdWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldFR5cGVkVmFsdWVzKCkge1xuICAgIGxldCB2YWxzID0gdGhpcy5nZXRUcmFuc2R1Y2VyVmFsdWVzKCk7XG4gICAgbGV0IHJldCA9IHt9O1xuICAgIGZvciAobGV0IHYgb2YgdmFscykge1xuICAgICAgbGV0IHRpZCA9IHYuZ2V0VHJhbnNkdWNlcklkKCk7XG4gICAgICByZXRbdGlkXSA9IHYuZ2V0VHlwZWRWYWx1ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpIHtcbiAgICAvLyBidWlsZCBjb250ZW50IGZvciB4bWwyanMuQnVpbGRlclxuICAgIHZhciB0VmFsdWVzID0gdGhpcy50cmFuc2R1Y2VyVmFsdWVzLm1hcCh0diA9PiB0di5fZ2V0Q29udGVudEZvclhtbEJ1aWxkKCkpO1xuICAgIHJldHVybiB7XG4gICAgICBkZXZpY2U6IHtcbiAgICAgICAgJyQnOiB7XG4gICAgICAgICAgeG1sbnM6ICdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9zb3gnXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zZHVjZXJWYWx1ZTogdFZhbHVlc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB0b1htbFN0cmluZygpIHtcbiAgICBsZXQgYnVpbGRlciA9IG5ldyB4bWwyanMuQnVpbGRlcih7IHJlbmRlck9wdHM6IHtwcmV0dHk6IGZhbHNlfSB9KTtcbiAgICBsZXQgY29udGVudCA9IHRoaXMuX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpO1xuICAgIGxldCByYXdYbWxTdHIgPSBidWlsZGVyLmJ1aWxkT2JqZWN0KGNvbnRlbnQpO1xuXG4gICAgLy8gcmVtb3ZlIDw/eG1sIC4uLi4/PlxuICAgIGxldCB0cmltbWVkWG1sU3RyID0gWG1sVXRpbC5yZW1vdmVYbWxEZWNsYXJhdGlvbihyYXdYbWxTdHIpO1xuXG4gICAgcmV0dXJuIHRyaW1tZWRYbWxTdHI7XG4gIH1cblxuICBhcHBlbmRUb05vZGUobm9kZSkge1xuICAgIGNvbnN0IHJldCA9IG5vZGUuYygnZGF0YScsIHsgeG1sbnM6ICdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9zb3gnIH0pO1xuXG4gICAgZm9yIChjb25zdCB0diBvZiB0aGlzLnRyYW5zZHVjZXJWYWx1ZXMpIHtcbiAgICAgIHJldC5jKCd0cmFuc2R1Y2VyVmFsdWUnLCB0di5nZXRYbWxBdHRycygpKS51cCgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YTtcbiJdfQ==