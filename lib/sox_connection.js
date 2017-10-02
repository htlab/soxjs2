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
  }

  _createClass(SoxConnection, [{
    key: "_stropheOnRawInput",
    value: function _stropheOnRawInput(data) {
      console.log("<<<<<< input");
      console.log(data);
    }
  }, {
    key: "_stropheOnRawOutput",
    value: function _stropheOnRawOutput(data) {
      console.log(">>>>>> output");
      console.log(data);
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
      var _this = this;

      try {
        var that = this;
        var listenerId = this._genRandomId();
        var metaNode = device.getMetaNodeName();
        var _callback = function _callback(meta) {
          that._unsubNode(device.getMetaNodeName(), device.getDomain(), function () {});
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
            that._rawConn.sendIQ(iq2, suc2, err2);do {} while (true);
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
            that._rawConn.sendIQ(subIq, subSuc, function () {});
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
      var err = function err(iq) {};

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
      };

      var error = function error(msg) {};

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
        var cb = function cb() {};
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
          var err2 = function err2(iq) {};
          that._rawConn.sendIQ(iq2, suc2, err2);
        } else {
          callback();
        }
      };
      var err = function err(iq) {};
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
    value: function createDevice(device, meta, cbSuccess, cbFailed) {
      var _this2 = this;

      var domain = device.getDomain();
      var metaNode = device.getMetaNodeName();
      var dataNode = device.getDataNodeName();
      var that = this;
      this._createNode(metaNode, domain, function (iq) {
        _this2._createNode(dataNode, domain, function (iq2) {
          // TODO: send meta to meta node

        }, cbFailed);
      }, cbFailed);
    }
  }, {
    key: "_createNode",
    value: function _createNode(nodeName, domain, cbSuccess, cbFailed) {
      console.log("\n\n---- _createNode");
      var service = 'pubsub.' + domain;
      var conn = this._rawConn;
      var uniqueId = conn.getUniqueId('pubsub');
      console.log("\n\n---- _createNode2");
      try {
        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_NS }).c('create', { node: nodeName });
        console.log("\n\n---- _createNode3");

        conn.sendIQ(iq, cbSuccess, cbFailed);
        console.log("\n\n---- _createNode4");
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
    key: "deleteDevice",
    value: function deleteDevice(device, cbSuccess, cbFailed) {
      // // TODO; このコードは動作確認できてない
      var domain = device.getDomain();
      var metaNode = device.getMetaNodeName();
      var dataNode = device.getDataNodeName();
      var that = this;
      this._deleteNode(metaNode, domain, function (iq) {
        that._deleteNode(dataNode, cbSuccess, cbFailed);
      }, cbFailed);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwiJHByZXMiLCIkaXEiLCJQVUJTVUJfTlMiLCJQVUJTVUJfT1dORVJfTlMiLCJTb3hDb25uZWN0aW9uIiwiYm9zaFNlcnZpY2UiLCJqaWQiLCJwYXNzd29yZCIsIl9yYXdDb25uIiwiX2lzQ29ubmVjdGVkIiwiX2RhdGFDYWxsYmFja3MiLCJfbWV0YUNhbGxiYWNrcyIsImRhdGEiLCJjb25zb2xlIiwibG9nIiwic2VuZCIsImMiLCJ0IiwidGhhdCIsInB1YnN1YkhhbmRsZXIiLCJldiIsImNiIiwicGFyc2VEYXRhUGF5bG9hZCIsImRpc3BhdGNoRGF0YSIsImV4IiwiZXJyb3IiLCJzZXJ2aWNlIiwiZ2V0RG9tYWluIiwiYWRkSGFuZGxlciIsIl9vbkNvbm5lY3RDYWxsYmFjayIsIl9vbkRpc2Nvbm5lY3RDYWxsYmFjayIsInN0YXR1cyIsIlN0YXR1cyIsIkNPTk5FQ1RJTkciLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmciLCJDT05ORkFJTCIsIl9zdHJvcGhlT25Db25uRmFpbGwiLCJESVNDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nIiwiRElTQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQiLCJDT05ORUNURUQiLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCIsImRldmljZU5hbWUiLCJnZXREZXZpY2UiLCJnZXROYW1lIiwiZGF0YUxpc3RlbmVyVGFibGUiLCJ1bmRlZmluZWQiLCJfYnJvYWRjYXN0IiwiZ2V0RG9tYWluRnJvbUppZCIsImdldEpJRCIsImNhbGxiYWNrIiwiY29ubiIsIkNvbm5lY3Rpb24iLCJnZXRCb3NoU2VydmljZSIsInJhd0lucHV0IiwiX3N0cm9waGVPblJhd0lucHV0IiwicmF3T3V0cHV0IiwiX3N0cm9waGVPblJhd091dHB1dCIsImdldFBhc3N3b3JkIiwiX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUiLCJjb25uZWN0IiwiaXNDb25uZWN0ZWQiLCJkaXNjb25uZWN0IiwiZGV2aWNlIiwibGlzdGVuZXJJZCIsIl9nZW5SYW5kb21JZCIsIl9yZWdpc3RlckRhdGFMaXN0ZW5lciIsIl9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQiLCJtZXRhTm9kZSIsImdldE1ldGFOb2RlTmFtZSIsIl9jYWxsYmFjayIsIm1ldGEiLCJfdW5zdWJOb2RlIiwiX3JlZ2lzdGVyTWV0YUxpc3RlbmVyIiwic3Vic2NyaXB0aW9ucyIsIm15U3ViIiwibWV0YU5vZGVTdWJJRHMiLCJhdmFpbGFibGVTdWJJRCIsInVuaXF1ZUlkIiwiZ2V0VW5pcXVlSWQiLCJpcTIiLCJ0eXBlIiwiZnJvbSIsInRvIiwiaWQiLCJ4bWxucyIsIm5vZGUiLCJtYXhfaXRlbXMiLCJzdWJpZCIsInN1YzIiLCJpcSIsImVycjIiLCJzZW5kSVEiLCJyYXdKaWQiLCJiYXJlSmlkIiwiZ2V0QmFyZUppZEZyb21KaWQiLCJzdWJJcSIsInN1YlN1YyIsIl9nZXRTdWJzY3JpcHRpb24iLCJzdWJzY3JpcHRpb25zMiIsIm15U3ViMiIsIm1ldGFOb2RlU3ViSURzMiIsImF2YWlsYWJsZVN1YklEMiIsInVuaXF1ZUlkMyIsImlxMyIsInN1YzMiLCJjb252UmVjZW50SXRlbSIsImVycjMiLCJlIiwic3RhY2siLCJkb21haW4iLCJzdWMiLCJjb252ZXJ0ZWQiLCJjb252U3Vic2NyaXB0aW9ucyIsImVyciIsIk5TIiwiRElTQ09fSVRFTVMiLCJzdWNjZXNzIiwibXNnIiwicXVlcnkiLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtcyIsImNoZWNrIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJfYXR0cmlidXRlcyIsIl92YWx1ZUZvckF0dHJNb2RpZmllZCIsImVuZHNXaXRoRGF0YSIsInJlYWxOb2RlIiwiY3V0RGF0YVN1ZmZpeCIsImVuZHNXaXRoTWV0YSIsImN1dE1ldGFTdWZmaXgiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImJpbmQiLCJwdXNoIiwidHJlZSIsIlB1YlN1YiIsImdldFN1YnNjcmlwdGlvbnMiLCJkYXRhTm9kZSIsImdldERhdGFOb2RlTmFtZSIsInVuc3Vic2NyaWJlIiwiX3N1Yk5vZGUiLCJyZXF1ZXN0UmVjZW50IiwibXlKaWQiLCJzdWIiLCJzdWJpZHMiLCJkZWxOZXh0RnVuYyIsInVuc3ViQXR0cnMiLCJmZXRjaFN1YnNjcmlwdGlvbnMiLCJjYlN1Y2Nlc3MiLCJjYkZhaWxlZCIsIl9jcmVhdGVOb2RlIiwibm9kZU5hbWUiLCJwdWJsaXNoQ29udGVudCIsIml0ZW1VbmlxdWVJZCIsImFwcGVuZFRvTm9kZSIsIl9kZWxldGVOb2RlIiwieG1sU3RyaW5nIiwidG9YbWxTdHJpbmciLCJwdWJsaXNoIiwiY2hhcnMiLCJuQ2hhcnMiLCJsZW4iLCJyZXQiLCJpZHgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJjaGFyIiwiY2hhckF0IiwiX3JlZ2lzdGVyTGlzdGVuZXIiLCJ0YWJsZSIsImFyZ3VtZW50IiwibGlzdGVuZXIiLCJfcmVtb3ZlTGlzdGVuZXJXaXRoSWQiLCJkZXZOYW1lIiwiZGV2VGFibGUiLCJmb3VuZCIsImxzdG5JZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQVVBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBYkEsSUFBTUEsVUFBVSxzQkFBWUEsT0FBNUI7O0FBRUEsSUFBTUMsUUFBUUQsUUFBUUMsS0FBdEI7QUFDQSxJQUFNQyxNQUFNRixRQUFRRSxHQUFwQjs7QUFFQSxJQUFNQyxZQUFZLG1DQUFsQjtBQUNBLElBQU1DLGtCQUFrQix5Q0FBeEI7O0lBU01DLGE7QUFDSix5QkFBWUMsV0FBWixFQUF5QkMsR0FBekIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQUE7O0FBQ3RDLFNBQUtGLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7O0FBRUEsU0FBS0MsUUFBTCxHQUFn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LGNBQWhDLEVBQWdEdUQsVUFBaEQ7QUFDRDs7OzBDQUVxQjhHLEssRUFBTzlHLFUsRUFBWTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUN2Qyw4QkFBb0JzRSxPQUFPQyxJQUFQLENBQVl1QyxLQUFaLENBQXBCLG1JQUF3QztBQUFBLGNBQS9CSSxPQUErQjs7QUFDdEMsY0FBSUMsV0FBV0wsTUFBTUksT0FBTixDQUFmO0FBQ0EsY0FBSUUsUUFBUSxLQUFaO0FBRnNDO0FBQUE7QUFBQTs7QUFBQTtBQUd0QyxrQ0FBbUI5QyxPQUFPQyxJQUFQLENBQVk0QyxRQUFaLENBQW5CLG1JQUEwQztBQUFBLGtCQUFqQ0UsTUFBaUM7O0FBQ3hDLGtCQUFJQSxXQUFXckgsVUFBZixFQUEyQjtBQUN6Qm9ILHdCQUFRLElBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFScUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTdEMsY0FBSUEsS0FBSixFQUFXO0FBQ1QsbUJBQU9ELFNBQVNuSCxVQUFULENBQVA7QUFDQTtBQUNEO0FBQ0Y7QUFkc0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWV4Qzs7Ozs7O0FBSUhzSCxPQUFPQyxPQUFQLEdBQWlCcEwsYUFBakIiLCJmaWxlIjoic294X2Nvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbm9kZVN0cm9waGUgZnJvbSBcIm5vZGUtc3Ryb3BoZVwiO1xuXG5jb25zdCBTdHJvcGhlID0gbm9kZVN0cm9waGUuU3Ryb3BoZTtcblxuY29uc3QgJHByZXMgPSBTdHJvcGhlLiRwcmVzO1xuY29uc3QgJGlxID0gU3Ryb3BoZS4kaXE7XG5cbmNvbnN0IFBVQlNVQl9OUyA9IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCI7XG5jb25zdCBQVUJTVUJfT1dORVJfTlMgPSBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YiNvd25lclwiO1xuXG5pbXBvcnQgcGFyc2VTdHJpbmcgZnJvbSBcInhtbDJqc1wiO1xuXG5pbXBvcnQgU294VXRpbCBmcm9tIFwiLi9zb3hfdXRpbFwiO1xuaW1wb3J0IFhtbFV0aWwgZnJvbSBcIi4veG1sX3V0aWxcIjtcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4vZGV2aWNlXCI7XG5pbXBvcnQgVHJhbnNkdWNlclZhbHVlIGZyb20gXCIuL3RyYW5zZHVjZXJfdmFsdWVcIjtcblxuY2xhc3MgU294Q29ubmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGJvc2hTZXJ2aWNlLCBqaWQsIHBhc3N3b3JkKSB7XG4gICAgdGhpcy5ib3NoU2VydmljZSA9IGJvc2hTZXJ2aWNlO1xuICAgIHRoaXMuamlkID0gamlkO1xuICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcblxuICAgIHRoaXMuX3Jhd0Nvbm4gPSBudWxsO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fZGF0YUNhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuX21ldGFDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdJbnB1dChkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCI8PDw8PDwgaW5wdXRcIik7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gIH1cblxuICBfc3Ryb3BoZU9uUmF3T3V0cHV0KGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIj4+Pj4+PiBvdXRwdXRcIik7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKSB7XG5cbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uQ29ubmVjdGVkKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiY29ubmVjdGVkIDFcIik7XG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kKCRwcmVzKCkuYygncHJpb3JpdHknKS50KCctMScpKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMlwiKTtcblxuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmJpbmQoXG4gICAgLy8gICBcInhtcHA6cHVic3ViOmxhc3QtcHVibGlzaGVkLWl0ZW1cIixcbiAgICAvLyAgIHRoYXQuX29uTGFzdFB1Ymxpc2hlZEl0ZW1SZWNlaXZlZFxuICAgIC8vICk7XG5cbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5iaW5kKFxuICAgIC8vICAgXCJ4bXBwOnB1YnN1YjppdGVtLXB1Ymxpc2hlZFwiLFxuICAgIC8vICAgdGhhdC5fb25QdWJsaXNoZWRJdGVtUmVjZWl2ZWRcbiAgICAvLyApO1xuXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IHB1YnN1YkhhbmRsZXIgPSAoZXYpID0+IHtcbiAgICAgIC8vIFRPRE9cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdAQEBAQCBwdWJzdWJIYW5kbGVyIScpO1xuICAgICAgICAvLyBYbWxVdGlsLmR1bXBEb20oZXYpO1xuICAgICAgICBsZXQgY2IgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAQEAgZ290IGRhdGEhXCIpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgZGF0YSA9IFNveFV0aWwucGFyc2VEYXRhUGF5bG9hZCh0aGF0LCBldiwgY2IpO1xuICAgICAgICAvLyBUT0RPOiBkaXNwYXRjaFxuICAgICAgICB0aGF0LmRpc3BhdGNoRGF0YShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7IC8vIG5lZWRlZCB0byBiZSBjYWxsZWQgZXZlcnkgdGltZVxuICAgIH07XG5cbiAgICBsZXQgc2VydmljZSA9ICdwdWJzdWIuJyArIHRoaXMuZ2V0RG9tYWluKCk7XG5cbiAgICB0aGlzLl9yYXdDb25uLmFkZEhhbmRsZXIoXG4gICAgICBwdWJzdWJIYW5kbGVyLFxuICAgICAgbnVsbCxcbiAgICAgICdtZXNzYWdlJyxcbiAgICAgIG51bGwsXG4gICAgICBudWxsLFxuICAgICAgc2VydmljZVxuICAgICk7XG5cbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDNcIik7XG4gICAgaWYgKHRoaXMuX29uQ29ubmVjdENhbGxiYWNrKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMy0xXCIpO1xuICAgICAgdGhpcy5fb25Db25uZWN0Q2FsbGJhY2soKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzLTJcIik7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCA0IGVuZFwiKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQoKSB7XG4gICAgdGhpcy5fcmF3Q29ubiA9IG51bGw7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5GYWlsbCgpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUoc3RhdHVzKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJAQCBzdGFydCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZVwiKTtcbiAgICBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5FQ1RJTkcpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZWN0aW5nXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORkFJTCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5mYWlsXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkZhaWxsKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuRElTQ09OTkVDVElORykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGRpc2Nvbm5lY3RpbmdcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkRJU0NPTk5FQ1RFRCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORUNURUQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uQ29ubmVjdGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgVU5LTk9XTiBTVEFUVVM6IFwiICsgc3RhdHVzKTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCJAQCBlbmQgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGVcIik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBfc3Ryb3BoZU9uTGFzdFB1Ymxpc2hlZEl0ZW1SZWNlaXZlZChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaE1ldGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaERhdGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIC8vIEZJWE1FXG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gX3N0cm9waGVPblB1Ymxpc2hlZEl0ZW1SZWNlaXZlZChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaERhdGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIC8vIEZJWE1FXG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAvLyAgIGxldCBkZXZpY2VMaXN0ZW5lclRhYmxlID0gdGhpcy5fZGF0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgLy8gICBpZiAoZGV2aWNlTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vICAgICByZXR1cm47XG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBkZXZpY2VUb0JpbmQgPSB0aGlzLmJpbmQoZGV2aWNlTmFtZSk7XG4gIC8vICAgbGV0IHRoYXQgPSB0aGlzO1xuICAvLyAgIGxldCBvbkRhdGFQYXJzZWQgPSAoZGF0YSkgPT4ge1xuICAvLyAgICAgdGhhdC5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICAvLyAgIH07XG4gIC8vICAgU294VXRpbC5wYXJzZURhdGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kLCBvbkRhdGFQYXJzZWQpO1xuICAvLyAgIC8vIHRoaXMuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgLy8gfVxuICBkaXNwYXRjaERhdGEoZGF0YSkge1xuICAgIGxldCBkZXZpY2VOYW1lID0gZGF0YS5nZXREZXZpY2UoKS5nZXROYW1lKCk7XG4gICAgbGV0IGRhdGFMaXN0ZW5lclRhYmxlID0gdGhpcy5fZGF0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgICBpZiAoZGF0YUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jyb2FkY2FzdChkYXRhTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIH1cblxuICAvLyBkaXNwYXRjaE1ldGFQdWJsaXNoKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgbGV0IGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gIC8vICAgbGV0IGRldmljZUxpc3RlbmVyVGFibGUgPSB0aGlzLl9tZXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAvLyAgIGlmIChkZXZpY2VMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgLy8gICAgIHJldHVybjtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgbGV0IGRldmljZVRvQmluZCA9IHRoaXMuYmluZChkZXZpY2VOYW1lKTtcbiAgLy8gICBsZXQgdGhhdCA9IHRoaXM7XG4gIC8vICAgbGV0IG9uTWV0YVBhcnNlZCA9IChtZXRhKSA9PiB7XG4gIC8vICAgICB0aGF0Ll9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgbWV0YSk7XG4gIC8vICAgfTtcbiAgLy8gICBTb3hVdGlsLnBhcnNlTWV0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQsIG9uTWV0YVBhcnNlZCk7XG4gIC8vICAgLy8gbGV0IG1ldGEgPSBTb3hVdGlsLnBhcnNlTWV0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQpO1xuICAvLyAgIC8vIHRoaXMuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBtZXRhKTtcbiAgLy8gfVxuXG4gIGdldEJvc2hTZXJ2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLmJvc2hTZXJ2aWNlO1xuICB9XG5cbiAgZ2V0RG9tYWluKCkge1xuICAgIHJldHVybiBTdHJvcGhlLlN0cm9waGUuZ2V0RG9tYWluRnJvbUppZCh0aGlzLmdldEpJRCgpKTtcbiAgfVxuXG4gIGdldEpJRCgpIHtcbiAgICByZXR1cm4gdGhpcy5qaWQ7XG4gIH1cblxuICBnZXRQYXNzd29yZCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXNzd29yZDtcbiAgfVxuXG4gIGNvbm5lY3QoY2FsbGJhY2spIHtcbiAgICBsZXQgY29ubiA9IG5ldyBTdHJvcGhlLlN0cm9waGUuQ29ubmVjdGlvbih0aGlzLmdldEJvc2hTZXJ2aWNlKCkpO1xuICAgIHRoaXMuX29uQ29ubmVjdENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgY29ubi5yYXdJbnB1dCA9IHRoaXMuX3N0cm9waGVPblJhd0lucHV0O1xuICAgIGNvbm4ucmF3T3V0cHV0ID0gdGhpcy5fc3Ryb3BoZU9uUmF3T3V0cHV0O1xuICAgIHRoaXMuX3Jhd0Nvbm4gPSBjb25uO1xuICAgIGxldCBqaWQgPSB0aGlzLmdldEpJRCgpO1xuICAgIGxldCBwYXNzd29yZCA9IHRoaXMuZ2V0UGFzc3dvcmQoKTtcblxuICAgIC8vIHdpdGhvdXQgd3JhcHBpbmcgY2FsbCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZSwgXCJ0aGlzXCIgd2lsbCBiZSBtaXNzZWQgaW5zaWRlIHRoZSBmdW5jXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBjYiA9IChzdGF0dXMpID0+IHsgcmV0dXJuIHRoYXQuX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUoc3RhdHVzKTsgfTtcbiAgICBjb25uLmNvbm5lY3QoamlkLCBwYXNzd29yZCwgY2IpO1xuICB9XG5cbiAgZGlzY29ubmVjdChjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLl9yYXdDb25uICE9PSBudWxsICYmIHRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHRoaXMuX3Jhd0Nvbm4uZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGdldFN0cm9waGVDb25uZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9yYXdDb25uO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoZGV2aWNlLCBjYWxsYmFjaywgbGlzdGVuZXJJZCkge1xuICAgIGlmIChsaXN0ZW5lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGxpc3RlbmVySWQgPSB0aGlzLl9nZW5SYW5kb21JZCgpO1xuICAgIH1cbiAgICB0aGlzLl9yZWdpc3RlckRhdGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbGlzdGVuZXJJZDtcbiAgfVxuXG4gIHJlbW92ZUFsbExpc3RlbmVyRm9yRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX2RhdGFDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCk7XG4gIH1cblxuICBmZXRjaE1ldGEoZGV2aWNlLCBjYWxsYmFjaykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICBsZXQgbGlzdGVuZXJJZCA9IHRoaXMuX2dlblJhbmRvbUlkKCk7XG4gICAgICBsZXQgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgICBsZXQgX2NhbGxiYWNrID0gKG1ldGEpID0+IHtcbiAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCAoKSA9PiB7fSk7XG4gICAgICAgIGNhbGxiYWNrKG1ldGEpO1xuICAgICAgfVxuICAgICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgICB0aGlzLl9yZWdpc3Rlck1ldGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIF9jYWxsYmFjayk7XG5cbiAgICAgIGxldCBjYiA9IChzdWJzY3JpcHRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IGppZCA9IHRoYXQuX3Jhd0Nvbm4uamlkO1xuICAgICAgICBjb25zdCBteVN1YiA9IHN1YnNjcmlwdGlvbnNbamlkXTtcbiAgICAgICAgaWYgKG15U3ViICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBtZXRhTm9kZVN1YklEcyA9IG15U3ViW21ldGFOb2RlXTtcbiAgICAgICAgICBjb25zdCBhdmFpbGFibGVTdWJJRCA9IG1ldGFOb2RlU3ViSURzWzBdO1xuXG4gICAgICAgICAgbGV0IHVuaXF1ZUlkID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBtZXRhTm9kZSwgbWF4X2l0ZW1zOiAxLCBzdWJpZDogYXZhaWxhYmxlU3ViSUQgfSk7XG4gICAgICAgICAgbGV0IHN1YzIgPSAoaXEpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxucmVjZW50IHJlcXVlc3Qgc3VjY2Vzcz9cXG5cXG5cIik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBsZXQgZXJyMiA9IChpcSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5yZWNlbnQgcmVxdWVzdCBmYWlsZWQ/XFxuXFxuXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEyLCBzdWMyLCBlcnIyKTtkbyB7XG5cbiAgICAgICAgICB9IHdoaWxlICh0cnVlKTsgfSBlbHNlIHtcbiAgICAgICAgICAvLyBmaXJzdCB3ZSBuZWVkIHRvIHN1YlxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuQEBAQEAgbm8gb3VyIHN1YiBpbmZvLCBnb2luZyB0byBzdWIhXFxuXFxuXFxuXCIpO1xuICAgICAgICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICAgICAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgICAgICAgbGV0IHN1YklxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAgICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgICAgICAgLmMoJ3N1YnNjcmliZScsIHtub2RlOiBtZXRhTm9kZSwgamlkOiByYXdKaWR9KTtcblxuICAgICAgICAgIGNvbnN0IHN1YlN1YyA9IChpcSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5AQEBAIHN1YiBzdWNjZXNzLCBnb2luZyB0byBmZXRjaCBzdWJzY3JpcHRpb25zIHRvIGdldCBzdWJpZFwiKTtcbiAgICAgICAgICAgIHRoYXQuX2dldFN1YnNjcmlwdGlvbihkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgKHN1YnNjcmlwdGlvbnMyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG15U3ViMiA9IHN1YnNjcmlwdGlvbnMyW2ppZF07XG4gICAgICAgICAgICAgIGNvbnN0IG1ldGFOb2RlU3ViSURzMiA9IG15U3ViMlttZXRhTm9kZV07XG4gICAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVN1YklEMiA9IG1ldGFOb2RlU3ViSURzMlswXTtcblxuICAgICAgICAgICAgICBsZXQgdW5pcXVlSWQzID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgICAgICAgbGV0IGlxMyA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IGppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZDMgfSlcbiAgICAgICAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAgICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbWV0YU5vZGUsIG1heF9pdGVtczogMSwgc3ViaWQ6IGF2YWlsYWJsZVN1YklEMiB9KTtcblxuICAgICAgICAgICAgICBjb25zdCBzdWMzID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YSA9IFhtbFV0aWwuY29udlJlY2VudEl0ZW0odGhhdCwgaXEpO1xuICAgICAgICAgICAgICAgIF9jYWxsYmFjayhtZXRhKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgY29uc3QgZXJyMyA9IChpcSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuQEBAQEAgcmVjZW50IHJlcXVlc3QgZXJyb3I/IDNcXG5cXG5cIik7XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEzLCBzdWMzLCBlcnIzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShzdWJJcSwgc3ViU3VjLCAoKSA9PiB7fSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpLCBkZXZpY2UuZ2V0RG9tYWluKCksIGNiKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRTdWJzY3JpcHRpb24obm9kZSwgZG9tYWluLCBjYikge1xuICAgIC8vIDxpcSB0eXBlPSdnZXQnXG4gICAgLy8gICAgIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAvLyAgICAgdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgLy8gICAgIGlkPSdzdWJzY3JpcHRpb25zMSc+XG4gICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgIC8vICAgICA8c3Vic2NyaXB0aW9ucy8+XG4gICAgLy8gICA8L3B1YnN1Yj5cbiAgICAvLyA8L2lxPlxuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgbGV0IHVuaXF1ZUlkID0gdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICBsZXQgaXEgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiB0aGlzLl9yYXdDb25uLmppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgICAgLmMoXCJwdWJzdWJcIiwge3htbG5zOiBQVUJTVUJfTlN9KVxuICAgICAgLmMoXCJzdWJzY3JpcHRpb25zXCIpO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgbGV0IGNvbnZlcnRlZCA9IFhtbFV0aWwuY29udlN1YnNjcmlwdGlvbnMoaXEpO1xuICAgICAgY2IoY29udmVydGVkKTtcbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHsgfTtcblxuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICBiaW5kKGRldmljZU5hbWUsIGRvbWFpbikge1xuICAgIGlmIChkb21haW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tYWluID0gdGhpcy5nZXREb21haW4oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERldmljZSh0aGlzLCBkZXZpY2VOYW1lLCBkb21haW4pO1xuICB9XG5cbiAgZmV0Y2hEZXZpY2VzKGNhbGxiYWNrLCBkb21haW4pIHtcbiAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIGxldCBpcSA9ICRpcSh7IGZyb206IGppZCwgdG86IHNlcnZpY2UsIHR5cGU6IFwiZ2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pLmMoXG4gICAgICAncXVlcnknLCB7IHhtbG5zOiBTdHJvcGhlLlN0cm9waGUuTlMuRElTQ09fSVRFTVMgfVxuICAgICk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHN1Y2Nlc3MgPSAobXNnKSA9PiB7XG4gICAgICBsZXQgcXVlcnkgPSBtc2cuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGl0ZW1zID0gcXVlcnkuX2NoaWxkTm9kZXNMaXN0O1xuXG4gICAgICBsZXQgY2hlY2sgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IG5vZGUgPSBpdGVtLl9hdHRyaWJ1dGVzLm5vZGUuX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgICAgICAgICBsZXQgcmVhbE5vZGUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKGNoZWNrW3JlYWxOb2RlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0gPSB7IGRhdGE6IHRydWUgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAgICAgICAgIGxldCByZWFsTm9kZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICBpZiAoY2hlY2tbcmVhbE5vZGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXSA9IHsgbWV0YTogdHJ1ZSB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0uZGF0YSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBkZXZpY2VzID0gW107XG4gICAgICBmb3IgKGxldCBkZXZpY2VOYW1lIG9mIE9iamVjdC5rZXlzKGNoZWNrKSkge1xuICAgICAgICBsZXQgYyA9IGNoZWNrW2RldmljZU5hbWVdO1xuICAgICAgICBpZiAoYy5kYXRhICYmIGMubWV0YSkge1xuICAgICAgICAgIGxldCBkZXZpY2UgPSB0aGF0LmJpbmQoZGV2aWNlTmFtZSk7XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZGV2aWNlcyk7XG4gICAgfTtcblxuICAgIGxldCBlcnJvciA9IChtc2cpID0+IHtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLnRyZWUoKSwgc3VjY2VzcywgZXJyb3IsIHVuZGVmaW5lZCk7XG4gIH1cblxuICBmZXRjaFN1YnNjcmlwdGlvbnMoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5nZXRTdWJzY3JpcHRpb25zKChzdWJzY3JpcHRpb25zKSA9PiB7XG4gICAgICAvLyBUT0RPOiBEZXZpY2Ug44Kq44OW44K444Kn44Kv44OI44Gu44Oq44K544OI44Gr5Yqg5bel44GX44GmY2FsbGJhY2vjgpLlkbzjgbPlh7rjgZlcblxuICAgIH0pO1xuICB9XG5cbiAgc3Vic2NyaWJlKGRldmljZSkge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBsZXQgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIC8vIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkZXZpY2UuZ2V0RG9tYWluKCk7XG5cbiAgICAvLyB0aGlzLl9zdWJOb2RlKGRhdGFOb2RlLCBkZXZpY2UuZ2V0RG9tYWluKCkpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMudW5zdWJzY3JpYmUoZGV2aWNlLCAoKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCB1bnN1YnNjcmliZSBjYWxsYmFjayBjYWxsZWRcIik7XG4gICAgICBsZXQgY2IgPSAoKSA9PiB7XG4gICAgICB9O1xuICAgICAgdGhhdC5fc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBmYWxzZSwgY2IpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3N1Yk5vZGUgY2FsbGVkXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgX3N1Yk5vZGUobm9kZSwgZG9tYWluLCByZXF1ZXN0UmVjZW50LCBjYWxsYmFjaykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcblxuICAgIC8vIGh0dHA6Ly9nZ296YWQuY29tL3N0cm9waGUucGx1Z2lucy9kb2NzL3N0cm9waGUucHVic3ViLmh0bWxcbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAQEAgcmF3IGppZCA9IFwiICsgdGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgbGV0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgLmMoJ3N1YnNjcmliZScsIHtub2RlOiBub2RlLCBqaWQ6IHJhd0ppZH0pO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgLy8gaHR0cHM6Ly94bXBwLm9yZy9leHRlbnNpb25zL3hlcC0wMDYwLmh0bWwjc3Vic2NyaWJlci1yZXRyaWV2ZS1yZXF1ZXN0cmVjZW50XG5cbiAgICAgIC8vIDxpcSB0eXBlPSdnZXQnXG4gICAgICAvLyAgICAgZnJvbT0nZnJhbmNpc2NvQGRlbm1hcmsubGl0L2JhcnJhY2tzJ1xuICAgICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgICAgLy8gICAgIGlkPSdpdGVtczInPlxuICAgICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgICAgLy8gICAgIDxpdGVtcyBub2RlPSdwcmluY2VseV9tdXNpbmdzJyBtYXhfaXRlbXM9JzInLz5cbiAgICAgIC8vICAgPC9wdWJzdWI+XG4gICAgICAvLyA8L2lxPlxuICAgICAgaWYgKHJlcXVlc3RSZWNlbnQpIHtcbiAgICAgICAgbGV0IHVuaXF1ZUlkID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgbGV0IGlxMiA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IHRoYXQuX3Jhd0Nvbm4uamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgICAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG5vZGUsIG1heF9pdGVtczogMSB9KTtcbiAgICAgICAgbGV0IHN1YzIgPSAoaXEpID0+IHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBsZXQgZXJyMiA9IChpcSkgPT4geyB9O1xuICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShpcTIsIHN1YzIsIGVycjIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHsgfTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmUoZGV2aWNlLCBjYWxsYmFjaykge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBsZXQgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBjYiA9ICgpID0+IHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgbXlKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuXG4gICAgdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKGRhdGFOb2RlLCBkb21haW4sIChzdWIpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiX2dldFN1YnNjcmlwdGlvbiBjYWxsYmFjayBjYWxsZWQgaW4gdW5zdWJzY3JpYmVcIik7XG4gICAgICBpZiAoc3ViW215SmlkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1YltteUppZF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGxldCBzdWJpZHMgPSBzdWJbbXlKaWRdW2RhdGFOb2RlXTtcbiAgICAgIGlmIChzdWJpZHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBzdWJpZHMgPT09IHVuZGVmaW5lZCFcIik7XG4gICAgICAgIGNiKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIHN1Ymlkcy5sZW5ndGg9PT1cIiArIHN1Ymlkcy5sZW5ndGgpO1xuICAgICAgaWYgKHN1Ymlkcy5sZW5ndGggPT0gMCkge1xuICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgY2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGRlbE5leHRGdW5jID0gKGkpID0+IHtcbiAgICAgICAgICBpZiAoc3ViaWRzLmxlbmd0aCA8PSBpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGVsTmV4dEZ1bmMoaSsxKSwgc3ViaWRzW2ldKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF91bnN1Yk5vZGUgY2FsbGVkIGZvciBzdWJpZD1cIiArIHN1Ymlkc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBkZWxOZXh0RnVuYygxKSwgc3ViaWRzWzBdKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3Vuc3ViTm9kZSBjYWxsZWQgZm9yIHN1YmlkPVwiICsgc3ViaWRzWzBdKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vIHRoaXMuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCAoKSA9PiB7XG4gICAgLy8gICAvLyBUT0RPXG4gICAgLy8gfSk7XG4gIH1cblxuICBfdW5zdWJOb2RlKG5vZGUsIGRvbWFpbiwgY2FsbGJhY2ssIHN1YmlkKSB7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICAvLyA8aXEgdHlwZT0nc2V0J1xuICAgIC8vIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAvLyB0bz0ncHVic3ViLnNoYWtlc3BlYXJlLmxpdCdcbiAgICAvLyBpZD0ndW5zdWIxJz5cbiAgICAvLyAgIDxwdWJzdWIgeG1sbnM9J2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1Yic+XG4gICAgLy8gICAgICA8dW5zdWJzY3JpYmVcbiAgICAvLyAgICAgICAgICBub2RlPSdwcmluY2VseV9tdXNpbmdzJ1xuICAgIC8vICAgICAgICAgIGppZD0nZnJhbmNpc2NvQGRlbm1hcmsubGl0Jy8+XG4gICAgLy8gICA8L3B1YnN1Yj5cbiAgICAvLyA8L2lxPlxuICAgIGxldCBiYXJlSmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKHRoaXMuX3Jhd0Nvbm4uamlkKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIl91bnN1Yk5vZGU6IGJhcmVKaWQ9XCIgKyBiYXJlSmlkKTtcblxuICAgIGxldCB1bnN1YkF0dHJzID0geyBub2RlOiBub2RlLCBqaWQ6IGJhcmVKaWQgfTtcbiAgICBpZiAoc3ViaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdW5zdWJBdHRycy5zdWJpZCA9IHN1YmlkO1xuICAgIH1cblxuICAgIGxldCBpcSA9ICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiBcInNldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KVxuICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCIgfSlcbiAgICAgIC5jKCd1bnN1YnNjcmliZScsIHVuc3ViQXR0cnMpO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ1bnN1YiBzdWNjZXNzXCIpO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKGlxKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidW5zdWIgZmFpbGVkXCIpO1xuICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGlxKTtcbiAgICB9O1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICB1bnN1YnNjcmliZUFsbCgpIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5mZXRjaFN1YnNjcmlwdGlvbnMoKGRldmljZXMpID0+IHtcbiAgICAgIGZvciAobGV0IGRldmljZSBvZiBkZXZpY2VzKSB7XG4gICAgICAgIHRoYXQudW5zdWJzY3JpYmUoZGV2aWNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZURldmljZShkZXZpY2UsIG1ldGEsIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICBjb25zdCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgY29uc3QgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgY29uc3QgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5fY3JlYXRlTm9kZShcbiAgICAgICAgbWV0YU5vZGUsXG4gICAgICAgIGRvbWFpbixcbiAgICAgICAgKGlxKSA9PiB7XG4gICAgICAgICAgdGhpcy5fY3JlYXRlTm9kZShkYXRhTm9kZSwgZG9tYWluLCAoaXEyKSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPOiBzZW5kIG1ldGEgdG8gbWV0YSBub2RlXG5cbiAgICAgICAgICB9LCBjYkZhaWxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNiRmFpbGVkXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVOb2RlKG5vZGVOYW1lLCBkb21haW4sIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlxcblxcbi0tLS0gX2NyZWF0ZU5vZGVcIik7XG4gICAgY29uc3Qgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICBjb25zdCB1bmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ3B1YnN1YicpO1xuICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuLS0tLSBfY3JlYXRlTm9kZTJcIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgLmMoJ2NyZWF0ZScsIHsgbm9kZTogbm9kZU5hbWUgfSk7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcblxcbi0tLS0gX2NyZWF0ZU5vZGUzXCIpO1xuXG4gICAgICBjb25uLnNlbmRJUShpcSwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcblxcbi0tLS0gX2NyZWF0ZU5vZGU0XCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9kZWxldGVOb2RlKG5vZGVOYW1lLCBkb21haW4sIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICBjb25zdCBzZXJ2aWNlID0gJ3B1YnN1Yi4nICsgZG9tYWluO1xuICAgIGNvbnN0IGNvbm4gPSB0aGlzLl9yYXdDb25uO1xuICAgIGNvbnN0IHVuaXF1ZUlkID0gY29ubi5nZXRVbmlxdWVJZCgncHVic3ViJyk7XG4gICAgLy8gY29uc3QgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZChjb25uLmppZCk7XG4gICAgLy8gY29uc3QgZnJvbUppZCA9IGNvbm4uXG4gICAgY29uc3QgaXEgPSAoXG4gICAgLy8gY29uc3QgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogJ3NldCcsIGlkOiB1bmlxdWVJZCwgZnJvbTogYmFyZUppZCB9KVxuICAgICAgJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAuYygncHVic3ViJywgeyB4bWxuczogUFVCU1VCX09XTkVSX05TIH0pXG4gICAgICAuYygnZGVsZXRlJywgeyBub2RlOiBub2RlTmFtZSB9KVxuICAgICk7XG5cbiAgICBjb25uLnNlbmRJUShpcSwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gIH1cblxuICBfcHVibGlzaFRvTm9kZShub2RlTmFtZSwgZG9tYWluLCBwdWJsaXNoQ29udGVudCwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIC8vIGV4cGVjdHMgcHVibGlzaENvbnRlbnQgYXMgYW4gaW5zdGFuY2Ugb2YgRGV2aWNlTWV0YSBvciBEYXRhXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICAgICAgY29uc3QgY29ubiA9IHRoaXMuX3Jhd0Nvbm47XG4gICAgICAgIGNvbnN0IHVuaXF1ZUlkID0gY29ubi5nZXRVbmlxdWVJZCgncHVic3ViJyk7XG4gICAgICAgIGNvbnN0IGl0ZW1VbmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ2l0ZW0nKTtcbiAgICAgICAgY29uc3QgaXEgPSAoXG4gICAgICAgICAgJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgIC5jKCdwdWJsaXNoJywgeyBub2RlOiBub2RlTmFtZSB9KVxuICAgICAgICAgIC5jKCdpdGVtJywgeyBpZDogaXRlbVVuaXF1ZUlkIH0pXG4gICAgICAgICAgLy8gLmNub2RlKHB1Ymxpc2hDb250ZW50KVxuICAgICAgICApO1xuXG4gICAgICAgIHB1Ymxpc2hDb250ZW50LmFwcGVuZFRvTm9kZShpcSk7XG5cbiAgICAgICAgY29ubi5zZW5kSVEoaXEsIGNiU3VjY2VzcywgY2JGYWlsZWQpO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUuc3RhY2spO1xuXG4gICAgfVxuICB9XG5cbiAgZGVsZXRlRGV2aWNlKGRldmljZSwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIC8vIC8vIFRPRE87IOOBk+OBruOCs+ODvOODieOBr+WLleS9nOeiuuiqjeOBp+OBjeOBpuOBquOBhFxuICAgIGNvbnN0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICBjb25zdCBtZXRhTm9kZSA9IGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKTtcbiAgICBjb25zdCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICB0aGlzLl9kZWxldGVOb2RlKFxuICAgICAgbWV0YU5vZGUsXG4gICAgICBkb21haW4sXG4gICAgICAoaXEpID0+IHtcbiAgICAgICAgdGhhdC5fZGVsZXRlTm9kZShkYXRhTm9kZSwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gICAgICB9LFxuICAgICAgY2JGYWlsZWRcbiAgICApO1xuICB9XG5cbiAgcHVibGlzaChkZXZpY2UsIGRhdGEpIHtcbiAgICBsZXQgeG1sU3RyaW5nID0gZGF0YS50b1htbFN0cmluZygpO1xuICAgIGxldCBub2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLnB1Ymxpc2gobm9kZSwgW3htbFN0cmluZ10pO1xuICB9XG5cbiAgX2dlblJhbmRvbUlkKCkge1xuICAgIGxldCBjaGFycyA9IFwiYWJjZGVmMDEyMzQ1Njc4OTBcIjtcbiAgICBsZXQgbkNoYXJzID0gY2hhcnMubGVuZ3RoO1xuICAgIGxldCBsZW4gPSAxMjg7XG4gICAgdmFyIHJldCA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IGlkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG5DaGFycyk7XG4gICAgICBsZXQgY2hhciA9IGNoYXJzLmNoYXJBdChpZHgpO1xuICAgICAgcmV0ID0gcmV0ICsgY2hhcjtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIF9yZWdpc3Rlck1ldGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLl9tZXRhQ2FsbGJhY2tzLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9yZWdpc3RlckRhdGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLl9kYXRhQ2FsbGJhY2tzLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9yZWdpc3Rlckxpc3RlbmVyKHRhYmxlLCBkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGRldmljZU5hbWUgPSBkZXZpY2UuZ2V0TmFtZSgpO1xuXG4gICAgaWYgKHRhYmxlW2RldmljZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhYmxlW2RldmljZU5hbWVdID0ge307XG4gICAgfVxuXG4gICAgdGFibGVbZGV2aWNlTmFtZV1bbGlzdGVuZXJJZF0gPSBjYWxsYmFjaztcbiAgfVxuXG4gIF9icm9hZGNhc3QodGFibGUsIGFyZ3VtZW50KSB7XG4gICAgZm9yIChsZXQgbGlzdGVuZXJJZCBvZiBPYmplY3Qua2V5cyh0YWJsZSkpIHtcbiAgICAgIGxldCBsaXN0ZW5lciA9IHRhYmxlW2xpc3RlbmVySWRdO1xuICAgICAgLy8gY29uc29sZS5sb2coJyQkJCQgbGlzdGVuZXJJZD0nICsgbGlzdGVuZXJJZCArIFwiLCBsaXN0ZW5lcj1cIiArIGxpc3RlbmVyKTtcbiAgICAgIGxpc3RlbmVyKGFyZ3VtZW50KTtcbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlTWV0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0aGlzLl9tZXRhQ2FsbGJhY2tzLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIF9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyV2l0aElkKHRoaXMuX2RhdGFDYWxsYmFja3MsIGxpc3RlbmVySWQpO1xuICB9XG5cbiAgX3JlbW92ZUxpc3RlbmVyV2l0aElkKHRhYmxlLCBsaXN0ZW5lcklkKSB7XG4gICAgZm9yIChsZXQgZGV2TmFtZSBvZiBPYmplY3Qua2V5cyh0YWJsZSkpIHtcbiAgICAgIGxldCBkZXZUYWJsZSA9IHRhYmxlW2Rldk5hbWVdO1xuICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBsc3RuSWQgb2YgT2JqZWN0LmtleXMoZGV2VGFibGUpKSB7XG4gICAgICAgIGlmIChsc3RuSWQgPT09IGxpc3RlbmVySWQpIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIGRlbGV0ZSBkZXZUYWJsZVtsaXN0ZW5lcklkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTb3hDb25uZWN0aW9uO1xuIl19