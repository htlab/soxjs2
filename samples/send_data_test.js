
var SoxConnection = require("../lib/sox_connection");
var Device = require("../lib/device");
// var DeviceMeta = require("../lib/device_meta");
// var MetaTransducer = require("../lib/meta_transducer");

var TransducerValue = require("../lib/transducer_value");
var Data = require("../lib/data");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "miroguest"
};
var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

var dn = '_test1016_3';
var domain = conn.getDomain();
conn.connect(function() {
  var device = conn.bind(dn, domain);
  var tv1 = new TransducerValue('hoge', 'raw111', 'typed111');
  var values = [tv1];
  var data = new Data(device, values);

  var suc = function() {
    console.log("\n\n@@@@ suc\n\n");
  };

  var err = function() {
    console.log("\n\n@@@@ err\n\n");
  };

  conn.publish(data, suc, err);
});
