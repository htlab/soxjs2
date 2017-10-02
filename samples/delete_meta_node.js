
var SoxConnection = require("../lib/sox_connection");
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
  console.log("\n\n$$$$$  connected\n\n");
  var suc = function() {
    console.log("\n\n@@@@ suc\n\n");
  };

  var err = function() {
    console.log("\n\n@@@@ err\n\n");
  };

  // conn._createNode(dataNode, domain, suc, err);
  conn._deleteNode(metaNode, domain, suc, err);
});
