
var SoxConnection = require("../lib/sox_connection");
var Device = require("../lib/device");
// var DeviceMeta = require("../lib/device_meta");
// var MetaTransducer = require("../lib/meta_transducer");

// var TransducerValue = require("../lib/transducer_value");
// var Data = require("../lib/data");

var soxConfig = {  // FIXME
  boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
  jid: "guest@sox.ht.sfc.keio.ac.jp",
  password: "miroguest"
};
var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

var dn = 'accessModelTest_data';
var domain = conn.getDomain();
var accessModel = 'open' // 'open' or 'whitelist'
var affaliate = ['mina@sox.ht.sfc.keio.ac.jp', 'takuro@sox.ht.sfc.keio.ac.jp']
conn.connect(function () {
  var suc = function () {
    console.log("\n\n@@@@ suc\n\n");
  };

  var err = function () {
    console.log("\n\n@@@@ err\n\n");
  };

  conn.setAccessPermission(dn, domain, accessModel, affaliate, suc, err)

});
