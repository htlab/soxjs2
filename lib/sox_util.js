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

        // come in 'transducerValue' and 'transducervalue'
        // FIXME: Snake case becomes lowercase in node-strophe specification
        // if you fix this, customize to 'node-strophe'
        if (tagName !== 'transducerValue' && tagName !== 'transducervalue') {
          // console.log('### tagName !== transducerV(v)alue, skipping: name=' + tagName);
          continue;
        }
        // console.log('### examine tag=' + tagName);

        // let attrs = tdrTag._valueForAttrModified;
        var attrs = tdrTag._attributes;
        var attrNames = Object.keys(attrs);
        // console.log('### attrNames=' + JSON.stringify(attrNames));

        var transducerId = attrs['id']._valueForAttrModified;

        var rawValue = null;
        var typedValue = null;

        // if camelCase ============================
        if (attrs['rawValue'] !== undefined) {
          rawValue = attrs['rawValue']._valueForAttrModified;
        }

        if (attrs['typedValue'] !== undefined) {
          typedValue = attrs['typedValue']._valueForAttrModified;
        }

        // if lowercase ============================
        // FIXME: Snake case becomes lowercase in node-strophe specification
        // if you fix this, customize to 'node-strophe'
        if (attrs['rawvalue'] !== undefined) {
          rawValue = attrs['rawvalue']._valueForAttrModified;
        }

        if (attrs['typedvalue'] !== undefined) {
          typedValue = attrs['typedvalue']._valueForAttrModified;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfdXRpbC5qcyJdLCJuYW1lcyI6WyJTb3hVdGlsIiwicGFyc2VUaW1lc3RhbXAiLCJ0aW1lc3RhbXBTdHIiLCJEYXRlIiwiZXh0cmFjdERldmljZXMiLCJzb3hDb25uIiwiZW50cnkiLCJjYWxsYmFjayIsInhtbCIsInRvU3RyaW5nIiwieG1sMmpzIiwicGFyc2VTdHJpbmciLCJlcnJvciIsInJlc3VsdCIsImlxVGFnIiwiaXEiLCJxdWVyeVRhZyIsInF1ZXJ5IiwiaXRlbVRhZ3MiLCJpdGVtIiwibm9kZUNoZWNrIiwiaXRlbVRhZyIsIml0ZW1BdHRycyIsIiQiLCJub2RlIiwiZW5kc1dpdGhNZXRhIiwiZGV2aWNlTmFtZSIsImN1dE1ldGFTdWZmaXgiLCJ1bmRlZmluZWQiLCJtZXRhIiwiZW5kc1dpdGhEYXRhIiwiY3V0RGF0YVN1ZmZpeCIsImRhdGEiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoZWNrIiwiZGV2aWNlIiwiYmluZCIsInB1c2giLCJub2RlTmFtZSIsImxlbiIsImxlbmd0aCIsInN1YnN0cmluZyIsInN1YnN0ciIsInBhcnNlRGF0YVBheWxvYWQiLCJtZXNzYWdlVGFnIiwiZXZlbnRUYWciLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtc1RhZyIsImRhdGFUYWciLCJ0ZHJUYWdzIiwibWVzc2FnZVRhZ0F0dHJzIiwiX2F0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiX3ZhbHVlRm9yQXR0ck1vZGlmaWVkIiwiZG9tYWluIiwiaXRlbXNUYWdBdHRycyIsImRldmljZVRvQmluZCIsIkRldmljZSIsInZhbHVlcyIsInRkclRhZyIsInRhZ05hbWUiLCJfbG9jYWxOYW1lIiwiYXR0cnMiLCJhdHRyTmFtZXMiLCJ0cmFuc2R1Y2VySWQiLCJyYXdWYWx1ZSIsInR5cGVkVmFsdWUiLCJ0aW1lc3RhbXAiLCJwYXJzZSIsInZhbHVlIiwiVHJhbnNkdWNlclZhbHVlIiwiRGF0YSIsInBhcnNlTWV0YVBheWxvYWQiLCJlcnIiLCJkZXZpY2VUYWciLCJkQXR0cnMiLCJkTmFtZSIsIm5hbWUiLCJkSWQiLCJpZCIsImRUeXBlIiwidHlwZSIsImRTZXJpYWxOdW1iZXIiLCJzZXJpYWxOdW1iZXIiLCJtZXRhVHJhbnNkdWNlcnMiLCJ0cmFuc2R1Y2VyVGFncyIsInRyYW5zZHVjZXIiLCJ0VGFnIiwidEF0dHJzIiwidE5hbWUiLCJ0SWQiLCJ0Q2FuQWN0dWF0ZSIsImNhbkFjdHVhdGUiLCJ0SGFzT3duTm9kZSIsImhhc093bk5vZGUiLCJ0VW5pdHMiLCJ1bml0cyIsInRVbml0U2NhbGFyIiwidW5pdFNjYWxhciIsInRNaW5WYWx1ZSIsIm1pblZhbHVlIiwidE1heFZhbHVlIiwibWF4VmFsdWUiLCJ0UmVzb2x1dGlvbiIsInJlc29sdXRpb24iLCJNZXRhVHJhbnNkdWNlciIsIkRldmljZU1ldGEiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBSUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0EsSUFBSUEsVUFBVTs7QUFFWkMsa0JBQWdCLHdCQUFDQyxZQUFELEVBQWtCO0FBQ2hDLFdBQU8sSUFBSUMsSUFBSixDQUFTRCxZQUFULENBQVA7QUFDRCxHQUpXOztBQU1aRSxrQkFBZ0Isd0JBQUNDLE9BQUQsRUFBVUMsS0FBVixFQUFpQkMsUUFBakIsRUFBOEI7QUFDNUMsUUFBSUMsTUFBTUYsTUFBTUcsUUFBTixFQUFWO0FBQ0FDLHFCQUFPQyxXQUFQLENBQW1CSCxHQUFuQixFQUF3QixVQUFDSSxLQUFELEVBQVFDLE1BQVIsRUFBbUI7O0FBRXpDOztBQUVBLFVBQUlDLFFBQVFELE9BQU9FLEVBQW5CO0FBQ0EsVUFBSUMsV0FBV0YsTUFBTUcsS0FBTixDQUFZLENBQVosQ0FBZjtBQUNBLFVBQUlDLFdBQVdGLFNBQVNHLElBQXhCOztBQUVBO0FBQ0EsVUFBSUMsWUFBWSxFQUFoQjtBQVR5QztBQUFBO0FBQUE7O0FBQUE7QUFVekMsNkJBQW9CRixRQUFwQiw4SEFBOEI7QUFBQSxjQUFyQkcsT0FB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V0FEWCxFQUN3QkUsV0FEeEIsRUFDcUNFLE1BRHJDLEVBRWZFLFdBRmUsRUFFRkUsU0FGRSxFQUVTRSxTQUZULEVBRW9CRSxXQUZwQixDQUFqQjs7QUFJQW5CLDBCQUFnQi9DLElBQWhCLENBQXFCaUQsVUFBckI7QUFDRDtBQTdCc0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUErQnZDLFVBQUkzRCxPQUFPLElBQUkrRSxxQkFBSixDQUNUbEQsWUFEUyxFQUNLc0IsR0FETCxFQUNVRSxLQURWLEVBQ2lCRSxhQURqQixFQUNnQ0UsZUFEaEMsQ0FBWDtBQUVBL0UsZUFBU3NCLElBQVQ7QUFDRCxLQWxDRDtBQW1DRDs7QUFwTlcsQ0FBZDs7QUFUQTtBQUNBOzs7QUFnT0FnRixPQUFPQyxPQUFQLEdBQWlCOUcsT0FBakIiLCJmaWxlIjoic294X3V0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeG1sMmpzIGZyb20gXCJ4bWwyanNcIjtcblxuLy8gaW1wb3J0ICogYXMgRGF0YU1vZHVsZSBmcm9tIFwiLi9kYXRhXCI7XG4vLyBpbXBvcnQgRGF0YSBhcyBTb3hEYXRhIGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCBEYXRhIGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCBUcmFuc2R1Y2VyVmFsdWUgZnJvbSBcIi4vdHJhbnNkdWNlcl92YWx1ZVwiO1xuaW1wb3J0IERldmljZU1ldGEgZnJvbSBcIi4vZGV2aWNlX21ldGFcIjtcbmltcG9ydCBNZXRhVHJhbnNkdWNlciBmcm9tIFwiLi9tZXRhX3RyYW5zZHVjZXJcIjtcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4vZGV2aWNlXCI7XG5cblxubGV0IFNveFV0aWwgPSB7XG5cbiAgcGFyc2VUaW1lc3RhbXA6ICh0aW1lc3RhbXBTdHIpID0+IHtcbiAgICByZXR1cm4gbmV3IERhdGUodGltZXN0YW1wU3RyKTtcbiAgfSxcblxuICBleHRyYWN0RGV2aWNlczogKHNveENvbm4sIGVudHJ5LCBjYWxsYmFjaykgPT4ge1xuICAgIGxldCB4bWwgPSBlbnRyeS50b1N0cmluZygpO1xuICAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnJvciwgcmVzdWx0KSA9PiB7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwicGFyc2VTdHJpbmcgZXJyb3I6IFwiICsgZXJyb3IpO1xuXG4gICAgICBsZXQgaXFUYWcgPSByZXN1bHQuaXE7XG4gICAgICBsZXQgcXVlcnlUYWcgPSBpcVRhZy5xdWVyeVswXTtcbiAgICAgIGxldCBpdGVtVGFncyA9IHF1ZXJ5VGFnLml0ZW07XG5cbiAgICAgIC8vIGlmIGJvdGggXCJfbWV0YVwiIGFuZCBcIl9kYXRhXCIgZXhpc3RzLCBpdCBzaG91bGQgYmUgc294IGRldmljZVxuICAgICAgbGV0IG5vZGVDaGVjayA9IHt9O1xuICAgICAgZm9yIChsZXQgaXRlbVRhZyBvZiBpdGVtVGFncykge1xuICAgICAgICBsZXQgaXRlbUF0dHJzID0gaXRlbVRhZy4kO1xuICAgICAgICBsZXQgbm9kZSA9IGl0ZW1BdHRycy5ub2RlO1xuXG4gICAgICAgIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAgICAgICAgIHZhciBkZXZpY2VOYW1lID0gU294VXRpbC5jdXRNZXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgIGlmIChub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXS5tZXRhID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAgICAgICAgIHZhciBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgIGlmIChub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vZGVDaGVja1tkZXZpY2VOYW1lXS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgZGV2aWNlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgZGV2aWNlTmFtZSBvZiBPYmplY3Qua2V5cyhub2RlQ2hlY2spKSB7XG4gICAgICAgIGxldCBjaGVjayA9IG5vZGVDaGVja1tkZXZpY2VOYW1lXTtcbiAgICAgICAgaWYgKGNoZWNrLm1ldGEgJiYgY2hlY2suZGF0YSkge1xuICAgICAgICAgIGxldCBkZXZpY2UgPSBzb3hDb25uLmJpbmQoZGV2aWNlTmFtZSk7XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZGV2aWNlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZW5kc1dpdGhNZXRhOiAobm9kZU5hbWUpID0+IHtcbiAgICBsZXQgbGVuID0gbm9kZU5hbWUubGVuZ3RoO1xuICAgIHJldHVybiAoNSA8PSBsZW4pICYmIG5vZGVOYW1lLnN1YnN0cmluZyhsZW4gLSA1LCBsZW4pID09PSBcIl9tZXRhXCI7XG4gIH0sXG5cbiAgZW5kc1dpdGhEYXRhOiAobm9kZU5hbWUpID0+IHtcbiAgICBsZXQgbGVuID0gbm9kZU5hbWUubGVuZ3RoO1xuICAgIHJldHVybiAoNSA8PSBsZW4pICYmIG5vZGVOYW1lLnN1YnN0cmluZyhsZW4gLSA1LCBsZW4pID09PSBcIl9kYXRhXCI7XG4gIH0sXG5cbiAgY3V0TWV0YVN1ZmZpeDogKG5vZGVOYW1lKSA9PiB7XG4gICAgaWYgKCFTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlTmFtZSkpIHtcbiAgICAgIHJldHVybiBub2RlTmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVOYW1lLnN1YnN0cigwLCBub2RlTmFtZS5sZW5ndGggLSA1KTtcbiAgfSxcblxuICBjdXREYXRhU3VmZml4OiAobm9kZU5hbWUpID0+IHtcbiAgICBpZiAoIVNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZU5hbWUuc3Vic3RyKDAsIG5vZGVOYW1lLmxlbmd0aCAtIDUpO1xuICB9LFxuXG4gIC8vIHBhcnNlRGF0YVBheWxvYWQ6IChlbnRyeSwgZGV2aWNlVG9CaW5kLCBjYWxsYmFjaykgPT4ge1xuICAvLyAgIGxldCB4bWwgPSBlbnRyeS50b1N0cmluZygpO1xuICAvLyAgIHhtbDJqcy5wYXJzZVN0cmluZyh4bWwsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAvLyAgICAgbGV0IGRhdGFUYWcgPSByZXN1bHQuZGF0YTtcbiAgLy8gICAgIGxldCB0cmFuc2R1Y2VyVmFsdWVUYWdzID0gZGF0YVRhZy50cmFuc2R1Y2VyVmFsdWU7XG4gIC8vICAgICBsZXQgdmFsdWVzID0gW107XG4gIC8vICAgICBmb3IgKGxldCB0VmFsdWVUYWcgb2YgdHJhbnNkdWNlclZhbHVlVGFncykge1xuICAvLyAgICAgICBsZXQgdkF0dHJzID0gdFZhbHVlVGFnLiQ7XG4gIC8vICAgICAgIGxldCB2SWQgPSB2QXR0cnMuaWQ7XG4gIC8vICAgICAgIGxldCB2UmF3ID0gdkF0dHJzLnJhd1ZhbHVlIHx8IG51bGw7XG4gIC8vICAgICAgIGxldCB2VHlwZWQgPSB2QXR0cnMudHlwZWRWYWx1ZSB8fCBudWxsO1xuICAvLyAgICAgICBsZXQgdlRpbWVzdGFtcCA9IFNveFV0aWwucGFyc2VUaW1lc3RhbXAodkF0dHJzLnRpbWVzdGFtcCk7XG4gIC8vXG4gIC8vICAgICAgIGxldCB0VmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKHZJZCwgdlJhdywgdlR5cGVkLCB2VGltZXN0YW1wKTtcbiAgLy8gICAgICAgdmFsdWVzLnB1c2godFZhbHVlKTtcbiAgLy8gICAgIH1cbiAgLy9cbiAgLy8gICAgIGxldCBkYXRhID0gbmV3IERhdGEoZGV2aWNlVG9CaW5kLCB2YWx1ZXMpO1xuICAvLyAgICAgLy8gbGV0IGRhdGEgPSBuZXcgRGF0YU1vZHVsZS5EYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgLy8gICAgIGNhbGxiYWNrKGRhdGEpO1xuICAvLyAgIH0pO1xuICAvLyB9LFxuXG4gIHBhcnNlRGF0YVBheWxvYWQ6IChzb3hDb25uLCBlbnRyeSwgY2FsbGJhY2spID0+IHtcbiAgICBsZXQgbWVzc2FnZVRhZyA9IGVudHJ5O1xuICAgIGxldCBldmVudFRhZyA9IGVudHJ5Ll9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICBsZXQgaXRlbXNUYWcgPSBldmVudFRhZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgbGV0IGl0ZW1UYWcgPSBpdGVtc1RhZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgbGV0IGRhdGFUYWcgPSBpdGVtVGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICBsZXQgdGRyVGFncyA9IGRhdGFUYWcuX2NoaWxkTm9kZXNMaXN0O1xuXG4gICAgbGV0IG1lc3NhZ2VUYWdBdHRycyA9IG1lc3NhZ2VUYWcuX2F0dHJpYnV0ZXM7XG4gICAgbGV0IHNlcnZpY2UgPSBtZXNzYWdlVGFnQXR0cnNbJ2Zyb20nXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgbGV0IGRvbWFpbiA9IHNlcnZpY2Uuc3Vic3RyaW5nKDcpOyAgLy8gc294Li4uXG4gICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBkb21haW4gPSAnICsgZG9tYWluKTtcblxuICAgIGxldCBpdGVtc1RhZ0F0dHJzID0gaXRlbXNUYWcuX2F0dHJpYnV0ZXM7XG4gICAgbGV0IG5vZGUgPSBpdGVtc1RhZ0F0dHJzWydub2RlJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgcGFyc2VEYXRhUGF5bG9hZDogbm9kZSA9ICcgKyBub2RlKTtcbiAgICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IGRldmljZU5hbWUgPSAnICsgZGV2aWNlTmFtZSk7XG5cbiAgICBsZXQgZGV2aWNlVG9CaW5kID0gbmV3IERldmljZShzb3hDb25uLCBkZXZpY2VOYW1lLCBkb21haW4pO1xuXG4gICAgbGV0IHZhbHVlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgdGRyVGFnIG9mIHRkclRhZ3MpIHtcbiAgICAgIGxldCB0YWdOYW1lID0gdGRyVGFnLl9sb2NhbE5hbWU7XG5cbiAgICAgIC8vIGNvbWUgaW4gJ3RyYW5zZHVjZXJWYWx1ZScgYW5kICd0cmFuc2R1Y2VydmFsdWUnXG4gICAgICBpZiAodGFnTmFtZSAhPT0gJ3RyYW5zZHVjZXJWYWx1ZScgJiYgdGFnTmFtZSAhPT0gJ3RyYW5zZHVjZXJ2YWx1ZScpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyMjIyB0YWdOYW1lICE9PSB0cmFuc2R1Y2VyVih2KWFsdWUsIHNraXBwaW5nOiBuYW1lPScgKyB0YWdOYW1lKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZygnIyMjIGV4YW1pbmUgdGFnPScgKyB0YWdOYW1lKTtcblxuICAgICAgLy8gbGV0IGF0dHJzID0gdGRyVGFnLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIGxldCBhdHRycyA9IHRkclRhZy5fYXR0cmlidXRlcztcbiAgICAgIGxldCBhdHRyTmFtZXMgPSBPYmplY3Qua2V5cyhhdHRycyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnIyMjIGF0dHJOYW1lcz0nICsgSlNPTi5zdHJpbmdpZnkoYXR0ck5hbWVzKSk7XG5cbiAgICAgIGxldCB0cmFuc2R1Y2VySWQgPSBhdHRyc1snaWQnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG5cbiAgICAgIHZhciByYXdWYWx1ZSA9IG51bGw7XG4gICAgICB2YXIgdHlwZWRWYWx1ZSA9IG51bGw7XG5cbiAgICAgIC8vIGlmIGNhbWVsQ2FzZSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICBpZiAoYXR0cnNbJ3Jhd1ZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByYXdWYWx1ZSA9IGF0dHJzWydyYXdWYWx1ZSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzWyd0eXBlZFZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0eXBlZFZhbHVlID0gYXR0cnNbJ3R5cGVkVmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGxvd2VyY2FzZSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICBpZiAoYXR0cnNbJ3Jhd3ZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByYXdWYWx1ZSA9IGF0dHJzWydyYXd2YWx1ZSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzWyd0eXBlZHZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0eXBlZFZhbHVlID0gYXR0cnNbJ3R5cGVkdmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICB9XG5cblxuICAgICAgdmFyIHRpbWVzdGFtcCA9IGF0dHJzWyd0aW1lc3RhbXAnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG5cbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgdGltZXN0YW1wID0gRGF0ZS5wYXJzZSh0aW1lc3RhbXApO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKFxuICAgICAgICB0cmFuc2R1Y2VySWQsIHJhd1ZhbHVlLCB0eXBlZFZhbHVlLCB0aW1lc3RhbXApO1xuICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBhZGRlZCB0cmFuc2R1Y2VyIHZhbHVlOiBpZD0nICsgdHJhbnNkdWNlcklkKTtcbiAgICB9XG5cbiAgICBsZXQgZGF0YSA9IG5ldyBEYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSxcblxuICBwYXJzZU1ldGFQYXlsb2FkOiAoZW50cnksIGRldmljZVRvQmluZCwgY2FsbGJhY2spID0+IHtcbiAgICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICB4bWwyanMucGFyc2VTdHJpbmcoeG1sLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgIGxldCBkZXZpY2VUYWcgPSByZXN1bHQuZGV2aWNlO1xuICAgICAgbGV0IGRBdHRycyA9IGRldmljZVRhZy4kO1xuXG4gICAgICBsZXQgZE5hbWUgPSBkQXR0cnMubmFtZTtcbiAgICAgIGxldCBkSWQgPSBkQXR0cnMuaWQ7XG4gICAgICBsZXQgZFR5cGUgPSBkQXR0cnMudHlwZTtcbiAgICAgIGxldCBkU2VyaWFsTnVtYmVyID0gZEF0dHJzLnNlcmlhbE51bWJlcjtcblxuICAgICAgbGV0IG1ldGFUcmFuc2R1Y2VycyA9IFtdO1xuICAgICAgbGV0IHRyYW5zZHVjZXJUYWdzID0gZGV2aWNlVGFnLnRyYW5zZHVjZXI7XG4gICAgICBmb3IgKGxldCB0VGFnIG9mIHRyYW5zZHVjZXJUYWdzKSB7XG4gICAgICAgIGxldCB0QXR0cnMgPSB0VGFnLiQ7XG5cbiAgICAgICAgbGV0IHROYW1lID0gdEF0dHJzLm5hbWU7XG4gICAgICAgIGxldCB0SWQgPSB0QXR0cnMuaWQ7XG4gICAgICAgIGxldCB0Q2FuQWN0dWF0ZSA9ICh0QXR0cnMuY2FuQWN0dWF0ZSB8fCBcImZhbHNlXCIpID09PSBcInRydWVcIjtcbiAgICAgICAgbGV0IHRIYXNPd25Ob2RlID0gKHRBdHRycy5oYXNPd25Ob2RlIHx8IFwiZmFsc2VcIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICBsZXQgdFVuaXRzID0gdEF0dHJzLnVuaXRzIHx8IG51bGw7XG4gICAgICAgIGxldCB0VW5pdFNjYWxhciA9IHRBdHRycy51bml0U2NhbGFyIHx8IG51bGw7XG4gICAgICAgIGxldCB0TWluVmFsdWUgPSB0QXR0cnMubWluVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgbGV0IHRNYXhWYWx1ZSA9IHRBdHRycy5tYXhWYWx1ZSB8fCBudWxsO1xuICAgICAgICBsZXQgdFJlc29sdXRpb24gPSB0QXR0cnMucmVzb2x1dGlvbiB8fCBudWxsO1xuXG4gICAgICAgIGxldCB0cmFuc2R1Y2VyID0gbmV3IE1ldGFUcmFuc2R1Y2VyKFxuICAgICAgICAgIGRldmljZVRvQmluZCwgdE5hbWUsIHRJZCwgdENhbkFjdHVhdGUsIHRIYXNPd25Ob2RlLCB0VW5pdHMsXG4gICAgICAgICAgdFVuaXRTY2FsYXIsIHRNaW5WYWx1ZSwgdE1heFZhbHVlLCB0UmVzb2x1dGlvbik7XG5cbiAgICAgICAgbWV0YVRyYW5zZHVjZXJzLnB1c2godHJhbnNkdWNlcik7XG4gICAgICB9XG5cbiAgICAgIGxldCBtZXRhID0gbmV3IERldmljZU1ldGEoXG4gICAgICAgIGRldmljZVRvQmluZCwgZElkLCBkVHlwZSwgZFNlcmlhbE51bWJlciwgbWV0YVRyYW5zZHVjZXJzKTtcbiAgICAgIGNhbGxiYWNrKG1ldGEpO1xuICAgIH0pO1xuICB9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNveFV0aWw7XG4iXX0=