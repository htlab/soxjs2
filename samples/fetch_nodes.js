var SoxConnection = require("../lib/sox_connection");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "xxxx"
};

// *** user login
// var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

// *** anonymous login
var conn = new SoxConnection(soxConfig.boshService, "sox.ht.sfc.keio.ac.jp");

conn.connect(function() {
  console.log("@@@ connected");
  conn.fetchDevices(function(devices) {
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      console.log(device.getName());
    }

    conn.disconnect();
    console.log("@@@ disconnected");
  });

});
console.log("@@@ connect() called");
