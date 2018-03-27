'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import XmlUtil from './xml_util';

var _xmlDeclarePatStr = "^<\\?xml[^>]+?>";
var _xmlDeclarePat = new RegExp(_xmlDeclarePatStr);

var DeviceMeta = function () {
  function DeviceMeta(device, deviceId, deviceType, serialNumber, metaTransducers) {
    _classCallCheck(this, DeviceMeta);

    this.device = device;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.serialNumber = serialNumber;
    this.metaTransducers = metaTransducers;
  }

  _createClass(DeviceMeta, [{
    key: 'getXmlAttrs',
    value: function getXmlAttrs() {
      return {
        id: this.deviceId,
        type: this.deviceType,
        serialNumber: this.serialNumber,
        name: this.device.getName(),
        xmlns: 'http://jabber.org/protocol/sox'
      };
    }
  }, {
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.getDevice().getName();
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this.deviceId;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return this.deviceType;
    }
  }, {
    key: 'getSerialNumber',
    value: function getSerialNumber() {
      return this.serialNumber;
    }
  }, {
    key: 'getMetaTransducers',
    value: function getMetaTransducers() {
      return this.metaTransducers;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      var tMetas = this.metaTransducers.map(function (mtv) {
        return mtv._getContentForXmlBuild();
      });
      return {
        device: {
          '$': {
            xmlns: 'http://jabber.org/protocol/sox',
            name: this.getName(),
            id: this.deviceId,
            type: this.deviceType,
            serialNumber: this.serialNumber
          },
          transducer: tMetas
        }
      };
    }
  }, {
    key: 'toXmlString',
    value: function toXmlString() {
      // import XmlUtil from './xml_util';
      var builder = new _xml2js2.default.Builder({ renderOpts: { pretty: false } });
      var content = this._getContentForXmlBuild();
      var rawXmlStr = builder.buildObject(content);

      // remove <?xml ....?>
      // let trimmedXmlStr = XmlUtil.removeXmlDeclaration(rawXmlStr);
      var trimmedXmlStr = rawXmlStr.replace(_xmlDeclarePat, "");

      return trimmedXmlStr;
    }
  }, {
    key: 'appendToNode',
    value: function appendToNode(node) {
      // used when publish
      var ret = node.c('device', this.getXmlAttrs());

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.metaTransducers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tdr = _step.value;

          ret.c('transducer', tdr.getXmlAttrs()).up();
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
  }]);

  return DeviceMeta;
}();

module.exports = DeviceMeta;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZpY2VfbWV0YS5qcyJdLCJuYW1lcyI6WyJfeG1sRGVjbGFyZVBhdFN0ciIsIl94bWxEZWNsYXJlUGF0IiwiUmVnRXhwIiwiRGV2aWNlTWV0YSIsImRldmljZSIsImRldmljZUlkIiwiZGV2aWNlVHlwZSIsInNlcmlhbE51bWJlciIsIm1ldGFUcmFuc2R1Y2VycyIsImlkIiwidHlwZSIsIm5hbWUiLCJnZXROYW1lIiwieG1sbnMiLCJnZXREZXZpY2UiLCJ0TWV0YXMiLCJtYXAiLCJtdHYiLCJfZ2V0Q29udGVudEZvclhtbEJ1aWxkIiwidHJhbnNkdWNlciIsImJ1aWxkZXIiLCJCdWlsZGVyIiwicmVuZGVyT3B0cyIsInByZXR0eSIsImNvbnRlbnQiLCJyYXdYbWxTdHIiLCJidWlsZE9iamVjdCIsInRyaW1tZWRYbWxTdHIiLCJyZXBsYWNlIiwibm9kZSIsInJldCIsImMiLCJnZXRYbWxBdHRycyIsInRkciIsInVwIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7OztBQUNBOztBQUVBLElBQU1BLG9CQUFvQixpQkFBMUI7QUFDQSxJQUFNQyxpQkFBaUIsSUFBSUMsTUFBSixDQUFXRixpQkFBWCxDQUF2Qjs7SUFFTUcsVTtBQUVKLHNCQUFZQyxNQUFaLEVBQW9CQyxRQUFwQixFQUE4QkMsVUFBOUIsRUFBMENDLFlBQTFDLEVBQXdEQyxlQUF4RCxFQUF5RTtBQUFBOztBQUN2RSxTQUFLSixNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFNBQUtDLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNEOzs7O2tDQUVhO0FBQ1osYUFBTztBQUNMQyxZQUFJLEtBQUtKLFFBREo7QUFFTEssY0FBTSxLQUFLSixVQUZOO0FBR0xDLHNCQUFjLEtBQUtBLFlBSGQ7QUFJTEksY0FBTSxLQUFLUCxNQUFMLENBQVlRLE9BQVosRUFKRDtBQUtMQyxlQUFPO0FBTEYsT0FBUDtBQU9EOzs7Z0NBRVc7QUFDVixhQUFPLEtBQUtULE1BQVo7QUFDRDs7OzhCQUVTO0FBQ1IsYUFBTyxLQUFLVSxTQUFMLEdBQWlCRixPQUFqQixFQUFQO0FBQ0Q7Ozs0QkFFTztBQUNOLGFBQU8sS0FBS1AsUUFBWjtBQUNEOzs7OEJBRVM7QUFDUixhQUFPLEtBQUtDLFVBQVo7QUFDRDs7O3NDQUVpQjtBQUNoQixhQUFPLEtBQUtDLFlBQVo7QUFDRDs7O3lDQUVvQjtBQUNuQixhQUFPLEtBQUtDLGVBQVo7QUFDRDs7OzZDQUV3QjtBQUN2QjtBQUNBLFVBQUlPLFNBQVMsS0FBS1AsZUFBTCxDQUFxQlEsR0FBckIsQ0FBeUI7QUFBQSxlQUFPQyxJQUFJQyxzQkFBSixFQUFQO0FBQUEsT0FBekIsQ0FBYjtBQUNBLGFBQU87QUFDTGQsZ0JBQVE7QUFDTixlQUFLO0FBQ0hTLG1CQUFPLGdDQURKO0FBRUhGLGtCQUFNLEtBQUtDLE9BQUwsRUFGSDtBQUdISCxnQkFBSSxLQUFLSixRQUhOO0FBSUhLLGtCQUFNLEtBQUtKLFVBSlI7QUFLSEMsMEJBQWMsS0FBS0E7QUFMaEIsV0FEQztBQVFOWSxzQkFBWUo7QUFSTjtBQURILE9BQVA7QUFZRDs7O2tDQUVhO0FBQ1o7QUFDQSxVQUFNSyxVQUFVLElBQUksaUJBQU9DLE9BQVgsQ0FBbUIsRUFBRUMsWUFBWSxFQUFDQyxRQUFRLEtBQVQsRUFBZCxFQUFuQixDQUFoQjtBQUNBLFVBQU1DLFVBQVUsS0FBS04sc0JBQUwsRUFBaEI7QUFDQSxVQUFNTyxZQUFZTCxRQUFRTSxXQUFSLENBQW9CRixPQUFwQixDQUFsQjs7QUFFQTtBQUNBO0FBQ0EsVUFBTUcsZ0JBQWdCRixVQUFVRyxPQUFWLENBQWtCM0IsY0FBbEIsRUFBa0MsRUFBbEMsQ0FBdEI7O0FBRUEsYUFBTzBCLGFBQVA7QUFDRDs7O2lDQUVZRSxJLEVBQU07QUFDakI7QUFDQSxVQUFNQyxNQUFNRCxLQUFLRSxDQUFMLENBQU8sUUFBUCxFQUFpQixLQUFLQyxXQUFMLEVBQWpCLENBQVo7O0FBRmlCO0FBQUE7QUFBQTs7QUFBQTtBQUlqQiw2QkFBa0IsS0FBS3hCLGVBQXZCLDhIQUF3QztBQUFBLGNBQTdCeUIsR0FBNkI7O0FBQ3RDSCxjQUFJQyxDQUFKLENBQU0sWUFBTixFQUFvQkUsSUFBSUQsV0FBSixFQUFwQixFQUF1Q0UsRUFBdkM7QUFDRDtBQU5nQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVFqQixhQUFPSixHQUFQO0FBQ0Q7Ozs7OztBQUlISyxPQUFPQyxPQUFQLEdBQWlCakMsVUFBakIiLCJmaWxlIjoiZGV2aWNlX21ldGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeG1sMmpzIGZyb20gJ3htbDJqcyc7XG4vLyBpbXBvcnQgWG1sVXRpbCBmcm9tICcuL3htbF91dGlsJztcblxuY29uc3QgX3htbERlY2xhcmVQYXRTdHIgPSBcIl48XFxcXD94bWxbXj5dKz8+XCI7XG5jb25zdCBfeG1sRGVjbGFyZVBhdCA9IG5ldyBSZWdFeHAoX3htbERlY2xhcmVQYXRTdHIpO1xuXG5jbGFzcyBEZXZpY2VNZXRhIHtcblxuICBjb25zdHJ1Y3RvcihkZXZpY2UsIGRldmljZUlkLCBkZXZpY2VUeXBlLCBzZXJpYWxOdW1iZXIsIG1ldGFUcmFuc2R1Y2Vycykge1xuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIHRoaXMuZGV2aWNlSWQgPSBkZXZpY2VJZDtcbiAgICB0aGlzLmRldmljZVR5cGUgPSBkZXZpY2VUeXBlO1xuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gc2VyaWFsTnVtYmVyO1xuICAgIHRoaXMubWV0YVRyYW5zZHVjZXJzID0gbWV0YVRyYW5zZHVjZXJzO1xuICB9XG5cbiAgZ2V0WG1sQXR0cnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmRldmljZUlkLFxuICAgICAgdHlwZTogdGhpcy5kZXZpY2VUeXBlLFxuICAgICAgc2VyaWFsTnVtYmVyOiB0aGlzLnNlcmlhbE51bWJlcixcbiAgICAgIG5hbWU6IHRoaXMuZGV2aWNlLmdldE5hbWUoKSxcbiAgICAgIHhtbG5zOiAnaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvc294J1xuICAgIH07XG4gIH1cblxuICBnZXREZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlO1xuICB9XG5cbiAgZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREZXZpY2UoKS5nZXROYW1lKCk7XG4gIH1cblxuICBnZXRJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2VJZDtcbiAgfVxuXG4gIGdldFR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlVHlwZTtcbiAgfVxuXG4gIGdldFNlcmlhbE51bWJlcigpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJpYWxOdW1iZXI7XG4gIH1cblxuICBnZXRNZXRhVHJhbnNkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0YVRyYW5zZHVjZXJzO1xuICB9XG5cbiAgX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpIHtcbiAgICAvLyBidWlsZCBjb250ZW50IGZvciB4bWwyanMuQnVpbGRlclxuICAgIHZhciB0TWV0YXMgPSB0aGlzLm1ldGFUcmFuc2R1Y2Vycy5tYXAobXR2ID0+IG10di5fZ2V0Q29udGVudEZvclhtbEJ1aWxkKCkpO1xuICAgIHJldHVybiB7XG4gICAgICBkZXZpY2U6IHtcbiAgICAgICAgJyQnOiB7XG4gICAgICAgICAgeG1sbnM6ICdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9zb3gnLFxuICAgICAgICAgIG5hbWU6IHRoaXMuZ2V0TmFtZSgpLFxuICAgICAgICAgIGlkOiB0aGlzLmRldmljZUlkLFxuICAgICAgICAgIHR5cGU6IHRoaXMuZGV2aWNlVHlwZSxcbiAgICAgICAgICBzZXJpYWxOdW1iZXI6IHRoaXMuc2VyaWFsTnVtYmVyXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zZHVjZXI6IHRNZXRhc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB0b1htbFN0cmluZygpIHtcbiAgICAvLyBpbXBvcnQgWG1sVXRpbCBmcm9tICcuL3htbF91dGlsJztcbiAgICBjb25zdCBidWlsZGVyID0gbmV3IHhtbDJqcy5CdWlsZGVyKHsgcmVuZGVyT3B0czoge3ByZXR0eTogZmFsc2V9IH0pO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLl9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKTtcbiAgICBjb25zdCByYXdYbWxTdHIgPSBidWlsZGVyLmJ1aWxkT2JqZWN0KGNvbnRlbnQpO1xuXG4gICAgLy8gcmVtb3ZlIDw/eG1sIC4uLi4/PlxuICAgIC8vIGxldCB0cmltbWVkWG1sU3RyID0gWG1sVXRpbC5yZW1vdmVYbWxEZWNsYXJhdGlvbihyYXdYbWxTdHIpO1xuICAgIGNvbnN0IHRyaW1tZWRYbWxTdHIgPSByYXdYbWxTdHIucmVwbGFjZShfeG1sRGVjbGFyZVBhdCwgXCJcIik7XG5cbiAgICByZXR1cm4gdHJpbW1lZFhtbFN0cjtcbiAgfVxuXG4gIGFwcGVuZFRvTm9kZShub2RlKSB7XG4gICAgLy8gdXNlZCB3aGVuIHB1Ymxpc2hcbiAgICBjb25zdCByZXQgPSBub2RlLmMoJ2RldmljZScsIHRoaXMuZ2V0WG1sQXR0cnMoKSk7XG5cbiAgICBmb3IgKGNvbnN0IHRkciBvZiB0aGlzLm1ldGFUcmFuc2R1Y2Vycykge1xuICAgICAgcmV0LmMoJ3RyYW5zZHVjZXInLCB0ZHIuZ2V0WG1sQXR0cnMoKSkudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZXZpY2VNZXRhO1xuIl19