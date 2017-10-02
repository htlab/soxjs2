
var SoxConnection = require("../lib/sox_connection");
var Device = require("../lib/device");
var DeviceMeta = require("../lib/device_meta");
var MetaTransducer = require("../lib/meta_transducer");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "miroguest"
};
// var conn = new SoxConnection(soxConfig.boshService, 'sox.ht.sfc.keio.ac.jp');
var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

var dn = '_test0930';
var domain = conn.getDomain();

var metaNode = dn  +'_meta';

conn.connect(function() {
  try {
    console.log("\n\n$$$$$  connected\n\n");
    var suc = function() {
      console.log("\n\n@@@@ suc\n\n");
    };

    var err = function() {
      console.log("\n\n@@@@ err\n\n");
    };

    // conn._createNode(metaNode, domain, suc, err);
    var device = new Device(conn, dn, conn.getDomain());
    var hogeTransducer = new MetaTransducer( // TODO
      device,
      "hoge",
      "hoge",
      false,
      false
    );
    var metaTransducers = [
      hogeTransducer
    ];
    var deviceId = "hoge111";
    var deviceType = "hogetype";
    var serialNumber = "1";
    var deviceMeta = new DeviceMeta(
      device,
      deviceId,
      deviceType,
      serialNumber,
      metaTransducers
    );

    // var publishContent = deviceMeta.toXmlString();
    var publishContent = deviceMeta;

    conn._publishToNode(
      metaNode,
      device.getDomain(),
      publishContent,
      suc,
      err
    );

  } catch (e) {
    console.error(e.stack);

  }
});
