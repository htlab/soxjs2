
var SoxConnection = require("../lib/sox_connection");
var Device = require("../lib/device");
var DeviceMeta = require("../lib/device_meta");
var MetaTransducer = require("../lib/meta_transducer");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "miroguest"
};
var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

// var dn = '_test1016_3';
var dn = 'test1016sono4';
// var dn = 'test1016sono7';
var domain = conn.getDomain();


// var dataNode = dn  +'_data';
conn.connect(function() {
  console.log("@@@@ create_device_test 1");
  var device = new Device(conn, dn, conn.getDomain());

  var suc = function() {
    console.log("\n\n@@@@ suc\n\n");
  };

  var err = function() {
    console.log("\n\n@@@@ err\n\n");
  };

  conn.deleteDevice(device, suc, err);
});
