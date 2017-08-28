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
  }]);

  return Data;
}();

module.exports = Data;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYXRhLmpzIl0sIm5hbWVzIjpbIkRhdGEiLCJkZXZpY2UiLCJ0cmFuc2R1Y2VyVmFsdWVzIiwidmFscyIsImdldFRyYW5zZHVjZXJWYWx1ZXMiLCJyZXQiLCJ2IiwidGlkIiwiZ2V0VHJhbnNkdWNlcklkIiwiZ2V0UmF3VmFsdWUiLCJnZXRUeXBlZFZhbHVlIiwidFZhbHVlcyIsIm1hcCIsInR2IiwiX2dldENvbnRlbnRGb3JYbWxCdWlsZCIsInhtbG5zIiwidHJhbnNkdWNlclZhbHVlIiwiYnVpbGRlciIsIkJ1aWxkZXIiLCJyZW5kZXJPcHRzIiwicHJldHR5IiwiY29udGVudCIsInJhd1htbFN0ciIsImJ1aWxkT2JqZWN0IiwidHJpbW1lZFhtbFN0ciIsInJlbW92ZVhtbERlY2xhcmF0aW9uIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUdBO0FBQ0E7OztBQUhBOzs7O0FBSUE7Ozs7Ozs7O0lBR01BLEk7QUFFSixnQkFBWUMsTUFBWixFQUFvQkMsZ0JBQXBCLEVBQXNDO0FBQUE7O0FBQ3BDLFNBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7OztnQ0FFVztBQUNWLGFBQU8sS0FBS0QsTUFBWjtBQUNEOzs7MENBRXFCO0FBQ3BCLGFBQU8sS0FBS0MsZ0JBQVo7QUFDRDs7O21DQUVjO0FBQ2IsVUFBSUMsT0FBTyxLQUFLQyxtQkFBTCxFQUFYO0FBQ0EsVUFBSUMsTUFBTSxFQUFWO0FBRmE7QUFBQTtBQUFBOztBQUFBO0FBR2IsNkJBQWNGLElBQWQsOEhBQW9CO0FBQUEsY0FBWEcsQ0FBVzs7QUFDbEIsY0FBSUMsTUFBTUQsRUFBRUUsZUFBRixFQUFWO0FBQ0FILGNBQUlFLEdBQUosSUFBV0QsRUFBRUcsV0FBRixFQUFYO0FBQ0Q7QUFOWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU9iLGFBQU9KLEdBQVA7QUFDRDs7O3FDQUVnQjtBQUNmLFVBQUlGLE9BQU8sS0FBS0MsbUJBQUwsRUFBWDtBQUNBLFVBQUlDLE1BQU0sRUFBVjtBQUZlO0FBQUE7QUFBQTs7QUFBQTtBQUdmLDhCQUFjRixJQUFkLG1JQUFvQjtBQUFBLGNBQVhHLENBQVc7O0FBQ2xCLGNBQUlDLE1BQU1ELEVBQUVFLGVBQUYsRUFBVjtBQUNBSCxjQUFJRSxHQUFKLElBQVdELEVBQUVJLGFBQUYsRUFBWDtBQUNEO0FBTmM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFPZixhQUFPTCxHQUFQO0FBQ0Q7Ozs2Q0FFd0I7QUFDdkI7QUFDQSxVQUFJTSxVQUFVLEtBQUtULGdCQUFMLENBQXNCVSxHQUF0QixDQUEwQjtBQUFBLGVBQU1DLEdBQUdDLHNCQUFILEVBQU47QUFBQSxPQUExQixDQUFkO0FBQ0EsYUFBTztBQUNMYixnQkFBUTtBQUNOLGVBQUs7QUFDSGMsbUJBQU87QUFESixXQURDO0FBSU5DLDJCQUFpQkw7QUFKWDtBQURILE9BQVA7QUFRRDs7O2tDQUVhO0FBQ1osVUFBSU0sVUFBVSxJQUFJLGlCQUFPQyxPQUFYLENBQW1CLEVBQUVDLFlBQVksRUFBQ0MsUUFBUSxLQUFULEVBQWQsRUFBbkIsQ0FBZDtBQUNBLFVBQUlDLFVBQVUsS0FBS1Asc0JBQUwsRUFBZDtBQUNBLFVBQUlRLFlBQVlMLFFBQVFNLFdBQVIsQ0FBb0JGLE9BQXBCLENBQWhCOztBQUVBO0FBQ0EsVUFBSUcsZ0JBQWdCLG1CQUFRQyxvQkFBUixDQUE2QkgsU0FBN0IsQ0FBcEI7O0FBRUEsYUFBT0UsYUFBUDtBQUNEOzs7Ozs7QUFLSEUsT0FBT0MsT0FBUCxHQUFpQjNCLElBQWpCIiwiZmlsZSI6ImRhdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB4bWwyanMgZnJvbSAneG1sMmpzJztcblxuLy8gVE9ET1xuLy8gaW1wb3J0IFNveFV0aWwgZnJvbSAnLi9zb3hfdXRpbCc7XG5pbXBvcnQgWG1sVXRpbCBmcm9tICcuL3htbF91dGlsJztcblxuXG5jbGFzcyBEYXRhIHtcblxuICBjb25zdHJ1Y3RvcihkZXZpY2UsIHRyYW5zZHVjZXJWYWx1ZXMpIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLnRyYW5zZHVjZXJWYWx1ZXMgPSB0cmFuc2R1Y2VyVmFsdWVzO1xuICB9XG5cbiAgZ2V0RGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLmRldmljZTtcbiAgfVxuXG4gIGdldFRyYW5zZHVjZXJWYWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNkdWNlclZhbHVlcztcbiAgfVxuXG4gIGdldFJhd1ZhbHVlcygpIHtcbiAgICBsZXQgdmFscyA9IHRoaXMuZ2V0VHJhbnNkdWNlclZhbHVlcygpO1xuICAgIGxldCByZXQgPSB7fTtcbiAgICBmb3IgKGxldCB2IG9mIHZhbHMpIHtcbiAgICAgIGxldCB0aWQgPSB2LmdldFRyYW5zZHVjZXJJZCgpO1xuICAgICAgcmV0W3RpZF0gPSB2LmdldFJhd1ZhbHVlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBnZXRUeXBlZFZhbHVlcygpIHtcbiAgICBsZXQgdmFscyA9IHRoaXMuZ2V0VHJhbnNkdWNlclZhbHVlcygpO1xuICAgIGxldCByZXQgPSB7fTtcbiAgICBmb3IgKGxldCB2IG9mIHZhbHMpIHtcbiAgICAgIGxldCB0aWQgPSB2LmdldFRyYW5zZHVjZXJJZCgpO1xuICAgICAgcmV0W3RpZF0gPSB2LmdldFR5cGVkVmFsdWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIF9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSB7XG4gICAgLy8gYnVpbGQgY29udGVudCBmb3IgeG1sMmpzLkJ1aWxkZXJcbiAgICB2YXIgdFZhbHVlcyA9IHRoaXMudHJhbnNkdWNlclZhbHVlcy5tYXAodHYgPT4gdHYuX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGV2aWNlOiB7XG4gICAgICAgICckJzoge1xuICAgICAgICAgIHhtbG5zOiAnaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvc294J1xuICAgICAgICB9LFxuICAgICAgICB0cmFuc2R1Y2VyVmFsdWU6IHRWYWx1ZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdG9YbWxTdHJpbmcoKSB7XG4gICAgbGV0IGJ1aWxkZXIgPSBuZXcgeG1sMmpzLkJ1aWxkZXIoeyByZW5kZXJPcHRzOiB7cHJldHR5OiBmYWxzZX0gfSk7XG4gICAgbGV0IGNvbnRlbnQgPSB0aGlzLl9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKTtcbiAgICBsZXQgcmF3WG1sU3RyID0gYnVpbGRlci5idWlsZE9iamVjdChjb250ZW50KTtcblxuICAgIC8vIHJlbW92ZSA8P3htbCAuLi4uPz5cbiAgICBsZXQgdHJpbW1lZFhtbFN0ciA9IFhtbFV0aWwucmVtb3ZlWG1sRGVjbGFyYXRpb24ocmF3WG1sU3RyKTtcblxuICAgIHJldHVybiB0cmltbWVkWG1sU3RyO1xuICB9XG5cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGE7XG4iXX0=