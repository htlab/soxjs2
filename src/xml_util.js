
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
