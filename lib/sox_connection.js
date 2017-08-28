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
      var jid = this.getJID();
      if (jid === undefined) {
        if (!this.isConnected()) {
          throw new Error("cannot determine domain(anonymous mode + not connected)");
        }
      } else {
        return Strophe.Strophe.getDomainFromJid(this.getJID());
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwiJHByZXMiLCIkaXEiLCJQVUJTVUJfTlMiLCJTb3hDb25uZWN0aW9uIiwiYm9zaFNlcnZpY2UiLCJqaWQiLCJwYXNzd29yZCIsIl9yYXdDb25uIiwiX2lzQ29ubmVjdGVkIiwiX2RhdGFDYWxsYmFja3MiLCJfbWV0YUNhbGxiYWNrcyIsImRhdGEiLCJzZW5kIiwiYyIsInQiLCJ0aGF0IiwicHVic3ViSGFuZGxlciIsImV2IiwiY2IiLCJwYXJzZURhdGFQYXlsb2FkIiwiZGlzcGF0Y2hEYXRhIiwiZXgiLCJjb25zb2xlIiwiZXJyb3IiLCJzZXJ2aWNlIiwiZ2V0RG9tYWluIiwiYWRkSGFuZGxlciIsIl9vbkNvbm5lY3RDYWxsYmFjayIsIl9vbkRpc2Nvbm5lY3RDYWxsYmFjayIsInN0YXR1cyIsIlN0YXR1cyIsIkNPTk5FQ1RJTkciLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmciLCJDT05ORkFJTCIsIl9zdHJvcGhlT25Db25uRmFpbGwiLCJESVNDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nIiwiRElTQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQiLCJDT05ORUNURUQiLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCIsImRldmljZU5hbWUiLCJnZXREZXZpY2UiLCJnZXROYW1lIiwiZGF0YUxpc3RlbmVyVGFibGUiLCJ1bmRlZmluZWQiLCJfYnJvYWRjYXN0IiwiZ2V0SklEIiwiaXNDb25uZWN0ZWQiLCJFcnJvciIsImdldERvbWFpbkZyb21KaWQiLCJjYWxsYmFjayIsImNvbm4iLCJDb25uZWN0aW9uIiwiZ2V0Qm9zaFNlcnZpY2UiLCJyYXdJbnB1dCIsIl9zdHJvcGhlT25SYXdJbnB1dCIsInJhd091dHB1dCIsIl9zdHJvcGhlT25SYXdPdXRwdXQiLCJnZXRQYXNzd29yZCIsIl9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlIiwiY29ubmVjdCIsImRpc2Nvbm5lY3QiLCJkZXZpY2UiLCJsaXN0ZW5lcklkIiwiX2dlblJhbmRvbUlkIiwiX3JlZ2lzdGVyRGF0YUxpc3RlbmVyIiwiX3JlbW92ZURhdGFMaXN0ZW5lcldpdGhJZCIsIm1ldGFOb2RlIiwiZ2V0TWV0YU5vZGVOYW1lIiwiX2NhbGxiYWNrIiwibWV0YSIsIl9yZW1vdmVNZXRhTGlzdGVuZXJXaXRoSWQiLCJQdWJTdWIiLCJ1bnN1YnNjcmliZSIsIl9yZWdpc3Rlck1ldGFMaXN0ZW5lciIsImlxIiwiX2dldFN1YnNjcmlwdGlvbiIsImUiLCJsb2ciLCJzdGFjayIsIm5vZGUiLCJkb21haW4iLCJ1bmlxdWVJZCIsImdldFVuaXF1ZUlkIiwidHlwZSIsImZyb20iLCJ0byIsImlkIiwieG1sbnMiLCJzdWMiLCJjb252ZXJ0ZWQiLCJjb252U3Vic2NyaXB0aW9ucyIsImVyciIsInNlbmRJUSIsIk5TIiwiRElTQ09fSVRFTVMiLCJzdWNjZXNzIiwibXNnIiwicXVlcnkiLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtcyIsImNoZWNrIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJfYXR0cmlidXRlcyIsIl92YWx1ZUZvckF0dHJNb2RpZmllZCIsImVuZHNXaXRoRGF0YSIsInJlYWxOb2RlIiwiY3V0RGF0YVN1ZmZpeCIsImVuZHNXaXRoTWV0YSIsImN1dE1ldGFTdWZmaXgiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImJpbmQiLCJwdXNoIiwidHJlZSIsImdldFN1YnNjcmlwdGlvbnMiLCJzdWJzY3JpcHRpb25zIiwiZGF0YU5vZGUiLCJnZXREYXRhTm9kZU5hbWUiLCJfc3ViTm9kZSIsInJlcXVlc3RSZWNlbnQiLCJyYXdKaWQiLCJiYXJlSmlkIiwiZ2V0QmFyZUppZEZyb21KaWQiLCJpcTIiLCJtYXhfaXRlbXMiLCJzdWMyIiwiZXJyMiIsIm15SmlkIiwic3ViIiwic3ViaWRzIiwiX3Vuc3ViTm9kZSIsImRlbE5leHRGdW5jIiwic3ViaWQiLCJ1bnN1YkF0dHJzIiwiZmV0Y2hTdWJzY3JpcHRpb25zIiwiY3JlYXRlTm9kZSIsIm1ldGFYbWxTdHJpbmciLCJ0b1htbFN0cmluZyIsInB1Ymxpc2giLCJkZWxldGVOb2RlIiwieG1sU3RyaW5nIiwiY2hhcnMiLCJuQ2hhcnMiLCJsZW4iLCJyZXQiLCJpZHgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJjaGFyIiwiY2hhckF0IiwiX3JlZ2lzdGVyTGlzdGVuZXIiLCJ0YWJsZSIsImFyZ3VtZW50IiwibGlzdGVuZXIiLCJfcmVtb3ZlTGlzdGVuZXJXaXRoSWQiLCJkZXZOYW1lIiwiZGV2VGFibGUiLCJmb3VuZCIsImxzdG5JZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQVNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBWkEsSUFBSUEsVUFBVSxzQkFBWUEsT0FBMUI7O0FBRUEsSUFBSUMsUUFBUUQsUUFBUUMsS0FBcEI7QUFDQSxJQUFJQyxNQUFNRixRQUFRRSxHQUFsQjs7QUFFQSxJQUFJQyxZQUFZLG1DQUFoQjs7SUFTTUMsYTtBQUNKLHlCQUFZQyxXQUFaLEVBQXlCQyxHQUF6QixFQUE4QkMsUUFBOUIsRUFBd0M7QUFBQTs7QUFDdEMsU0FBS0YsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxTQUFLQyxHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjs7QUFFQSxTQUFLQyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixLQUFwQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsRUFBdEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0Q7Ozs7dUNBRWtCQyxJLEVBQU07QUFDdkI7QUFDQTtBQUNEOzs7d0NBRW1CQSxJLEVBQU07QUFDeEI7QUFDQTtBQUNEOzs7K0NBRTBCLENBRTFCOzs7OENBRXlCO0FBQ3hCO0FBQ0EsV0FBS0osUUFBTCxDQUFjSyxJQUFkLENBQW1CWixRQUFRYSxDQUFSLENBQVUs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Z0cscUJBQUwsQ0FBMkIsS0FBS3RKLGNBQWhDLEVBQWdEc0QsVUFBaEQ7QUFDRDs7OzhDQUV5QkEsVSxFQUFZO0FBQ3BDLFdBQUtnRyxxQkFBTCxDQUEyQixLQUFLdkosY0FBaEMsRUFBZ0R1RCxVQUFoRDtBQUNEOzs7MENBRXFCNkYsSyxFQUFPN0YsVSxFQUFZO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ3ZDLDhCQUFvQmtELE9BQU9DLElBQVAsQ0FBWTBDLEtBQVosQ0FBcEIsbUlBQXdDO0FBQUEsY0FBL0JJLE9BQStCOztBQUN0QyxjQUFJQyxXQUFXTCxNQUFNSSxPQUFOLENBQWY7QUFDQSxjQUFJRSxRQUFRLEtBQVo7QUFGc0M7QUFBQTtBQUFBOztBQUFBO0FBR3RDLGtDQUFtQmpELE9BQU9DLElBQVAsQ0FBWStDLFFBQVosQ0FBbkIsbUlBQTBDO0FBQUEsa0JBQWpDRSxNQUFpQzs7QUFDeEMsa0JBQUlBLFdBQVdwRyxVQUFmLEVBQTJCO0FBQ3pCbUcsd0JBQVEsSUFBUjtBQUNBO0FBQ0Q7QUFDRjtBQVJxQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVN0QyxjQUFJQSxLQUFKLEVBQVc7QUFDVCxtQkFBT0QsU0FBU2xHLFVBQVQsQ0FBUDtBQUNBO0FBQ0Q7QUFDRjtBQWRzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZXhDOzs7Ozs7QUFJSHFHLE9BQU9DLE9BQVAsR0FBaUJuSyxhQUFqQiIsImZpbGUiOiJzb3hfY29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBub2RlU3Ryb3BoZSBmcm9tIFwibm9kZS1zdHJvcGhlXCI7XG5cbmxldCBTdHJvcGhlID0gbm9kZVN0cm9waGUuU3Ryb3BoZTtcblxubGV0ICRwcmVzID0gU3Ryb3BoZS4kcHJlcztcbmxldCAkaXEgPSBTdHJvcGhlLiRpcTtcblxubGV0IFBVQlNVQl9OUyA9IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCI7XG5cbmltcG9ydCBwYXJzZVN0cmluZyBmcm9tIFwieG1sMmpzXCI7XG5cbmltcG9ydCBTb3hVdGlsIGZyb20gXCIuL3NveF91dGlsXCI7XG5pbXBvcnQgWG1sVXRpbCBmcm9tIFwiLi94bWxfdXRpbFwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwiLi9kZXZpY2VcIjtcbmltcG9ydCBUcmFuc2R1Y2VyVmFsdWUgZnJvbSBcIi4vdHJhbnNkdWNlcl92YWx1ZVwiO1xuXG5jbGFzcyBTb3hDb25uZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoYm9zaFNlcnZpY2UsIGppZCwgcGFzc3dvcmQpIHtcbiAgICB0aGlzLmJvc2hTZXJ2aWNlID0gYm9zaFNlcnZpY2U7XG4gICAgdGhpcy5qaWQgPSBqaWQ7XG4gICAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xuXG4gICAgdGhpcy5fcmF3Q29ubiA9IG51bGw7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kYXRhQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fbWV0YUNhbGxiYWNrcyA9IHt9O1xuICB9XG5cbiAgX3N0cm9waGVPblJhd0lucHV0KGRhdGEpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIjw8PDw8PCBpbnB1dFwiKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdPdXRwdXQoZGF0YSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiPj4+Pj4+IG91dHB1dFwiKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uQ29ubmVjdGluZygpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQoKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJjb25uZWN0ZWQgMVwiKTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmQoJHByZXMoKS5jKCdwcmlvcml0eScpLnQoJy0xJykpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAyXCIpO1xuXG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuYmluZChcbiAgICAvLyAgIFwieG1wcDpwdWJzdWI6bGFzdC1wdWJsaXNoZWQtaXRlbVwiLFxuICAgIC8vICAgdGhhdC5fb25MYXN0UHVibGlzaGVkSXRlbVJlY2VpdmVkXG4gICAgLy8gKTtcblxuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmJpbmQoXG4gICAgLy8gICBcInhtcHA6cHVic3ViOml0ZW0tcHVibGlzaGVkXCIsXG4gICAgLy8gICB0aGF0Ll9vblB1Ymxpc2hlZEl0ZW1SZWNlaXZlZFxuICAgIC8vICk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgcHVic3ViSGFuZGxlciA9IChldikgPT4ge1xuICAgICAgLy8gVE9ET1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0BAQEBAIHB1YnN1YkhhbmRsZXIhJyk7XG4gICAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShldik7XG4gICAgICAgIGxldCBjYiA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEBAQCBnb3QgZGF0YSFcIik7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBkYXRhID0gU294VXRpbC5wYXJzZURhdGFQYXlsb2FkKHRoYXQsIGV2LCBjYik7XG4gICAgICAgIC8vIFRPRE86IGRpc3BhdGNoXG4gICAgICAgIHRoYXQuZGlzcGF0Y2hEYXRhKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gbmVlZGVkIHRvIGJlIGNhbGxlZCBldmVyeSB0aW1lXG4gICAgfTtcblxuICAgIGxldCBzZXJ2aWNlID0gJ3B1YnN1Yi4nICsgdGhpcy5nZXREb21haW4oKTtcblxuICAgIHRoaXMuX3Jhd0Nvbm4uYWRkSGFuZGxlcihcbiAgICAgIHB1YnN1YkhhbmRsZXIsXG4gICAgICBudWxsLFxuICAgICAgJ21lc3NhZ2UnLFxuICAgICAgbnVsbCxcbiAgICAgIG51bGwsXG4gICAgICBzZXJ2aWNlXG4gICAgKTtcblxuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgM1wiKTtcbiAgICBpZiAodGhpcy5fb25Db25uZWN0Q2FsbGJhY2spIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzLTFcIik7XG4gICAgICB0aGlzLl9vbkNvbm5lY3RDYWxsYmFjaygpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDMtMlwiKTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDQgZW5kXCIpO1xuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nKCkge1xuXG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RlZCgpIHtcbiAgICB0aGlzLl9yYXdDb25uID0gbnVsbDtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9vbkRpc2Nvbm5lY3RDYWxsYmFjaykge1xuICAgICAgdGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkZhaWxsKCkge1xuXG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZShzdGF0dXMpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAIHN0YXJ0IG9mIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlXCIpO1xuICAgIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkVDVElORykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5lY3RpbmdcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uQ29ubmVjdGluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5GQUlMKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmZhaWxcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRmFpbGwoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5ESVNDT05ORUNUSU5HKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAZGlzY29ubmVjdGluZ1wiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuRElTQ09OTkVDVEVEKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RlZCgpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5FQ1RFRCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQCBVTktOT1dOIFNUQVRVUzogXCIgKyBzdGF0dXMpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAIGVuZCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZVwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIF9zdHJvcGhlT25MYXN0UHVibGlzaGVkSXRlbVJlY2VpdmVkKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgaWYgKFNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoTWV0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2UgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgLy8gRklYTUVcbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBfc3Ryb3BoZU9uUHVibGlzaGVkSXRlbVJlY2VpdmVkKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gIC8vICAgICB0aGlzLmRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgLy8gRklYTUVcbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBkaXNwYXRjaERhdGFQdWJsaXNoKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgbGV0IGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gIC8vICAgbGV0IGRldmljZUxpc3RlbmVyVGFibGUgPSB0aGlzLl9kYXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAvLyAgIGlmIChkZXZpY2VMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgLy8gICAgIHJldHVybjtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgbGV0IGRldmljZVRvQmluZCA9IHRoaXMuYmluZChkZXZpY2VOYW1lKTtcbiAgLy8gICBsZXQgdGhhdCA9IHRoaXM7XG4gIC8vICAgbGV0IG9uRGF0YVBhcnNlZCA9IChkYXRhKSA9PiB7XG4gIC8vICAgICB0aGF0Ll9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIC8vICAgfTtcbiAgLy8gICBTb3hVdGlsLnBhcnNlRGF0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQsIG9uRGF0YVBhcnNlZCk7XG4gIC8vICAgLy8gdGhpcy5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICAvLyB9XG4gIGRpc3BhdGNoRGF0YShkYXRhKSB7XG4gICAgbGV0IGRldmljZU5hbWUgPSBkYXRhLmdldERldmljZSgpLmdldE5hbWUoKTtcbiAgICBsZXQgZGF0YUxpc3RlbmVyVGFibGUgPSB0aGlzLl9kYXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAgIGlmIChkYXRhTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYnJvYWRjYXN0KGRhdGFMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgfVxuXG4gIC8vIGRpc3BhdGNoTWV0YVB1Ymxpc2gob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgLy8gICBsZXQgZGV2aWNlTGlzdGVuZXJUYWJsZSA9IHRoaXMuX21ldGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gIC8vICAgaWYgKGRldmljZUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAvLyAgICAgcmV0dXJuO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQgZGV2aWNlVG9CaW5kID0gdGhpcy5iaW5kKGRldmljZU5hbWUpO1xuICAvLyAgIGxldCB0aGF0ID0gdGhpcztcbiAgLy8gICBsZXQgb25NZXRhUGFyc2VkID0gKG1ldGEpID0+IHtcbiAgLy8gICAgIHRoYXQuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBtZXRhKTtcbiAgLy8gICB9O1xuICAvLyAgIFNveFV0aWwucGFyc2VNZXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCwgb25NZXRhUGFyc2VkKTtcbiAgLy8gICAvLyBsZXQgbWV0YSA9IFNveFV0aWwucGFyc2VNZXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCk7XG4gIC8vICAgLy8gdGhpcy5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIG1ldGEpO1xuICAvLyB9XG5cbiAgZ2V0Qm9zaFNlcnZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm9zaFNlcnZpY2U7XG4gIH1cblxuICBnZXREb21haW4oKSB7XG4gICAgbGV0IGppZCA9IHRoaXMuZ2V0SklEKCk7XG4gICAgaWYgKGppZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgZGV0ZXJtaW5lIGRvbWFpbihhbm9ueW1vdXMgbW9kZSArIG5vdCBjb25uZWN0ZWQpXCIpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBTdHJvcGhlLlN0cm9waGUuZ2V0RG9tYWluRnJvbUppZCh0aGlzLmdldEpJRCgpKTtcbiAgICB9XG4gIH1cblxuICBnZXRKSUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuamlkO1xuICB9XG5cbiAgZ2V0UGFzc3dvcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFzc3dvcmQ7XG4gIH1cblxuICBjb25uZWN0KGNhbGxiYWNrKSB7XG4gICAgbGV0IGNvbm4gPSBuZXcgU3Ryb3BoZS5TdHJvcGhlLkNvbm5lY3Rpb24odGhpcy5nZXRCb3NoU2VydmljZSgpKTtcbiAgICB0aGlzLl9vbkNvbm5lY3RDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIGNvbm4ucmF3SW5wdXQgPSB0aGlzLl9zdHJvcGhlT25SYXdJbnB1dDtcbiAgICBjb25uLnJhd091dHB1dCA9IHRoaXMuX3N0cm9waGVPblJhd091dHB1dDtcbiAgICB0aGlzLl9yYXdDb25uID0gY29ubjtcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLmdldFBhc3N3b3JkKCk7XG5cbiAgICAvLyB3aXRob3V0IHdyYXBwaW5nIGNhbGwgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUsIFwidGhpc1wiIHdpbGwgYmUgbWlzc2VkIGluc2lkZSB0aGUgZnVuY1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgY2IgPSAoc3RhdHVzKSA9PiB7IHJldHVybiB0aGF0Ll9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlKHN0YXR1cyk7IH07XG4gICAgY29ubi5jb25uZWN0KGppZCwgcGFzc3dvcmQsIGNiKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fcmF3Q29ubiAhPT0gbnVsbCAmJiB0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLl9yYXdDb25uLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBnZXRTdHJvcGhlQ29ubmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmF3Q29ubjtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGRldmljZSwgY2FsbGJhY2ssIGxpc3RlbmVySWQpIHtcbiAgICBpZiAobGlzdGVuZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIGxpc3RlbmVySWQ7XG4gIH1cblxuICByZW1vdmVBbGxMaXN0ZW5lckZvckRldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9kYXRhQ2FsbGJhY2tzID0ge307XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpO1xuICB9XG5cbiAgZmV0Y2hNZXRhKGRldmljZSwgY2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgbGV0IGxpc3RlbmVySWQgPSB0aGlzLl9nZW5SYW5kb21JZCgpO1xuICAgICAgbGV0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgICAgbGV0IF9jYWxsYmFjayA9IChtZXRhKSA9PiB7XG4gICAgICAgIHRoYXQuX3JlbW92ZU1ldGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKTtcbiAgICAgICAgdGhhdC5fcmF3Q29ubi5QdWJTdWIudW5zdWJzY3JpYmUobWV0YU5vZGUpO1xuICAgICAgICBjYWxsYmFjayhtZXRhKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlZ2lzdGVyTWV0YUxpc3RlbmVyKGRldmljZSwgbGlzdGVuZXJJZCwgX2NhbGxiYWNrKTtcbiAgICAgIC8vIHRoaXMuc3Vic2NyaWJlKGRldmljZSk7XG4gICAgICAvLyB0aGlzLl9zdWJOb2RlKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCB0cnVlKTtcbiAgICAgIC8vIGxldCBjYiA9IChpcSkgPT4ge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhcInJlcXVlc3RpbmcgcmVjZW50IGl0ZW1cIik7XG4gICAgICAvLyAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyB0aGF0LmdldERvbWFpbigpO1xuICAgICAgLy9cbiAgICAgIC8vICAgLy8gaHR0cHM6Ly94bXBwLm9yZy9leHRlbnNpb25zL3hlcC0wMDYwLmh0bWwjc3Vic2NyaWJlci1yZXRyaWV2ZS1yZXF1ZXN0cmVjZW50XG4gICAgICAvL1xuICAgICAgLy8gICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgICAgLy8gICAvLyAgICAgZnJvbT0nZnJhbmNpc2NvQGRlbm1hcmsubGl0L2JhcnJhY2tzJ1xuICAgICAgLy8gICAvLyAgICAgdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgICAvLyAgIC8vICAgICBpZD0naXRlbXMyJz5cbiAgICAgIC8vICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgICAgLy8gICAvLyAgICAgPGl0ZW1zIG5vZGU9J3ByaW5jZWx5X211c2luZ3MnIG1heF9pdGVtcz0nMicvPlxuICAgICAgLy8gICAvLyAgIDwvcHVic3ViPlxuICAgICAgLy8gICAvLyA8L2lxPlxuICAgICAgLy8gICBsZXQgdW5pcXVlSWQgPSB0aGF0Ll9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgICAgLy8gICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhhdC5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgIC8vICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgIC8vICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbm9kZSwgbWF4X2l0ZW1zOiAxIH0pO1xuICAgICAgLy8gICAvLyB0aGF0Ll9yYXdDb25uLlxuICAgICAgLy8gICBsZXQgc3VjMiA9IChpcSkgPT4ge1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwicmVjZW50IHJlcXVlc3Qgc3VjY2Vzcz9cIik7XG4gICAgICAvL1xuICAgICAgLy8gICB9O1xuICAgICAgLy8gICBsZXQgZXJyMiA9IChpcSkgPT4ge1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwicmVjZW50IHJlcXVlc3QgZmFpbGVkP1wiKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIH07XG4gICAgICAvLyAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKGlxMiwgc3VjMiwgZXJyMik7XG4gICAgICAvL1xuICAgICAgLy8gfTtcbiAgICAgIC8vIHRoaXMuX3Vuc3ViTm9kZShkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgY2IpO1xuXG4gICAgICBsZXQgY2IgPSAoaXEpID0+IHtcbiAgICAgICAgLy8gVE9ET1xuXG4gICAgICB9O1xuICAgICAgdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCBjYik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0U3Vic2NyaXB0aW9uKG5vZGUsIGRvbWFpbiwgY2IpIHtcblxuICAgIC8vICAgbGV0IGlxMiA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IHRoYXQuX3Jhd0Nvbm4uamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgLy8gICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgIC8vICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbm9kZSwgbWF4X2l0ZW1zOiAxIH0pO1xuICAgIC8vIDxpcSB0eXBlPSdnZXQnXG4gICAgLy8gICAgIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAvLyAgICAgdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgLy8gICAgIGlkPSdzdWJzY3JpcHRpb25zMSc+XG4gICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgIC8vICAgICA8c3Vic2NyaXB0aW9ucy8+XG4gICAgLy8gICA8L3B1YnN1Yj5cbiAgICAvLyA8L2lxPlxuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgbGV0IHVuaXF1ZUlkID0gdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICBsZXQgaXEgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiB0aGlzLl9yYXdDb25uLmppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgICAgLmMoXCJwdWJzdWJcIiwge3htbG5zOiBQVUJTVUJfTlN9KVxuICAgICAgLmMoXCJzdWJzY3JpcHRpb25zXCIpO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJnZXQgc3ViIG9rXCIpO1xuICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGlxKTtcbiAgICAgIGxldCBjb252ZXJ0ZWQgPSBYbWxVdGlsLmNvbnZTdWJzY3JpcHRpb25zKGlxKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiY29udmVydGVkIG9rXCIpO1xuICAgICAgY2IoY29udmVydGVkKTtcblxuICAgIH07XG4gICAgbGV0IGVyciA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJnZXQgc3ViIGZhaWxlZFwiKTtcblxuICAgIH07XG5cbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgYmluZChkZXZpY2VOYW1lLCBkb21haW4pIHtcbiAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEZXZpY2UodGhpcywgZGV2aWNlTmFtZSwgZG9tYWluKTtcbiAgfVxuXG4gIGZldGNoRGV2aWNlcyhjYWxsYmFjaywgZG9tYWluKSB7XG4gICAgaWYgKGRvbWFpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkb21haW4gPSB0aGlzLmdldERvbWFpbigpO1xuICAgIH1cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3Ryb3BoZS9zdHJvcGhlanMtcGx1Z2luLXB1YnN1Yi9ibG9iL21hc3Rlci9zdHJvcGhlLnB1YnN1Yi5qcyNMMjk3XG4gICAgbGV0IGppZCA9IHRoaXMuZ2V0SklEKCk7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICAvLyBsZXQgaXEgPSAkaXEoe2Zyb206IGppZCwgdG86IHNlcnZpY2UsIHR5cGU6J2dldCd9KVxuICAgIC8vICAgLmMoJ3F1ZXJ5JywgeyB4bWxuczogU3Ryb3BoZS5TdHJvcGhlLk5TLkRJU0NPX0lURU1TIH0pO1xuICAgIGxldCBpcSA9ICRpcSh7IGZyb206IGppZCwgdG86IHNlcnZpY2UsIHR5cGU6IFwiZ2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pLmMoXG4gICAgICAncXVlcnknLCB7IHhtbG5zOiBTdHJvcGhlLlN0cm9waGUuTlMuRElTQ09fSVRFTVMgfVxuICAgICk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHN1Y2Nlc3MgPSAobXNnKSA9PiB7XG5cbiAgICAgIC8vIERFQlVHXG4gICAgICAvLyBsZXQgcyA9IG1zZy50b1N0cmluZygpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEBAQCBpbnNpZGUgc3VjY2VzcyBvZiBmZXRjaERldmljZXNcIik7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInR5cGVvZihtc2cpPVwiICsgU3RyaW5nKHR5cGVvZihtc2cpKSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhtc2cpKSk7XG4gICAgICAvLyAvLyBjb25zb2xlLmxvZyhtc2cuX2NoaWxkTm9kZXNMaXN0Lmxlbmd0aCk7XG4gICAgICAvLyAvLyBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5fY2hpbGROb2Rlc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIC8vICAgdmFyIGNuID0gbXNnLl9jaGlsZE5vZGVzTGlzdFtpXTtcbiAgICAgIC8vIC8vICAgY29uc29sZS5sb2coXCItLS1jaGlsZCBub2RlIFwiICsgU3RyaW5nKGkpKTtcbiAgICAgIC8vIC8vICAgY29uc29sZS5sb2coU3RyaW5nKGNuKSk7XG4gICAgICAvLyAvLyAgIGNvbnNvbGUubG9nKGkpO1xuICAgICAgLy8gLy8gICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjbikpKTtcbiAgICAgIC8vIC8vIH1cbiAgICAgIC8vXG4gICAgICAvLyBsZXQgcXVlcnkgPSBtc2cuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLXF1ZXJ5XCIpO1xuICAgICAgLy8gbGV0IGR1bXBDaGlsZEluZm8gPSAoeCwgaW5kZW50KSA9PiB7XG4gICAgICAvLyAgIGlmICghaW5kZW50KSB7XG4gICAgICAvLyAgICAgaW5kZW50ID0gMDtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gICB2YXIgaW5kID0gXCJcIjtcbiAgICAgIC8vICAgZm9yICh2YXIgaiA9IDA7IGogPCBpbmRlbnQ7IGorKykge1xuICAgICAgLy8gICAgIGluZCA9IGluZCArIFwiICBcIjtcbiAgICAgIC8vICAgfVxuICAgICAgLy9cbiAgICAgIC8vICAgaWYgKHguX2NoaWxkTm9kZXNMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiX2xvY2FsTmFtZT1cIiArIHguX2xvY2FsTmFtZSArIFwiLCBfYXR0cmlidXRlcz1cIiArIFN0cmluZyhPYmplY3Qua2V5cyh4Ll9hdHRyaWJ1dGVzKSkpO1xuICAgICAgLy9cbiAgICAgIC8vICAgfVxuICAgICAgLy9cbiAgICAgIC8vICAgY29uc29sZS5sb2coeC5fY2hpbGROb2Rlc0xpc3QubGVuZ3RoKTtcbiAgICAgIC8vICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Ll9jaGlsZE5vZGVzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gICAgIHZhciBjbiA9IHguX2NoaWxkTm9kZXNMaXN0W2ldO1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGluZCArIFwiLS0tY2hpbGQgbm9kZSBcIiArIFN0cmluZyhpKSk7XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coaW5kICsgU3RyaW5nKGNuKSk7XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coaW5kICsgU3RyaW5nKGkpKTtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhpbmQgKyBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjbikpKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfVxuICAgICAgLy8gY29uc29sZS5sb2coXCItLS1pdGVtMFwiKTtcbiAgICAgIC8vIGR1bXBDaGlsZEluZm8ocXVlcnkpO1xuICAgICAgLy9cbiAgICAgIC8vIHZhciBpdGVtMCA9IHF1ZXJ5Ll9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIC8vIGR1bXBDaGlsZEluZm8oaXRlbTApO1xuICAgICAgLy9cbiAgICAgIC8vXG4gICAgICAvLyAvLyBjb25zb2xlLmxvZyhcInR5cGVvZihtc2dbMF0pPVwiICsgU3RyaW5nKHR5cGVvZihtc2dbMF0pKSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLXRvU3RyaW5nKCkgcmVzdWx0XCIpO1xuICAgICAgLy8gaWYgKDEwMDAgPCBzLmxlbmd0aCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhzLnN1YnN0cmluZygwLCAxMDAwKSk7XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhzKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIC8vIERFQlVHIEVORFxuICAgICAgbGV0IHF1ZXJ5ID0gbXNnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCBpdGVtcyA9IHF1ZXJ5Ll9jaGlsZE5vZGVzTGlzdDtcblxuICAgICAgbGV0IGNoZWNrID0ge307XG4gICAgICAvLyBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaXRlbS5fYXR0cmlidXRlcz1cIiArIE9iamVjdC5rZXlzKGl0ZW0uX2F0dHJpYnV0ZXMpKTtcbiAgICAgICAgLy8gbGV0IG5vZGUgPSBpdGVtLl9hdHRyaWJ1dGVzLm5vZGU7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibm9kZT1cIiArIE9iamVjdC5rZXlzKG5vZGUpKVxuICAgICAgICBsZXQgbm9kZSA9IGl0ZW0uX2F0dHJpYnV0ZXMubm9kZS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibm9kZT1cIiArIG5vZGUpO1xuICAgICAgICBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgICAgICAgICBsZXQgcmVhbE5vZGUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKGNoZWNrW3JlYWxOb2RlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0gPSB7IGRhdGE6IHRydWUgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAgICAgICAgIGxldCByZWFsTm9kZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICBpZiAoY2hlY2tbcmVhbE5vZGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXSA9IHsgbWV0YTogdHJ1ZSB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0uZGF0YSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGxldCBkZXZpY2VOYW1lcyA9IFtdO1xuICAgICAgbGV0IGRldmljZXMgPSBbXTtcbiAgICAgIGZvciAobGV0IGRldmljZU5hbWUgb2YgT2JqZWN0LmtleXMoY2hlY2spKSB7XG4gICAgICAgIGxldCBjID0gY2hlY2tbZGV2aWNlTmFtZV07XG4gICAgICAgIGlmIChjLmRhdGEgJiYgYy5tZXRhKSB7XG4gICAgICAgICAgbGV0IGRldmljZSA9IHRoYXQuYmluZChkZXZpY2VOYW1lKTtcbiAgICAgICAgICBkZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICAvLyBkZXZpY2VOYW1lcy5wdXNoKGRldmljZU5hbWUpO1xuICAgICAgICAgIC8vIGRldmljZU5hbWVzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhkZXZpY2VzKTtcblxuICAgICAgLy8gZm9yIChsZXQgZG4gb2YgZGV2aWNlTmFtZXMpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZG4pO1xuICAgICAgLy8gfVxuICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tIGRldmljZXMgPSBcIiArIGRldmljZU5hbWVzLmxlbmd0aCk7XG5cbiAgICAgIC8vIFNveFV0aWwuZXh0cmFjdERldmljZXModGhhdCwgbXNnLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGxldCBlcnJvciA9IChtc2cpID0+IHtcbiAgICAgIC8vIEZJWE1FXG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEAgZmV0Y2hEZXZpY2VzIGVycm9yOiBcIiArIG1zZyk7XG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9yYXdDb25uLnNlbmRJUShpcS50cmVlKCksIHN1Y2Nlc3MsIGVycm9yLCB1bmRlZmluZWQpO1xuXG5cbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5kaXNjb3Zlck5vZGVzKChzdWNfcmVzdWx0KSA9PiB7XG4gICAgLy8gICBjb25zb2xlLmxvZyhcImRpc2NvdmVyTm9kZXM6IHN1Y2Nlc3NlZDogXCIgKyBzdWNfcmVzdWx0KTtcbiAgICAvL1xuICAgIC8vIH0sIChlcnJfcmVzdWx0KSA9PiB7XG4gICAgLy8gICBjb25zb2xlLmxvZyhcImRpc2NvbnZlck5vZGVzOiBmYWlsZWRcIiArIGVycl9yZXN1bHQpO1xuICAgIC8vIH0pO1xuICB9XG5cbiAgZmV0Y2hTdWJzY3JpcHRpb25zKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuZ2V0U3Vic2NyaXB0aW9ucygoc3Vic2NyaXB0aW9ucykgPT4ge1xuICAgICAgLy8gVE9ETzogRGV2aWNlIOOCquODluOCuOOCp+OCr+ODiOOBruODquOCueODiOOBq+WKoOW3peOBl+OBpmNhbGxiYWNr44KS5ZG844Gz5Ye644GZXG5cbiAgICB9KTtcbiAgfVxuXG4gIHN1YnNjcmliZShkZXZpY2UpIHtcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgbGV0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICAvLyBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZGV2aWNlLmdldERvbWFpbigpO1xuXG4gICAgLy8gdGhpcy5fc3ViTm9kZShkYXRhTm9kZSwgZGV2aWNlLmdldERvbWFpbigpKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLnVuc3Vic2NyaWJlKGRldmljZSwgKCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgdW5zdWJzY3JpYmUgY2FsbGJhY2sgY2FsbGVkXCIpO1xuICAgICAgbGV0IGNiID0gKCkgPT4ge1xuICAgICAgfTtcbiAgICAgIHRoYXQuX3N1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZmFsc2UsIGNiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF9zdWJOb2RlIGNhbGxlZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zdWJOb2RlKG5vZGUsIGRvbWFpbiwgcmVxdWVzdFJlY2VudCwgY2FsbGJhY2spIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3Ryb3BoZS9zdHJvcGhlanMtcGx1Z2luLXB1YnN1Yi9ibG9iL21hc3Rlci9zdHJvcGhlLnB1YnN1Yi5qcyNMMjk3XG4gICAgLy8gbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRldmljZS5nZXREb21haW4oKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5zdWJzY3JpYmUoZGF0YU5vZGUpO1xuICAgIC8vIFRPRE9cblxuICAgIC8vIG5vZGUgbGlzdCBnZXQg44Gu44Go44GN44GucXVlcnlcbiAgICAvLyBsZXQgaXEgPSAkaXEoeyBmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCB0eXBlOiBcImdldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KS5jKFxuICAgIC8vICAgJ3F1ZXJ5JywgeyB4bWxuczogU3Ryb3BoZS5TdHJvcGhlLk5TLkRJU0NPX0lURU1TIH1cbiAgICAvLyApO1xuXG4gICAgLy8gaHR0cDovL2dnb3phZC5jb20vc3Ryb3BoZS5wbHVnaW5zL2RvY3Mvc3Ryb3BoZS5wdWJzdWIuaHRtbFxuICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAQEBAQCByYXcgamlkID0gXCIgKyB0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgbGV0IHJhd0ppZCA9IHRoaXMuX3Jhd0Nvbm4uamlkO1xuICAgIGxldCBiYXJlSmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKHRoaXMuX3Jhd0Nvbm4uamlkKTtcbiAgICBsZXQgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogXCJzZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSlcbiAgICAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiIH0pXG4gICAgICAvLyAuYygnc3Vic2NyaWJlJywge25vZGU6IG5vZGUsIGppZDogYmFyZUppZH0pO1xuICAgICAgLmMoJ3N1YnNjcmliZScsIHtub2RlOiBub2RlLCBqaWQ6IHJhd0ppZH0pO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJzdWJzY3JpYmUgc3VjY2Vzcz8gbm9kZT1cIiArIG5vZGUpO1xuXG4gICAgICAvLyBodHRwczovL3htcHAub3JnL2V4dGVuc2lvbnMveGVwLTAwNjAuaHRtbCNzdWJzY3JpYmVyLXJldHJpZXZlLXJlcXVlc3RyZWNlbnRcblxuICAgICAgLy8gPGlxIHR5cGU9J2dldCdcbiAgICAgIC8vICAgICBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgICAvLyAgICAgdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgICAvLyAgICAgaWQ9J2l0ZW1zMic+XG4gICAgICAvLyAgIDxwdWJzdWIgeG1sbnM9J2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1Yic+XG4gICAgICAvLyAgICAgPGl0ZW1zIG5vZGU9J3ByaW5jZWx5X211c2luZ3MnIG1heF9pdGVtcz0nMicvPlxuICAgICAgLy8gICA8L3B1YnN1Yj5cbiAgICAgIC8vIDwvaXE+XG4gICAgICBpZiAocmVxdWVzdFJlY2VudCkge1xuICAgICAgICBsZXQgdW5pcXVlSWQgPSB0aGF0Ll9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgICAgICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhhdC5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbm9kZSwgbWF4X2l0ZW1zOiAxIH0pO1xuICAgICAgICAvLyB0aGF0Ll9yYXdDb25uLlxuICAgICAgICBsZXQgc3VjMiA9IChpcSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicmVjZW50IHJlcXVlc3Qgc3VjY2Vzcz9cIik7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGVycjIgPSAoaXEpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInJlY2VudCByZXF1ZXN0IGZhaWxlZD9cIik7XG5cbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEyLCBzdWMyLCBlcnIyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInN1YnNjcmliZSBmYWlsZWQ/ICBcIiArIFN0cmluZyhpcSkpO1xuICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGlxKTtcbiAgICB9O1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG5cbiAgfVxuXG4gIHVuc3Vic2NyaWJlKGRldmljZSwgY2FsbGJhY2spIHtcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgbGV0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY2IgPSAoKSA9PiB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IG15SmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKHRoaXMuX3Jhd0Nvbm4uamlkKTtcblxuICAgIHRoaXMuX2dldFN1YnNjcmlwdGlvbihkYXRhTm9kZSwgZG9tYWluLCAoc3ViKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIl9nZXRTdWJzY3JpcHRpb24gY2FsbGJhY2sgY2FsbGVkIGluIHVuc3Vic2NyaWJlXCIpO1xuICAgICAgaWYgKHN1YltteUppZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdWJbbXlKaWRdID0ge307XG4gICAgICB9XG4gICAgICBsZXQgc3ViaWRzID0gc3ViW215SmlkXVtkYXRhTm9kZV07XG4gICAgICBpZiAoc3ViaWRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgc3ViaWRzID09PSB1bmRlZmluZWQhXCIpO1xuICAgICAgICBjYigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBzdWJpZHMubGVuZ3RoPT09XCIgKyBzdWJpZHMubGVuZ3RoKTtcbiAgICAgIGlmIChzdWJpZHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGNiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBkZWxOZXh0RnVuYyA9IChpKSA9PiB7XG4gICAgICAgICAgaWYgKHN1Ymlkcy5sZW5ndGggPD0gaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGRlbE5leHRGdW5jKGkrMSksIHN1Ymlkc1tpXSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBfdW5zdWJOb2RlIGNhbGxlZCBmb3Igc3ViaWQ9XCIgKyBzdWJpZHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGVsTmV4dEZ1bmMoMSksIHN1Ymlkc1swXSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF91bnN1Yk5vZGUgY2FsbGVkIGZvciBzdWJpZD1cIiArIHN1Ymlkc1swXSk7XG4gICAgICB9XG4gICAgfSlcbiAgICAvLyB0aGlzLl91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgKCkgPT4ge1xuICAgIC8vICAgLy8gVE9ET1xuICAgIC8vIH0pO1xuICB9XG5cbiAgX3Vuc3ViTm9kZShub2RlLCBkb21haW4sIGNhbGxiYWNrLCBzdWJpZCkge1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgLy8gPGlxIHR5cGU9J3NldCdcbiAgICAvLyBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgLy8gaWQ9J3Vuc3ViMSc+XG4gICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgIC8vICAgICAgPHVuc3Vic2NyaWJlXG4gICAgLy8gICAgICAgICAgbm9kZT0ncHJpbmNlbHlfbXVzaW5ncydcbiAgICAvLyAgICAgICAgICBqaWQ9J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdCcvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgLy8gY29uc29sZS5sb2coXCJfdW5zdWJOb2RlOiBiYXJlSmlkPVwiICsgYmFyZUppZCk7XG5cbiAgICBsZXQgdW5zdWJBdHRycyA9IHsgbm9kZTogbm9kZSwgamlkOiBiYXJlSmlkIH07XG4gICAgaWYgKHN1YmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHVuc3ViQXR0cnMuc3ViaWQgPSBzdWJpZDtcbiAgICB9XG5cbiAgICBsZXQgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogXCJzZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSlcbiAgICAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiIH0pXG4gICAgICAuYygndW5zdWJzY3JpYmUnLCB1bnN1YkF0dHJzKTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidW5zdWIgc3VjY2Vzc1wiKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhpcSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInVuc3ViIGZhaWxlZFwiKTtcbiAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShpcSk7XG4gICAgfTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmVBbGwoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIHRoaXMuZmV0Y2hTdWJzY3JpcHRpb25zKChkZXZpY2VzKSA9PiB7XG4gICAgICBmb3IgKGxldCBkZXZpY2Ugb2YgZGV2aWNlcykge1xuICAgICAgICB0aGF0LnVuc3Vic2NyaWJlKGRldmljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjcmVhdGVEZXZpY2UoZGV2aWNlLCBtZXRhKSB7XG4gICAgLy8gY3JlYXRlIFwiX2RhdGFcIiBhbmQgXCJfbWV0YVwiIG5vZGVzXG4gICAgbGV0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmNyZWF0ZU5vZGUoZGF0YU5vZGUpO1xuICAgIGxldCBtZXRhTm9kZSA9IGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5jcmVhdGVOb2RlKG1ldGFOb2RlKTtcblxuICAgIC8vIHB1Ymxpc2ggbWV0YSBkYXRhXG4gICAgbGV0IG1ldGFYbWxTdHJpbmcgPSBtZXRhLnRvWG1sU3RyaW5nKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIucHVibGlzaChtZXRhTm9kZSwgW21ldGFYbWxTdHJpbmddKTtcbiAgfVxuXG4gIGRlbGV0ZURldmljZShkZXZpY2UpIHtcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuZGVsZXRlTm9kZShkYXRhTm9kZSk7XG4gICAgbGV0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmRlbGV0ZU5vZGUobWV0YU5vZGUpO1xuICB9XG5cbiAgcHVibGlzaChkZXZpY2UsIGRhdGEpIHtcbiAgICBsZXQgeG1sU3RyaW5nID0gZGF0YS50b1htbFN0cmluZygpO1xuICAgIGxldCBub2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLnB1Ymxpc2gobm9kZSwgW3htbFN0cmluZ10pO1xuICB9XG5cbiAgX2dlblJhbmRvbUlkKCkge1xuICAgIGxldCBjaGFycyA9IFwiYWJjZGVmMDEyMzQ1Njc4OTBcIjtcbiAgICBsZXQgbkNoYXJzID0gY2hhcnMubGVuZ3RoO1xuICAgIGxldCBsZW4gPSAxMjg7XG4gICAgdmFyIHJldCA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IGlkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG5DaGFycyk7XG4gICAgICBsZXQgY2hhciA9IGNoYXJzLmNoYXJBdChpZHgpO1xuICAgICAgcmV0ID0gcmV0ICsgY2hhcjtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIF9yZWdpc3Rlck1ldGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLl9tZXRhQ2FsbGJhY2tzLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9yZWdpc3RlckRhdGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLl9kYXRhQ2FsbGJhY2tzLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9yZWdpc3Rlckxpc3RlbmVyKHRhYmxlLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGRldmljZU5hbWUgPSBkZXZpY2UuZ2V0TmFtZSgpO1xuXG4gICAgaWYgKHRhYmxlW2RldmljZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhYmxlW2RldmljZU5hbWVdID0ge307XG4gICAgfVxuXG4gICAgdGFibGVbZGV2aWNlTmFtZV1bbGlzdGVuZXJJZF0gPSBjYWxsYmFjaztcbiAgfVxuXG4gIF9icm9hZGNhc3QodGFibGUsIGFyZ3VtZW50KSB7XG4gICAgZm9yIChsZXQgbGlzdGVuZXJJZCBvZiBPYmplY3Qua2V5cyh0YWJsZSkpIHtcbiAgICAgIGxldCBsaXN0ZW5lciA9IHRhYmxlW2xpc3RlbmVySWRdO1xuICAgICAgLy8gY29uc29sZS5sb2coJyQkJCQgbGlzdGVuZXJJZD0nICsgbGlzdGVuZXJJZCArIFwiLCBsaXN0ZW5lcj1cIiArIGxpc3RlbmVyKTtcbiAgICAgIGxpc3RlbmVyKGFyZ3VtZW50KTtcbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlTWV0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0aGlzLl9tZXRhQ2FsbGJhY2tzLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIF9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyV2l0aElkKHRoaXMuX2RhdGFDYWxsYmFja3MsIGxpc3RlbmVySWQpO1xuICB9XG5cbiAgX3JlbW92ZUxpc3RlbmVyV2l0aElkKHRhYmxlLCBsaXN0ZW5lcklkKSB7XG4gICAgZm9yIChsZXQgZGV2TmFtZSBvZiBPYmplY3Qua2V5cyh0YWJsZSkpIHtcbiAgICAgIGxldCBkZXZUYWJsZSA9IHRhYmxlW2Rldk5hbWVdO1xuICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBsc3RuSWQgb2YgT2JqZWN0LmtleXMoZGV2VGFibGUpKSB7XG4gICAgICAgIGlmIChsc3RuSWQgPT09IGxpc3RlbmVySWQpIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIGRlbGV0ZSBkZXZUYWJsZVtsaXN0ZW5lcklkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTb3hDb25uZWN0aW9uO1xuIl19