"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeStrophe = require("node-strophe");

var _nodeStrophe2 = _interopRequireDefault(_nodeStrophe);

var _xml2js = require("xml2js");

var _xml2js2 = _interopRequireDefault(_xml2js);

var _sox_util = require("./sox_util");

var _sox_util2 = _interopRequireDefault(_sox_util);

var _xml_util = require("./xml_util");

var _xml_util2 = _interopRequireDefault(_xml_util);

var _device = require("./device");

var _device2 = _interopRequireDefault(_device);

var _transducer_value = require("./transducer_value");

var _transducer_value2 = _interopRequireDefault(_transducer_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Strophe = _nodeStrophe2.default.Strophe;

var $pres = Strophe.$pres;
var $iq = Strophe.$iq;

var PUBSUB_NS = "http://jabber.org/protocol/pubsub";

var SoxConnection = function () {
  function SoxConnection(boshService, jid, password) {
    _classCallCheck(this, SoxConnection);

    this.boshService = boshService;
    this.jid = jid;
    this.password = password;

    this._rawConn = null;
    this._isConnected = false;
    this._dataCallbacks = {};
    this._metaCallbacks = {};
  }

  _createClass(SoxConnection, [{
    key: "_stropheOnRawInput",
    value: function _stropheOnRawInput(data) {
      // console.log("<<<<<< input");
      // console.log(data);
    }
  }, {
    key: "_stropheOnRawOutput",
    value: function _stropheOnRawOutput(data) {
      // console.log(">>>>>> output");
      // console.log(data);
    }
  }, {
    key: "_stropheOnConnConnecting",
    value: function _stropheOnConnConnecting() {}
  }, {
    key: "_stropheOnConnConnected",
    value: function _stropheOnConnConnected() {
      // console.log("connected 1");
      this._rawConn.send($pres().c('priority').t('-1'));
      // console.log("### connected 2");

      // this._rawConn.PubSub.bind(
      //   "xmpp:pubsub:last-published-item",
      //   that._onLastPublishedItemReceived
      // );

      // this._rawConn.PubSub.bind(
      //   "xmpp:pubsub:item-published",
      //   that._onPublishedItemReceived
      // );

      var that = this;

      var pubsubHandler = function pubsubHandler(ev) {
        // TODO
        try {
          // console.log('@@@@@ pubsubHandler!');
          // XmlUtil.dumpDom(ev);
          var cb = function cb(data) {
            // console.log("@@@@@ got data!");
          };
          var data = _sox_util2.default.parseDataPayload(that, ev, cb);
          // TODO: dispatch
          that.dispatchData(data);
        } catch (ex) {
          console.error(ex);
        }
        return true; // needed to be called every time
      };

      var service = 'pubsub.' + this.getDomain();

      this._rawConn.addHandler(pubsubHandler, null, 'message', null, null, service);

      this._isConnected = true;
      // console.log("### connected 3");
      if (this._onConnectCallback) {
        // console.log("### connected 3-1");
        this._onConnectCallback();
        // console.log("### connected 3-2");
      }
      // console.log("### connected 4 end");
    }
  }, {
    key: "_stropheOnConnDisconnecting",
    value: function _stropheOnConnDisconnecting() {}
  }, {
    key: "_stropheOnConnDisconnected",
    value: function _stropheOnConnDisconnected() {
      this._rawConn = null;
      this._isConnected = false;
      if (this._onDisconnectCallback) {
        this._onDisconnectCallback();
      }
    }
  }, {
    key: "_stropheOnConnFaill",
    value: function _stropheOnConnFaill() {}
  }, {
    key: "_stropheOnConnectionStatusUpdate",
    value: function _stropheOnConnectionStatusUpdate(status) {
      // console.log("@@ start of _stropheOnConnectionStatusUpdate");
      if (status === Strophe.Strophe.Status.CONNECTING) {
        // console.log("@@connecting");
        this._stropheOnConnConnecting();
      } else if (status === Strophe.Strophe.Status.CONNFAIL) {
        // console.log("@@connfail");
        this._stropheOnConnFaill();
      } else if (status === Strophe.Strophe.Status.DISCONNECTING) {
        // console.log("@@disconnecting");
        this._stropheOnConnDisconnecting();
      } else if (status === Strophe.Strophe.Status.DISCONNECTED) {
        // console.log("@@disconnected");
        this._stropheOnConnDisconnected();
      } else if (status === Strophe.Strophe.Status.CONNECTED) {
        // console.log("@@connected");
        this._stropheOnConnConnected();
      } else {}
      // console.log("@@ UNKNOWN STATUS: " + status);

      // console.log("@@ end of _stropheOnConnectionStatusUpdate");
      return true;
    }

    // _stropheOnLastPublishedItemReceived(obj) {
    //   let node = obj.node;
    //   if (SoxUtil.endsWithMeta(node)) {
    //     this.dispatchMetaPublish(obj);
    //   } else if (SoxUtil.endsWithData(node)) {
    //     this.dispatchDataPublish(obj);
    //   } else {
    //     // FIXME
    //   }
    // }

    // _stropheOnPublishedItemReceived(obj) {
    //   let node = obj.node;
    //   if (SoxUtil.endsWithData(node)) {
    //     this.dispatchDataPublish(obj);
    //   } else {
    //     // FIXME
    //   }
    // }

    // dispatchDataPublish(obj) {
    //   let node = obj.node;
    //   let deviceName = SoxUtil.cutDataSuffix(node);
    //   let deviceListenerTable = this._dataCallbacks[deviceName];
    //   if (deviceListenerTable === undefined) {
    //     return;
    //   }
    //
    //   let deviceToBind = this.bind(deviceName);
    //   let that = this;
    //   let onDataParsed = (data) => {
    //     that._broadcast(deviceListenerTable, data);
    //   };
    //   SoxUtil.parseDataPayload(obj.entry, deviceToBind, onDataParsed);
    //   // this._broadcast(deviceListenerTable, data);
    // }

  }, {
    key: "dispatchData",
    value: function dispatchData(data) {
      var deviceName = data.getDevice().getName();
      var dataListenerTable = this._dataCallbacks[deviceName];
      if (dataListenerTable === undefined) {
        return;
      }

      this._broadcast(dataListenerTable, data);
    }

    // dispatchMetaPublish(obj) {
    //   let node = obj.node;
    //   let deviceName = SoxUtil.cutMetaSuffix(node);
    //   let deviceListenerTable = this._metaCallbacks[deviceName];
    //   if (deviceListenerTable === undefined) {
    //     return;
    //   }
    //
    //   let deviceToBind = this.bind(deviceName);
    //   let that = this;
    //   let onMetaParsed = (meta) => {
    //     that._broadcast(deviceListenerTable, meta);
    //   };
    //   SoxUtil.parseMetaPayload(obj.entry, deviceToBind, onMetaParsed);
    //   // let meta = SoxUtil.parseMetaPayload(obj.entry, deviceToBind);
    //   // this._broadcast(deviceListenerTable, meta);
    // }

  }, {
    key: "getBoshService",
    value: function getBoshService() {
      return this.boshService;
    }
  }, {
    key: "getDomain",
    value: function getDomain() {
      return Strophe.Strophe.getDomainFromJid(this.getJID());
    }
  }, {
    key: "getJID",
    value: function getJID() {
      return this.jid;
    }
  }, {
    key: "getPassword",
    value: function getPassword() {
      return this.password;
    }
  }, {
    key: "connect",
    value: function connect(callback) {
      var conn = new Strophe.Strophe.Connection(this.getBoshService());
      this._onConnectCallback = callback;
      conn.rawInput = this._stropheOnRawInput;
      conn.rawOutput = this._stropheOnRawOutput;
      this._rawConn = conn;
      var jid = this.getJID();
      var password = this.getPassword();

      // without wrapping call of _stropheOnConnectionStatusUpdate, "this" will be missed inside the func
      var that = this;
      var cb = function cb(status) {
        return that._stropheOnConnectionStatusUpdate(status);
      };
      conn.connect(jid, password, cb);
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback) {
      if (this._rawConn !== null && this.isConnected()) {
        this._onDisconnectCallback = callback;
        this._rawConn.disconnect();
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this._isConnected;
    }
  }, {
    key: "getStropheConnection",
    value: function getStropheConnection() {
      return this._rawConn;
    }
  }, {
    key: "addListener",
    value: function addListener(device, callback, listenerId) {
      if (listenerId === undefined) {
        listenerId = this._genRandomId();
      }
      this._registerDataListener(device, listenerId, callback);
      return listenerId;
    }
  }, {
    key: "removeAllListenerForDevice",
    value: function removeAllListenerForDevice(device) {
      this._dataCallbacks = {};
    }
  }, {
    key: "removeListener",
    value: function removeListener(listenerId) {
      this._removeDataListenerWithId(listenerId);
    }
  }, {
    key: "fetchMeta",
    value: function fetchMeta(device, callback) {
      try {
        var that = this;
        var listenerId = this._genRandomId();
        var metaNode = device.getMetaNodeName();
        var _callback = function _callback(meta) {
          that._removeMetaListenerWithId(listenerId);
          that._rawConn.PubSub.unsubscribe(metaNode);
          callback(meta);
        };
        this._registerMetaListener(device, listenerId, _callback);
        // this.subscribe(device);
        // this._subNode(device.getMetaNodeName(), device.getDomain(), true);
        // let cb = (iq) => {
        //   console.log("requesting recent item");
        //   let service = "pubsub." + that.getDomain();
        //
        //   // https://xmpp.org/extensions/xep-0060.html#subscriber-retrieve-requestrecent
        //
        //   // <iq type='get'
        //   //     from='francisco@denmark.lit/barracks'
        //   //     to='pubsub.shakespeare.lit'
        //   //     id='items2'>
        //   //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
        //   //     <items node='princely_musings' max_items='2'/>
        //   //   </pubsub>
        //   // </iq>
        //   let uniqueId = that._rawConn.getUniqueId("pubsub");
        //   let iq2 = $iq({ type: "get", from: that._rawConn.jid, to: service, id: uniqueId })
        //     .c("pubsub", { xmlns: PUBSUB_NS })
        //     .c("items", { node: node, max_items: 1 });
        //   // that._rawConn.
        //   let suc2 = (iq) => {
        //     console.log("recent request success?");
        //
        //   };
        //   let err2 = (iq) => {
        //     console.log("recent request failed?");
        //
        //   };
        //   that._rawConn.sendIQ(iq2, suc2, err2);
        //
        // };
        // this._unsubNode(device.getMetaNodeName(), device.getDomain(), cb);

        var cb = function cb(iq) {
          // TODO

        };
        this._getSubscription(device.getMetaNodeName(), device.getDomain(), cb);
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_getSubscription",
    value: function _getSubscription(node, domain, cb) {

      //   let iq2 = $iq({ type: "get", from: that._rawConn.jid, to: service, id: uniqueId })
      //     .c("pubsub", { xmlns: PUBSUB_NS })
      //     .c("items", { node: node, max_items: 1 });
      // <iq type='get'
      //     from='francisco@denmark.lit/barracks'
      //     to='pubsub.shakespeare.lit'
      //     id='subscriptions1'>
      //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
      //     <subscriptions/>
      //   </pubsub>
      // </iq>
      var service = "pubsub." + domain;
      var uniqueId = this._rawConn.getUniqueId("pubsub");
      var iq = $iq({ type: "get", from: this._rawConn.jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("subscriptions");

      var suc = function suc(iq) {
        // console.log("get sub ok");
        // XmlUtil.dumpDom(iq);
        var converted = _xml_util2.default.convSubscriptions(iq);
        // console.log("converted ok");
        cb(converted);
      };
      var err = function err(iq) {
        // console.log("get sub failed");

      };

      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "bind",
    value: function bind(deviceName, domain) {
      if (domain === undefined) {
        domain = this.getDomain();
      }

      return new _device2.default(this, deviceName, domain);
    }
  }, {
    key: "fetchDevices",
    value: function fetchDevices(callback, domain) {
      if (domain === undefined) {
        domain = this.getDomain();
      }
      // https://github.com/strophe/strophejs-plugin-pubsub/blob/master/strophe.pubsub.js#L297
      var jid = this.getJID();
      var service = "pubsub." + domain;
      // let iq = $iq({from: jid, to: service, type:'get'})
      //   .c('query', { xmlns: Strophe.Strophe.NS.DISCO_ITEMS });
      var iq = $iq({ from: jid, to: service, type: "get", id: this._rawConn.getUniqueId("pubsub") }).c('query', { xmlns: Strophe.Strophe.NS.DISCO_ITEMS });

      var that = this;
      var success = function success(msg) {

        // DEBUG
        // let s = msg.toString();
        // console.log("@@@@@ inside success of fetchDevices");
        // console.log("typeof(msg)=" + String(typeof(msg)));
        // console.log(JSON.stringify(Object.keys(msg)));
        // // console.log(msg._childNodesList.length);
        // // for (var i = 0; i < msg._childNodesList.length; i++) {
        // //   var cn = msg._childNodesList[i];
        // //   console.log("---child node " + String(i));
        // //   console.log(String(cn));
        // //   console.log(i);
        // //   console.log(JSON.stringify(Object.keys(cn)));
        // // }
        //
        // let query = msg._childNodesList[0];
        // console.log("-----query");
        // let dumpChildInfo = (x, indent) => {
        //   if (!indent) {
        //     indent = 0;
        //   }
        //   var ind = "";
        //   for (var j = 0; j < indent; j++) {
        //     ind = ind + "  ";
        //   }
        //
        //   if (x._childNodesList.length === 0) {
        //     console.log("_localName=" + x._localName + ", _attributes=" + String(Object.keys(x._attributes)));
        //
        //   }
        //
        //   console.log(x._childNodesList.length);
        //   for (var i = 0; i < x._childNodesList.length; i++) {
        //     var cn = x._childNodesList[i];
        //     console.log(ind + "---child node " + String(i));
        //     console.log(ind + String(cn));
        //     console.log(ind + String(i));
        //     console.log(ind + JSON.stringify(Object.keys(cn)));
        //   }
        // }
        // console.log("---item0");
        // dumpChildInfo(query);
        //
        // var item0 = query._childNodesList[0];
        // dumpChildInfo(item0);
        //
        //
        // // console.log("typeof(msg[0])=" + String(typeof(msg[0])));
        // console.log("---toString() result");
        // if (1000 < s.length) {
        //   console.log(s.substring(0, 1000));
        // } else {
        //   console.log(s);
        // }
        // // DEBUG END
        var query = msg._childNodesList[0];
        var items = query._childNodesList;

        var check = {};
        // for (let item of items) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          // console.log("item._attributes=" + Object.keys(item._attributes));
          // let node = item._attributes.node;
          // console.log("node=" + Object.keys(node))
          var node = item._attributes.node._valueForAttrModified;
          // console.log("node=" + node);
          if (_sox_util2.default.endsWithData(node)) {
            var realNode = _sox_util2.default.cutDataSuffix(node);
            if (check[realNode] === undefined) {
              check[realNode] = { data: true };
            } else {
              check[realNode].data = true;
            }
          } else if (_sox_util2.default.endsWithMeta(node)) {
            var _realNode = _sox_util2.default.cutMetaSuffix(node);
            if (check[_realNode] === undefined) {
              check[_realNode] = { meta: true };
            } else {
              check[_realNode].data = true;
            }
          }
        }

        // let deviceNames = [];
        var devices = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(check)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var deviceName = _step.value;

            var c = check[deviceName];
            if (c.data && c.meta) {
              var device = that.bind(deviceName);
              devices.push(device);
              // deviceNames.push(deviceName);
              // deviceNames.push(device);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        callback(devices);

        // for (let dn of deviceNames) {
        //   console.log(dn);
        // }
        // console.log("---- devices = " + deviceNames.length);

        // SoxUtil.extractDevices(that, msg, callback);
      };

      var error = function error(msg) {
        // FIXME
        // console.log("@@@@ fetchDevices error: " + msg);
      };

      return this._rawConn.sendIQ(iq.tree(), success, error, undefined);

      // this._rawConn.PubSub.discoverNodes((suc_result) => {
      //   console.log("discoverNodes: successed: " + suc_result);
      //
      // }, (err_result) => {
      //   console.log("disconverNodes: failed" + err_result);
      // });
    }
  }, {
    key: "fetchSubscriptions",
    value: function fetchSubscriptions(callback) {
      this._rawConn.PubSub.getSubscriptions(function (subscriptions) {
        // TODO: Device オブジェクトのリストに加工してcallbackを呼び出す

      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(device) {
      var dataNode = device.getDataNodeName();
      var domain = device.getDomain();
      // let service = "pubsub." + device.getDomain();

      // this._subNode(dataNode, device.getDomain());
      var that = this;

      this.unsubscribe(device, function () {
        // console.log("@@@ unsubscribe callback called");
        var cb = function cb() {};
        that._subNode(dataNode, domain, false, cb);
        // console.log("@@@ _subNode called");
      });
    }
  }, {
    key: "_subNode",
    value: function _subNode(node, domain, requestRecent, callback) {
      // https://github.com/strophe/strophejs-plugin-pubsub/blob/master/strophe.pubsub.js#L297
      // let service = "pubsub." + device.getDomain();
      var that = this;
      var service = "pubsub." + domain;
      // this._rawConn.PubSub.subscribe(dataNode);
      // TODO

      // node list get のときのquery
      // let iq = $iq({ from: jid, to: service, type: "get", id: this._rawConn.getUniqueId("pubsub") }).c(
      //   'query', { xmlns: Strophe.Strophe.NS.DISCO_ITEMS }
      // );

      // http://ggozad.com/strophe.plugins/docs/strophe.pubsub.html
      // console.log("@@@@@@@ raw jid = " + this._rawConn.jid);
      var rawJid = this._rawConn.jid;
      var bareJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);
      var iq = $iq({ to: service, type: "set", id: this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" })
      // .c('subscribe', {node: node, jid: bareJid});
      .c('subscribe', { node: node, jid: rawJid });

      var suc = function suc(iq) {
        // console.log("subscribe success? node=" + node);

        // https://xmpp.org/extensions/xep-0060.html#subscriber-retrieve-requestrecent

        // <iq type='get'
        //     from='francisco@denmark.lit/barracks'
        //     to='pubsub.shakespeare.lit'
        //     id='items2'>
        //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
        //     <items node='princely_musings' max_items='2'/>
        //   </pubsub>
        // </iq>
        if (requestRecent) {
          var uniqueId = that._rawConn.getUniqueId("pubsub");
          var iq2 = $iq({ type: "get", from: that._rawConn.jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: node, max_items: 1 });
          // that._rawConn.
          var suc2 = function suc2(iq) {
            // console.log("recent request success?");
            if (callback) {
              callback();
            }
          };
          var err2 = function err2(iq) {
            // console.log("recent request failed?");

          };
          that._rawConn.sendIQ(iq2, suc2, err2);
        } else {
          callback();
        }
      };
      var err = function err(iq) {
        // console.log("subscribe failed?  " + String(iq));
        // XmlUtil.dumpDom(iq);
      };
      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(device, callback) {
      var dataNode = device.getDataNodeName();
      var domain = device.getDomain();
      var that = this;

      var cb = function cb() {
        if (callback) {
          callback();
        }
      };

      var myJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);

      this._getSubscription(dataNode, domain, function (sub) {
        // console.log("_getSubscription callback called in unsubscribe");
        if (sub[myJid] === undefined) {
          sub[myJid] = {};
        }
        var subids = sub[myJid][dataNode];
        if (subids === undefined) {
          // console.log("@@@ subids === undefined!");
          cb();
          return;
        }
        // console.log("@@@ subids.length===" + subids.length);
        if (subids.length == 0) {
          that._unsubNode(dataNode, domain, cb);
        } else {
          var delNextFunc = function delNextFunc(i) {
            if (subids.length <= i) {
              return cb;
            }
            return function () {
              that._unsubNode(dataNode, domain, delNextFunc(i + 1), subids[i]);
              // console.log("@@@ _unsubNode called for subid=" + subids[i]);
            };
          };

          that._unsubNode(dataNode, domain, delNextFunc(1), subids[0]);
          // console.log("@@@ _unsubNode called for subid=" + subids[0]);
        }
      });
      // this._unsubNode(dataNode, domain, () => {
      //   // TODO
      // });
    }
  }, {
    key: "_unsubNode",
    value: function _unsubNode(node, domain, callback, subid) {
      var service = "pubsub." + domain;
      // <iq type='set'
      // from='francisco@denmark.lit/barracks'
      // to='pubsub.shakespeare.lit'
      // id='unsub1'>
      //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
      //      <unsubscribe
      //          node='princely_musings'
      //          jid='francisco@denmark.lit'/>
      //   </pubsub>
      // </iq>
      var bareJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);
      // console.log("_unsubNode: bareJid=" + bareJid);

      var unsubAttrs = { node: node, jid: bareJid };
      if (subid !== undefined) {
        unsubAttrs.subid = subid;
      }

      var iq = $iq({ to: service, type: "set", id: this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('unsubscribe', unsubAttrs);

      var suc = function suc(iq) {
        // console.log("unsub success");
        if (callback) {
          callback(iq);
        }
      };
      var err = function err(iq) {
        // console.log("unsub failed");
        // XmlUtil.dumpDom(iq);
      };
      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "unsubscribeAll",
    value: function unsubscribeAll() {
      var that = this;
      this.fetchSubscriptions(function (devices) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = devices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var device = _step2.value;

            that.unsubscribe(device);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      });
    }
  }, {
    key: "createDevice",
    value: function createDevice(device, meta) {
      // create "_data" and "_meta" nodes
      var dataNode = device.getDataNodeName();
      this._rawConn.PubSub.createNode(dataNode);
      var metaNode = device.getMetaNodeName();
      this._rawConn.PubSub.createNode(metaNode);

      // publish meta data
      var metaXmlString = meta.toXmlString();
      this._rawConn.PubSub.publish(metaNode, [metaXmlString]);
    }
  }, {
    key: "deleteDevice",
    value: function deleteDevice(device) {
      var dataNode = device.getDataNodeName();
      this._rawConn.PubSub.deleteNode(dataNode);
      var metaNode = device.getMetaNodeName();
      this._rawConn.PubSub.deleteNode(metaNode);
    }
  }, {
    key: "publish",
    value: function publish(device, data) {
      var xmlString = data.toXmlString();
      var node = device.getDataNodeName();
      this._rawConn.PubSub.publish(node, [xmlString]);
    }
  }, {
    key: "_genRandomId",
    value: function _genRandomId() {
      var chars = "abcdef01234567890";
      var nChars = chars.length;
      var len = 128;
      var ret = "";
      for (var i = 0; i < len; i++) {
        var idx = Math.floor(Math.random() * nChars);
        var char = chars.charAt(idx);
        ret = ret + char;
      }
      return ret;
    }
  }, {
    key: "_registerMetaListener",
    value: function _registerMetaListener(device, listenerId, callback) {
      this._registerListener(this._metaCallbacks, device, listenerId, callback);
    }
  }, {
    key: "_registerDataListener",
    value: function _registerDataListener(device, listenerId, callback) {
      this._registerListener(this._dataCallbacks, device, listenerId, callback);
    }
  }, {
    key: "_registerListener",
    value: function _registerListener(table, device, listenerId, callback) {
      var deviceName = device.getName();

      if (table[deviceName] === undefined) {
        table[deviceName] = {};
      }

      table[deviceName][listenerId] = callback;
    }
  }, {
    key: "_broadcast",
    value: function _broadcast(table, argument) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(table)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var listenerId = _step3.value;

          var listener = table[listenerId];
          // console.log('$$$$ listenerId=' + listenerId + ", listener=" + listener);
          listener(argument);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "_removeMetaListenerWithId",
    value: function _removeMetaListenerWithId(listenerId) {
      this._removeListenerWithId(this._metaCallbacks, listenerId);
    }
  }, {
    key: "_removeDataListenerWithId",
    value: function _removeDataListenerWithId(listenerId) {
      this._removeListenerWithId(this._dataCallbacks, listenerId);
    }
  }, {
    key: "_removeListenerWithId",
    value: function _removeListenerWithId(table, listenerId) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(table)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var devName = _step4.value;

          var devTable = table[devName];
          var found = false;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = Object.keys(devTable)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var lstnId = _step5.value;

              if (lstnId === listenerId) {
                found = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          if (found) {
            delete devTable[listenerId];
            break;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return SoxConnection;
}();

module.exports = SoxConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwiJHByZXMiLCIkaXEiLCJQVUJTVUJfTlMiLCJTb3hDb25uZWN0aW9uIiwiYm9zaFNlcnZpY2UiLCJqaWQiLCJwYXNzd29yZCIsIl9yYXdDb25uIiwiX2lzQ29ubmVjdGVkIiwiX2RhdGFDYWxsYmFja3MiLCJfbWV0YUNhbGxiYWNrcyIsImRhdGEiLCJzZW5kIiwiYyIsInQiLCJ0aGF0IiwicHVic3ViSGFuZGxlciIsImV2IiwiY2IiLCJwYXJzZURhdGFQYXlsb2FkIiwiZGlzcGF0Y2hEYXRhIiwiZXgiLCJjb25zb2xlIiwiZXJyb3IiLCJzZXJ2aWNlIiwiZ2V0RG9tYWluIiwiYWRkSGFuZGxlciIsIl9vbkNvbm5lY3RDYWxsYmFjayIsIl9vbkRpc2Nvbm5lY3RDYWxsYmFjayIsInN0YXR1cyIsIlN0YXR1cyIsIkNPTk5FQ1RJTkciLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmciLCJDT05ORkFJTCIsIl9zdHJvcGhlT25Db25uRmFpbGwiLCJESVNDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nIiwiRElTQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQiLCJDT05ORUNURUQiLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCIsImRldmljZU5hbWUiLCJnZXREZXZpY2UiLCJnZXROYW1lIiwiZGF0YUxpc3RlbmVyVGFibGUiLCJ1bmRlZmluZWQiLCJfYnJvYWRjYXN0IiwiZ2V0RG9tYWluRnJvbUppZCIsImdldEpJRCIsImNhbGxiYWNrIiwiY29ubiIsIkNvbm5lY3Rpb24iLCJnZXRCb3NoU2VydmljZSIsInJhd0lucHV0IiwiX3N0cm9waGVPblJhd0lucHV0IiwicmF3T3V0cHV0IiwiX3N0cm9waGVPblJhd091dHB1dCIsImdldFBhc3N3b3JkIiwiX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUiLCJjb25uZWN0IiwiaXNDb25uZWN0ZWQiLCJkaXNjb25uZWN0IiwiZGV2aWNlIiwibGlzdGVuZXJJZCIsIl9nZW5SYW5kb21JZCIsIl9yZWdpc3RlckRhdGFMaXN0ZW5lciIsIl9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQiLCJtZXRhTm9kZSIsImdldE1ldGFOb2RlTmFtZSIsIl9jYWxsYmFjayIsIm1ldGEiLCJfcmVtb3ZlTWV0YUxpc3RlbmVyV2l0aElkIiwiUHViU3ViIiwidW5zdWJzY3JpYmUiLCJfcmVnaXN0ZXJNZXRhTGlzdGVuZXIiLCJpcSIsIl9nZXRTdWJzY3JpcHRpb24iLCJlIiwibG9nIiwic3RhY2siLCJub2RlIiwiZG9tYWluIiwidW5pcXVlSWQiLCJnZXRVbmlxdWVJZCIsInR5cGUiLCJmcm9tIiwidG8iLCJpZCIsInhtbG5zIiwic3VjIiwiY29udmVydGVkIiwiY29udlN1YnNjcmlwdGlvbnMiLCJlcnIiLCJzZW5kSVEiLCJOUyIsIkRJU0NPX0lURU1TIiwic3VjY2VzcyIsIm1zZyIsInF1ZXJ5IiwiX2NoaWxkTm9kZXNMaXN0IiwiaXRlbXMiLCJjaGVjayIsImkiLCJsZW5ndGgiLCJpdGVtIiwiX2F0dHJpYnV0ZXMiLCJfdmFsdWVGb3JBdHRyTW9kaWZpZWQiLCJlbmRzV2l0aERhdGEiLCJyZWFsTm9kZSIsImN1dERhdGFTdWZmaXgiLCJlbmRzV2l0aE1ldGEiLCJjdXRNZXRhU3VmZml4IiwiZGV2aWNlcyIsIk9iamVjdCIsImtleXMiLCJiaW5kIiwicHVzaCIsInRyZWUiLCJnZXRTdWJzY3JpcHRpb25zIiwic3Vic2NyaXB0aW9ucyIsImRhdGFOb2RlIiwiZ2V0RGF0YU5vZGVOYW1lIiwiX3N1Yk5vZGUiLCJyZXF1ZXN0UmVjZW50IiwicmF3SmlkIiwiYmFyZUppZCIsImdldEJhcmVKaWRGcm9tSmlkIiwiaXEyIiwibWF4X2l0ZW1zIiwic3VjMiIsImVycjIiLCJteUppZCIsInN1YiIsInN1YmlkcyIsIl91bnN1Yk5vZGUiLCJkZWxOZXh0RnVuYyIsInN1YmlkIiwidW5zdWJBdHRycyIsImZldGNoU3Vic2NyaXB0aW9ucyIsImNyZWF0ZU5vZGUiLCJtZXRhWG1sU3RyaW5nIiwidG9YbWxTdHJpbmciLCJwdWJsaXNoIiwiZGVsZXRlTm9kZSIsInhtbFN0cmluZyIsImNoYXJzIiwibkNoYXJzIiwibGVuIiwicmV0IiwiaWR4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiY2hhciIsImNoYXJBdCIsIl9yZWdpc3Rlckxpc3RlbmVyIiwidGFibGUiLCJhcmd1bWVudCIsImxpc3RlbmVyIiwiX3JlbW92ZUxpc3RlbmVyV2l0aElkIiwiZGV2TmFtZSIsImRldlRhYmxlIiwiZm91bmQiLCJsc3RuSWQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFTQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQVpBLElBQUlBLFVBQVUsc0JBQVlBLE9BQTFCOztBQUVBLElBQUlDLFFBQVFELFFBQVFDLEtBQXBCO0FBQ0EsSUFBSUMsTUFBTUYsUUFBUUUsR0FBbEI7O0FBRUEsSUFBSUMsWUFBWSxtQ0FBaEI7O0lBU01DLGE7QUFDSix5QkFBWUMsV0FBWixFQUF5QkMsR0FBekIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQUE7O0FBQ3RDLFNBQUtGLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7O0FBRUEsU0FBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNEOzs7O3VDQUVrQkMsSSxFQUFNO0FBQ3ZCO0FBQ0E7QUFDRDs7O3dDQUVtQkEsSSxFQUFNO0FBQ3hCO0FBQ0E7QUFDRDs7OytDQUUwQixDQUUxQjs7OzhDQUV5QjtBQUN4QjtBQUNBLFdBQUtKLFFBQUwsQ0FBY0ssSUFBZCxDQUFtQlosUUFBUWEsQ0FBUixDQUFVLFVBQVYsRUFB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LDhCQUFvQmtELE9BQU9DLElBQVAsQ0FBWTBDLEtBQVosQ0FBcEIsbUlBQXdDO0FBQUEsY0FBL0JJLE9BQStCOztBQUN0QyxjQUFJQyxXQUFXTCxNQUFNSSxPQUFOLENBQWY7QUFDQSxjQUFJRSxRQUFRLEtBQVo7QUFGc0M7QUFBQTtBQUFBOztBQUFBO0FBR3RDLGtDQUFtQmpELE9BQU9DLElBQVAsQ0FBWStDLFFBQVosQ0FBbkIsbUlBQTBDO0FBQUEsa0JBQWpDRSxNQUFpQzs7QUFDeEMsa0JBQUlBLFdBQVdwRyxVQUFmLEVBQTJCO0FBQ3pCbUcsd0JBQVEsSUFBUjtBQUNBO0FBQ0Q7QUFDRjtBQVJxQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVN0QyxjQUFJQSxLQUFKLEVBQVc7QUFDVCxtQkFBT0QsU0FBU2xHLFVBQVQsQ0FBUDtBQUNBO0FBQ0Q7QUFDRjtBQWRzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZXhDOzs7Ozs7QUFJSHFHLE9BQU9DLE9BQVAsR0FBaUJsSyxhQUFqQiIsImZpbGUiOiJzb3hfY29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBub2RlU3Ryb3BoZSBmcm9tIFwibm9kZS1zdHJvcGhlXCI7XG5cbmxldCBTdHJvcGhlID0gbm9kZVN0cm9waGUuU3Ryb3BoZTtcblxubGV0ICRwcmVzID0gU3Ryb3BoZS4kcHJlcztcbmxldCAkaXEgPSBTdHJvcGhlLiRpcTtcblxubGV0IFBVQlNVQl9OUyA9IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCI7XG5cbmltcG9ydCBwYXJzZVN0cmluZyBmcm9tIFwieG1sMmpzXCI7XG5cbmltcG9ydCBTb3hVdGlsIGZyb20gXCIuL3NveF91dGlsXCI7XG5pbXBvcnQgWG1sVXRpbCBmcm9tIFwiLi94bWxfdXRpbFwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwiLi9kZXZpY2VcIjtcbmltcG9ydCBUcmFuc2R1Y2VyVmFsdWUgZnJvbSBcIi4vdHJhbnNkdWNlcl92YWx1ZVwiO1xuXG5jbGFzcyBTb3hDb25uZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoYm9zaFNlcnZpY2UsIGppZCwgcGFzc3dvcmQpIHtcbiAgICB0aGlzLmJvc2hTZXJ2aWNlID0gYm9zaFNlcnZpY2U7XG4gICAgdGhpcy5qaWQgPSBqaWQ7XG4gICAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xuXG4gICAgdGhpcy5fcmF3Q29ubiA9IG51bGw7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kYXRhQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fbWV0YUNhbGxiYWNrcyA9IHt9O1xuICB9XG5cbiAgX3N0cm9waGVPblJhd0lucHV0KGRhdGEpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIjw8PDw8PCBpbnB1dFwiKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdPdXRwdXQoZGF0YSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiPj4+Pj4+IG91dHB1dFwiKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uQ29ubmVjdGluZygpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQoKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJjb25uZWN0ZWQgMVwiKTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmQoJHByZXMoKS5jKCdwcmlvcml0eScpLnQoJy0xJykpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAyXCIpO1xuXG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuYmluZChcbiAgICAvLyAgIFwieG1wcDpwdWJzdWI6bGFzdC1wdWJsaXNoZWQtaXRlbVwiLFxuICAgIC8vICAgdGhhdC5fb25MYXN0UHVibGlzaGVkSXRlbVJlY2VpdmVkXG4gICAgLy8gKTtcblxuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmJpbmQoXG4gICAgLy8gICBcInhtcHA6cHVic3ViOml0ZW0tcHVibGlzaGVkXCIsXG4gICAgLy8gICB0aGF0Ll9vblB1Ymxpc2hlZEl0ZW1SZWNlaXZlZFxuICAgIC8vICk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgcHVic3ViSGFuZGxlciA9IChldikgPT4ge1xuICAgICAgLy8gVE9ET1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0BAQEBAIHB1YnN1YkhhbmRsZXIhJyk7XG4gICAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShldik7XG4gICAgICAgIGxldCBjYiA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEBAQCBnb3QgZGF0YSFcIik7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBkYXRhID0gU294VXRpbC5wYXJzZURhdGFQYXlsb2FkKHRoYXQsIGV2LCBjYik7XG4gICAgICAgIC8vIFRPRE86IGRpc3BhdGNoXG4gICAgICAgIHRoYXQuZGlzcGF0Y2hEYXRhKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gbmVlZGVkIHRvIGJlIGNhbGxlZCBldmVyeSB0aW1lXG4gICAgfTtcblxuICAgIGxldCBzZXJ2aWNlID0gJ3B1YnN1Yi4nICsgdGhpcy5nZXREb21haW4oKTtcblxuICAgIHRoaXMuX3Jhd0Nvbm4uYWRkSGFuZGxlcihcbiAgICAgIHB1YnN1YkhhbmRsZXIsXG4gICAgICBudWxsLFxuICAgICAgJ21lc3NhZ2UnLFxuICAgICAgbnVsbCxcbiAgICAgIG51bGwsXG4gICAgICBzZXJ2aWNlXG4gICAgKTtcblxuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgM1wiKTtcbiAgICBpZiAodGhpcy5fb25Db25uZWN0Q2FsbGJhY2spIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzLTFcIik7XG4gICAgICB0aGlzLl9vbkNvbm5lY3RDYWxsYmFjaygpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDMtMlwiKTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDQgZW5kXCIpO1xuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nKCkge1xuXG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RlZCgpIHtcbiAgICB0aGlzLl9yYXdDb25uID0gbnVsbDtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9vbkRpc2Nvbm5lY3RDYWxsYmFjaykge1xuICAgICAgdGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkZhaWxsKCkge1xuXG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZShzdGF0dXMpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAIHN0YXJ0IG9mIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlXCIpO1xuICAgIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkVDVElORykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5lY3RpbmdcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uQ29ubmVjdGluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5GQUlMKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmZhaWxcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRmFpbGwoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5ESVNDT05ORUNUSU5HKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAZGlzY29ubmVjdGluZ1wiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuRElTQ09OTkVDVEVEKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RlZCgpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5FQ1RFRCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQCBVTktOT1dOIFNUQVRVUzogXCIgKyBzdGF0dXMpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAIGVuZCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZVwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIF9zdHJvcGhlT25MYXN0UHVibGlzaGVkSXRlbVJlY2VpdmVkKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgaWYgKFNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoTWV0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2UgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgLy8gRklYTUVcbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBfc3Ryb3BoZU9uUHVibGlzaGVkSXRlbVJlY2VpdmVkKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgLy8gRklYTUVcbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBkaXNwYXRjaERhdGFQdWJsaXNoKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgbGV0IGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gIC8vICAgbGV0IGRldmljZUxpc3RlbmVyVGFibGUgPSB0aGlzLl9kYXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAvLyAgIGlmIChkZXZpY2VMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgLy8gICAgIHJldHVybjtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgbGV0IGRldmljZVRvQmluZCA9IHRoaXMuYmluZChkZXZpY2VOYW1lKTtcbiAgLy8gICBsZXQgdGhhdCA9IHRoaXM7XG4gIC8vICAgbGV0IG9uRGF0YVBhcnNlZCA9IChkYXRhKSA9PiB7XG4gIC8vICAgICB0aGF0Ll9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIC8vICAgfTtcbiAgLy8gICBTb3hVdGlsLnBhcnNlRGF0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQsIG9uRGF0YVBhcnNlZCk7XG4gIC8vICAgLy8gdGhpcy5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICAvLyB9XG4gIGRpc3BhdGNoRGF0YShkYXRhKSB7XG4gICAgbGV0IGRldmljZU5hbWUgPSBkYXRhLmdldERldmljZSgpLmdldE5hbWUoKTtcbiAgICBsZXQgZGF0YUxpc3RlbmVyVGFibGUgPSB0aGlzLl9kYXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAgIGlmIChkYXRhTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYnJvYWRjYXN0KGRhdGFMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgfVxuXG4gIC8vIGRpc3BhdGNoTWV0YVB1Ymxpc2gob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgLy8gICBsZXQgZGV2aWNlTGlzdGVuZXJUYWJsZSA9IHRoaXMuX21ldGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gIC8vICAgaWYgKGRldmljZUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAvLyAgICAgcmV0dXJuO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQgZGV2aWNlVG9CaW5kID0gdGhpcy5iaW5kKGRldmljZU5hbWUpO1xuICAvLyAgIGxldCB0aGF0ID0gdGhpcztcbiAgLy8gICBsZXQgb25NZXRhUGFyc2VkID0gKG1ldGEpID0+IHtcbiAgLy8gICAgIHRoYXQuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBtZXRhKTtcbiAgLy8gICB9O1xuICAvLyAgIFNveFV0aWwucGFyc2VNZXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCwgb25NZXRhUGFyc2VkKTtcbiAgLy8gICAvLyBsZXQgbWV0YSA9IFNveFV0aWwucGFyc2VNZXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCk7XG4gIC8vICAgLy8gdGhpcy5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIG1ldGEpO1xuICAvLyB9XG5cbiAgZ2V0Qm9zaFNlcnZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm9zaFNlcnZpY2U7XG4gIH1cblxuICBnZXREb21haW4oKSB7XG4gICAgcmV0dXJuIFN0cm9waGUuU3Ryb3BoZS5nZXREb21haW5Gcm9tSmlkKHRoaXMuZ2V0SklEKCkpO1xuICB9XG5cbiAgZ2V0SklEKCkge1xuICAgIHJldHVybiB0aGlzLmppZDtcbiAgfVxuXG4gIGdldFBhc3N3b3JkKCkge1xuICAgIHJldHVybiB0aGlzLnBhc3N3b3JkO1xuICB9XG5cbiAgY29ubmVjdChjYWxsYmFjaykge1xuICAgIGxldCBjb25uID0gbmV3IFN0cm9waGUuU3Ryb3BoZS5Db25uZWN0aW9uKHRoaXMuZ2V0Qm9zaFNlcnZpY2UoKSk7XG4gICAgdGhpcy5fb25Db25uZWN0Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBjb25uLnJhd0lucHV0ID0gdGhpcy5fc3Ryb3BoZU9uUmF3SW5wdXQ7XG4gICAgY29ubi5yYXdPdXRwdXQgPSB0aGlzLl9zdHJvcGhlT25SYXdPdXRwdXQ7XG4gICAgdGhpcy5fcmF3Q29ubiA9IGNvbm47XG4gICAgbGV0IGppZCA9IHRoaXMuZ2V0SklEKCk7XG4gICAgbGV0IHBhc3N3b3JkID0gdGhpcy5nZXRQYXNzd29yZCgpO1xuXG4gICAgLy8gd2l0aG91dCB3cmFwcGluZyBjYWxsIG9mIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlLCBcInRoaXNcIiB3aWxsIGJlIG1pc3NlZCBpbnNpZGUgdGhlIGZ1bmNcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IGNiID0gKHN0YXR1cykgPT4geyByZXR1cm4gdGhhdC5fc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZShzdGF0dXMpOyB9O1xuICAgIGNvbm4uY29ubmVjdChqaWQsIHBhc3N3b3JkLCBjYik7XG4gIH1cblxuICBkaXNjb25uZWN0KGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX3Jhd0Nvbm4gIT09IG51bGwgJiYgdGhpcy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLl9vbkRpc2Nvbm5lY3RDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgdGhpcy5fcmF3Q29ubi5kaXNjb25uZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgZ2V0U3Ryb3BoZUNvbm5lY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jhd0Nvbm47XG4gIH1cblxuICBhZGRMaXN0ZW5lcihkZXZpY2UsIGNhbGxiYWNrLCBsaXN0ZW5lcklkKSB7XG4gICAgaWYgKGxpc3RlbmVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbGlzdGVuZXJJZCA9IHRoaXMuX2dlblJhbmRvbUlkKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlZ2lzdGVyRGF0YUxpc3RlbmVyKGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spO1xuICAgIHJldHVybiBsaXN0ZW5lcklkO1xuICB9XG5cbiAgcmVtb3ZlQWxsTGlzdGVuZXJGb3JEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fZGF0YUNhbGxiYWNrcyA9IHt9O1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXJJZCkge1xuICAgIHRoaXMuX3JlbW92ZURhdGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIGZldGNoTWV0YShkZXZpY2UsIGNhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgIGxldCBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICAgIGxldCBtZXRhTm9kZSA9IGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKTtcbiAgICAgIGxldCBfY2FsbGJhY2sgPSAobWV0YSkgPT4ge1xuICAgICAgICB0aGF0Ll9yZW1vdmVNZXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCk7XG4gICAgICAgIHRoYXQuX3Jhd0Nvbm4uUHViU3ViLnVuc3Vic2NyaWJlKG1ldGFOb2RlKTtcbiAgICAgICAgY2FsbGJhY2sobWV0YSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9yZWdpc3Rlck1ldGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIF9jYWxsYmFjayk7XG4gICAgICAvLyB0aGlzLnN1YnNjcmliZShkZXZpY2UpO1xuICAgICAgLy8gdGhpcy5fc3ViTm9kZShkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgdHJ1ZSk7XG4gICAgICAvLyBsZXQgY2IgPSAoaXEpID0+IHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coXCJyZXF1ZXN0aW5nIHJlY2VudCBpdGVtXCIpO1xuICAgICAgLy8gICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgdGhhdC5nZXREb21haW4oKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIC8vIGh0dHBzOi8veG1wcC5vcmcvZXh0ZW5zaW9ucy94ZXAtMDA2MC5odG1sI3N1YnNjcmliZXItcmV0cmlldmUtcmVxdWVzdHJlY2VudFxuICAgICAgLy9cbiAgICAgIC8vICAgLy8gPGlxIHR5cGU9J2dldCdcbiAgICAgIC8vICAgLy8gICAgIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAgIC8vICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgICAgLy8gICAvLyAgICAgaWQ9J2l0ZW1zMic+XG4gICAgICAvLyAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAgIC8vICAgLy8gICAgIDxpdGVtcyBub2RlPSdwcmluY2VseV9tdXNpbmdzJyBtYXhfaXRlbXM9JzInLz5cbiAgICAgIC8vICAgLy8gICA8L3B1YnN1Yj5cbiAgICAgIC8vICAgLy8gPC9pcT5cbiAgICAgIC8vICAgbGV0IHVuaXF1ZUlkID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgIC8vICAgbGV0IGlxMiA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IHRoYXQuX3Jhd0Nvbm4uamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAvLyAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAvLyAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG5vZGUsIG1heF9pdGVtczogMSB9KTtcbiAgICAgIC8vICAgLy8gdGhhdC5fcmF3Q29ubi5cbiAgICAgIC8vICAgbGV0IHN1YzIgPSAoaXEpID0+IHtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInJlY2VudCByZXF1ZXN0IHN1Y2Nlc3M/XCIpO1xuICAgICAgLy9cbiAgICAgIC8vICAgfTtcbiAgICAgIC8vICAgbGV0IGVycjIgPSAoaXEpID0+IHtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInJlY2VudCByZXF1ZXN0IGZhaWxlZD9cIik7XG4gICAgICAvL1xuICAgICAgLy8gICB9O1xuICAgICAgLy8gICB0aGF0Ll9yYXdDb25uLnNlbmRJUShpcTIsIHN1YzIsIGVycjIpO1xuICAgICAgLy9cbiAgICAgIC8vIH07XG4gICAgICAvLyB0aGlzLl91bnN1Yk5vZGUoZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpLCBkZXZpY2UuZ2V0RG9tYWluKCksIGNiKTtcblxuICAgICAgbGV0IGNiID0gKGlxKSA9PiB7XG4gICAgICAgIC8vIFRPRE9cblxuICAgICAgfTtcbiAgICAgIHRoaXMuX2dldFN1YnNjcmlwdGlvbihkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgY2IpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgfVxuICB9XG5cbiAgX2dldFN1YnNjcmlwdGlvbihub2RlLCBkb21haW4sIGNiKSB7XG5cbiAgICAvLyAgIGxldCBpcTIgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiB0aGF0Ll9yYXdDb25uLmppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgIC8vICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAvLyAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG5vZGUsIG1heF9pdGVtczogMSB9KTtcbiAgICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgIC8vICAgICBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgIC8vICAgICBpZD0nc3Vic2NyaXB0aW9uczEnPlxuICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAvLyAgICAgPHN1YnNjcmlwdGlvbnMvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIGxldCB1bmlxdWVJZCA9IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgbGV0IGlxID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhpcy5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgIC5jKFwicHVic3ViXCIsIHt4bWxuczogUFVCU1VCX05TfSlcbiAgICAgIC5jKFwic3Vic2NyaXB0aW9uc1wiKTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0IHN1YiBva1wiKTtcbiAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShpcSk7XG4gICAgICBsZXQgY29udmVydGVkID0gWG1sVXRpbC5jb252U3Vic2NyaXB0aW9ucyhpcSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImNvbnZlcnRlZCBva1wiKTtcbiAgICAgIGNiKGNvbnZlcnRlZCk7XG5cbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0IHN1YiBmYWlsZWRcIik7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kSVEoaXEsIHN1YywgZXJyKTtcbiAgfVxuXG4gIGJpbmQoZGV2aWNlTmFtZSwgZG9tYWluKSB7XG4gICAgaWYgKGRvbWFpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkb21haW4gPSB0aGlzLmdldERvbWFpbigpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRGV2aWNlKHRoaXMsIGRldmljZU5hbWUsIGRvbWFpbik7XG4gIH1cblxuICBmZXRjaERldmljZXMoY2FsbGJhY2ssIGRvbWFpbikge1xuICAgIGlmIChkb21haW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tYWluID0gdGhpcy5nZXREb21haW4oKTtcbiAgICB9XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3N0cm9waGUvc3Ryb3BoZWpzLXBsdWdpbi1wdWJzdWIvYmxvYi9tYXN0ZXIvc3Ryb3BoZS5wdWJzdWIuanMjTDI5N1xuICAgIGxldCBqaWQgPSB0aGlzLmdldEpJRCgpO1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgLy8gbGV0IGlxID0gJGlxKHtmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCB0eXBlOidnZXQnfSlcbiAgICAvLyAgIC5jKCdxdWVyeScsIHsgeG1sbnM6IFN0cm9waGUuU3Ryb3BoZS5OUy5ESVNDT19JVEVNUyB9KTtcbiAgICBsZXQgaXEgPSAkaXEoeyBmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCB0eXBlOiBcImdldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KS5jKFxuICAgICAgJ3F1ZXJ5JywgeyB4bWxuczogU3Ryb3BoZS5TdHJvcGhlLk5TLkRJU0NPX0lURU1TIH1cbiAgICApO1xuXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBzdWNjZXNzID0gKG1zZykgPT4ge1xuXG4gICAgICAvLyBERUJVR1xuICAgICAgLy8gbGV0IHMgPSBtc2cudG9TdHJpbmcoKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAQEAgaW5zaWRlIHN1Y2Nlc3Mgb2YgZmV0Y2hEZXZpY2VzXCIpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ0eXBlb2YobXNnKT1cIiArIFN0cmluZyh0eXBlb2YobXNnKSkpO1xuICAgICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMobXNnKSkpO1xuICAgICAgLy8gLy8gY29uc29sZS5sb2cobXNnLl9jaGlsZE5vZGVzTGlzdC5sZW5ndGgpO1xuICAgICAgLy8gLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBtc2cuX2NoaWxkTm9kZXNMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyAvLyAgIHZhciBjbiA9IG1zZy5fY2hpbGROb2Rlc0xpc3RbaV07XG4gICAgICAvLyAvLyAgIGNvbnNvbGUubG9nKFwiLS0tY2hpbGQgbm9kZSBcIiArIFN0cmluZyhpKSk7XG4gICAgICAvLyAvLyAgIGNvbnNvbGUubG9nKFN0cmluZyhjbikpO1xuICAgICAgLy8gLy8gICBjb25zb2xlLmxvZyhpKTtcbiAgICAgIC8vIC8vICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMoY24pKSk7XG4gICAgICAvLyAvLyB9XG4gICAgICAvL1xuICAgICAgLy8gbGV0IHF1ZXJ5ID0gbXNnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS1xdWVyeVwiKTtcbiAgICAgIC8vIGxldCBkdW1wQ2hpbGRJbmZvID0gKHgsIGluZGVudCkgPT4ge1xuICAgICAgLy8gICBpZiAoIWluZGVudCkge1xuICAgICAgLy8gICAgIGluZGVudCA9IDA7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vICAgdmFyIGluZCA9IFwiXCI7XG4gICAgICAvLyAgIGZvciAodmFyIGogPSAwOyBqIDwgaW5kZW50OyBqKyspIHtcbiAgICAgIC8vICAgICBpbmQgPSBpbmQgKyBcIiAgXCI7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vXG4gICAgICAvLyAgIGlmICh4Ll9jaGlsZE5vZGVzTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcIl9sb2NhbE5hbWU9XCIgKyB4Ll9sb2NhbE5hbWUgKyBcIiwgX2F0dHJpYnV0ZXM9XCIgKyBTdHJpbmcoT2JqZWN0LmtleXMoeC5fYXR0cmlidXRlcykpKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIH1cbiAgICAgIC8vXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKHguX2NoaWxkTm9kZXNMaXN0Lmxlbmd0aCk7XG4gICAgICAvLyAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5fY2hpbGROb2Rlc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vICAgICB2YXIgY24gPSB4Ll9jaGlsZE5vZGVzTGlzdFtpXTtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhpbmQgKyBcIi0tLWNoaWxkIG5vZGUgXCIgKyBTdHJpbmcoaSkpO1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGluZCArIFN0cmluZyhjbikpO1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGluZCArIFN0cmluZyhpKSk7XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coaW5kICsgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMoY24pKSk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0taXRlbTBcIik7XG4gICAgICAvLyBkdW1wQ2hpbGRJbmZvKHF1ZXJ5KTtcbiAgICAgIC8vXG4gICAgICAvLyB2YXIgaXRlbTAgPSBxdWVyeS5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICAvLyBkdW1wQ2hpbGRJbmZvKGl0ZW0wKTtcbiAgICAgIC8vXG4gICAgICAvL1xuICAgICAgLy8gLy8gY29uc29sZS5sb2coXCJ0eXBlb2YobXNnWzBdKT1cIiArIFN0cmluZyh0eXBlb2YobXNnWzBdKSkpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCItLS10b1N0cmluZygpIHJlc3VsdFwiKTtcbiAgICAgIC8vIGlmICgxMDAwIDwgcy5sZW5ndGgpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2cocy5zdWJzdHJpbmcoMCwgMTAwMCkpO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2cocyk7XG4gICAgICAvLyB9XG4gICAgICAvLyAvLyBERUJVRyBFTkRcbiAgICAgIGxldCBxdWVyeSA9IG1zZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICBsZXQgaXRlbXMgPSBxdWVyeS5fY2hpbGROb2Rlc0xpc3Q7XG5cbiAgICAgIGxldCBjaGVjayA9IHt9O1xuICAgICAgLy8gZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIml0ZW0uX2F0dHJpYnV0ZXM9XCIgKyBPYmplY3Qua2V5cyhpdGVtLl9hdHRyaWJ1dGVzKSk7XG4gICAgICAgIC8vIGxldCBub2RlID0gaXRlbS5fYXR0cmlidXRlcy5ub2RlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm5vZGU9XCIgKyBPYmplY3Qua2V5cyhub2RlKSlcbiAgICAgICAgbGV0IG5vZGUgPSBpdGVtLl9hdHRyaWJ1dGVzLm5vZGUuX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm5vZGU9XCIgKyBub2RlKTtcbiAgICAgICAgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gICAgICAgICAgbGV0IHJlYWxOb2RlID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgIGlmIChjaGVja1tyZWFsTm9kZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdID0geyBkYXRhOiB0cnVlIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZSkpIHtcbiAgICAgICAgICBsZXQgcmVhbE5vZGUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKGNoZWNrW3JlYWxOb2RlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0gPSB7IG1ldGE6IHRydWUgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBsZXQgZGV2aWNlTmFtZXMgPSBbXTtcbiAgICAgIGxldCBkZXZpY2VzID0gW107XG4gICAgICBmb3IgKGxldCBkZXZpY2VOYW1lIG9mIE9iamVjdC5rZXlzKGNoZWNrKSkge1xuICAgICAgICBsZXQgYyA9IGNoZWNrW2RldmljZU5hbWVdO1xuICAgICAgICBpZiAoYy5kYXRhICYmIGMubWV0YSkge1xuICAgICAgICAgIGxldCBkZXZpY2UgPSB0aGF0LmJpbmQoZGV2aWNlTmFtZSk7XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgICAgLy8gZGV2aWNlTmFtZXMucHVzaChkZXZpY2VOYW1lKTtcbiAgICAgICAgICAvLyBkZXZpY2VOYW1lcy5wdXNoKGRldmljZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZGV2aWNlcyk7XG5cbiAgICAgIC8vIGZvciAobGV0IGRuIG9mIGRldmljZU5hbWVzKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGRuKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLSBkZXZpY2VzID0gXCIgKyBkZXZpY2VOYW1lcy5sZW5ndGgpO1xuXG4gICAgICAvLyBTb3hVdGlsLmV4dHJhY3REZXZpY2VzKHRoYXQsIG1zZywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBsZXQgZXJyb3IgPSAobXNnKSA9PiB7XG4gICAgICAvLyBGSVhNRVxuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEBAIGZldGNoRGV2aWNlcyBlcnJvcjogXCIgKyBtc2cpO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5fcmF3Q29ubi5zZW5kSVEoaXEudHJlZSgpLCBzdWNjZXNzLCBlcnJvciwgdW5kZWZpbmVkKTtcblxuXG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuZGlzY292ZXJOb2Rlcygoc3VjX3Jlc3VsdCkgPT4ge1xuICAgIC8vICAgY29uc29sZS5sb2coXCJkaXNjb3Zlck5vZGVzOiBzdWNjZXNzZWQ6IFwiICsgc3VjX3Jlc3VsdCk7XG4gICAgLy9cbiAgICAvLyB9LCAoZXJyX3Jlc3VsdCkgPT4ge1xuICAgIC8vICAgY29uc29sZS5sb2coXCJkaXNjb252ZXJOb2RlczogZmFpbGVkXCIgKyBlcnJfcmVzdWx0KTtcbiAgICAvLyB9KTtcbiAgfVxuXG4gIGZldGNoU3Vic2NyaXB0aW9ucyhjYWxsYmFjaykge1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmdldFN1YnNjcmlwdGlvbnMoKHN1YnNjcmlwdGlvbnMpID0+IHtcbiAgICAgIC8vIFRPRE86IERldmljZSDjgqrjg5bjgrjjgqfjgq/jg4jjga7jg6rjgrnjg4jjgavliqDlt6XjgZfjgaZjYWxsYmFja+OCkuWRvOOBs+WHuuOBmVxuXG4gICAgfSk7XG4gIH1cblxuICBzdWJzY3JpYmUoZGV2aWNlKSB7XG4gICAgbGV0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIGxldCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgLy8gbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRldmljZS5nZXREb21haW4oKTtcblxuICAgIC8vIHRoaXMuX3N1Yk5vZGUoZGF0YU5vZGUsIGRldmljZS5nZXREb21haW4oKSk7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy51bnN1YnNjcmliZShkZXZpY2UsICgpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIHVuc3Vic2NyaWJlIGNhbGxiYWNrIGNhbGxlZFwiKTtcbiAgICAgIGxldCBjYiA9ICgpID0+IHtcbiAgICAgIH07XG4gICAgICB0aGF0Ll9zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGZhbHNlLCBjYik7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBfc3ViTm9kZSBjYWxsZWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBfc3ViTm9kZShub2RlLCBkb21haW4sIHJlcXVlc3RSZWNlbnQsIGNhbGxiYWNrKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3N0cm9waGUvc3Ryb3BoZWpzLXBsdWdpbi1wdWJzdWIvYmxvYi9tYXN0ZXIvc3Ryb3BoZS5wdWJzdWIuanMjTDI5N1xuICAgIC8vIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuc3Vic2NyaWJlKGRhdGFOb2RlKTtcbiAgICAvLyBUT0RPXG5cbiAgICAvLyBub2RlIGxpc3QgZ2V0IOOBruOBqOOBjeOBrnF1ZXJ5XG4gICAgLy8gbGV0IGlxID0gJGlxKHsgZnJvbTogamlkLCB0bzogc2VydmljZSwgdHlwZTogXCJnZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSkuYyhcbiAgICAvLyAgICdxdWVyeScsIHsgeG1sbnM6IFN0cm9waGUuU3Ryb3BoZS5OUy5ESVNDT19JVEVNUyB9XG4gICAgLy8gKTtcblxuICAgIC8vIGh0dHA6Ly9nZ296YWQuY29tL3N0cm9waGUucGx1Z2lucy9kb2NzL3N0cm9waGUucHVic3ViLmh0bWxcbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAQEAgcmF3IGppZCA9IFwiICsgdGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgbGV0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgLy8gLmMoJ3N1YnNjcmliZScsIHtub2RlOiBub2RlLCBqaWQ6IGJhcmVKaWR9KTtcbiAgICAgIC5jKCdzdWJzY3JpYmUnLCB7bm9kZTogbm9kZSwgamlkOiByYXdKaWR9KTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwic3Vic2NyaWJlIHN1Y2Nlc3M/IG5vZGU9XCIgKyBub2RlKTtcblxuICAgICAgLy8gaHR0cHM6Ly94bXBwLm9yZy9leHRlbnNpb25zL3hlcC0wMDYwLmh0bWwjc3Vic2NyaWJlci1yZXRyaWV2ZS1yZXF1ZXN0cmVjZW50XG5cbiAgICAgIC8vIDxpcSB0eXBlPSdnZXQnXG4gICAgICAvLyAgICAgZnJvbT0nZnJhbmNpc2NvQGRlbm1hcmsubGl0L2JhcnJhY2tzJ1xuICAgICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgICAgLy8gICAgIGlkPSdpdGVtczInPlxuICAgICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgICAgLy8gICAgIDxpdGVtcyBub2RlPSdwcmluY2VseV9tdXNpbmdzJyBtYXhfaXRlbXM9JzInLz5cbiAgICAgIC8vICAgPC9wdWJzdWI+XG4gICAgICAvLyA8L2lxPlxuICAgICAgaWYgKHJlcXVlc3RSZWNlbnQpIHtcbiAgICAgICAgbGV0IHVuaXF1ZUlkID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgbGV0IGlxMiA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IHRoYXQuX3Jhd0Nvbm4uamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG5vZGUsIG1heF9pdGVtczogMSB9KTtcbiAgICAgICAgLy8gdGhhdC5fcmF3Q29ubi5cbiAgICAgICAgbGV0IHN1YzIgPSAoaXEpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInJlY2VudCByZXF1ZXN0IHN1Y2Nlc3M/XCIpO1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGxldCBlcnIyID0gKGlxKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJyZWNlbnQgcmVxdWVzdCBmYWlsZWQ/XCIpO1xuXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKGlxMiwgc3VjMiwgZXJyMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IGVyciA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJzdWJzY3JpYmUgZmFpbGVkPyAgXCIgKyBTdHJpbmcoaXEpKTtcbiAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShpcSk7XG4gICAgfTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuXG4gIH1cblxuICB1bnN1YnNjcmliZShkZXZpY2UsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIGxldCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IGNiID0gKCkgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBteUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG5cbiAgICB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZGF0YU5vZGUsIGRvbWFpbiwgKHN1YikgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJfZ2V0U3Vic2NyaXB0aW9uIGNhbGxiYWNrIGNhbGxlZCBpbiB1bnN1YnNjcmliZVwiKTtcbiAgICAgIGlmIChzdWJbbXlKaWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3ViW215SmlkXSA9IHt9O1xuICAgICAgfVxuICAgICAgbGV0IHN1YmlkcyA9IHN1YltteUppZF1bZGF0YU5vZGVdO1xuICAgICAgaWYgKHN1YmlkcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIHN1YmlkcyA9PT0gdW5kZWZpbmVkIVwiKTtcbiAgICAgICAgY2IoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgc3ViaWRzLmxlbmd0aD09PVwiICsgc3ViaWRzLmxlbmd0aCk7XG4gICAgICBpZiAoc3ViaWRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBjYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZGVsTmV4dEZ1bmMgPSAoaSkgPT4ge1xuICAgICAgICAgIGlmIChzdWJpZHMubGVuZ3RoIDw9IGkpIHtcbiAgICAgICAgICAgIHJldHVybiBjYjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBkZWxOZXh0RnVuYyhpKzEpLCBzdWJpZHNbaV0pO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3Vuc3ViTm9kZSBjYWxsZWQgZm9yIHN1YmlkPVwiICsgc3ViaWRzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGRlbE5leHRGdW5jKDEpLCBzdWJpZHNbMF0pO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBfdW5zdWJOb2RlIGNhbGxlZCBmb3Igc3ViaWQ9XCIgKyBzdWJpZHNbMF0pO1xuICAgICAgfVxuICAgIH0pXG4gICAgLy8gdGhpcy5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sICgpID0+IHtcbiAgICAvLyAgIC8vIFRPRE9cbiAgICAvLyB9KTtcbiAgfVxuXG4gIF91bnN1Yk5vZGUobm9kZSwgZG9tYWluLCBjYWxsYmFjaywgc3ViaWQpIHtcbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIC8vIDxpcSB0eXBlPSdzZXQnXG4gICAgLy8gZnJvbT0nZnJhbmNpc2NvQGRlbm1hcmsubGl0L2JhcnJhY2tzJ1xuICAgIC8vIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgIC8vIGlkPSd1bnN1YjEnPlxuICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAvLyAgICAgIDx1bnN1YnNjcmliZVxuICAgIC8vICAgICAgICAgIG5vZGU9J3ByaW5jZWx5X211c2luZ3MnXG4gICAgLy8gICAgICAgICAgamlkPSdmcmFuY2lzY29AZGVubWFyay5saXQnLz5cbiAgICAvLyAgIDwvcHVic3ViPlxuICAgIC8vIDwvaXE+XG4gICAgbGV0IGJhcmVKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiX3Vuc3ViTm9kZTogYmFyZUppZD1cIiArIGJhcmVKaWQpO1xuXG4gICAgbGV0IHVuc3ViQXR0cnMgPSB7IG5vZGU6IG5vZGUsIGppZDogYmFyZUppZCB9O1xuICAgIGlmIChzdWJpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB1bnN1YkF0dHJzLnN1YmlkID0gc3ViaWQ7XG4gICAgfVxuXG4gICAgbGV0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgLmMoJ3Vuc3Vic2NyaWJlJywgdW5zdWJBdHRycyk7XG5cbiAgICBsZXQgc3VjID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInVuc3ViIHN1Y2Nlc3NcIik7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soaXEpO1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IGVyciA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ1bnN1YiBmYWlsZWRcIik7XG4gICAgICAvLyBYbWxVdGlsLmR1bXBEb20oaXEpO1xuICAgIH07XG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kSVEoaXEsIHN1YywgZXJyKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlQWxsKCkge1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICB0aGlzLmZldGNoU3Vic2NyaXB0aW9ucygoZGV2aWNlcykgPT4ge1xuICAgICAgZm9yIChsZXQgZGV2aWNlIG9mIGRldmljZXMpIHtcbiAgICAgICAgdGhhdC51bnN1YnNjcmliZShkZXZpY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlRGV2aWNlKGRldmljZSwgbWV0YSkge1xuICAgIC8vIGNyZWF0ZSBcIl9kYXRhXCIgYW5kIFwiX21ldGFcIiBub2Rlc1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5jcmVhdGVOb2RlKGRhdGFOb2RlKTtcbiAgICBsZXQgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuY3JlYXRlTm9kZShtZXRhTm9kZSk7XG5cbiAgICAvLyBwdWJsaXNoIG1ldGEgZGF0YVxuICAgIGxldCBtZXRhWG1sU3RyaW5nID0gbWV0YS50b1htbFN0cmluZygpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLnB1Ymxpc2gobWV0YU5vZGUsIFttZXRhWG1sU3RyaW5nXSk7XG4gIH1cblxuICBkZWxldGVEZXZpY2UoZGV2aWNlKSB7XG4gICAgbGV0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmRlbGV0ZU5vZGUoZGF0YU5vZGUpO1xuICAgIGxldCBtZXRhTm9kZSA9IGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5kZWxldGVOb2RlKG1ldGFOb2RlKTtcbiAgfVxuXG4gIHB1Ymxpc2goZGV2aWNlLCBkYXRhKSB7XG4gICAgbGV0IHhtbFN0cmluZyA9IGRhdGEudG9YbWxTdHJpbmcoKTtcbiAgICBsZXQgbm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5wdWJsaXNoKG5vZGUsIFt4bWxTdHJpbmddKTtcbiAgfVxuXG4gIF9nZW5SYW5kb21JZCgpIHtcbiAgICBsZXQgY2hhcnMgPSBcImFiY2RlZjAxMjM0NTY3ODkwXCI7XG4gICAgbGV0IG5DaGFycyA9IGNoYXJzLmxlbmd0aDtcbiAgICBsZXQgbGVuID0gMTI4O1xuICAgIHZhciByZXQgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBpZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuQ2hhcnMpO1xuICAgICAgbGV0IGNoYXIgPSBjaGFycy5jaGFyQXQoaWR4KTtcbiAgICAgIHJldCA9IHJldCArIGNoYXI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBfcmVnaXN0ZXJNZXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fbWV0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fZGF0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJMaXN0ZW5lcih0YWJsZSwgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIGxldCBkZXZpY2VOYW1lID0gZGV2aWNlLmdldE5hbWUoKTtcblxuICAgIGlmICh0YWJsZVtkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWJsZVtkZXZpY2VOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIHRhYmxlW2RldmljZU5hbWVdW2xpc3RlbmVySWRdID0gY2FsbGJhY2s7XG4gIH1cblxuICBfYnJvYWRjYXN0KHRhYmxlLCBhcmd1bWVudCkge1xuICAgIGZvciAobGV0IGxpc3RlbmVySWQgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgbGlzdGVuZXIgPSB0YWJsZVtsaXN0ZW5lcklkXTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCckJCQkIGxpc3RlbmVySWQ9JyArIGxpc3RlbmVySWQgKyBcIiwgbGlzdGVuZXI9XCIgKyBsaXN0ZW5lcik7XG4gICAgICBsaXN0ZW5lcihhcmd1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZU1ldGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJXaXRoSWQodGhpcy5fbWV0YUNhbGxiYWNrcywgbGlzdGVuZXJJZCk7XG4gIH1cblxuICBfcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0aGlzLl9kYXRhQ2FsbGJhY2tzLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIF9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0YWJsZSwgbGlzdGVuZXJJZCkge1xuICAgIGZvciAobGV0IGRldk5hbWUgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgZGV2VGFibGUgPSB0YWJsZVtkZXZOYW1lXTtcbiAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgbHN0bklkIG9mIE9iamVjdC5rZXlzKGRldlRhYmxlKSkge1xuICAgICAgICBpZiAobHN0bklkID09PSBsaXN0ZW5lcklkKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICBkZWxldGUgZGV2VGFibGVbbGlzdGVuZXJJZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU294Q29ubmVjdGlvbjtcbiJdfQ==