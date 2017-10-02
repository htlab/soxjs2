
import xml2js from 'xml2js';

// TODO
// import SoxUtil from './sox_util';
import XmlUtil from './xml_util';


class Data {

  constructor(device, transducerValues) {
    this.device = device;
    this.transducerValues = transducerValues;
  }

  getDevice() {
    return this.device;
  }

  getTransducerValues() {
    return this.transducerValues;
  }

  getRawValues() {
    let vals = this.getTransducerValues();
    let ret = {};
    for (let v of vals) {
      let tid = v.getTransducerId();
      ret[tid] = v.getRawValue();
    }
    return ret;
  }

  getTypedValues() {
    let vals = this.getTransducerValues();
    let ret = {};
    for (let v of vals) {
      let tid = v.getTransducerId();
      ret[tid] = v.getTypedValue();
    }
    return ret;
  }

  _getContentForXmlBuild() {
    // build content for xml2js.Builder
    var tValues = this.transducerValues.map(tv => tv._getContentForXmlBuild());
    return {
      device: {
        '$': {
          xmlns: 'http://jabber.org/protocol/sox'
        },
        transducerValue: tValues
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

  appendToNode(node) {
    const ret = node.c('data', { xmlns: 'http://jabber.org/protocol/sox' });

    for (const tv of this.transducerValues) {
      ret.c('transducerValue', tv.getXmlAttrs()).up();
    }

    return ret;
  }

}


module.exports = Data;
