class Device {

  constructor(soxConnection, deviceName, domain) {
    if (domain === undefined) {
      domain = soxConnection.getDomain();
    }

    this.soxConnection = soxConnection;
    this.name = deviceName;
    this.domain = domain;
  }

  getName() {
    return this.name;
  }

  getDomain() {
    return this.domain;
  }

  getMetaNodeName() {
    return this.name + "_meta";
  }

  getDataNodeName() {
    return this.name + "_data";
  }

  getBoundSoxConnection() {
    return this.soxConnection;
  }

  addListener(callback, listenerId) {
    let conn = this.getBoundSoxConnection();
    conn.addListeer(this, callback, listenerId);
  }

  removeAllListener() {
    let conn = this.getBoundSoxConnection();
    conn.removeAllListenerForDevice(this);
  }

  fetchMeta(callback) {
    let conn = this.getBoundSoxConnection();
    conn.fetchMeta(this, callback);
  }

  publish(data) {
    let conn = this.getBoundSoxConnection();
    return conn.publish(self, data);
  }

}

module.exports = Device;
