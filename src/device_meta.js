import xml2js from 'xml2js';
// import XmlUtil from './xml_util';

const _xmlDeclarePatStr = "^<\\?xml[^>]+?>";
const _xmlDeclarePat = new RegExp(_xmlDeclarePatStr);

class DeviceMeta {

  constructor(device, deviceId, deviceType, serialNumber, metaTransducers) {
    this.device = device;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.serialNumber = serialNumber;
    this.metaTransducers = metaTransducers;
  }

  getXmlAttrs() {
    return {
      id: this.deviceId,
      type: this.deviceType,
      serialNumber: this.serialNumber
    };
  }

  getDevice() {
    return this.device;
  }

  getName() {
    return this.getDevice().getName();
  }

  getId() {
    return this.deviceId;
  }

  getType() {
    return this.deviceType;
  }

  getSerialNumber() {
    return this.serialNumber;
  }

  getMetaTransducers() {
    return this.metaTransducers;
  }

  _getContentForXmlBuild() {
    // build content for xml2js.Builder
    var tMetas = this.metaTransducers.map(mtv => mtv._getContentForXmlBuild());
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

  toXmlString() {
    // import XmlUtil from './xml_util';
    const builder = new xml2js.Builder({ renderOpts: {pretty: false} });
    const content = this._getContentForXmlBuild();
    const rawXmlStr = builder.buildObject(content);

    // remove <?xml ....?>
    // let trimmedXmlStr = XmlUtil.removeXmlDeclaration(rawXmlStr);
    const trimmedXmlStr = rawXmlStr.replace(_xmlDeclarePat, "");

    return trimmedXmlStr;
  }

  appendToNode(node) {
    // used when publish
    const ret = node.c('device', this.getXmlAttrs());

    for (const tdr of this.metaTransducers) {
      ret.c('transducer', tdr.getXmlAttrs()).up();
    }

    return ret;
  }

}

module.exports = DeviceMeta;
