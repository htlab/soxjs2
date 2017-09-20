

import Device from "./device";
import DeviceMeta from "./device_meta";
import MetaTransducer from "./meta_transducer";

var _xmlDeclarePatStr = "^<\\?xml[^>]+?>";
var _xmlDeclarePat = new RegExp(_xmlDeclarePatStr);


let XmlUtil = {

  removeXmlDeclaration: (xmlString) => {
    return xmlString.replace(_xmlDeclarePat, "");
  },

  dumpDom: (dom, indent) => {
    if (indent === undefined) {
      indent = 0;
    }
    let tagName = dom._localName;
    let children = dom._childNodesList;
    let attrs = dom._attributes;

    var sp = "";
    for (var i = 0; i < indent; i++) {
      sp = sp + "  ";
    }

    let log = (msg) => {
      console.log(sp + msg);
    };

    log("---tag: " + tagName);
    // log("---attributes:");
    // for (let aName of Object.keys(attrs)) {
    //   let av = attrs[aName]._valueForAttrModified;
    //   log("  - " + aName + ": " + av);
    // }
    if (children && 0 < children.length) {
      log("---children:");
      for (var i = 0; i < children.length; i++) {
        let c = children[i];
        XmlUtil.dumpDom(c, indent + 1);
      }
    }
  },

  convRecentItem: (soxConnection, iq) => {
    XmlUtil.dumpDom(iq);
    let fromService = iq._attributes['from']._valueForAttrModified;
    let fromDomain = fromService.substring(7);

    let pubsubTag = iq._childNodesList[0];
    let itemsTag = pubsubTag._childNodesList[0];
    let itemTag = itemsTag._childNodesList[0];
    let deviceTag = itemTag._childNodesList[0];
    let transducerTags = deviceTag._childNodesList;

    let getAttr = (attrs, name) => {
      let v = attrs[name];
      return (v) ? v._valueForAttrModified : v;
    };

    // device: name, id, type, serialNumber
    let deviceTagAttr = deviceTag._attributes;
    let deviceName = getAttr(deviceTagAttr, 'name');
    let deviceId = getAttr(deviceTagAttr, 'id');
    let deviceType = getAttr(deviceTagAttr, 'type');
    let deviceSerialNumber = getAttr(deviceTagAttr, 'serialNumber');

    // transducer: name, id, canActuate, hasOwnNode, units,
    //             unitScalar, minValue, maxValue, resolution
    let device = new Device(soxConnection, deviceName, fromDomain);
    let transducers = [];

    for (let i = 0; i < transducerTags.length; i++) {
      let tdrTag = transducerTags[i];
      if (tdrTag._localName !== 'transducer') {
        continue;
      }
      let tdrAttrs = tdrTag._attributes;

      transducers.push(new MetaTransducer(
        device,
        getAttr(tdrAttrs, 'name'),
        getAttr(tdrAttrs, 'id'),
        getAttr(tdrAttrs, 'canActuate'),
        getAttr(tdrAttrs, 'hasOwnNode'),
        getAttr(tdrAttrs, 'units'),
        getAttr(tdrAttrs, 'unitScalar'),
        getAttr(tdrAttrs, 'minValue'),
        getAttr(tdrAttrs, 'maxValue'),
        getAttr(tdrAttrs, 'resolution')
      ));
    }

    let meta = new DeviceMeta(
      device, deviceId, deviceType, deviceSerialNumber, transducers);
    return meta;
  },

  convSubscriptions: (iq) => {
    let pubsubTag = iq._childNodesList[0];
    let subscriptionsTag = pubsubTag._childNodesList[0];
    let subscriptionTags = subscriptionsTag._childNodesList;

    let ret = {};
    for (var i = 0; i < subscriptionTags.length; i++) {
      let subscriptionTag = subscriptionTags[i];

      let attrs = subscriptionTag._attributes;

      let jid = attrs.jid._valueForAttrModified;
      if (ret[jid] === undefined) {
        ret[jid] = {};
      }

      let nodeName = attrs.node._valueForAttrModified;
      let subidAttr = attrs.subid;
      if (subidAttr !== undefined) {
        let subid = subidAttr._valueForAttrModified;
        if (ret[jid][nodeName] === undefined) {
          ret[jid][nodeName] = [];
        }
        ret[jid][nodeName].push(subid);
      } else {
        ret[jid][nodeName] = [];
      }
    }

    return ret;
  }

};

module.exports = XmlUtil;
