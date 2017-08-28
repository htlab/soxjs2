var obj;
obj = {
  data: {
    transducerValue: [
      {
        id: "tid1",
        rawValue: "hoge",
        timestamp: "2014-05-14T16:33:32.778352+09:00"
      },
      {
        id: "tid2",
        rawValue: "mogera",
        timestamp: "2014-05-14T16:33:32.778352+09:00"
      }
    ]
  }
}

obj = {
  data: {
    transducerValue: [
      {
        '$': {
          id: "tid1",
          rawValue: "hoge",
          timestamp: "2014-05-14T16:33:32.778352+09:00"
        }
      },
      {
        '$': {
          id: "tid2",
          rawValue: "mogera",
          timestamp: "2014-05-14T16:33:32.778352+09:00"
        }
      }
    ]
  }
}

// '<data xmlns="http://jabber.org/protocol/sox">
// <transducerValue id="simple" timestamp="2014-05-14T16:33:32.778352+09:00" typedValue="50"/>
// <transducerValue id="simple2" timestamp="2014-05-14T16:33:32.778352+09:00" typedValue="60"/>
// </data>'


var xml2js = require("xml2js");

// sys.print();

var b = new xml2js.Builder();
var x = b.buildObject(obj);

// var sys = require("sys");
// sys.print(x);

var deleteXmlDelrare = function(xmlString) {
  var patStr = "^<\\?xml[^>]+?>";
  var pat = new RegExp(patStr);
  return xmlString.replace(pat, "");
};

console.log(x);

console.log("-------------------");

console.log(deleteXmlDelrare(x));
