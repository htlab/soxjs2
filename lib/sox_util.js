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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfdXRpbC5qcyJdLCJuYW1lcyI6WyJTb3hVdGlsIiwicGFyc2VUaW1lc3RhbXAiLCJ0aW1lc3RhbXBTdHIiLCJEYXRlIiwiZXh0cmFjdERldmljZXMiLCJzb3hDb25uIiwiZW50cnkiLCJjYWxsYmFjayIsInhtbCIsInRvU3RyaW5nIiwicGFyc2VTdHJpbmciLCJlcnJvciIsInJlc3VsdCIsImlxVGFnIiwiaXEiLCJxdWVyeVRhZyIsInF1ZXJ5IiwiaXRlbVRhZ3MiLCJpdGVtIiwibm9kZUNoZWNrIiwiaXRlbVRhZyIsIml0ZW1BdHRycyIsIiQiLCJub2RlIiwiZW5kc1dpdGhNZXRhIiwiZGV2aWNlTmFtZSIsImN1dE1ldGFTdWZmaXgiLCJ1bmRlZmluZWQiLCJtZXRhIiwiZW5kc1dpdGhEYXRhIiwiY3V0RGF0YVN1ZmZpeCIsImRhdGEiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoZWNrIiwiZGV2aWNlIiwiYmluZCIsInB1c2giLCJub2RlTmFtZSIsImxlbiIsImxlbmd0aCIsInN1YnN0cmluZyIsInN1YnN0ciIsInBhcnNlRGF0YVBheWxvYWQiLCJtZXNzYWdlVGFnIiwiZXZlbnRUYWciLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtc1RhZyIsImRhdGFUYWciLCJ0ZHJUYWdzIiwibWVzc2FnZVRhZ0F0dHJzIiwiX2F0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiX3ZhbHVlRm9yQXR0ck1vZGlmaWVkIiwiZG9tYWluIiwiaXRlbXNUYWdBdHRycyIsImRldmljZVRvQmluZCIsInZhbHVlcyIsInRkclRhZyIsInRhZ05hbWUiLCJfbG9jYWxOYW1lIiwiYXR0cnMiLCJhdHRyTmFtZXMiLCJ0cmFuc2R1Y2VySWQiLCJyYXdWYWx1ZSIsInR5cGVkVmFsdWUiLCJ0aW1lc3RhbXAiLCJwYXJzZSIsInZhbHVlIiwicGFyc2VNZXRhUGF5bG9hZCIsImVyciIsImRldmljZVRhZyIsImRBdHRycyIsImROYW1lIiwibmFtZSIsImRJZCIsImlkIiwiZFR5cGUiLCJ0eXBlIiwiZFNlcmlhbE51bWJlciIsInNlcmlhbE51bWJlciIsIm1ldGFUcmFuc2R1Y2VycyIsInRyYW5zZHVjZXJUYWdzIiwidHJhbnNkdWNlciIsInRUYWciLCJ0QXR0cnMiLCJ0TmFtZSIsInRJZCIsInRDYW5BY3R1YXRlIiwiY2FuQWN0dWF0ZSIsInRIYXNPd25Ob2RlIiwiaGFzT3duTm9kZSIsInRVbml0cyIsInVuaXRzIiwidFVuaXRTY2FsYXIiLCJ1bml0U2NhbGFyIiwidE1pblZhbHVlIiwibWluVmFsdWUiLCJ0TWF4VmFsdWUiLCJtYXhWYWx1ZSIsInRSZXNvbHV0aW9uIiwicmVzb2x1dGlvbiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFJQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxJQUFJQSxVQUFVOztBQUVWQyxrQkFBZ0Isd0JBQUNDLFlBQUQsRUFBa0I7QUFDaEMsV0FBTyxJQUFJQyxJQUFKLENBQVNELFlBQVQsQ0FBUDtBQUNELEdBSlM7O0FBTVZFLGtCQUFnQix3QkFBQ0MsT0FBRCxFQUFVQyxLQUFWLEVBQWlCQyxRQUFqQixFQUE4QjtBQUM1QyxRQUFJQyxNQUFNRixNQUFNRyxRQUFOLEVBQVY7QUFDQSxxQkFBT0MsV0FBUCxDQUFtQkYsR0FBbkIsRUFBd0IsVUFBQ0csS0FBRCxFQUFRQyxNQUFSLEVBQW1COztBQUV6Qzs7QUFFQSxVQUFJQyxRQUFRRCxPQUFPRSxFQUFuQjtBQUNBLFVBQUlDLFdBQVdGLE1BQU1HLEtBQU4sQ0FBWSxDQUFaLENBQWY7QUFDQSxVQUFJQyxXQUFXRixTQUFTRyxJQUF4Qjs7QUFFQTtBQUNBLFVBQUlDLFlBQVksRUFBaEI7QUFUeUM7QUFBQTtBQUFBOztBQUFBO0FBVXpDLDZCQUFvQkYsUUFBcEIsOEhBQThCO0FBQUEsY0FBckJHLE9BQXFCOztBQUM1QixjQUFJQyxZQUFZRCxRQUFRRSxDQUF4QjtBQUNBLGNBQUlDLE9BQU9GLFVBQVVFLElBQXJCOztBQUVBLGNBQUl2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QWQ7O0FBVEE7QUFDQTs7O0FBK01BMkUsT0FBT0MsT0FBUCxHQUFpQnhHLE9BQWpCIiwiZmlsZSI6InNveF91dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHhtbDJqcyBmcm9tIFwieG1sMmpzXCI7XG5cbi8vIGltcG9ydCAqIGFzIERhdGFNb2R1bGUgZnJvbSBcIi4vZGF0YVwiO1xuLy8gaW1wb3J0IERhdGEgYXMgU294RGF0YSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgRGF0YSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgVHJhbnNkdWNlclZhbHVlIGZyb20gXCIuL3RyYW5zZHVjZXJfdmFsdWVcIjtcbmltcG9ydCBEZXZpY2VNZXRhIGZyb20gXCIuL2RldmljZV9tZXRhXCI7XG5pbXBvcnQgTWV0YVRyYW5zZHVjZXIgZnJvbSBcIi4vbWV0YV90cmFuc2R1Y2VyXCI7XG5pbXBvcnQgRGV2aWNlIGZyb20gXCIuL2RldmljZVwiO1xuXG5cbmxldCBTb3hVdGlsID0ge1xuXG4gICAgcGFyc2VUaW1lc3RhbXA6ICh0aW1lc3RhbXBTdHIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXBTdHIpO1xuICAgIH0sXG5cbiAgICBleHRyYWN0RGV2aWNlczogKHNveENvbm4sIGVudHJ5LCBjYWxsYmFjaykgPT4ge1xuICAgICAgbGV0IHhtbCA9IGVudHJ5LnRvU3RyaW5nKCk7XG4gICAgICB4bWwyanMucGFyc2VTdHJpbmcoeG1sLCAoZXJyb3IsIHJlc3VsdCkgPT4ge1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwicGFyc2VTdHJpbmcgZXJyb3I6IFwiICsgZXJyb3IpO1xuXG4gICAgICAgIGxldCBpcVRhZyA9IHJlc3VsdC5pcTtcbiAgICAgICAgbGV0IHF1ZXJ5VGFnID0gaXFUYWcucXVlcnlbMF07XG4gICAgICAgIGxldCBpdGVtVGFncyA9IHF1ZXJ5VGFnLml0ZW07XG5cbiAgICAgICAgLy8gaWYgYm90aCBcIl9tZXRhXCIgYW5kIFwiX2RhdGFcIiBleGlzdHMsIGl0IHNob3VsZCBiZSBzb3ggZGV2aWNlXG4gICAgICAgIGxldCBub2RlQ2hlY2sgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaXRlbVRhZyBvZiBpdGVtVGFncykge1xuICAgICAgICAgIGxldCBpdGVtQXR0cnMgPSBpdGVtVGFnLiQ7XG4gICAgICAgICAgbGV0IG5vZGUgPSBpdGVtQXR0cnMubm9kZTtcblxuICAgICAgICAgIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAgICAgICAgICAgdmFyIGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZUNoZWNrW2RldmljZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0ubWV0YSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAgICAgICAgICAgdmFyIGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZUNoZWNrW2RldmljZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0uZGF0YSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRldmljZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgZGV2aWNlTmFtZSBvZiBPYmplY3Qua2V5cyhub2RlQ2hlY2spKSB7XG4gICAgICAgICAgbGV0IGNoZWNrID0gbm9kZUNoZWNrW2RldmljZU5hbWVdO1xuICAgICAgICAgIGlmIChjaGVjay5tZXRhICYmIGNoZWNrLmRhdGEpIHtcbiAgICAgICAgICAgIGxldCBkZXZpY2UgPSBzb3hDb25uLmJpbmQoZGV2aWNlTmFtZSk7XG4gICAgICAgICAgICBkZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhkZXZpY2VzKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBlbmRzV2l0aE1ldGE6IChub2RlTmFtZSkgPT4ge1xuICAgICAgbGV0IGxlbiA9IG5vZGVOYW1lLmxlbmd0aDtcbiAgICAgIHJldHVybiAoNSA8PSBsZW4pICYmIG5vZGVOYW1lLnN1YnN0cmluZyhsZW4gLSA1LCBsZW4pID09PSBcIl9tZXRhXCI7XG4gICAgfSxcblxuICAgIGVuZHNXaXRoRGF0YTogKG5vZGVOYW1lKSA9PiB7XG4gICAgICBsZXQgbGVuID0gbm9kZU5hbWUubGVuZ3RoO1xuICAgICAgcmV0dXJuICg1IDw9IGxlbikgJiYgbm9kZU5hbWUuc3Vic3RyaW5nKGxlbiAtIDUsIGxlbikgPT09IFwiX2RhdGFcIjtcbiAgICB9LFxuXG4gICAgY3V0TWV0YVN1ZmZpeDogKG5vZGVOYW1lKSA9PiB7XG4gICAgICBpZiAoIVNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGVOYW1lKSkge1xuICAgICAgICByZXR1cm4gbm9kZU5hbWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZU5hbWUuc3Vic3RyKDAsIG5vZGVOYW1lLmxlbmd0aCAtIDUpO1xuICAgIH0sXG5cbiAgICBjdXREYXRhU3VmZml4OiAobm9kZU5hbWUpID0+IHtcbiAgICAgIGlmICghU294VXRpbC5lbmRzV2l0aERhdGEobm9kZU5hbWUpKSB7XG4gICAgICAgIHJldHVybiBub2RlTmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlTmFtZS5zdWJzdHIoMCwgbm9kZU5hbWUubGVuZ3RoIC0gNSk7XG4gICAgfSxcblxuICAgIC8vIHBhcnNlRGF0YVBheWxvYWQ6IChlbnRyeSwgZGV2aWNlVG9CaW5kLCBjYWxsYmFjaykgPT4ge1xuICAgIC8vICAgbGV0IHhtbCA9IGVudHJ5LnRvU3RyaW5nKCk7XG4gICAgLy8gICB4bWwyanMucGFyc2VTdHJpbmcoeG1sLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAvLyAgICAgbGV0IGRhdGFUYWcgPSByZXN1bHQuZGF0YTtcbiAgICAvLyAgICAgbGV0IHRyYW5zZHVjZXJWYWx1ZVRhZ3MgPSBkYXRhVGFnLnRyYW5zZHVjZXJWYWx1ZTtcbiAgICAvLyAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgIC8vICAgICBmb3IgKGxldCB0VmFsdWVUYWcgb2YgdHJhbnNkdWNlclZhbHVlVGFncykge1xuICAgIC8vICAgICAgIGxldCB2QXR0cnMgPSB0VmFsdWVUYWcuJDtcbiAgICAvLyAgICAgICBsZXQgdklkID0gdkF0dHJzLmlkO1xuICAgIC8vICAgICAgIGxldCB2UmF3ID0gdkF0dHJzLnJhd1ZhbHVlIHx8IG51bGw7XG4gICAgLy8gICAgICAgbGV0IHZUeXBlZCA9IHZBdHRycy50eXBlZFZhbHVlIHx8IG51bGw7XG4gICAgLy8gICAgICAgbGV0IHZUaW1lc3RhbXAgPSBTb3hVdGlsLnBhcnNlVGltZXN0YW1wKHZBdHRycy50aW1lc3RhbXApO1xuICAgIC8vXG4gICAgLy8gICAgICAgbGV0IHRWYWx1ZSA9IG5ldyBUcmFuc2R1Y2VyVmFsdWUodklkLCB2UmF3LCB2VHlwZWQsIHZUaW1lc3RhbXApO1xuICAgIC8vICAgICAgIHZhbHVlcy5wdXNoKHRWYWx1ZSk7XG4gICAgLy8gICAgIH1cbiAgICAvL1xuICAgIC8vICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgICAvLyAgICAgLy8gbGV0IGRhdGEgPSBuZXcgRGF0YU1vZHVsZS5EYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgICAvLyAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuXG4gICAgcGFyc2VEYXRhUGF5bG9hZDogKHNveENvbm4sIGVudHJ5LCBjYWxsYmFjaykgPT4ge1xuICAgICAgbGV0IG1lc3NhZ2VUYWcgPSBlbnRyeTtcbiAgICAgIGxldCBldmVudFRhZyA9IGVudHJ5Ll9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCBpdGVtc1RhZyA9IGV2ZW50VGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCBpdGVtVGFnID0gaXRlbXNUYWcuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGRhdGFUYWcgPSBpdGVtVGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCB0ZHJUYWdzID0gZGF0YVRhZy5fY2hpbGROb2Rlc0xpc3Q7XG5cbiAgICAgIGxldCBtZXNzYWdlVGFnQXR0cnMgPSBtZXNzYWdlVGFnLl9hdHRyaWJ1dGVzO1xuICAgICAgbGV0IHNlcnZpY2UgPSBtZXNzYWdlVGFnQXR0cnNbJ2Zyb20nXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICBsZXQgZG9tYWluID0gc2VydmljZS5zdWJzdHJpbmcoNyk7ICAvLyBzb3guLi5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgcGFyc2VEYXRhUGF5bG9hZDogZG9tYWluID0gJyArIGRvbWFpbik7XG5cbiAgICAgIGxldCBpdGVtc1RhZ0F0dHJzID0gaXRlbXNUYWcuX2F0dHJpYnV0ZXM7XG4gICAgICBsZXQgbm9kZSA9IGl0ZW1zVGFnQXR0cnNbJ25vZGUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IG5vZGUgPSAnICsgbm9kZSk7XG4gICAgICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgcGFyc2VEYXRhUGF5bG9hZDogZGV2aWNlTmFtZSA9ICcgKyBkZXZpY2VOYW1lKTtcblxuICAgICAgbGV0IGRldmljZVRvQmluZCA9IG5ldyBEZXZpY2Uoc294Q29ubiwgZGV2aWNlTmFtZSwgZG9tYWluKTtcblxuICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuXG4gICAgICBmb3IgKGxldCB0ZHJUYWcgb2YgdGRyVGFncykge1xuICAgICAgICBsZXQgdGFnTmFtZSA9IHRkclRhZy5fbG9jYWxOYW1lO1xuICAgICAgICBpZiAodGFnTmFtZSAhPT0gJ3RyYW5zZHVjZXJWYWx1ZScpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnIyMjIHRhZ05hbWUgIT09IHRyYW5zZHVjZXJWYWx1ZSwgc2tpcHBpbmc6IG5hbWU9JyArIHRhZ05hbWUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgZXhhbWluZSB0YWc9JyArIHRhZ05hbWUpO1xuXG4gICAgICAgIC8vIGxldCBhdHRycyA9IHRkclRhZy5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIGxldCBhdHRycyA9IHRkclRhZy5fYXR0cmlidXRlcztcbiAgICAgICAgbGV0IGF0dHJOYW1lcyA9IE9iamVjdC5rZXlzKGF0dHJzKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBhdHRyTmFtZXM9JyArIEpTT04uc3RyaW5naWZ5KGF0dHJOYW1lcykpO1xuXG4gICAgICAgIGxldCB0cmFuc2R1Y2VySWQgPSBhdHRyc1snaWQnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIGxldCByYXdWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmIChhdHRyc1sncmF3VmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmF3VmFsdWUgPSBhdHRyc1sncmF3VmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHR5cGVkVmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAoYXR0cnNbJ3R5cGVkVmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdHlwZWRWYWx1ZSA9IGF0dHJzWyd0eXBlZFZhbHVlJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBhdHRyc1sndGltZXN0YW1wJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuXG4gICAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKHRpbWVzdGFtcCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKFxuICAgICAgICAgIHRyYW5zZHVjZXJJZCwgcmF3VmFsdWUsIHR5cGVkVmFsdWUsIHRpbWVzdGFtcCk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBhZGRlZCB0cmFuc2R1Y2VyIHZhbHVlOiBpZD0nICsgdHJhbnNkdWNlcklkKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YShkZXZpY2VUb0JpbmQsIHZhbHVlcyk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgcGFyc2VNZXRhUGF5bG9hZDogKGVudHJ5LCBkZXZpY2VUb0JpbmQsIGNhbGxiYWNrKSA9PiB7XG4gICAgICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICBsZXQgZGV2aWNlVGFnID0gcmVzdWx0LmRldmljZTtcbiAgICAgICAgbGV0IGRBdHRycyA9IGRldmljZVRhZy4kO1xuXG4gICAgICAgIGxldCBkTmFtZSA9IGRBdHRycy5uYW1lO1xuICAgICAgICBsZXQgZElkID0gZEF0dHJzLmlkO1xuICAgICAgICBsZXQgZFR5cGUgPSBkQXR0cnMudHlwZTtcbiAgICAgICAgbGV0IGRTZXJpYWxOdW1iZXIgPSBkQXR0cnMuc2VyaWFsTnVtYmVyO1xuXG4gICAgICAgIGxldCBtZXRhVHJhbnNkdWNlcnMgPSBbXTtcbiAgICAgICAgbGV0IHRyYW5zZHVjZXJUYWdzID0gZGV2aWNlVGFnLnRyYW5zZHVjZXI7XG4gICAgICAgIGZvciAobGV0IHRUYWcgb2YgdHJhbnNkdWNlclRhZ3MpIHtcbiAgICAgICAgICBsZXQgdEF0dHJzID0gdFRhZy4kO1xuXG4gICAgICAgICAgbGV0IHROYW1lID0gdEF0dHJzLm5hbWU7XG4gICAgICAgICAgbGV0IHRJZCA9IHRBdHRycy5pZDtcbiAgICAgICAgICBsZXQgdENhbkFjdHVhdGUgPSAodEF0dHJzLmNhbkFjdHVhdGUgfHwgXCJmYWxzZVwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgbGV0IHRIYXNPd25Ob2RlID0gKHRBdHRycy5oYXNPd25Ob2RlIHx8IFwiZmFsc2VcIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICAgIGxldCB0VW5pdHMgPSB0QXR0cnMudW5pdHMgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgdFVuaXRTY2FsYXIgPSB0QXR0cnMudW5pdFNjYWxhciB8fCBudWxsO1xuICAgICAgICAgIGxldCB0TWluVmFsdWUgPSB0QXR0cnMubWluVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgdE1heFZhbHVlID0gdEF0dHJzLm1heFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgbGV0IHRSZXNvbHV0aW9uID0gdEF0dHJzLnJlc29sdXRpb24gfHwgbnVsbDtcblxuICAgICAgICAgIGxldCB0cmFuc2R1Y2VyID0gbmV3IE1ldGFUcmFuc2R1Y2VyKFxuICAgICAgICAgICAgZGV2aWNlVG9CaW5kLCB0TmFtZSwgdElkLCB0Q2FuQWN0dWF0ZSwgdEhhc093bk5vZGUsIHRVbml0cyxcbiAgICAgICAgICAgIHRVbml0U2NhbGFyLCB0TWluVmFsdWUsIHRNYXhWYWx1ZSwgdFJlc29sdXRpb24pO1xuXG4gICAgICAgICAgbWV0YVRyYW5zZHVjZXJzLnB1c2godHJhbnNkdWNlcik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWV0YSA9IG5ldyBEZXZpY2VNZXRhKFxuICAgICAgICAgIGRldmljZVRvQmluZCwgZElkLCBkVHlwZSwgZFNlcmlhbE51bWJlciwgbWV0YVRyYW5zZHVjZXJzKTtcbiAgICAgICAgY2FsbGJhY2sobWV0YSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNveFV0aWw7XG4iXX0=