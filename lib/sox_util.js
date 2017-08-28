"use strict";

var _xml2js = require("xml2js");

var _xml2js2 = _interopRequireDefault(_xml2js);

var _data = require("./data");

var _data2 = _interopRequireDefault(_data);

var _transducer_value = require("./transducer_value");

var _transducer_value2 = _interopRequireDefault(_transducer_value);

var _device_meta = require("./device_meta");

var _device_meta2 = _interopRequireDefault(_device_meta);

var _meta_transducer = require("./meta_transducer");

var _meta_transducer2 = _interopRequireDefault(_meta_transducer);

var _device = require("./device");

var _device2 = _interopRequireDefault(_device);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SoxUtil = {

  parseTimestamp: function parseTimestamp(timestampStr) {
    return new Date(timestampStr);
  },

  extractDevices: function extractDevices(soxConn, entry, callback) {
    var xml = entry.toString();
    _xml2js2.default.parseString(xml, function (error, result) {

      // console.log("parseString error: " + error);

      var iqTag = result.iq;
      var queryTag = iqTag.query[0];
      var itemTags = queryTag.item;

      // if both "_meta" and "_data" exists, it should be sox device
      var nodeCheck = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = itemTags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var itemTag = _step.value;

          var itemAttrs = itemTag.$;
          var node = itemAttrs.node;

          if (SoxUtil.endsWithMeta(node)) {
            var deviceName = SoxUtil.cutMetaSuffix(node);
            if (nodeCheck[deviceName] === undefined) {
              nodeCheck[deviceName] = {};
            }
            nodeCheck[deviceName].meta = true;
          } else if (SoxUtil.endsWithData(node)) {
            var deviceName = SoxUtil.cutDataSuffix(node);
            if (nodeCheck[deviceName] === undefined) {
              nodeCheck[deviceName] = {};
            }
            nodeCheck[deviceName].data = true;
          }
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

      var devices = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(nodeCheck)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _deviceName = _step2.value;

          var check = nodeCheck[_deviceName];
          if (check.meta && check.data) {
            var device = soxConn.bind(_deviceName);
            devices.push(device);
          }
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

      callback(devices);
    });
  },

  endsWithMeta: function endsWithMeta(nodeName) {
    var len = nodeName.length;
    return 5 <= len && nodeName.substring(len - 5, len) === "_meta";
  },

  endsWithData: function endsWithData(nodeName) {
    var len = nodeName.length;
    return 5 <= len && nodeName.substring(len - 5, len) === "_data";
  },

  cutMetaSuffix: function cutMetaSuffix(nodeName) {
    if (!SoxUtil.endsWithMeta(nodeName)) {
      return nodeName;
    }
    return nodeName.substr(0, nodeName.length - 5);
  },

  cutDataSuffix: function cutDataSuffix(nodeName) {
    if (!SoxUtil.endsWithData(nodeName)) {
      return nodeName;
    }
    return nodeName.substr(0, nodeName.length - 5);
  },

  // parseDataPayload: (entry, deviceToBind, callback) => {
  //   let xml = entry.toString();
  //   xml2js.parseString(xml, (err, result) => {
  //     let dataTag = result.data;
  //     let transducerValueTags = dataTag.transducerValue;
  //     let values = [];
  //     for (let tValueTag of transducerValueTags) {
  //       let vAttrs = tValueTag.$;
  //       let vId = vAttrs.id;
  //       let vRaw = vAttrs.rawValue || null;
  //       let vTyped = vAttrs.typedValue || null;
  //       let vTimestamp = SoxUtil.parseTimestamp(vAttrs.timestamp);
  //
  //       let tValue = new TransducerValue(vId, vRaw, vTyped, vTimestamp);
  //       values.push(tValue);
  //     }
  //
  //     let data = new Data(deviceToBind, values);
  //     // let data = new DataModule.Data(deviceToBind, values);
  //     callback(data);
  //   });
  // },

  parseDataPayload: function parseDataPayload(soxConn, entry, callback) {
    var messageTag = entry;
    var eventTag = entry._childNodesList[0];
    var itemsTag = eventTag._childNodesList[0];
    var itemTag = itemsTag._childNodesList[0];
    var dataTag = itemTag._childNodesList[0];
    var tdrTags = dataTag._childNodesList;

    var messageTagAttrs = messageTag._attributes;
    var service = messageTagAttrs['from']._valueForAttrModified;
    var domain = service.substring(7); // sox...
    // console.log('### parseDataPayload: domain = ' + domain);

    var itemsTagAttrs = itemsTag._attributes;
    var node = itemsTagAttrs['node']._valueForAttrModified;
    // console.log('### parseDataPayload: node = ' + node);
    var deviceName = SoxUtil.cutDataSuffix(node);
    // console.log('### parseDataPayload: deviceName = ' + deviceName);

    var deviceToBind = new _device2.default(soxConn, deviceName, domain);

    var values = [];

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = tdrTags[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var tdrTag = _step3.value;

        var tagName = tdrTag._localName;
        if (tagName !== 'transducerValue') {
          // console.log('### tagName !== transducerValue, skipping: name=' + tagName);
          continue;
        }
        // console.log('### examine tag=' + tagName);

        // let attrs = tdrTag._valueForAttrModified;
        var attrs = tdrTag._attributes;
        var attrNames = Object.keys(attrs);
        // console.log('### attrNames=' + JSON.stringify(attrNames));

        var transducerId = attrs['id']._valueForAttrModified;
        var rawValue = attrs['rawValue']._valueForAttrModified;
        var typedValue = attrs['typedValue']._valueForAttrModified;
        var timestamp = attrs['timestamp']._valueForAttrModified;

        if (timestamp) {
          timestamp = Date.parse(timestamp);
        }

        var value = new _transducer_value2.default(transducerId, rawValue, typedValue, timestamp);
        values.push(value);
        // console.log('### parseDataPayload: added transducer value: id=' + transducerId);
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

    var data = new _data2.default(deviceToBind, values);
    return data;
  },

  parseMetaPayload: function parseMetaPayload(entry, deviceToBind, callback) {
    var xml = entry.toString();
    _xml2js2.default.parseString(xml, function (err, result) {
      var deviceTag = result.device;
      var dAttrs = deviceTag.$;

      var dName = dAttrs.name;
      var dId = dAttrs.id;
      var dType = dAttrs.type;
      var dSerialNumber = dAttrs.serialNumber;

      var metaTransducers = [];
      var transducerTags = deviceTag.transducer;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = transducerTags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tTag = _step4.value;

          var tAttrs = tTag.$;

          var tName = tAttrs.name;
          var tId = tAttrs.id;
          var tCanActuate = (tAttrs.canActuate || "false") === "true";
          var tHasOwnNode = (tAttrs.hasOwnNode || "false") === "true";
          var tUnits = tAttrs.units || null;
          var tUnitScalar = tAttrs.unitScalar || null;
          var tMinValue = tAttrs.minValue || null;
          var tMaxValue = tAttrs.maxValue || null;
          var tResolution = tAttrs.resolution || null;

          var transducer = new _meta_transducer2.default(deviceToBind, tName, tId, tCanActuate, tHasOwnNode, tUnits, tUnitScalar, tMinValue, tMaxValue, tResolution);

          metaTransducers.push(transducer);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var meta = new _device_meta2.default(deviceToBind, dId, dType, dSerialNumber, metaTransducers);
      callback(meta);
    });
  }

};

// import * as DataModule from "./data";
// import Data as SoxData from "./data";


module.exports = SoxUtil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfdXRpbC5qcyJdLCJuYW1lcyI6WyJTb3hVdGlsIiwicGFyc2VUaW1lc3RhbXAiLCJ0aW1lc3RhbXBTdHIiLCJEYXRlIiwiZXh0cmFjdERldmljZXMiLCJzb3hDb25uIiwiZW50cnkiLCJjYWxsYmFjayIsInhtbCIsInRvU3RyaW5nIiwicGFyc2VTdHJpbmciLCJlcnJvciIsInJlc3VsdCIsImlxVGFnIiwiaXEiLCJxdWVyeVRhZyIsInF1ZXJ5IiwiaXRlbVRhZ3MiLCJpdGVtIiwibm9kZUNoZWNrIiwiaXRlbVRhZyIsIml0ZW1BdHRycyIsIiQiLCJub2RlIiwiZW5kc1dpdGhNZXRhIiwiZGV2aWNlTmFtZSIsImN1dE1ldGFTdWZmaXgiLCJ1bmRlZmluZWQiLCJtZXRhIiwiZW5kc1dpdGhEYXRhIiwiY3V0RGF0YVN1ZmZpeCIsImRhdGEiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoZWNrIiwiZGV2aWNlIiwiYmluZCIsInB1c2giLCJub2RlTmFtZSIsImxlbiIsImxlbmd0aCIsInN1YnN0cmluZyIsInN1YnN0ciIsInBhcnNlRGF0YVBheWxvYWQiLCJtZXNzYWdlVGFnIiwiZXZlbnRUYWciLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtc1RhZyIsImRhdGFUYWciLCJ0ZHJUYWdzIiwibWVzc2FnZVRhZ0F0dHJzIiwiX2F0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiX3ZhbHVlRm9yQXR0ck1vZGlmaWVkIiwiZG9tYWluIiwiaXRlbXNUYWdBdHRycyIsImRldmljZVRvQmluZCIsInZhbHVlcyIsInRkclRhZyIsInRhZ05hbWUiLCJfbG9jYWxOYW1lIiwiYXR0cnMiLCJhdHRyTmFtZXMiLCJ0cmFuc2R1Y2VySWQiLCJyYXdWYWx1ZSIsInR5cGVkVmFsdWUiLCJ0aW1lc3RhbXAiLCJwYXJzZSIsInZhbHVlIiwicGFyc2VNZXRhUGF5bG9hZCIsImVyciIsImRldmljZVRhZyIsImRBdHRycyIsImROYW1lIiwibmFtZSIsImRJZCIsImlkIiwiZFR5cGUiLCJ0eXBlIiwiZFNlcmlhbE51bWJlciIsInNlcmlhbE51bWJlciIsIm1ldGFUcmFuc2R1Y2VycyIsInRyYW5zZHVjZXJUYWdzIiwidHJhbnNkdWNlciIsInRUYWciLCJ0QXR0cnMiLCJ0TmFtZSIsInRJZCIsInRDYW5BY3R1YXRlIiwiY2FuQWN0dWF0ZSIsInRIYXNPd25Ob2RlIiwiaGFzT3duTm9kZSIsInRVbml0cyIsInVuaXRzIiwidFVuaXRTY2FsYXIiLCJ1bml0U2NhbGFyIiwidE1pblZhbHVlIiwibWluVmFsdWUiLCJ0TWF4VmFsdWUiLCJtYXhWYWx1ZSIsInRSZXNvbHV0aW9uIiwicmVzb2x1dGlvbiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFJQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxJQUFJQSxVQUFVOztBQUVWQyxrQkFBZ0Isd0JBQUNDLFlBQUQsRUFBa0I7QUFDaEMsV0FBTyxJQUFJQyxJQUFKLENBQVNELFlBQVQsQ0FBUDtBQUNELEdBSlM7O0FBTVZFLGtCQUFnQix3QkFBQ0MsT0FBRCxFQUFVQyxLQUFWLEVBQWlCQyxRQUFqQixFQUE4QjtBQUM1QyxRQUFJQyxNQUFNRixNQUFNRyxRQUFOLEVBQVY7QUFDQSxxQkFBT0MsV0FBUCxDQUFtQkYsR0FBbkIsRUFBd0IsVUFBQ0csS0FBRCxFQUFRQyxNQUFSLEVBQW1COztBQUV6Qzs7QUFFQSxVQUFJQyxRQUFRRCxPQUFPRSxFQUFuQjtBQUNBLFVBQUlDLFdBQVdGLE1BQU1HLEtBQU4sQ0FBWSxDQUFaLENBQWY7QUFDQSxVQUFJQyxXQUFXRixTQUFTRyxJQUF4Qjs7QUFFQTtBQUNBLFVBQUlDLFlBQVksRUFBaEI7QUFUeUM7QUFBQTtBQUFBOztBQUFBO0FBVXpDLDZCQUFvQkYsUUFBcEIsOEhBQThCO0FBQUEsY0FBckJHLE9BQXFCOztBQUM1QixjQUFJQyxZQUFZRCxRQUFRRSxDQUF4QjtBQUNBLGNBQUlDLE9BQU9GLFVBQVVFLElBQXJCOztBQUVBLGNBQUl2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QUFsQjs7QUFFQSxjQUFJaUUsUUFBUUQsT0FBT1gsSUFBbkI7QUFDQSxjQUFJYSxNQUFNRixPQUFPVCxFQUFqQjtBQUNBLGNBQUlZLGNBQWMsQ0FBQ0gsT0FBT0ksVUFBUCxJQUFxQixPQUF0QixNQUFtQyxNQUFyRDtBQUNBLGNBQUlDLGNBQWMsQ0FBQ0wsT0FBT00sVUFBUCxJQUFxQixPQUF0QixNQUFtQyxNQUFyRDtBQUNBLGNBQUlDLFNBQVNQLE9BQU9RLEtBQVAsSUFBZ0IsSUFBN0I7QUFDQSxjQUFJQyxjQUFjVCxPQUFPVSxVQUFQLElBQXFCLElBQXZDO0FBQ0EsY0FBSUMsWUFBWVgsT0FBT1ksUUFBUCxJQUFtQixJQUFuQztBQUNBLGNBQUlDLFlBQVliLE9BQU9jLFFBQVAsSUFBbUIsSUFBbkM7QUFDQSxjQUFJQyxjQUFjZixPQUFPZ0IsVUFBUCxJQUFxQixJQUF2Qzs7QUFFQSxjQUFJbEIsYUFBYSw4QkFDZjNCLFlBRGUsRUFDRDhCLEtBREMsRUFDTUMsR0FETixFQUNXQyxXQURYLEVBQ3dCRSxXQUR4QixFQUNxQ0UsTUFEckMsRUFFZkUsV0FGZSxFQUVGRSxTQUZFLEVBRVNFLFNBRlQsRUFFb0JFLFdBRnBCLENBQWpCOztBQUlBbkIsMEJBQWdCNUMsSUFBaEIsQ0FBcUI4QyxVQUFyQjtBQUNEO0FBN0JzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQStCdkMsVUFBSXhELE9BQU8sMEJBQ1Q2QixZQURTLEVBQ0ttQixHQURMLEVBQ1VFLEtBRFYsRUFDaUJFLGFBRGpCLEVBQ2dDRSxlQURoQyxDQUFYO0FBRUEzRSxlQUFTcUIsSUFBVDtBQUNELEtBbENEO0FBbUNEOztBQTdMUyxDQUFkOztBQVRBO0FBQ0E7OztBQXlNQTJFLE9BQU9DLE9BQVAsR0FBaUJ4RyxPQUFqQiIsImZpbGUiOiJzb3hfdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB4bWwyanMgZnJvbSBcInhtbDJqc1wiO1xuXG4vLyBpbXBvcnQgKiBhcyBEYXRhTW9kdWxlIGZyb20gXCIuL2RhdGFcIjtcbi8vIGltcG9ydCBEYXRhIGFzIFNveERhdGEgZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IERhdGEgZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IFRyYW5zZHVjZXJWYWx1ZSBmcm9tIFwiLi90cmFuc2R1Y2VyX3ZhbHVlXCI7XG5pbXBvcnQgRGV2aWNlTWV0YSBmcm9tIFwiLi9kZXZpY2VfbWV0YVwiO1xuaW1wb3J0IE1ldGFUcmFuc2R1Y2VyIGZyb20gXCIuL21ldGFfdHJhbnNkdWNlclwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwiLi9kZXZpY2VcIjtcblxuXG5sZXQgU294VXRpbCA9IHtcblxuICAgIHBhcnNlVGltZXN0YW1wOiAodGltZXN0YW1wU3RyKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhdGUodGltZXN0YW1wU3RyKTtcbiAgICB9LFxuXG4gICAgZXh0cmFjdERldmljZXM6IChzb3hDb25uLCBlbnRyeSwgY2FsbGJhY2spID0+IHtcbiAgICAgIGxldCB4bWwgPSBlbnRyeS50b1N0cmluZygpO1xuICAgICAgeG1sMmpzLnBhcnNlU3RyaW5nKHhtbCwgKGVycm9yLCByZXN1bHQpID0+IHtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBhcnNlU3RyaW5nIGVycm9yOiBcIiArIGVycm9yKTtcblxuICAgICAgICBsZXQgaXFUYWcgPSByZXN1bHQuaXE7XG4gICAgICAgIGxldCBxdWVyeVRhZyA9IGlxVGFnLnF1ZXJ5WzBdO1xuICAgICAgICBsZXQgaXRlbVRhZ3MgPSBxdWVyeVRhZy5pdGVtO1xuXG4gICAgICAgIC8vIGlmIGJvdGggXCJfbWV0YVwiIGFuZCBcIl9kYXRhXCIgZXhpc3RzLCBpdCBzaG91bGQgYmUgc294IGRldmljZVxuICAgICAgICBsZXQgbm9kZUNoZWNrID0ge307XG4gICAgICAgIGZvciAobGV0IGl0ZW1UYWcgb2YgaXRlbVRhZ3MpIHtcbiAgICAgICAgICBsZXQgaXRlbUF0dHJzID0gaXRlbVRhZy4kO1xuICAgICAgICAgIGxldCBub2RlID0gaXRlbUF0dHJzLm5vZGU7XG5cbiAgICAgICAgICBpZiAoU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZSkpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VOYW1lID0gU294VXRpbC5jdXRNZXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgICAgaWYgKG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdLm1ldGEgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgICAgaWYgKG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXZpY2VzID0gW107XG4gICAgICAgIGZvciAobGV0IGRldmljZU5hbWUgb2YgT2JqZWN0LmtleXMobm9kZUNoZWNrKSkge1xuICAgICAgICAgIGxldCBjaGVjayA9IG5vZGVDaGVja1tkZXZpY2VOYW1lXTtcbiAgICAgICAgICBpZiAoY2hlY2subWV0YSAmJiBjaGVjay5kYXRhKSB7XG4gICAgICAgICAgICBsZXQgZGV2aWNlID0gc294Q29ubi5iaW5kKGRldmljZU5hbWUpO1xuICAgICAgICAgICAgZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soZGV2aWNlcyk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZW5kc1dpdGhNZXRhOiAobm9kZU5hbWUpID0+IHtcbiAgICAgIGxldCBsZW4gPSBub2RlTmFtZS5sZW5ndGg7XG4gICAgICByZXR1cm4gKDUgPD0gbGVuKSAmJiBub2RlTmFtZS5zdWJzdHJpbmcobGVuIC0gNSwgbGVuKSA9PT0gXCJfbWV0YVwiO1xuICAgIH0sXG5cbiAgICBlbmRzV2l0aERhdGE6IChub2RlTmFtZSkgPT4ge1xuICAgICAgbGV0IGxlbiA9IG5vZGVOYW1lLmxlbmd0aDtcbiAgICAgIHJldHVybiAoNSA8PSBsZW4pICYmIG5vZGVOYW1lLnN1YnN0cmluZyhsZW4gLSA1LCBsZW4pID09PSBcIl9kYXRhXCI7XG4gICAgfSxcblxuICAgIGN1dE1ldGFTdWZmaXg6IChub2RlTmFtZSkgPT4ge1xuICAgICAgaWYgKCFTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVOYW1lLnN1YnN0cigwLCBub2RlTmFtZS5sZW5ndGggLSA1KTtcbiAgICB9LFxuXG4gICAgY3V0RGF0YVN1ZmZpeDogKG5vZGVOYW1lKSA9PiB7XG4gICAgICBpZiAoIVNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGVOYW1lKSkge1xuICAgICAgICByZXR1cm4gbm9kZU5hbWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZU5hbWUuc3Vic3RyKDAsIG5vZGVOYW1lLmxlbmd0aCAtIDUpO1xuICAgIH0sXG5cbiAgICAvLyBwYXJzZURhdGFQYXlsb2FkOiAoZW50cnksIGRldmljZVRvQmluZCwgY2FsbGJhY2spID0+IHtcbiAgICAvLyAgIGxldCB4bWwgPSBlbnRyeS50b1N0cmluZygpO1xuICAgIC8vICAgeG1sMmpzLnBhcnNlU3RyaW5nKHhtbCwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgLy8gICAgIGxldCBkYXRhVGFnID0gcmVzdWx0LmRhdGE7XG4gICAgLy8gICAgIGxldCB0cmFuc2R1Y2VyVmFsdWVUYWdzID0gZGF0YVRhZy50cmFuc2R1Y2VyVmFsdWU7XG4gICAgLy8gICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAvLyAgICAgZm9yIChsZXQgdFZhbHVlVGFnIG9mIHRyYW5zZHVjZXJWYWx1ZVRhZ3MpIHtcbiAgICAvLyAgICAgICBsZXQgdkF0dHJzID0gdFZhbHVlVGFnLiQ7XG4gICAgLy8gICAgICAgbGV0IHZJZCA9IHZBdHRycy5pZDtcbiAgICAvLyAgICAgICBsZXQgdlJhdyA9IHZBdHRycy5yYXdWYWx1ZSB8fCBudWxsO1xuICAgIC8vICAgICAgIGxldCB2VHlwZWQgPSB2QXR0cnMudHlwZWRWYWx1ZSB8fCBudWxsO1xuICAgIC8vICAgICAgIGxldCB2VGltZXN0YW1wID0gU294VXRpbC5wYXJzZVRpbWVzdGFtcCh2QXR0cnMudGltZXN0YW1wKTtcbiAgICAvL1xuICAgIC8vICAgICAgIGxldCB0VmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKHZJZCwgdlJhdywgdlR5cGVkLCB2VGltZXN0YW1wKTtcbiAgICAvLyAgICAgICB2YWx1ZXMucHVzaCh0VmFsdWUpO1xuICAgIC8vICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YShkZXZpY2VUb0JpbmQsIHZhbHVlcyk7XG4gICAgLy8gICAgIC8vIGxldCBkYXRhID0gbmV3IERhdGFNb2R1bGUuRGF0YShkZXZpY2VUb0JpbmQsIHZhbHVlcyk7XG4gICAgLy8gICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcblxuICAgIHBhcnNlRGF0YVBheWxvYWQ6IChzb3hDb25uLCBlbnRyeSwgY2FsbGJhY2spID0+IHtcbiAgICAgIGxldCBtZXNzYWdlVGFnID0gZW50cnk7XG4gICAgICBsZXQgZXZlbnRUYWcgPSBlbnRyeS5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICBsZXQgaXRlbXNUYWcgPSBldmVudFRhZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICBsZXQgaXRlbVRhZyA9IGl0ZW1zVGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCBkYXRhVGFnID0gaXRlbVRhZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICBsZXQgdGRyVGFncyA9IGRhdGFUYWcuX2NoaWxkTm9kZXNMaXN0O1xuXG4gICAgICBsZXQgbWVzc2FnZVRhZ0F0dHJzID0gbWVzc2FnZVRhZy5fYXR0cmlidXRlcztcbiAgICAgIGxldCBzZXJ2aWNlID0gbWVzc2FnZVRhZ0F0dHJzWydmcm9tJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgbGV0IGRvbWFpbiA9IHNlcnZpY2Uuc3Vic3RyaW5nKDcpOyAgLy8gc294Li4uXG4gICAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IGRvbWFpbiA9ICcgKyBkb21haW4pO1xuXG4gICAgICBsZXQgaXRlbXNUYWdBdHRycyA9IGl0ZW1zVGFnLl9hdHRyaWJ1dGVzO1xuICAgICAgbGV0IG5vZGUgPSBpdGVtc1RhZ0F0dHJzWydub2RlJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBub2RlID0gJyArIG5vZGUpO1xuICAgICAgbGV0IGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IGRldmljZU5hbWUgPSAnICsgZGV2aWNlTmFtZSk7XG5cbiAgICAgIGxldCBkZXZpY2VUb0JpbmQgPSBuZXcgRGV2aWNlKHNveENvbm4sIGRldmljZU5hbWUsIGRvbWFpbik7XG5cbiAgICAgIGxldCB2YWx1ZXMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgdGRyVGFnIG9mIHRkclRhZ3MpIHtcbiAgICAgICAgbGV0IHRhZ05hbWUgPSB0ZHJUYWcuX2xvY2FsTmFtZTtcbiAgICAgICAgaWYgKHRhZ05hbWUgIT09ICd0cmFuc2R1Y2VyVmFsdWUnKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyB0YWdOYW1lICE9PSB0cmFuc2R1Y2VyVmFsdWUsIHNraXBwaW5nOiBuYW1lPScgKyB0YWdOYW1lKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnIyMjIGV4YW1pbmUgdGFnPScgKyB0YWdOYW1lKTtcblxuICAgICAgICAvLyBsZXQgYXR0cnMgPSB0ZHJUYWcuX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICBsZXQgYXR0cnMgPSB0ZHJUYWcuX2F0dHJpYnV0ZXM7XG4gICAgICAgIGxldCBhdHRyTmFtZXMgPSBPYmplY3Qua2V5cyhhdHRycyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgYXR0ck5hbWVzPScgKyBKU09OLnN0cmluZ2lmeShhdHRyTmFtZXMpKTtcblxuICAgICAgICBsZXQgdHJhbnNkdWNlcklkID0gYXR0cnNbJ2lkJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICBsZXQgcmF3VmFsdWUgPSBhdHRyc1sncmF3VmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIGxldCB0eXBlZFZhbHVlID0gYXR0cnNbJ3R5cGVkVmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBhdHRyc1sndGltZXN0YW1wJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuXG4gICAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKHRpbWVzdGFtcCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKFxuICAgICAgICAgIHRyYW5zZHVjZXJJZCwgcmF3VmFsdWUsIHR5cGVkVmFsdWUsIHRpbWVzdGFtcCk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBhZGRlZCB0cmFuc2R1Y2VyIHZhbHVlOiBpZD0nICsgdHJhbnNkdWNlcklkKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YShkZXZpY2VUb0JpbmQsIHZhbHVlcyk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgcGFyc2VNZXRhUGF5bG9hZDogKGVudHJ5LCBkZXZpY2VUb0JpbmQsIGNhbGxiYWNrKSA9PiB7XG4gICAgICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICBsZXQgZGV2aWNlVGFnID0gcmVzdWx0LmRldmljZTtcbiAgICAgICAgbGV0IGRBdHRycyA9IGRldmljZVRhZy4kO1xuXG4gICAgICAgIGxldCBkTmFtZSA9IGRBdHRycy5uYW1lO1xuICAgICAgICBsZXQgZElkID0gZEF0dHJzLmlkO1xuICAgICAgICBsZXQgZFR5cGUgPSBkQXR0cnMudHlwZTtcbiAgICAgICAgbGV0IGRTZXJpYWxOdW1iZXIgPSBkQXR0cnMuc2VyaWFsTnVtYmVyO1xuXG4gICAgICAgIGxldCBtZXRhVHJhbnNkdWNlcnMgPSBbXTtcbiAgICAgICAgbGV0IHRyYW5zZHVjZXJUYWdzID0gZGV2aWNlVGFnLnRyYW5zZHVjZXI7XG4gICAgICAgIGZvciAobGV0IHRUYWcgb2YgdHJhbnNkdWNlclRhZ3MpIHtcbiAgICAgICAgICBsZXQgdEF0dHJzID0gdFRhZy4kO1xuXG4gICAgICAgICAgbGV0IHROYW1lID0gdEF0dHJzLm5hbWU7XG4gICAgICAgICAgbGV0IHRJZCA9IHRBdHRycy5pZDtcbiAgICAgICAgICBsZXQgdENhbkFjdHVhdGUgPSAodEF0dHJzLmNhbkFjdHVhdGUgfHwgXCJmYWxzZVwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgbGV0IHRIYXNPd25Ob2RlID0gKHRBdHRycy5oYXNPd25Ob2RlIHx8IFwiZmFsc2VcIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICAgIGxldCB0VW5pdHMgPSB0QXR0cnMudW5pdHMgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgdFVuaXRTY2FsYXIgPSB0QXR0cnMudW5pdFNjYWxhciB8fCBudWxsO1xuICAgICAgICAgIGxldCB0TWluVmFsdWUgPSB0QXR0cnMubWluVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgdE1heFZhbHVlID0gdEF0dHJzLm1heFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgbGV0IHRSZXNvbHV0aW9uID0gdEF0dHJzLnJlc29sdXRpb24gfHwgbnVsbDtcblxuICAgICAgICAgIGxldCB0cmFuc2R1Y2VyID0gbmV3IE1ldGFUcmFuc2R1Y2VyKFxuICAgICAgICAgICAgZGV2aWNlVG9CaW5kLCB0TmFtZSwgdElkLCB0Q2FuQWN0dWF0ZSwgdEhhc093bk5vZGUsIHRVbml0cyxcbiAgICAgICAgICAgIHRVbml0U2NhbGFyLCB0TWluVmFsdWUsIHRNYXhWYWx1ZSwgdFJlc29sdXRpb24pO1xuXG4gICAgICAgICAgbWV0YVRyYW5zZHVjZXJzLnB1c2godHJhbnNkdWNlcik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWV0YSA9IG5ldyBEZXZpY2VNZXRhKFxuICAgICAgICAgIGRldmljZVRvQmluZCwgZElkLCBkVHlwZSwgZFNlcmlhbE51bWJlciwgbWV0YVRyYW5zZHVjZXJzKTtcbiAgICAgICAgY2FsbGJhY2sobWV0YSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNveFV0aWw7XG4iXX0=