
var SoxConnection = require("../lib/sox_connection");

var soxConfig = {  // FIXME
    boshService: "http://sox.ht.sfc.keio.ac.jp:5280/http-bind/",
    jid: "guest@sox.ht.sfc.keio.ac.jp",
    password: "xxxx"
};

// *** user login
// var conn = new SoxConnection(soxConfig.boshService, soxConfig.jid, soxConfig.password);

// *** anonymous login (jid=null does not work!)
var conn = new SoxConnection(soxConfig.boshService, 'sox.ht.sfc.keio.ac.jp');

// var deviceName = "Barcelona_weather";
// var deviceName = "genova5";
// var deviceName = "Disney";
var deviceName = "fujisawaGeoTweets";
var device = conn.bind(deviceName);

conn.connect(function() {
  console.log("@@@ connected");
  var listenerId = conn.addListener(device, function(data) {
    console.log("@@@@ data retrieved");
  });
  console.log("@@@ listener ID = " + listenerId);
  conn.subscribe(device);
});
