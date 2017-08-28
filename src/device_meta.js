import xml2js from 'xml2js';
import XmlUtil from './xml_util';

class DeviceMeta {

  constructor(device, deviceId, deviceType, serialNumber, metaTransducers) {
    this.device = device;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.serialNumber = serialNumber;
    this.metaTransducers = metaTransducers;
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
    let builder = new xml2js.Builder({ renderOpts: {pretty: false} });
    let content = this._getContentForXmlBuild();
    let rawXmlStr = builder.buildObject(content);

    // remove <?xml ....?>
    let trimmedXmlStr = XmlUtil.removeXmlDeclaration(rawXmlStr);

    return trimmedXmlStr;
  }

}

module.exports = DeviceMeta;
