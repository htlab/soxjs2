
var SoxConnection = require("../lib/sox_connection");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "miroguest"
};

var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

// var deviceName = "kyotoweather";
// var deviceName = "naver";
var deviceName = "fujisawaGeoTweets";
var device = conn.bind(deviceName);

conn.connect(function() {
  console.log("@@@ connected");
  conn.fetchMeta(device, function(meta) {
      console.log("\n\n@!@!@!@!@! got meta");
      var mts = meta.getMetaTransducers();
      for (var i = 0; i < mts.length; i++) {
          var mt = mts[i];
          console.log(mt.getId());
      }
      conn.disconnect();
  });
});
