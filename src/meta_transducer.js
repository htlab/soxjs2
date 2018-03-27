class MetaTransducer {

  constructor(device, name, tdrId, _canActuate, _hasOwnNode, units,
      unitScalar, minValue, maxValue, resolution) {
    this.device = device;
    this.name = name;
    this.tdrId = tdrId;
    this._canActuate = _canActuate;
    this._hasOwnNode = _hasOwnNode;
    this.units = units;
    this.unitScalar = unitScalar;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.resolution = resolution;
  }

  getDevice() {
    return this.device;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.tdrId;
  }

  canActuate() {
    return this._canActuate;
  }

  hasOwnNode() {
    return this._hasOwnNode;
  }

  getUnits() {
    return this.units;
  }

  getUnitScalar() {
    return this.unitScalar;
  }

  getMinValue() {
    return this.minValue;
  }

  getMaxValue() {
    return this.maxValue;
  }

  getResolution() {
    return this.resolution;
  }

  getXmlAttrs() {
    let attrs = {
        name: this.name,
        id: this.tdrId,
        // canActuate: String(this.canActuate()),
        // hasOwnNode: String(this.hasOwnNode()),
        // units: this.units,
        // unitScalar: this.unitScalar,
        // minValue: this.minValue,
        // maxValue: this.maxValue,
        // resolution: this.resolution
    }

    if (this._canActuate !== undefined) {
      attrs.canActuate = String(this.canActuate());
    }

    if (this._hasOwnNode !== undefined) {
      attrs.hasOwnNode = String(this.hasOwnNode());
    }

    if (this.units) {
      attrs.units = this.units;
    }

    if (this.unitScalar) {
      attrs.unitScalar = this.unitScalar;
    }

    if (this.minValue) {
      attrs.minValue = this.minValue;
    }

    if (this.maxValue) {
      attrs.maxValue = this.maxValue;
    }

    if (this.resolution) {
      attrs.resolution = this.resolution;
    }

    return attrs;
  }

  _getContentForXmlBuild() {
    // build content for xml2js.Builder()
    return { '$': this.getXmlAttrs() };
  }

}


module.exports = MetaTransducer;
