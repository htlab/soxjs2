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
var PUBSUB_OWNER_NS = "http://jabber.org/protocol/pubsub#owner";

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

    this._connEventCallbacks = {};
  }

  _createClass(SoxConnection, [{
    key: "_stropheOnRawInput",
    value: function _stropheOnRawInput(data) {
      //console.log("<<<<<< input");
      //console.log(data);
    }
  }, {
    key: "_stropheOnRawOutput",
    value: function _stropheOnRawOutput(data) {
      //console.log(">>>>>> output");
      //console.log(data);
    }
  }, {
    key: "addConnectionEventListner",
    value: function addConnectionEventListner(listener, listenerId) {
      if (listenerId === undefined) {
        listenerId = this._genRandomId();
      }

      this._connEventCallbacks[listenerId] = listener;
      return listenerId;
    }
  }, {
    key: "_callConnEvent",
    value: function _callConnEvent(methodName) {
      var callbacks = this._connEventCallbacks;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(callbacks)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callbackId = _step.value;

          var listener = callbacks[callbackId];
          var callback = listener[methodName];
          try {
            if (callback === undefined) {
              console.warn('callbackId=' + callbackId + " has not such method: " + methodName);
            } else {
              callback();
            }
          } catch (e) {
            console.error(e);
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
    }
  }, {
    key: "_stropheOnConnConnecting",
    value: function _stropheOnConnConnecting() {
      this._callConnEvent('onConnecting');
    }
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
      this._callConnEvent('onConnected');
    }
  }, {
    key: "_stropheOnConnDisconnecting",
    value: function _stropheOnConnDisconnecting() {
      this._callConnEvent('onDisconnecting');
    }
  }, {
    key: "_stropheOnConnDisconnected",
    value: function _stropheOnConnDisconnected() {
      this._rawConn = null;
      this._isConnected = false;
      if (this._onDisconnectCallback) {
        this._onDisconnectCallback();
      }
      this._callConnEvent('onDisconnected');
    }
  }, {
    key: "_stropheOnConnFaill",
    value: function _stropheOnConnFaill() {
      this._callConnEvent('onFail');
    }
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
      } else { }
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
      var _this = this;

      try {
        var that = this;
        var listenerId = this._genRandomId();
        var metaNode = device.getMetaNodeName();
        var _callback = function _callback(meta) {
          that._unsubNode(device.getMetaNodeName(), device.getDomain(), function () { });
          callback(meta);
        };
        var service = "pubsub." + this.getDomain();
        this._registerMetaListener(device, listenerId, _callback);

        var cb = function cb(subscriptions) {
          var jid = that._rawConn.jid;
          var mySub = subscriptions[jid];
          if (mySub !== undefined) {
            var metaNodeSubIDs = mySub[metaNode];
            var availableSubID = metaNodeSubIDs[0];

            var uniqueId = that._rawConn.getUniqueId("pubsub");
            var iq2 = $iq({ type: "get", from: jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: metaNode, max_items: 1, subid: availableSubID });
            var suc2 = function suc2(iq) {
              // console.log("\n\nrecent request success?\n\n");
            };
            var err2 = function err2(iq) {
              // console.log("\n\nrecent request failed?\n\n");
            };
            that._rawConn.sendIQ(iq2, suc2, err2); do { } while (true);
          } else {
            // first we need to sub
            // console.log("\n\n\n@@@@@ no our sub info, going to sub!\n\n\n");
            var rawJid = _this._rawConn.jid;
            var bareJid = Strophe.Strophe.getBareJidFromJid(_this._rawConn.jid);
            var subIq = $iq({ to: service, type: "set", id: _this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('subscribe', { node: metaNode, jid: rawJid });

            var subSuc = function subSuc(iq) {
              // console.log("\n\n@@@@ sub success, going to fetch subscriptions to get subid");
              that._getSubscription(device.getMetaNodeName(), device.getDomain(), function (subscriptions2) {
                var mySub2 = subscriptions2[jid];
                var metaNodeSubIDs2 = mySub2[metaNode];
                var availableSubID2 = metaNodeSubIDs2[0];

                var uniqueId3 = that._rawConn.getUniqueId("pubsub");
                var iq3 = $iq({ type: "get", from: jid, to: service, id: uniqueId3 }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: metaNode, max_items: 1, subid: availableSubID2 });

                var suc3 = function suc3(iq) {
                  var meta = _xml_util2.default.convRecentItem(that, iq);
                  _callback(meta);
                };
                var err3 = function err3(iq) {
                  // console.log("\n\n@@@@@ recent request error? 3\n\n");
                };

                that._rawConn.sendIQ(iq3, suc3, err3);
              });
            };
            that._rawConn.sendIQ(subIq, subSuc, function () { });
          }
        };
        this._getSubscription(device.getMetaNodeName(), device.getDomain(), cb);
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_getSubscription",
    value: function _getSubscription(node, domain, cb) {
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
        var converted = _xml_util2.default.convSubscriptions(iq);
        cb(converted);
      };
      var err = function err(iq) { };

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
      var iq = $iq({ from: jid, to: service, type: "get", id: this._rawConn.getUniqueId("pubsub") }).c('query', { xmlns: Strophe.Strophe.NS.DISCO_ITEMS });

      var that = this;
      var success = function success(msg) {
        var query = msg._childNodesList[0];
        var items = query._childNodesList;

        var check = {};
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var node = item._attributes.node._valueForAttrModified;
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

        var devices = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(check)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var deviceName = _step2.value;

            var c = check[deviceName];
            if (c.data && c.meta) {
              var device = that.bind(deviceName);
              devices.push(device);
            }
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

        callback(devices);
      };

      var error = function error(msg) { };

      return this._rawConn.sendIQ(iq.tree(), success, error, undefined);
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
        var cb = function cb() { };
        that._subNode(dataNode, domain, false, cb);
        // console.log("@@@ _subNode called");
      });
    }
  }, {
    key: "_subNode",
    value: function _subNode(node, domain, requestRecent, callback) {
      // https://github.com/strophe/strophejs-plugin-pubsub/blob/master/strophe.pubsub.js#L297
      var that = this;
      var service = "pubsub." + domain;

      // http://ggozad.com/strophe.plugins/docs/strophe.pubsub.html
      // console.log("@@@@@@@ raw jid = " + this._rawConn.jid);
      var rawJid = this._rawConn.jid;
      var bareJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);
      var iq = $iq({ to: service, type: "set", id: this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('subscribe', { node: node, jid: rawJid });

      var suc = function suc(iq) {
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
          var suc2 = function suc2(iq) {
            if (callback) {
              callback();
            }
          };
          var err2 = function err2(iq) { };
          that._rawConn.sendIQ(iq2, suc2, err2);
        } else {
          callback();
        }
      };
      var err = function err(iq) { };
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = devices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var device = _step3.value;

            that.unsubscribe(device);
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
      });
    }
  }, {
    key: "createDevice",
    value: function createDevice(device, meta, cbSuccess, cbFailed) {
      try {
        var domain = device.getDomain();
        var metaNode = device.getMetaNodeName();
        var dataNode = device.getDataNodeName();
        var that = this;
        this._createNode(metaNode, domain, function (iq) {
          that._createNode(dataNode, domain, function (iq2) {
            // TODO: send meta to meta node
            that._publishToNode(metaNode, device.getDomain(), meta, cbSuccess, cbFailed);
          }, cbFailed);
        }, cbFailed);
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_createNode",
    value: function _createNode(nodeName, domain, cbSuccess, cbFailed) {
      // console.log("\n\n---- _createNode");
      var service = 'pubsub.' + domain;
      var conn = this._rawConn;
      var uniqueId = conn.getUniqueId('pubsub');
      // console.log("\n\n---- _createNode2");
      try {
        // const iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid })
        //   .c('pubsub', { xmlns: PUBSUB_NS })
        //   .c('create', { node: nodeName });
        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_NS }).c('create', { node: nodeName }).c('configure').c('x', { xmlns: 'jabber:x:data', type: 'submit' }).c('field', { var: 'pubsub#access_model', type: 'list-single' }).c('value').t('open').up().up().c('field', { var: 'pubsub#publish_model', type: 'list-single' }).c('value').t('open').up().up().c('field', { var: 'pubsub#persist_items', type: 'boolean' }).c('value').t('1').up().up().c('field', { var: 'pubsub#max_items', type: 'text-single' }).c('value').t('1');
        // console.log("\n\n---- _createNode3");

        conn.sendIQ(iq, cbSuccess, cbFailed);
        // console.log("\n\n---- _createNode4");
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_deleteNode",
    value: function _deleteNode(nodeName, domain, cbSuccess, cbFailed) {
      var service = 'pubsub.' + domain;
      var conn = this._rawConn;
      var uniqueId = conn.getUniqueId('pubsub');
      // const bareJid = Strophe.Strophe.getBareJidFromJid(conn.jid);
      // const fromJid = conn.
      var iq =
        // const iq = $iq({ to: service, type: 'set', id: uniqueId, from: bareJid })
        $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_OWNER_NS }).c('delete', { node: nodeName });

      conn.sendIQ(iq, cbSuccess, cbFailed);
    }
  }, {
    key: "deleteDevice",
    value: function deleteDevice(device, cbSuccess, cbFailed) {
      var domain = device.getDomain();
      var metaNode = device.getMetaNodeName();
      var dataNode = device.getDataNodeName();
      var that = this;
      this._deleteNode(metaNode, domain, function (iq) {
        that._deleteNode(dataNode, domain, cbSuccess, cbFailed);
      }, function (iq) {
        cbFailed(iq);
        that._deleteNode(dataNode, domain, function (iq2) { }, function (iq2) { });
      });
    }
  }, {
    key: "publish",
    value: function publish(data, cbSuccess, cbFailed) {
      var device = data.getDevice();
      var domain = device.getDomain();
      var dataNode = device.getDataNodeName();
      this._publishToNode(dataNode, domain, data, cbSuccess, cbFailed);
    }
  }, {
    key: "_publishToNode",
    value: function _publishToNode(nodeName, domain, publishContent, cbSuccess, cbFailed) {
      // expects publishContent as an instance of DeviceMeta or Data
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');
        var itemUniqueId = conn.getUniqueId('item');
        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_NS }).c('publish', { node: nodeName }).c('item', { id: itemUniqueId })
          // .cnode(publishContent)
          ;

        publishContent.appendToNode(iq);

        conn.sendIQ(iq, cbSuccess, cbFailed);
      } catch (e) {
        console.error(e.stack);
      }
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
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(table)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var listenerId = _step4.value;

          var listener = table[listenerId];
          // console.log('$$$$ listenerId=' + listenerId + ", listener=" + listener);
          listener(argument);
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
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = Object.keys(table)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var devName = _step5.value;

          var devTable = table[devName];
          var found = false;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = Object.keys(devTable)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var lstnId = _step6.value;

              if (lstnId === listenerId) {
                found = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          if (found) {
            delete devTable[listenerId];
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
    }
  }, {
    key: "setAccessPermission",
    value: function setAccessPermission(nodeName, domain, accessModel, cbSuccess, cbFailed) {
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');

        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c(
          'pubsub', { xmlns: PUBSUB_OWNER_NS }).c(
            'configure', { node: nodeName }).c(
              'x', { xmlns: 'jabber:x:data', type: 'submit' }).c(
                'field', { var: 'pubsub#access_model', type: 'list-single' }).c(
                  'value').t(accessModel)
        conn.sendIQ(iq, cbSuccess, cbFailed);

      } catch (e) {
        console.error(e.stack);
      }
    }
  }, {
    key: "setAffaliation",
    value: function setAffaliation(nodeName, domain, affaliation, cbSuccess, cbFailed) {
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');

        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c(
          'pubsub', { xmlns: PUBSUB_OWNER_NS }).c(
            'affiliations', { node: nodeName })

        for (var i = 0; i < affaliation.length; i++) {
          iq.c('affinition', { xmlns: PUBSUB_OWNER_NS, jid: affaliation[i], affiliation: 'none' }).up()
        }
        console.log(iq.tree)

        conn.sendIQ(iq, cbSuccess, cbFailed);

      } catch (e) {
        console.error(e.stack);
      }

    }
  }

  ]);

  return SoxConnection;
}();

module.exports = SoxConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwiJHByZXMiLCIkaXEiLCJQVUJTVUJfTlMiLCJQVUJTVUJfT1dORVJfTlMiLCJTb3hDb25uZWN0aW9uIiwiYm9zaFNlcnZpY2UiLCJqaWQiLCJwYXNzd29yZCIsIl9yYXdDb25uIiwiX2lzQ29ubmVjdGVkIiwiX2RhdGFDYWxsYmFja3MiLCJfbWV0YUNhbGxiYWNrcyIsIl9jb25uRXZlbnRDYWxsYmFja3MiLCJkYXRhIiwibGlzdGVuZXIiLCJsaXN0ZW5lcklkIiwidW5kZWZpbmVkIiwiX2dlblJhbmRvbUlkIiwibWV0aG9kTmFtZSIsImNhbGxiYWNrcyIsIk9iamVjdCIsImtleXMiLCJjYWxsYmFja0lkIiwiY2FsbGJhY2siLCJjb25zb2xlIiwid2FybiIsImUiLCJlcnJvciIsIl9jYWxsQ29ubkV2ZW50Iiwic2VuZCIsImMiLCJ0IiwidGhhdCIsInB1YnN1YkhhbmRsZXIiLCJldiIsImNiIiwicGFyc2VEYXRhUGF5bG9hZCIsImRpc3BhdGNoRGF0YSIsImV4Iiwic2VydmljZSIsImdldERvbWFpbiIsImFkZEhhbmRsZXIiLCJfb25Db25uZWN0Q2FsbGJhY2siLCJfb25EaXNjb25uZWN0Q2FsbGJhY2siLCJzdGF0dXMiLCJTdGF0dXMiLCJDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5Db25uZWN0aW5nIiwiQ09OTkZBSUwiLCJfc3Ryb3BoZU9uQ29ubkZhaWxsIiwiRElTQ09OTkVDVElORyIsIl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZyIsIkRJU0NPTk5FQ1RFRCIsIl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkIiwiQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQiLCJkZXZpY2VOYW1lIiwiZ2V0RGV2aWNlIiwiZ2V0TmFtZSIsImRhdGFMaXN0ZW5lclRhYmxlIiwiX2Jyb2FkY2FzdCIsImdldERvbWFpbkZyb21KaWQiLCJnZXRKSUQiLCJjb25uIiwiQ29ubmVjdGlvbiIsImdldEJvc2hTZXJ2aWNlIiwicmF3SW5wdXQiLCJfc3Ryb3BoZU9uUmF3SW5wdXQiLCJyYXdPdXRwdXQiLCJfc3Ryb3BoZU9uUmF3T3V0cHV0IiwiZ2V0UGFzc3dvcmQiLCJfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZSIsImNvbm5lY3QiLCJpc0Nvbm5lY3RlZCIsImRpc2Nvbm5lY3QiLCJkZXZpY2UiLCJfcmVnaXN0ZXJEYXRhTGlzdGVuZXIiLCJfcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkIiwibWV0YU5vZGUiLCJnZXRNZXRhTm9kZU5hbWUiLCJfY2FsbGJhY2siLCJtZXRhIiwiX3Vuc3ViTm9kZSIsIl9yZWdpc3Rlck1ldGFMaXN0ZW5lciIsInN1YnNjcmlwdGlvbnMiLCJteVN1YiIsIm1ldGFOb2RlU3ViSURzIiwiYXZhaWxhYmxlU3ViSUQiLCJ1bmlxdWVJZCIsImdldFVuaXF1ZUlkIiwiaXEyIiwidHlwZSIsImZyb20iLCJ0byIsImlkIiwieG1sbnMiLCJub2RlIiwibWF4X2l0ZW1zIiwic3ViaWQiLCJzdWMyIiwiaXEiLCJlcnIyIiwic2VuZElRIiwicmF3SmlkIiwiYmFyZUppZCIsImdldEJhcmVKaWRGcm9tSmlkIiwic3ViSXEiLCJzdWJTdWMiLCJfZ2V0U3Vic2NyaXB0aW9uIiwic3Vic2NyaXB0aW9uczIiLCJteVN1YjIiLCJtZXRhTm9kZVN1YklEczIiLCJhdmFpbGFibGVTdWJJRDIiLCJ1bmlxdWVJZDMiLCJpcTMiLCJzdWMzIiwiY29udlJlY2VudEl0ZW0iLCJlcnIzIiwibG9nIiwic3RhY2siLCJkb21haW4iLCJzdWMiLCJjb252ZXJ0ZWQiLCJjb252U3Vic2NyaXB0aW9ucyIsImVyciIsIk5TIiwiRElTQ09fSVRFTVMiLCJzdWNjZXNzIiwibXNnIiwicXVlcnkiLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtcyIsImNoZWNrIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJfYXR0cmlidXRlcyIsIl92YWx1ZUZvckF0dHJNb2RpZmllZCIsImVuZHNXaXRoRGF0YSIsInJlYWxOb2RlIiwiY3V0RGF0YVN1ZmZpeCIsImVuZHNXaXRoTWV0YSIsImN1dE1ldGFTdWZmaXgiLCJkZXZpY2VzIiwiYmluZCIsInB1c2giLCJ0cmVlIiwiUHViU3ViIiwiZ2V0U3Vic2NyaXB0aW9ucyIsImRhdGFOb2RlIiwiZ2V0RGF0YU5vZGVOYW1lIiwidW5zdWJzY3JpYmUiLCJfc3ViTm9kZSIsInJlcXVlc3RSZWNlbnQiLCJteUppZCIsInN1YiIsInN1YmlkcyIsImRlbE5leHRGdW5jIiwidW5zdWJBdHRycyIsImZldGNoU3Vic2NyaXB0aW9ucyIsImNiU3VjY2VzcyIsImNiRmFpbGVkIiwiX2NyZWF0ZU5vZGUiLCJfcHVibGlzaFRvTm9kZSIsIm5vZGVOYW1lIiwidmFyIiwidXAiLCJfZGVsZXRlTm9kZSIsInB1Ymxpc2hDb250ZW50IiwiaXRlbVVuaXF1ZUlkIiwiYXBwZW5kVG9Ob2RlIiwiY2hhcnMiLCJuQ2hhcnMiLCJsZW4iLCJyZXQiLCJpZHgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJjaGFyIiwiY2hhckF0IiwiX3JlZ2lzdGVyTGlzdGVuZXIiLCJ0YWJsZSIsImFyZ3VtZW50IiwiX3JlbW92ZUxpc3RlbmVyV2l0aElkIiwiZGV2TmFtZSIsImRldlRhYmxlIiwiZm91bmQiLCJsc3RuSWQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFVQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQWJBLElBQU1BLFVBQVUsc0JBQVlBLE9BQTVCOztBQUVBLElBQU1DLFFBQVFELFFBQVFDLEtBQXRCO0FBQ0EsSUFBTUMsTUFBTUYsUUFBUUUsR0FBcEI7O0FBRUEsSUFBTUMsWUFBWSxtQ0FBbEI7QUFDQSxJQUFNQyxrQkFBa0IseUNBQXhCOztJQVNNQyxhO0FBQ0oseUJBQVlDLFdBQVosRUFBeUJDLEdBQXpCLEVBQThCQyxRQUE5QixFQUF3QztBQUFBOztBQUN0QyxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtB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RXFCdUssSyxFQUFPdkssVSxFQUFZO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ3ZDLDhCQUFvQkssT0FBT0MsSUFBUCxDQUFZaUssS0FBWixDQUFwQixtSUFBd0M7QUFBQSxjQUEvQkcsT0FBK0I7O0FBQ3RDLGNBQUlDLFdBQVdKLE1BQU1HLE9BQU4sQ0FBZjtBQUNBLGNBQUlFLFFBQVEsS0FBWjtBQUZzQztBQUFBO0FBQUE7O0FBQUE7QUFHdEMsa0NBQW1CdkssT0FBT0MsSUFBUCxDQUFZcUssUUFBWixDQUFuQixtSUFBMEM7QUFBQSxrQkFBakNFLE1BQWlDOztBQUN4QyxrQkFBSUEsV0FBVzdLLFVBQWYsRUFBMkI7QUFDekI0Syx3QkFBUSxJQUFSO0FBQ0E7QUFDRDtBQUNGO0FBUnFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU3RDLGNBQUlBLEtBQUosRUFBVztBQUNULG1CQUFPRCxTQUFTM0ssVUFBVCxDQUFQO0FBQ0E7QUFDRDtBQUNGO0FBZHNDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFleEM7Ozs7OztBQUlIOEssT0FBT0MsT0FBUCxHQUFpQjFMLGFBQWpCIiwiZmlsZSI6InNveF9jb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5vZGVTdHJvcGhlIGZyb20gXCJub2RlLXN0cm9waGVcIjtcblxuY29uc3QgU3Ryb3BoZSA9IG5vZGVTdHJvcGhlLlN0cm9waGU7XG5cbmNvbnN0ICRwcmVzID0gU3Ryb3BoZS4kcHJlcztcbmNvbnN0ICRpcSA9IFN0cm9waGUuJGlxO1xuXG5jb25zdCBQVUJTVUJfTlMgPSBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiO1xuY29uc3QgUFVCU1VCX09XTkVSX05TID0gXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWIjb3duZXJcIjtcblxuaW1wb3J0IHBhcnNlU3RyaW5nIGZyb20gXCJ4bWwyanNcIjtcblxuaW1wb3J0IFNveFV0aWwgZnJvbSBcIi4vc294X3V0aWxcIjtcbmltcG9ydCBYbWxVdGlsIGZyb20gXCIuL3htbF91dGlsXCI7XG5pbXBvcnQgRGV2aWNlIGZyb20gXCIuL2RldmljZVwiO1xuaW1wb3J0IFRyYW5zZHVjZXJWYWx1ZSBmcm9tIFwiLi90cmFuc2R1Y2VyX3ZhbHVlXCI7XG5cbmNsYXNzIFNveENvbm5lY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihib3NoU2VydmljZSwgamlkLCBwYXNzd29yZCkge1xuICAgIHRoaXMuYm9zaFNlcnZpY2UgPSBib3NoU2VydmljZTtcbiAgICB0aGlzLmppZCA9IGppZDtcbiAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cbiAgICB0aGlzLl9yYXdDb25uID0gbnVsbDtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2RhdGFDYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLl9tZXRhQ2FsbGJhY2tzID0ge307XG5cbiAgICB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdJbnB1dChkYXRhKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIjw8PDw8PCBpbnB1dFwiKTtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICB9XG5cbiAgX3N0cm9waGVPblJhd091dHB1dChkYXRhKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIj4+Pj4+PiBvdXRwdXRcIik7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIGFkZENvbm5lY3Rpb25FdmVudExpc3RuZXIobGlzdGVuZXIsIGxpc3RlbmVySWQpIHtcbiAgICBpZiAobGlzdGVuZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3NbbGlzdGVuZXJJZF0gPSBsaXN0ZW5lcjtcbiAgICByZXR1cm4gbGlzdGVuZXJJZDtcbiAgfVxuXG4gIF9jYWxsQ29ubkV2ZW50KG1ldGhvZE5hbWUpIHtcbiAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3M7XG4gICAgZm9yIChjb25zdCBjYWxsYmFja0lkIG9mIE9iamVjdC5rZXlzKGNhbGxiYWNrcykpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gY2FsbGJhY2tzW2NhbGxiYWNrSWRdO1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSBsaXN0ZW5lclttZXRob2ROYW1lXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdjYWxsYmFja0lkPScgKyBjYWxsYmFja0lkICsgXCIgaGFzIG5vdCBzdWNoIG1ldGhvZDogXCIgKyBtZXRob2ROYW1lKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKSB7XG4gICAgdGhpcy5fY2FsbENvbm5FdmVudCgnb25Db25uZWN0aW5nJyk7XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCgpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImNvbm5lY3RlZCAxXCIpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZCgkcHJlcygpLmMoJ3ByaW9yaXR5JykudCgnLTEnKSk7XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDJcIik7XG5cbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5iaW5kKFxuICAgIC8vICAgXCJ4bXBwOnB1YnN1YjpsYXN0LXB1Ymxpc2hlZC1pdGVtXCIsXG4gICAgLy8gICB0aGF0Ll9vbkxhc3RQdWJsaXNoZWRJdGVtUmVjZWl2ZWRcbiAgICAvLyApO1xuXG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuYmluZChcbiAgICAvLyAgIFwieG1wcDpwdWJzdWI6aXRlbS1wdWJsaXNoZWRcIixcbiAgICAvLyAgIHRoYXQuX29uUHVibGlzaGVkSXRlbVJlY2VpdmVkXG4gICAgLy8gKTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBwdWJzdWJIYW5kbGVyID0gKGV2KSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgICB0cnkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnQEBAQEAgcHVic3ViSGFuZGxlciEnKTtcbiAgICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGV2KTtcbiAgICAgICAgbGV0IGNiID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAIGdvdCBkYXRhIVwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGRhdGEgPSBTb3hVdGlsLnBhcnNlRGF0YVBheWxvYWQodGhhdCwgZXYsIGNiKTtcbiAgICAgICAgLy8gVE9ETzogZGlzcGF0Y2hcbiAgICAgICAgdGhhdC5kaXNwYXRjaERhdGEoZGF0YSk7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlOyAvLyBuZWVkZWQgdG8gYmUgY2FsbGVkIGV2ZXJ5IHRpbWVcbiAgICB9O1xuXG4gICAgbGV0IHNlcnZpY2UgPSAncHVic3ViLicgKyB0aGlzLmdldERvbWFpbigpO1xuXG4gICAgdGhpcy5fcmF3Q29ubi5hZGRIYW5kbGVyKFxuICAgICAgcHVic3ViSGFuZGxlcixcbiAgICAgIG51bGwsXG4gICAgICAnbWVzc2FnZScsXG4gICAgICBudWxsLFxuICAgICAgbnVsbCxcbiAgICAgIHNlcnZpY2VcbiAgICApO1xuXG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzXCIpO1xuICAgIGlmICh0aGlzLl9vbkNvbm5lY3RDYWxsYmFjaykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDMtMVwiKTtcbiAgICAgIHRoaXMuX29uQ29ubmVjdENhbGxiYWNrKCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMy0yXCIpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgNCBlbmRcIik7XG4gICAgdGhpcy5fY2FsbENvbm5FdmVudCgnb25Db25uZWN0ZWQnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpIHtcbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkRpc2Nvbm5lY3RpbmcnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkKCkge1xuICAgIHRoaXMuX3Jhd0Nvbm4gPSBudWxsO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9vbkRpc2Nvbm5lY3RDYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkRpc2Nvbm5lY3RlZCcpO1xuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5GYWlsbCgpIHtcbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkZhaWwnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlKHN0YXR1cykge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgc3RhcnQgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGVcIik7XG4gICAgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORUNUSU5HKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmVjdGluZ1wiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5Db25uZWN0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkZBSUwpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZmFpbFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5GYWlsbCgpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkRJU0NPTk5FQ1RJTkcpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBkaXNjb25uZWN0aW5nXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5ESVNDT05ORUNURUQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkVDVEVEKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAIFVOS05PV04gU1RBVFVTOiBcIiArIHN0YXR1cyk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgZW5kIG9mIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlXCIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gX3N0cm9waGVPbkxhc3RQdWJsaXNoZWRJdGVtUmVjZWl2ZWQob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBpZiAoU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hNZXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICAvLyBGSVhNRVxuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8vIF9zdHJvcGhlT25QdWJsaXNoZWRJdGVtUmVjZWl2ZWQob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICAvLyBGSVhNRVxuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8vIGRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgLy8gICBsZXQgZGV2aWNlTGlzdGVuZXJUYWJsZSA9IHRoaXMuX2RhdGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gIC8vICAgaWYgKGRldmljZUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAvLyAgICAgcmV0dXJuO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQgZGV2aWNlVG9CaW5kID0gdGhpcy5iaW5kKGRldmljZU5hbWUpO1xuICAvLyAgIGxldCB0aGF0ID0gdGhpcztcbiAgLy8gICBsZXQgb25EYXRhUGFyc2VkID0gKGRhdGEpID0+IHtcbiAgLy8gICAgIHRoYXQuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgLy8gICB9O1xuICAvLyAgIFNveFV0aWwucGFyc2VEYXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCwgb25EYXRhUGFyc2VkKTtcbiAgLy8gICAvLyB0aGlzLl9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIC8vIH1cbiAgZGlzcGF0Y2hEYXRhKGRhdGEpIHtcbiAgICBsZXQgZGV2aWNlTmFtZSA9IGRhdGEuZ2V0RGV2aWNlKCkuZ2V0TmFtZSgpO1xuICAgIGxldCBkYXRhTGlzdGVuZXJUYWJsZSA9IHRoaXMuX2RhdGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gICAgaWYgKGRhdGFMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9icm9hZGNhc3QoZGF0YUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICB9XG5cbiAgLy8gZGlzcGF0Y2hNZXRhUHVibGlzaChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXRNZXRhU3VmZml4KG5vZGUpO1xuICAvLyAgIGxldCBkZXZpY2VMaXN0ZW5lclRhYmxlID0gdGhpcy5fbWV0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgLy8gICBpZiAoZGV2aWNlTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vICAgICByZXR1cm47XG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBkZXZpY2VUb0JpbmQgPSB0aGlzLmJpbmQoZGV2aWNlTmFtZSk7XG4gIC8vICAgbGV0IHRoYXQgPSB0aGlzO1xuICAvLyAgIGxldCBvbk1ldGFQYXJzZWQgPSAobWV0YSkgPT4ge1xuICAvLyAgICAgdGhhdC5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIG1ldGEpO1xuICAvLyAgIH07XG4gIC8vICAgU294VXRpbC5wYXJzZU1ldGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kLCBvbk1ldGFQYXJzZWQpO1xuICAvLyAgIC8vIGxldCBtZXRhID0gU294VXRpbC5wYXJzZU1ldGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kKTtcbiAgLy8gICAvLyB0aGlzLl9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgbWV0YSk7XG4gIC8vIH1cblxuICBnZXRCb3NoU2VydmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3NoU2VydmljZTtcbiAgfVxuXG4gIGdldERvbWFpbigpIHtcbiAgICByZXR1cm4gU3Ryb3BoZS5TdHJvcGhlLmdldERvbWFpbkZyb21KaWQodGhpcy5nZXRKSUQoKSk7XG4gIH1cblxuICBnZXRKSUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuamlkO1xuICB9XG5cbiAgZ2V0UGFzc3dvcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFzc3dvcmQ7XG4gIH1cblxuICBjb25uZWN0KGNhbGxiYWNrKSB7XG4gICAgbGV0IGNvbm4gPSBuZXcgU3Ryb3BoZS5TdHJvcGhlLkNvbm5lY3Rpb24odGhpcy5nZXRCb3NoU2VydmljZSgpKTtcbiAgICB0aGlzLl9vbkNvbm5lY3RDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIGNvbm4ucmF3SW5wdXQgPSB0aGlzLl9zdHJvcGhlT25SYXdJbnB1dDtcbiAgICBjb25uLnJhd091dHB1dCA9IHRoaXMuX3N0cm9waGVPblJhd091dHB1dDtcbiAgICB0aGlzLl9yYXdDb25uID0gY29ubjtcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLmdldFBhc3N3b3JkKCk7XG5cbiAgICAvLyB3aXRob3V0IHdyYXBwaW5nIGNhbGwgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUsIFwidGhpc1wiIHdpbGwgYmUgbWlzc2VkIGluc2lkZSB0aGUgZnVuY1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgY2IgPSAoc3RhdHVzKSA9PiB7IHJldHVybiB0aGF0Ll9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlKHN0YXR1cyk7IH07XG4gICAgY29ubi5jb25uZWN0KGppZCwgcGFzc3dvcmQsIGNiKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fcmF3Q29ubiAhPT0gbnVsbCAmJiB0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLl9yYXdDb25uLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBnZXRTdHJvcGhlQ29ubmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmF3Q29ubjtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGRldmljZSwgY2FsbGJhY2ssIGxpc3RlbmVySWQpIHtcbiAgICBpZiAobGlzdGVuZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIGxpc3RlbmVySWQ7XG4gIH1cblxuICByZW1vdmVBbGxMaXN0ZW5lckZvckRldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9kYXRhQ2FsbGJhY2tzID0ge307XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpO1xuICB9XG5cbiAgZmV0Y2hNZXRhKGRldmljZSwgY2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgbGV0IGxpc3RlbmVySWQgPSB0aGlzLl9nZW5SYW5kb21JZCgpO1xuICAgICAgbGV0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgICAgbGV0IF9jYWxsYmFjayA9IChtZXRhKSA9PiB7XG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgKCkgPT4ge30pO1xuICAgICAgICBjYWxsYmFjayhtZXRhKTtcbiAgICAgIH1cbiAgICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyB0aGlzLmdldERvbWFpbigpO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJNZXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBfY2FsbGJhY2spO1xuXG4gICAgICBsZXQgY2IgPSAoc3Vic2NyaXB0aW9ucykgPT4ge1xuICAgICAgICBjb25zdCBqaWQgPSB0aGF0Ll9yYXdDb25uLmppZDtcbiAgICAgICAgY29uc3QgbXlTdWIgPSBzdWJzY3JpcHRpb25zW2ppZF07XG4gICAgICAgIGlmIChteVN1YiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc3QgbWV0YU5vZGVTdWJJRHMgPSBteVN1YlttZXRhTm9kZV07XG4gICAgICAgICAgY29uc3QgYXZhaWxhYmxlU3ViSUQgPSBtZXRhTm9kZVN1YklEc1swXTtcblxuICAgICAgICAgIGxldCB1bmlxdWVJZCA9IHRoYXQuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgICAgICAgbGV0IGlxMiA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IGppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgICAgICAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAgICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbWV0YU5vZGUsIG1heF9pdGVtczogMSwgc3ViaWQ6IGF2YWlsYWJsZVN1YklEIH0pO1xuICAgICAgICAgIGxldCBzdWMyID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbnJlY2VudCByZXF1ZXN0IHN1Y2Nlc3M/XFxuXFxuXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgbGV0IGVycjIgPSAoaXEpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxucmVjZW50IHJlcXVlc3QgZmFpbGVkP1xcblxcblwiKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKGlxMiwgc3VjMiwgZXJyMik7ZG8ge1xuXG4gICAgICAgICAgfSB3aGlsZSAodHJ1ZSk7IH0gZWxzZSB7XG4gICAgICAgICAgLy8gZmlyc3Qgd2UgbmVlZCB0byBzdWJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcblxcbkBAQEBAIG5vIG91ciBzdWIgaW5mbywgZ29pbmcgdG8gc3ViIVxcblxcblxcblwiKTtcbiAgICAgICAgICBsZXQgcmF3SmlkID0gdGhpcy5fcmF3Q29ubi5qaWQ7XG4gICAgICAgICAgbGV0IGJhcmVKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgICAgICAgIGxldCBzdWJJcSA9ICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiBcInNldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KVxuICAgICAgICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCIgfSlcbiAgICAgICAgICAgIC5jKCdzdWJzY3JpYmUnLCB7bm9kZTogbWV0YU5vZGUsIGppZDogcmF3SmlkfSk7XG5cbiAgICAgICAgICBjb25zdCBzdWJTdWMgPSAoaXEpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuQEBAQCBzdWIgc3VjY2VzcywgZ29pbmcgdG8gZmV0Y2ggc3Vic2NyaXB0aW9ucyB0byBnZXQgc3ViaWRcIik7XG4gICAgICAgICAgICB0aGF0Ll9nZXRTdWJzY3JpcHRpb24oZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpLCBkZXZpY2UuZ2V0RG9tYWluKCksIChzdWJzY3JpcHRpb25zMikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBteVN1YjIgPSBzdWJzY3JpcHRpb25zMltqaWRdO1xuICAgICAgICAgICAgICBjb25zdCBtZXRhTm9kZVN1YklEczIgPSBteVN1YjJbbWV0YU5vZGVdO1xuICAgICAgICAgICAgICBjb25zdCBhdmFpbGFibGVTdWJJRDIgPSBtZXRhTm9kZVN1YklEczJbMF07XG5cbiAgICAgICAgICAgICAgbGV0IHVuaXF1ZUlkMyA9IHRoYXQuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgICAgICAgICAgIGxldCBpcTMgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQzIH0pXG4gICAgICAgICAgICAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAgICAgICAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG1ldGFOb2RlLCBtYXhfaXRlbXM6IDEsIHN1YmlkOiBhdmFpbGFibGVTdWJJRDIgfSk7XG5cbiAgICAgICAgICAgICAgY29uc3Qgc3VjMyA9IChpcSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBYbWxVdGlsLmNvbnZSZWNlbnRJdGVtKHRoYXQsIGlxKTtcbiAgICAgICAgICAgICAgICBfY2FsbGJhY2sobWV0YSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGNvbnN0IGVycjMgPSAoaXEpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbkBAQEBAIHJlY2VudCByZXF1ZXN0IGVycm9yPyAzXFxuXFxuXCIpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKGlxMywgc3VjMywgZXJyMyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoc3ViSXEsIHN1YlN1YywgKCkgPT4ge30pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCBjYik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0U3Vic2NyaXB0aW9uKG5vZGUsIGRvbWFpbiwgY2IpIHtcbiAgICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgIC8vICAgICBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgIC8vICAgICBpZD0nc3Vic2NyaXB0aW9uczEnPlxuICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAvLyAgICAgPHN1YnNjcmlwdGlvbnMvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIGxldCB1bmlxdWVJZCA9IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgbGV0IGlxID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhpcy5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgIC5jKFwicHVic3ViXCIsIHt4bWxuczogUFVCU1VCX05TfSlcbiAgICAgIC5jKFwic3Vic2NyaXB0aW9uc1wiKTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIGxldCBjb252ZXJ0ZWQgPSBYbWxVdGlsLmNvbnZTdWJzY3JpcHRpb25zKGlxKTtcbiAgICAgIGNiKGNvbnZlcnRlZCk7XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7IH07XG5cbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgYmluZChkZXZpY2VOYW1lLCBkb21haW4pIHtcbiAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEZXZpY2UodGhpcywgZGV2aWNlTmFtZSwgZG9tYWluKTtcbiAgfVxuXG4gIGZldGNoRGV2aWNlcyhjYWxsYmFjaywgZG9tYWluKSB7XG4gICAgaWYgKGRvbWFpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkb21haW4gPSB0aGlzLmdldERvbWFpbigpO1xuICAgIH1cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3Ryb3BoZS9zdHJvcGhlanMtcGx1Z2luLXB1YnN1Yi9ibG9iL21hc3Rlci9zdHJvcGhlLnB1YnN1Yi5qcyNMMjk3XG4gICAgbGV0IGppZCA9IHRoaXMuZ2V0SklEKCk7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICBsZXQgaXEgPSAkaXEoeyBmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCB0eXBlOiBcImdldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KS5jKFxuICAgICAgJ3F1ZXJ5JywgeyB4bWxuczogU3Ryb3BoZS5TdHJvcGhlLk5TLkRJU0NPX0lURU1TIH1cbiAgICApO1xuXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBzdWNjZXNzID0gKG1zZykgPT4ge1xuICAgICAgbGV0IHF1ZXJ5ID0gbXNnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICAgIGxldCBpdGVtcyA9IHF1ZXJ5Ll9jaGlsZE5vZGVzTGlzdDtcblxuICAgICAgbGV0IGNoZWNrID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBub2RlID0gaXRlbS5fYXR0cmlidXRlcy5ub2RlLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgICAgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gICAgICAgICAgbGV0IHJlYWxOb2RlID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgIGlmIChjaGVja1tyZWFsTm9kZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdID0geyBkYXRhOiB0cnVlIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZSkpIHtcbiAgICAgICAgICBsZXQgcmVhbE5vZGUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKGNoZWNrW3JlYWxOb2RlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0gPSB7IG1ldGE6IHRydWUgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgZGV2aWNlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgZGV2aWNlTmFtZSBvZiBPYmplY3Qua2V5cyhjaGVjaykpIHtcbiAgICAgICAgbGV0IGMgPSBjaGVja1tkZXZpY2VOYW1lXTtcbiAgICAgICAgaWYgKGMuZGF0YSAmJiBjLm1ldGEpIHtcbiAgICAgICAgICBsZXQgZGV2aWNlID0gdGhhdC5iaW5kKGRldmljZU5hbWUpO1xuICAgICAgICAgIGRldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKGRldmljZXMpO1xuICAgIH07XG5cbiAgICBsZXQgZXJyb3IgPSAobXNnKSA9PiB7XG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9yYXdDb25uLnNlbmRJUShpcS50cmVlKCksIHN1Y2Nlc3MsIGVycm9yLCB1bmRlZmluZWQpO1xuICB9XG5cbiAgZmV0Y2hTdWJzY3JpcHRpb25zKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuZ2V0U3Vic2NyaXB0aW9ucygoc3Vic2NyaXB0aW9ucykgPT4ge1xuICAgICAgLy8gVE9ETzogRGV2aWNlIOOCquODluOCuOOCp+OCr+ODiOOBruODquOCueODiOOBq+WKoOW3peOBl+OBpmNhbGxiYWNr44KS5ZG844Gz5Ye644GZXG5cbiAgICB9KTtcbiAgfVxuXG4gIHN1YnNjcmliZShkZXZpY2UpIHtcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgbGV0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICAvLyBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZGV2aWNlLmdldERvbWFpbigpO1xuXG4gICAgLy8gdGhpcy5fc3ViTm9kZShkYXRhTm9kZSwgZGV2aWNlLmdldERvbWFpbigpKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLnVuc3Vic2NyaWJlKGRldmljZSwgKCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgdW5zdWJzY3JpYmUgY2FsbGJhY2sgY2FsbGVkXCIpO1xuICAgICAgbGV0IGNiID0gKCkgPT4ge1xuICAgICAgfTtcbiAgICAgIHRoYXQuX3N1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZmFsc2UsIGNiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF9zdWJOb2RlIGNhbGxlZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zdWJOb2RlKG5vZGUsIGRvbWFpbiwgcmVxdWVzdFJlY2VudCwgY2FsbGJhY2spIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3Ryb3BoZS9zdHJvcGhlanMtcGx1Z2luLXB1YnN1Yi9ibG9iL21hc3Rlci9zdHJvcGhlLnB1YnN1Yi5qcyNMMjk3XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG5cbiAgICAvLyBodHRwOi8vZ2dvemFkLmNvbS9zdHJvcGhlLnBsdWdpbnMvZG9jcy9zdHJvcGhlLnB1YnN1Yi5odG1sXG4gICAgLy8gY29uc29sZS5sb2coXCJAQEBAQEBAIHJhdyBqaWQgPSBcIiArIHRoaXMuX3Jhd0Nvbm4uamlkKTtcbiAgICBsZXQgcmF3SmlkID0gdGhpcy5fcmF3Q29ubi5qaWQ7XG4gICAgbGV0IGJhcmVKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIGxldCBpcSA9ICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiBcInNldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KVxuICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCIgfSlcbiAgICAgIC5jKCdzdWJzY3JpYmUnLCB7bm9kZTogbm9kZSwgamlkOiByYXdKaWR9KTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGh0dHBzOi8veG1wcC5vcmcvZXh0ZW5zaW9ucy94ZXAtMDA2MC5odG1sI3N1YnNjcmliZXItcmV0cmlldmUtcmVxdWVzdHJlY2VudFxuXG4gICAgICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgICAgLy8gICAgIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAgIC8vICAgICB0bz0ncHVic3ViLnNoYWtlc3BlYXJlLmxpdCdcbiAgICAgIC8vICAgICBpZD0naXRlbXMyJz5cbiAgICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAgIC8vICAgICA8aXRlbXMgbm9kZT0ncHJpbmNlbHlfbXVzaW5ncycgbWF4X2l0ZW1zPScyJy8+XG4gICAgICAvLyAgIDwvcHVic3ViPlxuICAgICAgLy8gPC9pcT5cbiAgICAgIGlmIChyZXF1ZXN0UmVjZW50KSB7XG4gICAgICAgIGxldCB1bmlxdWVJZCA9IHRoYXQuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgICAgIGxldCBpcTIgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiB0aGF0Ll9yYXdDb25uLmppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgICAgICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBub2RlLCBtYXhfaXRlbXM6IDEgfSk7XG4gICAgICAgIGxldCBzdWMyID0gKGlxKSA9PiB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGVycjIgPSAoaXEpID0+IHsgfTtcbiAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEyLCBzdWMyLCBlcnIyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7IH07XG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kSVEoaXEsIHN1YywgZXJyKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlKGRldmljZSwgY2FsbGJhY2spIHtcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgbGV0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY2IgPSAoKSA9PiB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IG15SmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKHRoaXMuX3Jhd0Nvbm4uamlkKTtcblxuICAgIHRoaXMuX2dldFN1YnNjcmlwdGlvbihkYXRhTm9kZSwgZG9tYWluLCAoc3ViKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIl9nZXRTdWJzY3JpcHRpb24gY2FsbGJhY2sgY2FsbGVkIGluIHVuc3Vic2NyaWJlXCIpO1xuICAgICAgaWYgKHN1YltteUppZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdWJbbXlKaWRdID0ge307XG4gICAgICB9XG4gICAgICBsZXQgc3ViaWRzID0gc3ViW215SmlkXVtkYXRhTm9kZV07XG4gICAgICBpZiAoc3ViaWRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgc3ViaWRzID09PSB1bmRlZmluZWQhXCIpO1xuICAgICAgICBjYigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBzdWJpZHMubGVuZ3RoPT09XCIgKyBzdWJpZHMubGVuZ3RoKTtcbiAgICAgIGlmIChzdWJpZHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGNiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBkZWxOZXh0RnVuYyA9IChpKSA9PiB7XG4gICAgICAgICAgaWYgKHN1Ymlkcy5sZW5ndGggPD0gaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRhdGFOb2RlLCBkb21haW4sIGRlbE5leHRGdW5jKGkrMSksIHN1Ymlkc1tpXSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBfdW5zdWJOb2RlIGNhbGxlZCBmb3Igc3ViaWQ9XCIgKyBzdWJpZHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGVsTmV4dEZ1bmMoMSksIHN1Ymlkc1swXSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF91bnN1Yk5vZGUgY2FsbGVkIGZvciBzdWJpZD1cIiArIHN1Ymlkc1swXSk7XG4gICAgICB9XG4gICAgfSlcbiAgICAvLyB0aGlzLl91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgKCkgPT4ge1xuICAgIC8vICAgLy8gVE9ET1xuICAgIC8vIH0pO1xuICB9XG5cbiAgX3Vuc3ViTm9kZShub2RlLCBkb21haW4sIGNhbGxiYWNrLCBzdWJpZCkge1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgLy8gPGlxIHR5cGU9J3NldCdcbiAgICAvLyBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgLy8gaWQ9J3Vuc3ViMSc+XG4gICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgIC8vICAgICAgPHVuc3Vic2NyaWJlXG4gICAgLy8gICAgICAgICAgbm9kZT0ncHJpbmNlbHlfbXVzaW5ncydcbiAgICAvLyAgICAgICAgICBqaWQ9J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdCcvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgLy8gY29uc29sZS5sb2coXCJfdW5zdWJOb2RlOiBiYXJlSmlkPVwiICsgYmFyZUppZCk7XG5cbiAgICBsZXQgdW5zdWJBdHRycyA9IHsgbm9kZTogbm9kZSwgamlkOiBiYXJlSmlkIH07XG4gICAgaWYgKHN1YmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHVuc3ViQXR0cnMuc3ViaWQgPSBzdWJpZDtcbiAgICB9XG5cbiAgICBsZXQgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogXCJzZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSlcbiAgICAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiIH0pXG4gICAgICAuYygndW5zdWJzY3JpYmUnLCB1bnN1YkF0dHJzKTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidW5zdWIgc3VjY2Vzc1wiKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhpcSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInVuc3ViIGZhaWxlZFwiKTtcbiAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShpcSk7XG4gICAgfTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmVBbGwoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIHRoaXMuZmV0Y2hTdWJzY3JpcHRpb25zKChkZXZpY2VzKSA9PiB7XG4gICAgICBmb3IgKGxldCBkZXZpY2Ugb2YgZGV2aWNlcykge1xuICAgICAgICB0aGF0LnVuc3Vic2NyaWJlKGRldmljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjcmVhdGVEZXZpY2UoZGV2aWNlLCBtZXRhLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICAgIGNvbnN0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgICAgY29uc3QgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgIHRoaXMuX2NyZWF0ZU5vZGUoXG4gICAgICAgICAgbWV0YU5vZGUsXG4gICAgICAgICAgZG9tYWluLFxuICAgICAgICAgIChpcSkgPT4ge1xuICAgICAgICAgICAgdGhhdC5fY3JlYXRlTm9kZShkYXRhTm9kZSwgZG9tYWluLCAoaXEyKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFRPRE86IHNlbmQgbWV0YSB0byBtZXRhIG5vZGVcbiAgICAgICAgICAgICAgdGhhdC5fcHVibGlzaFRvTm9kZShcbiAgICAgICAgICAgICAgICBtZXRhTm9kZSxcbiAgICAgICAgICAgICAgICBkZXZpY2UuZ2V0RG9tYWluKCksXG4gICAgICAgICAgICAgICAgbWV0YSxcbiAgICAgICAgICAgICAgICBjYlN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgY2JGYWlsZWRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sIGNiRmFpbGVkKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNiRmFpbGVkXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVOb2RlKG5vZGVOYW1lLCBkb21haW4sIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbi0tLS0gX2NyZWF0ZU5vZGVcIik7XG4gICAgY29uc3Qgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICBjb25zdCB1bmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ3B1YnN1YicpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuLS0tLSBfY3JlYXRlTm9kZTJcIik7XG4gICAgdHJ5IHtcbiAgICAgIC8vIGNvbnN0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAvLyAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgIC8vICAgLmMoJ2NyZWF0ZScsIHsgbm9kZTogbm9kZU5hbWUgfSk7XG4gICAgICBjb25zdCBpcSA9ICgkaXEoeyB0bzogc2VydmljZSwgdHlwZTogJ3NldCcsIGlkOiB1bmlxdWVJZCwgZnJvbTogY29ubi5qaWQgfSlcbiAgICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAuYygnY3JlYXRlJywgeyBub2RlOiBub2RlTmFtZSB9KVxuICAgICAgICAuYygnY29uZmlndXJlJylcbiAgICAgICAgLmMoJ3gnLCB7IHhtbG5zOiAnamFiYmVyOng6ZGF0YScsIHR5cGU6ICdzdWJtaXQnIH0pXG4gICAgICAgIC5jKCdmaWVsZCcsIHsgdmFyOiAncHVic3ViI2FjY2Vzc19tb2RlbCcsIHR5cGU6ICdsaXN0LXNpbmdsZSd9KVxuICAgICAgICAuYygndmFsdWUnKVxuICAgICAgICAudCgnb3BlbicpXG4gICAgICAgIC51cCgpLnVwKClcbiAgICAgICAgLmMoJ2ZpZWxkJywgeyB2YXI6ICdwdWJzdWIjcHVibGlzaF9tb2RlbCcsIHR5cGU6ICdsaXN0LXNpbmdsZScgfSlcbiAgICAgICAgLmMoJ3ZhbHVlJylcbiAgICAgICAgLnQoJ29wZW4nKVxuICAgICAgICAudXAoKS51cCgpXG4gICAgICAgIC5jKCdmaWVsZCcsIHsgdmFyOiAncHVic3ViI3BlcnNpc3RfaXRlbXMnLCB0eXBlOiAnYm9vbGVhbicgfSlcbiAgICAgICAgLmMoJ3ZhbHVlJylcbiAgICAgICAgLnQoJzEnKVxuICAgICAgICAudXAoKS51cCgpXG4gICAgICAgIC5jKCdmaWVsZCcsIHsgdmFyOiAncHVic3ViI21heF9pdGVtcycsIHR5cGU6ICd0ZXh0LXNpbmdsZScgfSlcbiAgICAgICAgLmMoJ3ZhbHVlJylcbiAgICAgICAgLnQoJzEnKVxuXG4gICAgICApO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG4tLS0tIF9jcmVhdGVOb2RlM1wiKTtcblxuICAgICAgY29ubi5zZW5kSVEoaXEsIGNiU3VjY2VzcywgY2JGYWlsZWQpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG4tLS0tIF9jcmVhdGVOb2RlNFwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICBfZGVsZXRlTm9kZShub2RlTmFtZSwgZG9tYWluLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKSB7XG4gICAgY29uc3Qgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICBjb25zdCB1bmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ3B1YnN1YicpO1xuICAgIC8vIGNvbnN0IGJhcmVKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQoY29ubi5qaWQpO1xuICAgIC8vIGNvbnN0IGZyb21KaWQgPSBjb25uLlxuICAgIGNvbnN0IGlxID0gKFxuICAgIC8vIGNvbnN0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGJhcmVKaWQgfSlcbiAgICAgICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiAnc2V0JywgaWQ6IHVuaXF1ZUlkLCBmcm9tOiBjb25uLmppZCB9KVxuICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9PV05FUl9OUyB9KVxuICAgICAgLmMoJ2RlbGV0ZScsIHsgbm9kZTogbm9kZU5hbWUgfSlcbiAgICApO1xuXG4gICAgY29ubi5zZW5kSVEoaXEsIGNiU3VjY2VzcywgY2JGYWlsZWQpO1xuICB9XG5cbiAgZGVsZXRlRGV2aWNlKGRldmljZSwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIGNvbnN0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICBjb25zdCBtZXRhTm9kZSA9IGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKTtcbiAgICBjb25zdCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICB0aGlzLl9kZWxldGVOb2RlKFxuICAgICAgbWV0YU5vZGUsXG4gICAgICBkb21haW4sXG4gICAgICAoaXEpID0+IHtcbiAgICAgICAgdGhhdC5fZGVsZXRlTm9kZShkYXRhTm9kZSwgZG9tYWluLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKTtcbiAgICAgIH0sXG4gICAgICAoaXEpID0+IHtcbiAgICAgICAgY2JGYWlsZWQoaXEpO1xuICAgICAgICB0aGF0Ll9kZWxldGVOb2RlKGRhdGFOb2RlLCBkb21haW4sIChpcTIpPT57fSwgKGlxMik9Pnt9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcHVibGlzaChkYXRhLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKSB7XG4gICAgY29uc3QgZGV2aWNlID0gZGF0YS5nZXREZXZpY2UoKTtcbiAgICBjb25zdCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgY29uc3QgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcHVibGlzaFRvTm9kZShkYXRhTm9kZSwgZG9tYWluLCBkYXRhLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKTtcbiAgfVxuXG4gIF9wdWJsaXNoVG9Ob2RlKG5vZGVOYW1lLCBkb21haW4sIHB1Ymxpc2hDb250ZW50LCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKSB7XG4gICAgLy8gZXhwZWN0cyBwdWJsaXNoQ29udGVudCBhcyBhbiBpbnN0YW5jZSBvZiBEZXZpY2VNZXRhIG9yIERhdGFcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gJ3B1YnN1Yi4nICsgZG9tYWluO1xuICAgICAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICAgICAgY29uc3QgdW5pcXVlSWQgPSBjb25uLmdldFVuaXF1ZUlkKCdwdWJzdWInKTtcbiAgICAgICAgY29uc3QgaXRlbVVuaXF1ZUlkID0gY29ubi5nZXRVbmlxdWVJZCgnaXRlbScpO1xuICAgICAgICBjb25zdCBpcSA9IChcbiAgICAgICAgICAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogJ3NldCcsIGlkOiB1bmlxdWVJZCwgZnJvbTogY29ubi5qaWQgfSlcbiAgICAgICAgICAuYygncHVic3ViJywgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAgICAgLmMoJ3B1Ymxpc2gnLCB7IG5vZGU6IG5vZGVOYW1lIH0pXG4gICAgICAgICAgLmMoJ2l0ZW0nLCB7IGlkOiBpdGVtVW5pcXVlSWQgfSlcbiAgICAgICAgICAvLyAuY25vZGUocHVibGlzaENvbnRlbnQpXG4gICAgICAgICk7XG5cbiAgICAgICAgcHVibGlzaENvbnRlbnQuYXBwZW5kVG9Ob2RlKGlxKTtcblxuICAgICAgICBjb25uLnNlbmRJUShpcSwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9nZW5SYW5kb21JZCgpIHtcbiAgICBsZXQgY2hhcnMgPSBcImFiY2RlZjAxMjM0NTY3ODkwXCI7XG4gICAgbGV0IG5DaGFycyA9IGNoYXJzLmxlbmd0aDtcbiAgICBsZXQgbGVuID0gMTI4O1xuICAgIHZhciByZXQgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBpZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuQ2hhcnMpO1xuICAgICAgbGV0IGNoYXIgPSBjaGFycy5jaGFyQXQoaWR4KTtcbiAgICAgIHJldCA9IHJldCArIGNoYXI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBfcmVnaXN0ZXJNZXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fbWV0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fZGF0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJMaXN0ZW5lcih0YWJsZSwgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIGxldCBkZXZpY2VOYW1lID0gZGV2aWNlLmdldE5hbWUoKTtcblxuICAgIGlmICh0YWJsZVtkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWJsZVtkZXZpY2VOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIHRhYmxlW2RldmljZU5hbWVdW2xpc3RlbmVySWRdID0gY2FsbGJhY2s7XG4gIH1cblxuICBfYnJvYWRjYXN0KHRhYmxlLCBhcmd1bWVudCkge1xuICAgIGZvciAobGV0IGxpc3RlbmVySWQgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgbGlzdGVuZXIgPSB0YWJsZVtsaXN0ZW5lcklkXTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCckJCQkIGxpc3RlbmVySWQ9JyArIGxpc3RlbmVySWQgKyBcIiwgbGlzdGVuZXI9XCIgKyBsaXN0ZW5lcik7XG4gICAgICBsaXN0ZW5lcihhcmd1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZU1ldGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJXaXRoSWQodGhpcy5fbWV0YUNhbGxiYWNrcywgbGlzdGVuZXJJZCk7XG4gIH1cblxuICBfcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0aGlzLl9kYXRhQ2FsbGJhY2tzLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIF9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0YWJsZSwgbGlzdGVuZXJJZCkge1xuICAgIGZvciAobGV0IGRldk5hbWUgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgZGV2VGFibGUgPSB0YWJsZVtkZXZOYW1lXTtcbiAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgbHN0bklkIG9mIE9iamVjdC5rZXlzKGRldlRhYmxlKSkge1xuICAgICAgICBpZiAobHN0bklkID09PSBsaXN0ZW5lcklkKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICBkZWxldGUgZGV2VGFibGVbbGlzdGVuZXJJZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU294Q29ubmVjdGlvbjtcbiJdfQ==