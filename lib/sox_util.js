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
        var rawValue = null;
        if (attrs['rawValue'] !== undefined) {
          rawValue = attrs['rawValue']._valueForAttrModified;
        }
        var typedValue = null;
        if (attrs['typedValue'] !== undefined) {
          typedValue = attrs['typedValue']._valueForAttrModified;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfdXRpbC5qcyJdLCJuYW1lcyI6WyJTb3hVdGlsIiwicGFyc2VUaW1lc3RhbXAiLCJ0aW1lc3RhbXBTdHIiLCJEYXRlIiwiZXh0cmFjdERldmljZXMiLCJzb3hDb25uIiwiZW50cnkiLCJjYWxsYmFjayIsInhtbCIsInRvU3RyaW5nIiwieG1sMmpzIiwicGFyc2VTdHJpbmciLCJlcnJvciIsInJlc3VsdCIsImlxVGFnIiwiaXEiLCJxdWVyeVRhZyIsInF1ZXJ5IiwiaXRlbVRhZ3MiLCJpdGVtIiwibm9kZUNoZWNrIiwiaXRlbVRhZyIsIml0ZW1BdHRycyIsIiQiLCJub2RlIiwiZW5kc1dpdGhNZXRhIiwiZGV2aWNlTmFtZSIsImN1dE1ldGFTdWZmaXgiLCJ1bmRlZmluZWQiLCJtZXRhIiwiZW5kc1dpdGhEYXRhIiwiY3V0RGF0YVN1ZmZpeCIsImRhdGEiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoZWNrIiwiZGV2aWNlIiwiYmluZCIsInB1c2giLCJub2RlTmFtZSIsImxlbiIsImxlbmd0aCIsInN1YnN0cmluZyIsInN1YnN0ciIsInBhcnNlRGF0YVBheWxvYWQiLCJtZXNzYWdlVGFnIiwiZXZlbnRUYWciLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtc1RhZyIsImRhdGFUYWciLCJ0ZHJUYWdzIiwibWVzc2FnZVRhZ0F0dHJzIiwiX2F0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiX3ZhbHVlRm9yQXR0ck1vZGlmaWVkIiwiZG9tYWluIiwiaXRlbXNUYWdBdHRycyIsImRldmljZVRvQmluZCIsIkRldmljZSIsInZhbHVlcyIsInRkclRhZyIsInRhZ05hbWUiLCJfbG9jYWxOYW1lIiwiYXR0cnMiLCJhdHRyTmFtZXMiLCJ0cmFuc2R1Y2VySWQiLCJyYXdWYWx1ZSIsInR5cGVkVmFsdWUiLCJ0aW1lc3RhbXAiLCJwYXJzZSIsInZhbHVlIiwiVHJhbnNkdWNlclZhbHVlIiwiRGF0YSIsInBhcnNlTWV0YVBheWxvYWQiLCJlcnIiLCJkZXZpY2VUYWciLCJkQXR0cnMiLCJkTmFtZSIsIm5hbWUiLCJkSWQiLCJpZCIsImRUeXBlIiwidHlwZSIsImRTZXJpYWxOdW1iZXIiLCJzZXJpYWxOdW1iZXIiLCJtZXRhVHJhbnNkdWNlcnMiLCJ0cmFuc2R1Y2VyVGFncyIsInRyYW5zZHVjZXIiLCJ0VGFnIiwidEF0dHJzIiwidE5hbWUiLCJ0SWQiLCJ0Q2FuQWN0dWF0ZSIsImNhbkFjdHVhdGUiLCJ0SGFzT3duTm9kZSIsImhhc093bk5vZGUiLCJ0VW5pdHMiLCJ1bml0cyIsInRVbml0U2NhbGFyIiwidW5pdFNjYWxhciIsInRNaW5WYWx1ZSIsIm1pblZhbHVlIiwidE1heFZhbHVlIiwibWF4VmFsdWUiLCJ0UmVzb2x1dGlvbiIsInJlc29sdXRpb24iLCJNZXRhVHJhbnNkdWNlciIsIkRldmljZU1ldGEiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBSUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0EsSUFBSUEsVUFBVTs7QUFFVkMsa0JBQWdCLHdCQUFDQyxZQUFELEVBQWtCO0FBQ2hDLFdBQU8sSUFBSUMsSUFBSixDQUFTRCxZQUFULENBQVA7QUFDRCxHQUpTOztBQU1WRSxrQkFBZ0Isd0JBQUNDLE9BQUQsRUFBVUMsS0FBVixFQUFpQkMsUUFBakIsRUFBOEI7QUFDNUMsUUFBSUMsTUFBTUYsTUFBTUcsUUFBTixFQUFWO0FBQ0FDLHFCQUFPQyxXQUFQLENBQW1CSCxHQUFuQixFQUF3QixVQUFDSSxLQUFELEVBQVFDLE1BQVIsRUFBbUI7O0FBRXpDOztBQUVBLFVBQUlDLFFBQVFELE9BQU9FLEVBQW5CO0FBQ0EsVUFBSUMsV0FBV0YsTUFBTUcsS0FBTixDQUFZLENBQVosQ0FBZjtBQUNBLFVBQUlDLFdBQVdGLFNBQVNHLElBQXhCOztBQUVBO0FBQ0EsVUFBSUMsWUFBWSxFQUFoQjtBQVR5QztBQUFBO0FBQUE7O0FBQUE7QUFVekMsNkJBQW9CRixRQUFwQiw4SEFBOEI7QUFBQSxjQUFyQkcsT0FB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RCxPQUFPLElBQUkrRSxxQkFBSixDQUNUbEQsWUFEUyxFQUNLc0IsR0FETCxFQUNVRSxLQURWLEVBQ2lCRSxhQURqQixFQUNnQ0UsZUFEaEMsQ0FBWDtBQUVBL0UsZUFBU3NCLElBQVQ7QUFDRCxLQWxDRDtBQW1DRDs7QUFuTVMsQ0FBZDs7QUFUQTtBQUNBOzs7QUErTUFnRixPQUFPQyxPQUFQLEdBQWlCOUcsT0FBakIiLCJmaWxlIjoic294X3V0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeG1sMmpzIGZyb20gXCJ4bWwyanNcIjtcblxuLy8gaW1wb3J0ICogYXMgRGF0YU1vZHVsZSBmcm9tIFwiLi9kYXRhXCI7XG4vLyBpbXBvcnQgRGF0YSBhcyBTb3hEYXRhIGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCBEYXRhIGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCBUcmFuc2R1Y2VyVmFsdWUgZnJvbSBcIi4vdHJhbnNkdWNlcl92YWx1ZVwiO1xuaW1wb3J0IERldmljZU1ldGEgZnJvbSBcIi4vZGV2aWNlX21ldGFcIjtcbmltcG9ydCBNZXRhVHJhbnNkdWNlciBmcm9tIFwiLi9tZXRhX3RyYW5zZHVjZXJcIjtcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4vZGV2aWNlXCI7XG5cblxubGV0IFNveFV0aWwgPSB7XG5cbiAgICBwYXJzZVRpbWVzdGFtcDogKHRpbWVzdGFtcFN0cikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcFN0cik7XG4gICAgfSxcblxuICAgIGV4dHJhY3REZXZpY2VzOiAoc294Q29ubiwgZW50cnksIGNhbGxiYWNrKSA9PiB7XG4gICAgICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnJvciwgcmVzdWx0KSA9PiB7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJwYXJzZVN0cmluZyBlcnJvcjogXCIgKyBlcnJvcik7XG5cbiAgICAgICAgbGV0IGlxVGFnID0gcmVzdWx0LmlxO1xuICAgICAgICBsZXQgcXVlcnlUYWcgPSBpcVRhZy5xdWVyeVswXTtcbiAgICAgICAgbGV0IGl0ZW1UYWdzID0gcXVlcnlUYWcuaXRlbTtcblxuICAgICAgICAvLyBpZiBib3RoIFwiX21ldGFcIiBhbmQgXCJfZGF0YVwiIGV4aXN0cywgaXQgc2hvdWxkIGJlIHNveCBkZXZpY2VcbiAgICAgICAgbGV0IG5vZGVDaGVjayA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpdGVtVGFnIG9mIGl0ZW1UYWdzKSB7XG4gICAgICAgICAgbGV0IGl0ZW1BdHRycyA9IGl0ZW1UYWcuJDtcbiAgICAgICAgICBsZXQgbm9kZSA9IGl0ZW1BdHRycy5ub2RlO1xuXG4gICAgICAgICAgaWYgKFNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGUpKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICAgIGlmIChub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXS5tZXRhID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICAgIGlmIChub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGV2aWNlcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBkZXZpY2VOYW1lIG9mIE9iamVjdC5rZXlzKG5vZGVDaGVjaykpIHtcbiAgICAgICAgICBsZXQgY2hlY2sgPSBub2RlQ2hlY2tbZGV2aWNlTmFtZV07XG4gICAgICAgICAgaWYgKGNoZWNrLm1ldGEgJiYgY2hlY2suZGF0YSkge1xuICAgICAgICAgICAgbGV0IGRldmljZSA9IHNveENvbm4uYmluZChkZXZpY2VOYW1lKTtcbiAgICAgICAgICAgIGRldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKGRldmljZXMpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGVuZHNXaXRoTWV0YTogKG5vZGVOYW1lKSA9PiB7XG4gICAgICBsZXQgbGVuID0gbm9kZU5hbWUubGVuZ3RoO1xuICAgICAgcmV0dXJuICg1IDw9IGxlbikgJiYgbm9kZU5hbWUuc3Vic3RyaW5nKGxlbiAtIDUsIGxlbikgPT09IFwiX21ldGFcIjtcbiAgICB9LFxuXG4gICAgZW5kc1dpdGhEYXRhOiAobm9kZU5hbWUpID0+IHtcbiAgICAgIGxldCBsZW4gPSBub2RlTmFtZS5sZW5ndGg7XG4gICAgICByZXR1cm4gKDUgPD0gbGVuKSAmJiBub2RlTmFtZS5zdWJzdHJpbmcobGVuIC0gNSwgbGVuKSA9PT0gXCJfZGF0YVwiO1xuICAgIH0sXG5cbiAgICBjdXRNZXRhU3VmZml4OiAobm9kZU5hbWUpID0+IHtcbiAgICAgIGlmICghU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZU5hbWUpKSB7XG4gICAgICAgIHJldHVybiBub2RlTmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlTmFtZS5zdWJzdHIoMCwgbm9kZU5hbWUubGVuZ3RoIC0gNSk7XG4gICAgfSxcblxuICAgIGN1dERhdGFTdWZmaXg6IChub2RlTmFtZSkgPT4ge1xuICAgICAgaWYgKCFTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVOYW1lLnN1YnN0cigwLCBub2RlTmFtZS5sZW5ndGggLSA1KTtcbiAgICB9LFxuXG4gICAgLy8gcGFyc2VEYXRhUGF5bG9hZDogKGVudHJ5LCBkZXZpY2VUb0JpbmQsIGNhbGxiYWNrKSA9PiB7XG4gICAgLy8gICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAvLyAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgIC8vICAgICBsZXQgZGF0YVRhZyA9IHJlc3VsdC5kYXRhO1xuICAgIC8vICAgICBsZXQgdHJhbnNkdWNlclZhbHVlVGFncyA9IGRhdGFUYWcudHJhbnNkdWNlclZhbHVlO1xuICAgIC8vICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgLy8gICAgIGZvciAobGV0IHRWYWx1ZVRhZyBvZiB0cmFuc2R1Y2VyVmFsdWVUYWdzKSB7XG4gICAgLy8gICAgICAgbGV0IHZBdHRycyA9IHRWYWx1ZVRhZy4kO1xuICAgIC8vICAgICAgIGxldCB2SWQgPSB2QXR0cnMuaWQ7XG4gICAgLy8gICAgICAgbGV0IHZSYXcgPSB2QXR0cnMucmF3VmFsdWUgfHwgbnVsbDtcbiAgICAvLyAgICAgICBsZXQgdlR5cGVkID0gdkF0dHJzLnR5cGVkVmFsdWUgfHwgbnVsbDtcbiAgICAvLyAgICAgICBsZXQgdlRpbWVzdGFtcCA9IFNveFV0aWwucGFyc2VUaW1lc3RhbXAodkF0dHJzLnRpbWVzdGFtcCk7XG4gICAgLy9cbiAgICAvLyAgICAgICBsZXQgdFZhbHVlID0gbmV3IFRyYW5zZHVjZXJWYWx1ZSh2SWQsIHZSYXcsIHZUeXBlZCwgdlRpbWVzdGFtcCk7XG4gICAgLy8gICAgICAgdmFsdWVzLnB1c2godFZhbHVlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgIGxldCBkYXRhID0gbmV3IERhdGEoZGV2aWNlVG9CaW5kLCB2YWx1ZXMpO1xuICAgIC8vICAgICAvLyBsZXQgZGF0YSA9IG5ldyBEYXRhTW9kdWxlLkRhdGEoZGV2aWNlVG9CaW5kLCB2YWx1ZXMpO1xuICAgIC8vICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG5cbiAgICBwYXJzZURhdGFQYXlsb2FkOiAoc294Q29ubiwgZW50cnksIGNhbGxiYWNrKSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZVRhZyA9IGVudHJ5O1xuICAgICAgbGV0IGV2ZW50VGFnID0gZW50cnkuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGl0ZW1zVGFnID0gZXZlbnRUYWcuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGl0ZW1UYWcgPSBpdGVtc1RhZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICBsZXQgZGF0YVRhZyA9IGl0ZW1UYWcuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IHRkclRhZ3MgPSBkYXRhVGFnLl9jaGlsZE5vZGVzTGlzdDtcblxuICAgICAgbGV0IG1lc3NhZ2VUYWdBdHRycyA9IG1lc3NhZ2VUYWcuX2F0dHJpYnV0ZXM7XG4gICAgICBsZXQgc2VydmljZSA9IG1lc3NhZ2VUYWdBdHRyc1snZnJvbSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIGxldCBkb21haW4gPSBzZXJ2aWNlLnN1YnN0cmluZyg3KTsgIC8vIHNveC4uLlxuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBkb21haW4gPSAnICsgZG9tYWluKTtcblxuICAgICAgbGV0IGl0ZW1zVGFnQXR0cnMgPSBpdGVtc1RhZy5fYXR0cmlidXRlcztcbiAgICAgIGxldCBub2RlID0gaXRlbXNUYWdBdHRyc1snbm9kZSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgcGFyc2VEYXRhUGF5bG9hZDogbm9kZSA9ICcgKyBub2RlKTtcbiAgICAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBkZXZpY2VOYW1lID0gJyArIGRldmljZU5hbWUpO1xuXG4gICAgICBsZXQgZGV2aWNlVG9CaW5kID0gbmV3IERldmljZShzb3hDb25uLCBkZXZpY2VOYW1lLCBkb21haW4pO1xuXG4gICAgICBsZXQgdmFsdWVzID0gW107XG5cbiAgICAgIGZvciAobGV0IHRkclRhZyBvZiB0ZHJUYWdzKSB7XG4gICAgICAgIGxldCB0YWdOYW1lID0gdGRyVGFnLl9sb2NhbE5hbWU7XG4gICAgICAgIGlmICh0YWdOYW1lICE9PSAndHJhbnNkdWNlclZhbHVlJykge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgdGFnTmFtZSAhPT0gdHJhbnNkdWNlclZhbHVlLCBza2lwcGluZzogbmFtZT0nICsgdGFnTmFtZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBleGFtaW5lIHRhZz0nICsgdGFnTmFtZSk7XG5cbiAgICAgICAgLy8gbGV0IGF0dHJzID0gdGRyVGFnLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgICAgbGV0IGF0dHJzID0gdGRyVGFnLl9hdHRyaWJ1dGVzO1xuICAgICAgICBsZXQgYXR0ck5hbWVzID0gT2JqZWN0LmtleXMoYXR0cnMpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnIyMjIGF0dHJOYW1lcz0nICsgSlNPTi5zdHJpbmdpZnkoYXR0ck5hbWVzKSk7XG5cbiAgICAgICAgbGV0IHRyYW5zZHVjZXJJZCA9IGF0dHJzWydpZCddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgICAgbGV0IHJhd1ZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKGF0dHJzWydyYXdWYWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByYXdWYWx1ZSA9IGF0dHJzWydyYXdWYWx1ZSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdHlwZWRWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmIChhdHRyc1sndHlwZWRWYWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0eXBlZFZhbHVlID0gYXR0cnNbJ3R5cGVkVmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRpbWVzdGFtcCA9IGF0dHJzWyd0aW1lc3RhbXAnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG5cbiAgICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICAgIHRpbWVzdGFtcCA9IERhdGUucGFyc2UodGltZXN0YW1wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWx1ZSA9IG5ldyBUcmFuc2R1Y2VyVmFsdWUoXG4gICAgICAgICAgdHJhbnNkdWNlcklkLCByYXdWYWx1ZSwgdHlwZWRWYWx1ZSwgdGltZXN0YW1wKTtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IGFkZGVkIHRyYW5zZHVjZXIgdmFsdWU6IGlkPScgKyB0cmFuc2R1Y2VySWQpO1xuICAgICAgfVxuXG4gICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICBwYXJzZU1ldGFQYXlsb2FkOiAoZW50cnksIGRldmljZVRvQmluZCwgY2FsbGJhY2spID0+IHtcbiAgICAgIGxldCB4bWwgPSBlbnRyeS50b1N0cmluZygpO1xuICAgICAgeG1sMmpzLnBhcnNlU3RyaW5nKHhtbCwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCBkZXZpY2VUYWcgPSByZXN1bHQuZGV2aWNlO1xuICAgICAgICBsZXQgZEF0dHJzID0gZGV2aWNlVGFnLiQ7XG5cbiAgICAgICAgbGV0IGROYW1lID0gZEF0dHJzLm5hbWU7XG4gICAgICAgIGxldCBkSWQgPSBkQXR0cnMuaWQ7XG4gICAgICAgIGxldCBkVHlwZSA9IGRBdHRycy50eXBlO1xuICAgICAgICBsZXQgZFNlcmlhbE51bWJlciA9IGRBdHRycy5zZXJpYWxOdW1iZXI7XG5cbiAgICAgICAgbGV0IG1ldGFUcmFuc2R1Y2VycyA9IFtdO1xuICAgICAgICBsZXQgdHJhbnNkdWNlclRhZ3MgPSBkZXZpY2VUYWcudHJhbnNkdWNlcjtcbiAgICAgICAgZm9yIChsZXQgdFRhZyBvZiB0cmFuc2R1Y2VyVGFncykge1xuICAgICAgICAgIGxldCB0QXR0cnMgPSB0VGFnLiQ7XG5cbiAgICAgICAgICBsZXQgdE5hbWUgPSB0QXR0cnMubmFtZTtcbiAgICAgICAgICBsZXQgdElkID0gdEF0dHJzLmlkO1xuICAgICAgICAgIGxldCB0Q2FuQWN0dWF0ZSA9ICh0QXR0cnMuY2FuQWN0dWF0ZSB8fCBcImZhbHNlXCIpID09PSBcInRydWVcIjtcbiAgICAgICAgICBsZXQgdEhhc093bk5vZGUgPSAodEF0dHJzLmhhc093bk5vZGUgfHwgXCJmYWxzZVwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgbGV0IHRVbml0cyA9IHRBdHRycy51bml0cyB8fCBudWxsO1xuICAgICAgICAgIGxldCB0VW5pdFNjYWxhciA9IHRBdHRycy51bml0U2NhbGFyIHx8IG51bGw7XG4gICAgICAgICAgbGV0IHRNaW5WYWx1ZSA9IHRBdHRycy5taW5WYWx1ZSB8fCBudWxsO1xuICAgICAgICAgIGxldCB0TWF4VmFsdWUgPSB0QXR0cnMubWF4VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgdFJlc29sdXRpb24gPSB0QXR0cnMucmVzb2x1dGlvbiB8fCBudWxsO1xuXG4gICAgICAgICAgbGV0IHRyYW5zZHVjZXIgPSBuZXcgTWV0YVRyYW5zZHVjZXIoXG4gICAgICAgICAgICBkZXZpY2VUb0JpbmQsIHROYW1lLCB0SWQsIHRDYW5BY3R1YXRlLCB0SGFzT3duTm9kZSwgdFVuaXRzLFxuICAgICAgICAgICAgdFVuaXRTY2FsYXIsIHRNaW5WYWx1ZSwgdE1heFZhbHVlLCB0UmVzb2x1dGlvbik7XG5cbiAgICAgICAgICBtZXRhVHJhbnNkdWNlcnMucHVzaCh0cmFuc2R1Y2VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtZXRhID0gbmV3IERldmljZU1ldGEoXG4gICAgICAgICAgZGV2aWNlVG9CaW5kLCBkSWQsIGRUeXBlLCBkU2VyaWFsTnVtYmVyLCBtZXRhVHJhbnNkdWNlcnMpO1xuICAgICAgICBjYWxsYmFjayhtZXRhKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU294VXRpbDtcbiJdfQ==