class TransducerValue {

  constructor(transducerId, rawValue, typedValue, timestamp) {
    this.transducerId = transducerId;
    this.rawValue = rawValue;
    this.typedValue = typedValue;
    if (timestamp === undefined) {
      timestamp = new Date();
    }
    this.timestamp = timestamp;
  }

  getTransducerId() {
    return this.transducerId;
  }

  getRawValue() {
    return this.rawValue;
  }

  getTypedValue() {
    return this.typedValue;
  }

  getTimestamp() {
    return this.timestamp;
  }

  _getContentForXmlBuild() {
    // build content for xml2js.Builder
    return { '$': this.getXmlAttrs() };
  }

  getXmlAttrs() {
    let ts = this.timestamp.toISOString();
    return {
      'id': this.transducerId,
      'rawValue': this.rawValue,
      'typedValue': this.typedValue,
      'timestamp': ts
    };
  }

}

module.exports = TransducerValue;
