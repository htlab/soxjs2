import xml2js from "xml2js";

// import * as DataModule from "./data";
// import Data as SoxData from "./data";
import Data from "./data";
import TransducerValue from "./transducer_value";
import DeviceMeta from "./device_meta";
import MetaTransducer from "./meta_transducer";
import Device from "./device";


let SoxUtil = {

    parseTimestamp: (timestampStr) => {
      return new Date(timestampStr);
    },

    extractDevices: (soxConn, entry, callback) => {
      let xml = entry.toString();
      xml2js.parseString(xml, (error, result) => {

        // console.log("parseString error: " + error);

        let iqTag = result.iq;
        let queryTag = iqTag.query[0];
        let itemTags = queryTag.item;

        // if both "_meta" and "_data" exists, it should be sox device
        let nodeCheck = {};
        for (let itemTag of itemTags) {
          let itemAttrs = itemTag.$;
          let node = itemAttrs.node;

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

        let devices = [];
        for (let deviceName of Object.keys(nodeCheck)) {
          let check = nodeCheck[deviceName];
          if (check.meta && check.data) {
            let device = soxConn.bind(deviceName);
            devices.push(device);
          }
        }

        callback(devices);
      });
    },

    endsWithMeta: (nodeName) => {
      let len = nodeName.length;
      return (5 <= len) && nodeName.substring(len - 5, len) === "_meta";
    },

    endsWithData: (nodeName) => {
      let len = nodeName.length;
      return (5 <= len) && nodeName.substring(len - 5, len) === "_data";
    },

    cutMetaSuffix: (nodeName) => {
      if (!SoxUtil.endsWithMeta(nodeName)) {
        return nodeName;
      }
      return nodeName.substr(0, nodeName.length - 5);
    },

    cutDataSuffix: (nodeName) => {
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

    parseDataPayload: (soxConn, entry, callback) => {
      let messageTag = entry;
      let eventTag = entry._childNodesList[0];
      let itemsTag = eventTag._childNodesList[0];
      let itemTag = itemsTag._childNodesList[0];
      let dataTag = itemTag._childNodesList[0];
      let tdrTags = dataTag._childNodesList;

      let messageTagAttrs = messageTag._attributes;
      let service = messageTagAttrs['from']._valueForAttrModified;
      let domain = service.substring(7);  // sox...
      // console.log('### parseDataPayload: domain = ' + domain);

      let itemsTagAttrs = itemsTag._attributes;
      let node = itemsTagAttrs['node']._valueForAttrModified;
      // console.log('### parseDataPayload: node = ' + node);
      let deviceName = SoxUtil.cutDataSuffix(node);
      // console.log('### parseDataPayload: deviceName = ' + deviceName);

      let deviceToBind = new Device(soxConn, deviceName, domain);

      let values = [];

      for (let tdrTag of tdrTags) {
        let tagName = tdrTag._localName;
        if (tagName !== 'transducerValue') {
          // console.log('### tagName !== transducerValue, skipping: name=' + tagName);
          continue;
        }
        // console.log('### examine tag=' + tagName);

        // let attrs = tdrTag._valueForAttrModified;
        let attrs = tdrTag._attributes;
        let attrNames = Object.keys(attrs);
        // console.log('### attrNames=' + JSON.stringify(attrNames));

        let transducerId = attrs['id']._valueForAttrModified;
        let rawValue = null;
        if (attrs['rawValue'] !== undefined) {
          rawValue = attrs['rawValue']._valueForAttrModified;
        }
        let typedValue = null;
        if (attrs['typedValue'] !== undefined) {
          typedValue = attrs['typedValue']._valueForAttrModified;
        }
        var timestamp = attrs['timestamp']._valueForAttrModified;

        if (timestamp) {
          timestamp = Date.parse(timestamp);
        }

        let value = new TransducerValue(
          transducerId, rawValue, typedValue, timestamp);
        values.push(value);
        // console.log('### parseDataPayload: added transducer value: id=' + transducerId);
      }

      let data = new Data(deviceToBind, values);
      return data;
    },

    parseMetaPayload: (entry, deviceToBind, callback) => {
      let xml = entry.toString();
      xml2js.parseString(xml, (err, result) => {
        let deviceTag = result.device;
        let dAttrs = deviceTag.$;

        let dName = dAttrs.name;
        let dId = dAttrs.id;
        let dType = dAttrs.type;
        let dSerialNumber = dAttrs.serialNumber;

        let metaTransducers = [];
        let transducerTags = deviceTag.transducer;
        for (let tTag of transducerTags) {
          let tAttrs = tTag.$;

          let tName = tAttrs.name;
          let tId = tAttrs.id;
          let tCanActuate = (tAttrs.canActuate || "false") === "true";
          let tHasOwnNode = (tAttrs.hasOwnNode || "false") === "true";
          let tUnits = tAttrs.units || null;
          let tUnitScalar = tAttrs.unitScalar || null;
          let tMinValue = tAttrs.minValue || null;
          let tMaxValue = tAttrs.maxValue || null;
          let tResolution = tAttrs.resolution || null;

          let transducer = new MetaTransducer(
            deviceToBind, tName, tId, tCanActuate, tHasOwnNode, tUnits,
            tUnitScalar, tMinValue, tMaxValue, tResolution);

          metaTransducers.push(transducer);
        }

        let meta = new DeviceMeta(
          deviceToBind, dId, dType, dSerialNumber, metaTransducers);
        callback(meta);
      });
    },

};

module.exports = SoxUtil;
