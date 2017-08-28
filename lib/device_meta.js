'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _xml_util = require('./xml_util');

var _xml_util2 = _interopRequireDefault(_xml_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      var builder = new _xml2js2.default.Builder({ renderOpts: { pretty: false } });
      var content = this._getContentForXmlBuild();
      var rawXmlStr = builder.buildObject(content);

      // remove <?xml ....?>
      var trimmedXmlStr = _xml_util2.default.removeXmlDeclaration(rawXmlStr);

      return trimmedXmlStr;
    }
  }]);

  return DeviceMeta;
}();

module.exports = DeviceMeta;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZpY2VfbWV0YS5qcyJdLCJuYW1lcyI6WyJEZXZpY2VNZXRhIiwiZGV2aWNlIiwiZGV2aWNlSWQiLCJkZXZpY2VUeXBlIiwic2VyaWFsTnVtYmVyIiwibWV0YVRyYW5zZHVjZXJzIiwiZ2V0RGV2aWNlIiwiZ2V0TmFtZSIsInRNZXRhcyIsIm1hcCIsIm10diIsIl9nZXRDb250ZW50Rm9yWG1sQnVpbGQiLCJ4bWxucyIsIm5hbWUiLCJpZCIsInR5cGUiLCJ0cmFuc2R1Y2VyIiwiYnVpbGRlciIsIkJ1aWxkZXIiLCJyZW5kZXJPcHRzIiwicHJldHR5IiwiY29udGVudCIsInJhd1htbFN0ciIsImJ1aWxkT2JqZWN0IiwidHJpbW1lZFhtbFN0ciIsInJlbW92ZVhtbERlY2xhcmF0aW9uIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7O0lBRU1BLFU7QUFFSixzQkFBWUMsTUFBWixFQUFvQkMsUUFBcEIsRUFBOEJDLFVBQTlCLEVBQTBDQyxZQUExQyxFQUF3REMsZUFBeEQsRUFBeUU7QUFBQTs7QUFDdkUsU0FBS0osTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLFlBQUwsR0FBb0JBLFlBQXBCO0FBQ0EsU0FBS0MsZUFBTCxHQUF1QkEsZUFBdkI7QUFDRDs7OztnQ0FFVztBQUNWLGFBQU8sS0FBS0osTUFBWjtBQUNEOzs7OEJBRVM7QUFDUixhQUFPLEtBQUtLLFNBQUwsR0FBaUJDLE9BQWpCLEVBQVA7QUFDRDs7OzRCQUVPO0FBQ04sYUFBTyxLQUFLTCxRQUFaO0FBQ0Q7Ozs4QkFFUztBQUNSLGFBQU8sS0FBS0MsVUFBWjtBQUNEOzs7c0NBRWlCO0FBQ2hCLGFBQU8sS0FBS0MsWUFBWjtBQUNEOzs7eUNBRW9CO0FBQ25CLGFBQU8sS0FBS0MsZUFBWjtBQUNEOzs7NkNBRXdCO0FBQ3ZCO0FBQ0EsVUFBSUcsU0FBUyxLQUFLSCxlQUFMLENBQXFCSSxHQUFyQixDQUF5QjtBQUFBLGVBQU9DLElBQUlDLHNCQUFKLEVBQVA7QUFBQSxPQUF6QixDQUFiO0FBQ0EsYUFBTztBQUNMVixnQkFBUTtBQUNOLGVBQUs7QUFDSFcsbUJBQU8sZ0NBREo7QUFFSEMsa0JBQU0sS0FBS04sT0FBTCxFQUZIO0FBR0hPLGdCQUFJLEtBQUtaLFFBSE47QUFJSGEsa0JBQU0sS0FBS1osVUFKUjtBQUtIQywwQkFBYyxLQUFLQTtBQUxoQixXQURDO0FBUU5ZLHNCQUFZUjtBQVJOO0FBREgsT0FBUDtBQVlEOzs7a0NBRWE7QUFDWixVQUFJUyxVQUFVLElBQUksaUJBQU9DLE9BQVgsQ0FBbUIsRUFBRUMsWUFBWSxFQUFDQyxRQUFRLEtBQVQsRUFBZCxFQUFuQixDQUFkO0FBQ0EsVUFBSUMsVUFBVSxLQUFLVixzQkFBTCxFQUFkO0FBQ0EsVUFBSVcsWUFBWUwsUUFBUU0sV0FBUixDQUFvQkYsT0FBcEIsQ0FBaEI7O0FBRUE7QUFDQSxVQUFJRyxnQkFBZ0IsbUJBQVFDLG9CQUFSLENBQTZCSCxTQUE3QixDQUFwQjs7QUFFQSxhQUFPRSxhQUFQO0FBQ0Q7Ozs7OztBQUlIRSxPQUFPQyxPQUFQLEdBQWlCM0IsVUFBakIiLCJmaWxlIjoiZGV2aWNlX21ldGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeG1sMmpzIGZyb20gJ3htbDJqcyc7XG5pbXBvcnQgWG1sVXRpbCBmcm9tICcuL3htbF91dGlsJztcblxuY2xhc3MgRGV2aWNlTWV0YSB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlLCBkZXZpY2VJZCwgZGV2aWNlVHlwZSwgc2VyaWFsTnVtYmVyLCBtZXRhVHJhbnNkdWNlcnMpIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLmRldmljZUlkID0gZGV2aWNlSWQ7XG4gICAgdGhpcy5kZXZpY2VUeXBlID0gZGV2aWNlVHlwZTtcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IHNlcmlhbE51bWJlcjtcbiAgICB0aGlzLm1ldGFUcmFuc2R1Y2VycyA9IG1ldGFUcmFuc2R1Y2VycztcbiAgfVxuXG4gIGdldERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2U7XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldERldmljZSgpLmdldE5hbWUoKTtcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIHJldHVybiB0aGlzLmRldmljZUlkO1xuICB9XG5cbiAgZ2V0VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2VUeXBlO1xuICB9XG5cbiAgZ2V0U2VyaWFsTnVtYmVyKCkge1xuICAgIHJldHVybiB0aGlzLnNlcmlhbE51bWJlcjtcbiAgfVxuXG4gIGdldE1ldGFUcmFuc2R1Y2VycygpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRhVHJhbnNkdWNlcnM7XG4gIH1cblxuICBfZ2V0Q29udGVudEZvclhtbEJ1aWxkKCkge1xuICAgIC8vIGJ1aWxkIGNvbnRlbnQgZm9yIHhtbDJqcy5CdWlsZGVyXG4gICAgdmFyIHRNZXRhcyA9IHRoaXMubWV0YVRyYW5zZHVjZXJzLm1hcChtdHYgPT4gbXR2Ll9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRldmljZToge1xuICAgICAgICAnJCc6IHtcbiAgICAgICAgICB4bWxuczogJ2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3NveCcsXG4gICAgICAgICAgbmFtZTogdGhpcy5nZXROYW1lKCksXG4gICAgICAgICAgaWQ6IHRoaXMuZGV2aWNlSWQsXG4gICAgICAgICAgdHlwZTogdGhpcy5kZXZpY2VUeXBlLFxuICAgICAgICAgIHNlcmlhbE51bWJlcjogdGhpcy5zZXJpYWxOdW1iZXJcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNkdWNlcjogdE1ldGFzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHRvWG1sU3RyaW5nKCkge1xuICAgIGxldCBidWlsZGVyID0gbmV3IHhtbDJqcy5CdWlsZGVyKHsgcmVuZGVyT3B0czoge3ByZXR0eTogZmFsc2V9IH0pO1xuICAgIGxldCBjb250ZW50ID0gdGhpcy5fZ2V0Q29udGVudEZvclhtbEJ1aWxkKCk7XG4gICAgbGV0IHJhd1htbFN0ciA9IGJ1aWxkZXIuYnVpbGRPYmplY3QoY29udGVudCk7XG5cbiAgICAvLyByZW1vdmUgPD94bWwgLi4uLj8+XG4gICAgbGV0IHRyaW1tZWRYbWxTdHIgPSBYbWxVdGlsLnJlbW92ZVhtbERlY2xhcmF0aW9uKHJhd1htbFN0cik7XG5cbiAgICByZXR1cm4gdHJpbW1lZFhtbFN0cjtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGV2aWNlTWV0YTtcbiJdfQ==