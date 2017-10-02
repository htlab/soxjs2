
var SoxConnection = require("../lib/sox_connection");
var Device = require("../lib/device");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "miroguest"
};
var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

var dn = '_test0930_2';
var domain = conn.getDomain();


// var dataNode = dn  +'_data';
conn.connect(function() {
  var device = new Device(conn, dn, conn.getDomain());
  // TODO: meta

  var suc = function() {
    console.log("\n\n@@@@ suc\n\n");
  };

  var err = function() {
    console.log("\n\n@@@@ err\n\n");
  };

});
