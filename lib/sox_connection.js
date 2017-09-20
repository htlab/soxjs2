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
            that._rawConn.sendIQ(iq2, suc2, err2);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwiJHByZXMiLCIkaXEiLCJQVUJTVUJfTlMiLCJTb3hDb25uZWN0aW9uIiwiYm9zaFNlcnZpY2UiLCJqaWQiLCJwYXNzd29yZCIsIl9yYXdDb25uIiwiX2lzQ29ubmVjdGVkIiwiX2RhdGFDYWxsYmFja3MiLCJfbWV0YUNhbGxiYWNrcyIsImRhdGEiLCJzZW5kIiwiYyIsInQiLCJ0aGF0IiwicHVic3ViSGFuZGxlciIsImV2IiwiY2IiLCJwYXJzZURhdGFQYXlsb2FkIiwiZGlzcGF0Y2hEYXRhIiwiZXgiLCJjb25zb2xlIiwiZXJyb3IiLCJzZXJ2aWNlIiwiZ2V0RG9tYWluIiwiYWRkSGFuZGxlciIsIl9vbkNvbm5lY3RDYWxsYmFjayIsIl9vbkRpc2Nvbm5lY3RDYWxsYmFjayIsInN0YXR1cyIsIlN0YXR1cyIsIkNPTk5FQ1RJTkciLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmciLCJDT05ORkFJTCIsIl9zdHJvcGhlT25Db25uRmFpbGwiLCJESVNDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0aW5nIiwiRElTQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQiLCJDT05ORUNURUQiLCJfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCIsImRldmljZU5hbWUiLCJnZXREZXZpY2UiLCJnZXROYW1lIiwiZGF0YUxpc3RlbmVyVGFibGUiLCJ1bmRlZmluZWQiLCJfYnJvYWRjYXN0IiwiZ2V0RG9tYWluRnJvbUppZCIsImdldEpJRCIsImNhbGxiYWNrIiwiY29ubiIsIkNvbm5lY3Rpb24iLCJnZXRCb3NoU2VydmljZSIsInJhd0lucHV0IiwiX3N0cm9waGVPblJhd0lucHV0IiwicmF3T3V0cHV0IiwiX3N0cm9waGVPblJhd091dHB1dCIsImdldFBhc3N3b3JkIiwiX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUiLCJjb25uZWN0IiwiaXNDb25uZWN0ZWQiLCJkaXNjb25uZWN0IiwiZGV2aWNlIiwibGlzdGVuZXJJZCIsIl9nZW5SYW5kb21JZCIsIl9yZWdpc3RlckRhdGFMaXN0ZW5lciIsIl9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQiLCJtZXRhTm9kZSIsImdldE1ldGFOb2RlTmFtZSIsIl9jYWxsYmFjayIsIm1ldGEiLCJfdW5zdWJOb2RlIiwiX3JlZ2lzdGVyTWV0YUxpc3RlbmVyIiwic3Vic2NyaXB0aW9ucyIsIm15U3ViIiwibWV0YU5vZGVTdWJJRHMiLCJhdmFpbGFibGVTdWJJRCIsInVuaXF1ZUlkIiwiZ2V0VW5pcXVlSWQiLCJpcTIiLCJ0eXBlIiwiZnJvbSIsInRvIiwiaWQiLCJ4bWxucyIsIm5vZGUiLCJtYXhfaXRlbXMiLCJzdWJpZCIsInN1YzIiLCJpcSIsImVycjIiLCJzZW5kSVEiLCJyYXdKaWQiLCJiYXJlSmlkIiwiZ2V0QmFyZUppZEZyb21KaWQiLCJzdWJJcSIsInN1YlN1YyIsIl9nZXRTdWJzY3JpcHRpb24iLCJzdWJzY3JpcHRpb25zMiIsIm15U3ViMiIsIm1ldGFOb2RlU3ViSURzMiIsImF2YWlsYWJsZVN1YklEMiIsInVuaXF1ZUlkMyIsImlxMyIsInN1YzMiLCJjb252UmVjZW50SXRlbSIsImVycjMiLCJlIiwibG9nIiwic3RhY2siLCJkb21haW4iLCJzdWMiLCJjb252ZXJ0ZWQiLCJjb252U3Vic2NyaXB0aW9ucyIsImVyciIsIk5TIiwiRElTQ09fSVRFTVMiLCJzdWNjZXNzIiwibXNnIiwicXVlcnkiLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtcyIsImNoZWNrIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJfYXR0cmlidXRlcyIsIl92YWx1ZUZvckF0dHJNb2RpZmllZCIsImVuZHNXaXRoRGF0YSIsInJlYWxOb2RlIiwiY3V0RGF0YVN1ZmZpeCIsImVuZHNXaXRoTWV0YSIsImN1dE1ldGFTdWZmaXgiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImJpbmQiLCJwdXNoIiwidHJlZSIsIlB1YlN1YiIsImdldFN1YnNjcmlwdGlvbnMiLCJkYXRhTm9kZSIsImdldERhdGFOb2RlTmFtZSIsInVuc3Vic2NyaWJlIiwiX3N1Yk5vZGUiLCJyZXF1ZXN0UmVjZW50IiwibXlKaWQiLCJzdWIiLCJzdWJpZHMiLCJkZWxOZXh0RnVuYyIsInVuc3ViQXR0cnMiLCJmZXRjaFN1YnNjcmlwdGlvbnMiLCJjcmVhdGVOb2RlIiwibWV0YVhtbFN0cmluZyIsInRvWG1sU3RyaW5nIiwicHVibGlzaCIsImRlbGV0ZU5vZGUiLCJ4bWxTdHJpbmciLCJjaGFycyIsIm5DaGFycyIsImxlbiIsInJldCIsImlkeCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImNoYXIiLCJjaGFyQXQiLCJfcmVnaXN0ZXJMaXN0ZW5lciIsInRhYmxlIiwiYXJndW1lbnQiLCJsaXN0ZW5lciIsIl9yZW1vdmVMaXN0ZW5lcldpdGhJZCIsImRldk5hbWUiLCJkZXZUYWJsZSIsImZvdW5kIiwibHN0bklkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBU0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFaQSxJQUFJQSxVQUFVLHNCQUFZQSxPQUExQjs7QUFFQSxJQUFJQyxRQUFRRCxRQUFRQyxLQUFwQjtBQUNBLElBQUlDLE1BQU1GLFFBQVFFLEdBQWxCOztBQUVBLElBQUlDLFlBQVksbUNBQWhCOztJQVNNQyxhO0FBQ0oseUJBQVlDLFdBQVosRUFBeUJDLEdBQXpCLEVBQThCQyxRQUE5QixFQUF3QztBQUFBOztBQUN0QyxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFNBQUtDLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCOztBQUVBLFNBQUtDLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsRUFBdEI7QUFDRDs7Ozt1Q0FFa0JDLEks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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNM0I7Ozs4Q0FFeUIzRyxVLEVBQVk7QUFDcEMsV0FBSzZHLHFCQUFMLENBQTJCLEtBQUtsSyxjQUFoQyxFQUFnRHFELFVBQWhEO0FBQ0Q7Ozs4Q0FFeUJBLFUsRUFBWTtBQUNwQyxXQUFLNkcscUJBQUwsQ0FBMkIsS0FBS25LLGNBQWhDLEVBQWdEc0QsVUFBaEQ7QUFDRDs7OzBDQUVxQjBHLEssRUFBTzFHLFUsRUFBWTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUN2Qyw4QkFBb0J1RSxPQUFPQyxJQUFQLENBQVlrQyxLQUFaLENBQXBCLG1JQUF3QztBQUFBLGNBQS9CSSxPQUErQjs7QUFDdEMsY0FBSUMsV0FBV0wsTUFBTUksT0FBTixDQUFmO0FBQ0EsY0FBSUUsUUFBUSxLQUFaO0FBRnNDO0FBQUE7QUFBQTs7QUFBQTtBQUd0QyxrQ0FBbUJ6QyxPQUFPQyxJQUFQLENBQVl1QyxRQUFaLENBQW5CLG1JQUEwQztBQUFBLGtCQUFqQ0UsTUFBaUM7O0FBQ3hDLGtCQUFJQSxXQUFXakgsVUFBZixFQUEyQjtBQUN6QmdILHdCQUFRLElBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFScUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTdEMsY0FBSUEsS0FBSixFQUFXO0FBQ1QsbUJBQU9ELFNBQVMvRyxVQUFULENBQVA7QUFDQTtBQUNEO0FBQ0Y7QUFkc0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWV4Qzs7Ozs7O0FBSUhrSCxPQUFPQyxPQUFQLEdBQWlCL0ssYUFBakIiLCJmaWxlIjoic294X2Nvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbm9kZVN0cm9waGUgZnJvbSBcIm5vZGUtc3Ryb3BoZVwiO1xuXG5sZXQgU3Ryb3BoZSA9IG5vZGVTdHJvcGhlLlN0cm9waGU7XG5cbmxldCAkcHJlcyA9IFN0cm9waGUuJHByZXM7XG5sZXQgJGlxID0gU3Ryb3BoZS4kaXE7XG5cbmxldCBQVUJTVUJfTlMgPSBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiO1xuXG5pbXBvcnQgcGFyc2VTdHJpbmcgZnJvbSBcInhtbDJqc1wiO1xuXG5pbXBvcnQgU294VXRpbCBmcm9tIFwiLi9zb3hfdXRpbFwiO1xuaW1wb3J0IFhtbFV0aWwgZnJvbSBcIi4veG1sX3V0aWxcIjtcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4vZGV2aWNlXCI7XG5pbXBvcnQgVHJhbnNkdWNlclZhbHVlIGZyb20gXCIuL3RyYW5zZHVjZXJfdmFsdWVcIjtcblxuY2xhc3MgU294Q29ubmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGJvc2hTZXJ2aWNlLCBqaWQsIHBhc3N3b3JkKSB7XG4gICAgdGhpcy5ib3NoU2VydmljZSA9IGJvc2hTZXJ2aWNlO1xuICAgIHRoaXMuamlkID0gamlkO1xuICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcblxuICAgIHRoaXMuX3Jhd0Nvbm4gPSBudWxsO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fZGF0YUNhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuX21ldGFDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdJbnB1dChkYXRhKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCI8PDw8PDwgaW5wdXRcIik7XG4gICAgLy8gY29uc29sZS5sb2coZGF0YSk7XG4gIH1cblxuICBfc3Ryb3BoZU9uUmF3T3V0cHV0KGRhdGEpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIj4+Pj4+PiBvdXRwdXRcIik7XG4gICAgLy8gY29uc29sZS5sb2coZGF0YSk7XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKSB7XG5cbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uQ29ubmVjdGVkKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiY29ubmVjdGVkIDFcIik7XG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kKCRwcmVzKCkuYygncHJpb3JpdHknKS50KCctMScpKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMlwiKTtcblxuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmJpbmQoXG4gICAgLy8gICBcInhtcHA6cHVic3ViOmxhc3QtcHVibGlzaGVkLWl0ZW1cIixcbiAgICAvLyAgIHRoYXQuX29uTGFzdFB1Ymxpc2hlZEl0ZW1SZWNlaXZlZFxuICAgIC8vICk7XG5cbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5iaW5kKFxuICAgIC8vICAgXCJ4bXBwOnB1YnN1YjppdGVtLXB1Ymxpc2hlZFwiLFxuICAgIC8vICAgdGhhdC5fb25QdWJsaXNoZWRJdGVtUmVjZWl2ZWRcbiAgICAvLyApO1xuXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IHB1YnN1YkhhbmRsZXIgPSAoZXYpID0+IHtcbiAgICAgIC8vIFRPRE9cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdAQEBAQCBwdWJzdWJIYW5kbGVyIScpO1xuICAgICAgICAvLyBYbWxVdGlsLmR1bXBEb20oZXYpO1xuICAgICAgICBsZXQgY2IgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAQEAgZ290IGRhdGEhXCIpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgZGF0YSA9IFNveFV0aWwucGFyc2VEYXRhUGF5bG9hZCh0aGF0LCBldiwgY2IpO1xuICAgICAgICAvLyBUT0RPOiBkaXNwYXRjaFxuICAgICAgICB0aGF0LmRpc3BhdGNoRGF0YShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7IC8vIG5lZWRlZCB0byBiZSBjYWxsZWQgZXZlcnkgdGltZVxuICAgIH07XG5cbiAgICBsZXQgc2VydmljZSA9ICdwdWJzdWIuJyArIHRoaXMuZ2V0RG9tYWluKCk7XG5cbiAgICB0aGlzLl9yYXdDb25uLmFkZEhhbmRsZXIoXG4gICAgICBwdWJzdWJIYW5kbGVyLFxuICAgICAgbnVsbCxcbiAgICAgICdtZXNzYWdlJyxcbiAgICAgIG51bGwsXG4gICAgICBudWxsLFxuICAgICAgc2VydmljZVxuICAgICk7XG5cbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDNcIik7XG4gICAgaWYgKHRoaXMuX29uQ29ubmVjdENhbGxiYWNrKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMy0xXCIpO1xuICAgICAgdGhpcy5fb25Db25uZWN0Q2FsbGJhY2soKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzLTJcIik7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCA0IGVuZFwiKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQoKSB7XG4gICAgdGhpcy5fcmF3Q29ubiA9IG51bGw7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5GYWlsbCgpIHtcblxuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUoc3RhdHVzKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJAQCBzdGFydCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZVwiKTtcbiAgICBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkNPTk5FQ1RJTkcpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZWN0aW5nXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORkFJTCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGNvbm5mYWlsXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkZhaWxsKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuRElTQ09OTkVDVElORykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGRpc2Nvbm5lY3RpbmdcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkRJU0NPTk5FQ1RFRCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5EaXNjb25uZWN0ZWQoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORUNURUQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uQ29ubmVjdGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgVU5LTk9XTiBTVEFUVVM6IFwiICsgc3RhdHVzKTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coXCJAQCBlbmQgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGVcIik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBfc3Ryb3BoZU9uTGFzdFB1Ymxpc2hlZEl0ZW1SZWNlaXZlZChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaE1ldGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaERhdGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIC8vIEZJWE1FXG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gX3N0cm9waGVPblB1Ymxpc2hlZEl0ZW1SZWNlaXZlZChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAvLyAgICAgdGhpcy5kaXNwYXRjaERhdGFQdWJsaXNoKG9iaik7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIC8vIEZJWE1FXG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAvLyAgIGxldCBkZXZpY2VMaXN0ZW5lclRhYmxlID0gdGhpcy5fZGF0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgLy8gICBpZiAoZGV2aWNlTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vICAgICByZXR1cm47XG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBkZXZpY2VUb0JpbmQgPSB0aGlzLmJpbmQoZGV2aWNlTmFtZSk7XG4gIC8vICAgbGV0IHRoYXQgPSB0aGlzO1xuICAvLyAgIGxldCBvbkRhdGFQYXJzZWQgPSAoZGF0YSkgPT4ge1xuICAvLyAgICAgdGhhdC5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICAvLyAgIH07XG4gIC8vICAgU294VXRpbC5wYXJzZURhdGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kLCBvbkRhdGFQYXJzZWQpO1xuICAvLyAgIC8vIHRoaXMuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgLy8gfVxuICBkaXNwYXRjaERhdGEoZGF0YSkge1xuICAgIGxldCBkZXZpY2VOYW1lID0gZGF0YS5nZXREZXZpY2UoKS5nZXROYW1lKCk7XG4gICAgbGV0IGRhdGFMaXN0ZW5lclRhYmxlID0gdGhpcy5fZGF0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgICBpZiAoZGF0YUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jyb2FkY2FzdChkYXRhTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIH1cblxuICAvLyBkaXNwYXRjaE1ldGFQdWJsaXNoKG9iaikge1xuICAvLyAgIGxldCBub2RlID0gb2JqLm5vZGU7XG4gIC8vICAgbGV0IGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gIC8vICAgbGV0IGRldmljZUxpc3RlbmVyVGFibGUgPSB0aGlzLl9tZXRhQ2FsbGJhY2tzW2RldmljZU5hbWVdO1xuICAvLyAgIGlmIChkZXZpY2VMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgLy8gICAgIHJldHVybjtcbiAgLy8gICB9XG4gIC8vXG4gIC8vICAgbGV0IGRldmljZVRvQmluZCA9IHRoaXMuYmluZChkZXZpY2VOYW1lKTtcbiAgLy8gICBsZXQgdGhhdCA9IHRoaXM7XG4gIC8vICAgbGV0IG9uTWV0YVBhcnNlZCA9IChtZXRhKSA9PiB7XG4gIC8vICAgICB0aGF0Ll9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgbWV0YSk7XG4gIC8vICAgfTtcbiAgLy8gICBTb3hVdGlsLnBhcnNlTWV0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQsIG9uTWV0YVBhcnNlZCk7XG4gIC8vICAgLy8gbGV0IG1ldGEgPSBTb3hVdGlsLnBhcnNlTWV0YVBheWxvYWQob2JqLmVudHJ5LCBkZXZpY2VUb0JpbmQpO1xuICAvLyAgIC8vIHRoaXMuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBtZXRhKTtcbiAgLy8gfVxuXG4gIGdldEJvc2hTZXJ2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLmJvc2hTZXJ2aWNlO1xuICB9XG5cbiAgZ2V0RG9tYWluKCkge1xuICAgIHJldHVybiBTdHJvcGhlLlN0cm9waGUuZ2V0RG9tYWluRnJvbUppZCh0aGlzLmdldEpJRCgpKTtcbiAgfVxuXG4gIGdldEpJRCgpIHtcbiAgICByZXR1cm4gdGhpcy5qaWQ7XG4gIH1cblxuICBnZXRQYXNzd29yZCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXNzd29yZDtcbiAgfVxuXG4gIGNvbm5lY3QoY2FsbGJhY2spIHtcbiAgICBsZXQgY29ubiA9IG5ldyBTdHJvcGhlLlN0cm9waGUuQ29ubmVjdGlvbih0aGlzLmdldEJvc2hTZXJ2aWNlKCkpO1xuICAgIHRoaXMuX29uQ29ubmVjdENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgY29ubi5yYXdJbnB1dCA9IHRoaXMuX3N0cm9waGVPblJhd0lucHV0O1xuICAgIGNvbm4ucmF3T3V0cHV0ID0gdGhpcy5fc3Ryb3BoZU9uUmF3T3V0cHV0O1xuICAgIHRoaXMuX3Jhd0Nvbm4gPSBjb25uO1xuICAgIGxldCBqaWQgPSB0aGlzLmdldEpJRCgpO1xuICAgIGxldCBwYXNzd29yZCA9IHRoaXMuZ2V0UGFzc3dvcmQoKTtcblxuICAgIC8vIHdpdGhvdXQgd3JhcHBpbmcgY2FsbCBvZiBfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZSwgXCJ0aGlzXCIgd2lsbCBiZSBtaXNzZWQgaW5zaWRlIHRoZSBmdW5jXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBjYiA9IChzdGF0dXMpID0+IHsgcmV0dXJuIHRoYXQuX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUoc3RhdHVzKTsgfTtcbiAgICBjb25uLmNvbm5lY3QoamlkLCBwYXNzd29yZCwgY2IpO1xuICB9XG5cbiAgZGlzY29ubmVjdChjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLl9yYXdDb25uICE9PSBudWxsICYmIHRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5fb25EaXNjb25uZWN0Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHRoaXMuX3Jhd0Nvbm4uZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGdldFN0cm9waGVDb25uZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9yYXdDb25uO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoZGV2aWNlLCBjYWxsYmFjaywgbGlzdGVuZXJJZCkge1xuICAgIGlmIChsaXN0ZW5lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGxpc3RlbmVySWQgPSB0aGlzLl9nZW5SYW5kb21JZCgpO1xuICAgIH1cbiAgICB0aGlzLl9yZWdpc3RlckRhdGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbGlzdGVuZXJJZDtcbiAgfVxuXG4gIHJlbW92ZUFsbExpc3RlbmVyRm9yRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX2RhdGFDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVEYXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCk7XG4gIH1cblxuICBmZXRjaE1ldGEoZGV2aWNlLCBjYWxsYmFjaykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICBsZXQgbGlzdGVuZXJJZCA9IHRoaXMuX2dlblJhbmRvbUlkKCk7XG4gICAgICBsZXQgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgICBsZXQgX2NhbGxiYWNrID0gKG1ldGEpID0+IHtcbiAgICAgICAgdGhhdC5fdW5zdWJOb2RlKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCAoKSA9PiB7fSk7XG4gICAgICAgIGNhbGxiYWNrKG1ldGEpO1xuICAgICAgfVxuICAgICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgICB0aGlzLl9yZWdpc3Rlck1ldGFMaXN0ZW5lcihkZXZpY2UsIGxpc3RlbmVySWQsIF9jYWxsYmFjayk7XG5cbiAgICAgIGxldCBjYiA9IChzdWJzY3JpcHRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IGppZCA9IHRoYXQuX3Jhd0Nvbm4uamlkO1xuICAgICAgICBjb25zdCBteVN1YiA9IHN1YnNjcmlwdGlvbnNbamlkXTtcbiAgICAgICAgaWYgKG15U3ViICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBtZXRhTm9kZVN1YklEcyA9IG15U3ViW21ldGFOb2RlXTtcbiAgICAgICAgICBjb25zdCBhdmFpbGFibGVTdWJJRCA9IG1ldGFOb2RlU3ViSURzWzBdO1xuXG4gICAgICAgICAgbGV0IHVuaXF1ZUlkID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBtZXRhTm9kZSwgbWF4X2l0ZW1zOiAxLCBzdWJpZDogYXZhaWxhYmxlU3ViSUQgfSk7XG4gICAgICAgICAgbGV0IHN1YzIgPSAoaXEpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxucmVjZW50IHJlcXVlc3Qgc3VjY2Vzcz9cXG5cXG5cIik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBsZXQgZXJyMiA9IChpcSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5yZWNlbnQgcmVxdWVzdCBmYWlsZWQ/XFxuXFxuXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEyLCBzdWMyLCBlcnIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBmaXJzdCB3ZSBuZWVkIHRvIHN1YlxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuQEBAQEAgbm8gb3VyIHN1YiBpbmZvLCBnb2luZyB0byBzdWIhXFxuXFxuXFxuXCIpO1xuICAgICAgICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICAgICAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgICAgICAgbGV0IHN1YklxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAgICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgICAgICAgLmMoJ3N1YnNjcmliZScsIHtub2RlOiBtZXRhTm9kZSwgamlkOiByYXdKaWR9KTtcblxuICAgICAgICAgIGNvbnN0IHN1YlN1YyA9IChpcSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5AQEBAIHN1YiBzdWNjZXNzLCBnb2luZyB0byBmZXRjaCBzdWJzY3JpcHRpb25zIHRvIGdldCBzdWJpZFwiKTtcbiAgICAgICAgICAgIHRoYXQuX2dldFN1YnNjcmlwdGlvbihkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgKHN1YnNjcmlwdGlvbnMyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG15U3ViMiA9IHN1YnNjcmlwdGlvbnMyW2ppZF07XG4gICAgICAgICAgICAgIGNvbnN0IG1ldGFOb2RlU3ViSURzMiA9IG15U3ViMlttZXRhTm9kZV07XG4gICAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVN1YklEMiA9IG1ldGFOb2RlU3ViSURzMlswXTtcblxuICAgICAgICAgICAgICBsZXQgdW5pcXVlSWQzID0gdGhhdC5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKTtcbiAgICAgICAgICAgICAgbGV0IGlxMyA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IGppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZDMgfSlcbiAgICAgICAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAgICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbWV0YU5vZGUsIG1heF9pdGVtczogMSwgc3ViaWQ6IGF2YWlsYWJsZVN1YklEMiB9KTtcblxuICAgICAgICAgICAgICBjb25zdCBzdWMzID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YSA9IFhtbFV0aWwuY29udlJlY2VudEl0ZW0odGhhdCwgaXEpO1xuICAgICAgICAgICAgICAgIF9jYWxsYmFjayhtZXRhKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgY29uc3QgZXJyMyA9IChpcSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuQEBAQEAgcmVjZW50IHJlcXVlc3QgZXJyb3I/IDNcXG5cXG5cIik7XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgdGhhdC5fcmF3Q29ubi5zZW5kSVEoaXEzLCBzdWMzLCBlcnIzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShzdWJJcSwgc3ViU3VjLCAoKSA9PiB7fSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpLCBkZXZpY2UuZ2V0RG9tYWluKCksIGNiKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRTdWJzY3JpcHRpb24obm9kZSwgZG9tYWluLCBjYikge1xuXG4gICAgLy8gICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhhdC5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAvLyAgICAgLmMoXCJwdWJzdWJcIiwgeyB4bWxuczogUFVCU1VCX05TIH0pXG4gICAgLy8gICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBub2RlLCBtYXhfaXRlbXM6IDEgfSk7XG4gICAgLy8gPGlxIHR5cGU9J2dldCdcbiAgICAvLyAgICAgZnJvbT0nZnJhbmNpc2NvQGRlbm1hcmsubGl0L2JhcnJhY2tzJ1xuICAgIC8vICAgICB0bz0ncHVic3ViLnNoYWtlc3BlYXJlLmxpdCdcbiAgICAvLyAgICAgaWQ9J3N1YnNjcmlwdGlvbnMxJz5cbiAgICAvLyAgIDxwdWJzdWIgeG1sbnM9J2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1Yic+XG4gICAgLy8gICAgIDxzdWJzY3JpcHRpb25zLz5cbiAgICAvLyAgIDwvcHVic3ViPlxuICAgIC8vIDwvaXE+XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICBsZXQgdW5pcXVlSWQgPSB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgIGxldCBpcSA9ICRpcSh7IHR5cGU6IFwiZ2V0XCIsIGZyb206IHRoaXMuX3Jhd0Nvbm4uamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkIH0pXG4gICAgICAuYyhcInB1YnN1YlwiLCB7eG1sbnM6IFBVQlNVQl9OU30pXG4gICAgICAuYyhcInN1YnNjcmlwdGlvbnNcIik7XG5cbiAgICBsZXQgc3VjID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImdldCBzdWIgb2tcIik7XG4gICAgICAvLyBYbWxVdGlsLmR1bXBEb20oaXEpO1xuICAgICAgbGV0IGNvbnZlcnRlZCA9IFhtbFV0aWwuY29udlN1YnNjcmlwdGlvbnMoaXEpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJjb252ZXJ0ZWQgb2tcIik7XG4gICAgICBjYihjb252ZXJ0ZWQpO1xuXG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImdldCBzdWIgZmFpbGVkXCIpO1xuXG4gICAgfTtcblxuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICBiaW5kKGRldmljZU5hbWUsIGRvbWFpbikge1xuICAgIGlmIChkb21haW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tYWluID0gdGhpcy5nZXREb21haW4oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERldmljZSh0aGlzLCBkZXZpY2VOYW1lLCBkb21haW4pO1xuICB9XG5cbiAgZmV0Y2hEZXZpY2VzKGNhbGxiYWNrLCBkb21haW4pIHtcbiAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIC8vIGxldCBpcSA9ICRpcSh7ZnJvbTogamlkLCB0bzogc2VydmljZSwgdHlwZTonZ2V0J30pXG4gICAgLy8gICAuYygncXVlcnknLCB7IHhtbG5zOiBTdHJvcGhlLlN0cm9waGUuTlMuRElTQ09fSVRFTVMgfSk7XG4gICAgbGV0IGlxID0gJGlxKHsgZnJvbTogamlkLCB0bzogc2VydmljZSwgdHlwZTogXCJnZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSkuYyhcbiAgICAgICdxdWVyeScsIHsgeG1sbnM6IFN0cm9waGUuU3Ryb3BoZS5OUy5ESVNDT19JVEVNUyB9XG4gICAgKTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc3VjY2VzcyA9IChtc2cpID0+IHtcblxuICAgICAgLy8gREVCVUdcbiAgICAgIC8vIGxldCBzID0gbXNnLnRvU3RyaW5nKCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAIGluc2lkZSBzdWNjZXNzIG9mIGZldGNoRGV2aWNlc1wiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidHlwZW9mKG1zZyk9XCIgKyBTdHJpbmcodHlwZW9mKG1zZykpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKG1zZykpKTtcbiAgICAgIC8vIC8vIGNvbnNvbGUubG9nKG1zZy5fY2hpbGROb2Rlc0xpc3QubGVuZ3RoKTtcbiAgICAgIC8vIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnLl9jaGlsZE5vZGVzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gLy8gICB2YXIgY24gPSBtc2cuX2NoaWxkTm9kZXNMaXN0W2ldO1xuICAgICAgLy8gLy8gICBjb25zb2xlLmxvZyhcIi0tLWNoaWxkIG5vZGUgXCIgKyBTdHJpbmcoaSkpO1xuICAgICAgLy8gLy8gICBjb25zb2xlLmxvZyhTdHJpbmcoY24pKTtcbiAgICAgIC8vIC8vICAgY29uc29sZS5sb2coaSk7XG4gICAgICAvLyAvLyAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKGNuKSkpO1xuICAgICAgLy8gLy8gfVxuICAgICAgLy9cbiAgICAgIC8vIGxldCBxdWVyeSA9IG1zZy5fY2hpbGROb2Rlc0xpc3RbMF07XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tcXVlcnlcIik7XG4gICAgICAvLyBsZXQgZHVtcENoaWxkSW5mbyA9ICh4LCBpbmRlbnQpID0+IHtcbiAgICAgIC8vICAgaWYgKCFpbmRlbnQpIHtcbiAgICAgIC8vICAgICBpbmRlbnQgPSAwO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIHZhciBpbmQgPSBcIlwiO1xuICAgICAgLy8gICBmb3IgKHZhciBqID0gMDsgaiA8IGluZGVudDsgaisrKSB7XG4gICAgICAvLyAgICAgaW5kID0gaW5kICsgXCIgIFwiO1xuICAgICAgLy8gICB9XG4gICAgICAvL1xuICAgICAgLy8gICBpZiAoeC5fY2hpbGROb2Rlc0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coXCJfbG9jYWxOYW1lPVwiICsgeC5fbG9jYWxOYW1lICsgXCIsIF9hdHRyaWJ1dGVzPVwiICsgU3RyaW5nKE9iamVjdC5rZXlzKHguX2F0dHJpYnV0ZXMpKSk7XG4gICAgICAvL1xuICAgICAgLy8gICB9XG4gICAgICAvL1xuICAgICAgLy8gICBjb25zb2xlLmxvZyh4Ll9jaGlsZE5vZGVzTGlzdC5sZW5ndGgpO1xuICAgICAgLy8gICBmb3IgKHZhciBpID0gMDsgaSA8IHguX2NoaWxkTm9kZXNMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyAgICAgdmFyIGNuID0geC5fY2hpbGROb2Rlc0xpc3RbaV07XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coaW5kICsgXCItLS1jaGlsZCBub2RlIFwiICsgU3RyaW5nKGkpKTtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhpbmQgKyBTdHJpbmcoY24pKTtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhpbmQgKyBTdHJpbmcoaSkpO1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGluZCArIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKGNuKSkpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLWl0ZW0wXCIpO1xuICAgICAgLy8gZHVtcENoaWxkSW5mbyhxdWVyeSk7XG4gICAgICAvL1xuICAgICAgLy8gdmFyIGl0ZW0wID0gcXVlcnkuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgLy8gZHVtcENoaWxkSW5mbyhpdGVtMCk7XG4gICAgICAvL1xuICAgICAgLy9cbiAgICAgIC8vIC8vIGNvbnNvbGUubG9nKFwidHlwZW9mKG1zZ1swXSk9XCIgKyBTdHJpbmcodHlwZW9mKG1zZ1swXSkpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tdG9TdHJpbmcoKSByZXN1bHRcIik7XG4gICAgICAvLyBpZiAoMTAwMCA8IHMubGVuZ3RoKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKHMuc3Vic3RyaW5nKDAsIDEwMDApKTtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKHMpO1xuICAgICAgLy8gfVxuICAgICAgLy8gLy8gREVCVUcgRU5EXG4gICAgICBsZXQgcXVlcnkgPSBtc2cuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGl0ZW1zID0gcXVlcnkuX2NoaWxkTm9kZXNMaXN0O1xuXG4gICAgICBsZXQgY2hlY2sgPSB7fTtcbiAgICAgIC8vIGZvciAobGV0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJpdGVtLl9hdHRyaWJ1dGVzPVwiICsgT2JqZWN0LmtleXMoaXRlbS5fYXR0cmlidXRlcykpO1xuICAgICAgICAvLyBsZXQgbm9kZSA9IGl0ZW0uX2F0dHJpYnV0ZXMubm9kZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJub2RlPVwiICsgT2JqZWN0LmtleXMobm9kZSkpXG4gICAgICAgIGxldCBub2RlID0gaXRlbS5fYXR0cmlidXRlcy5ub2RlLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJub2RlPVwiICsgbm9kZSk7XG4gICAgICAgIGlmIChTb3hVdGlsLmVuZHNXaXRoRGF0YShub2RlKSkge1xuICAgICAgICAgIGxldCByZWFsTm9kZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICBpZiAoY2hlY2tbcmVhbE5vZGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXSA9IHsgZGF0YTogdHJ1ZSB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0uZGF0YSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGUpKSB7XG4gICAgICAgICAgbGV0IHJlYWxOb2RlID0gU294VXRpbC5jdXRNZXRhU3VmZml4KG5vZGUpO1xuICAgICAgICAgIGlmIChjaGVja1tyZWFsTm9kZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdID0geyBtZXRhOiB0cnVlIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbGV0IGRldmljZU5hbWVzID0gW107XG4gICAgICBsZXQgZGV2aWNlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgZGV2aWNlTmFtZSBvZiBPYmplY3Qua2V5cyhjaGVjaykpIHtcbiAgICAgICAgbGV0IGMgPSBjaGVja1tkZXZpY2VOYW1lXTtcbiAgICAgICAgaWYgKGMuZGF0YSAmJiBjLm1ldGEpIHtcbiAgICAgICAgICBsZXQgZGV2aWNlID0gdGhhdC5iaW5kKGRldmljZU5hbWUpO1xuICAgICAgICAgIGRldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgIC8vIGRldmljZU5hbWVzLnB1c2goZGV2aWNlTmFtZSk7XG4gICAgICAgICAgLy8gZGV2aWNlTmFtZXMucHVzaChkZXZpY2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKGRldmljZXMpO1xuXG4gICAgICAvLyBmb3IgKGxldCBkbiBvZiBkZXZpY2VOYW1lcykge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhkbik7XG4gICAgICAvLyB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0gZGV2aWNlcyA9IFwiICsgZGV2aWNlTmFtZXMubGVuZ3RoKTtcblxuICAgICAgLy8gU294VXRpbC5leHRyYWN0RGV2aWNlcyh0aGF0LCBtc2csIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgbGV0IGVycm9yID0gKG1zZykgPT4ge1xuICAgICAgLy8gRklYTUVcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAQCBmZXRjaERldmljZXMgZXJyb3I6IFwiICsgbXNnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLnRyZWUoKSwgc3VjY2VzcywgZXJyb3IsIHVuZGVmaW5lZCk7XG5cblxuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmRpc2NvdmVyTm9kZXMoKHN1Y19yZXN1bHQpID0+IHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKFwiZGlzY292ZXJOb2Rlczogc3VjY2Vzc2VkOiBcIiArIHN1Y19yZXN1bHQpO1xuICAgIC8vXG4gICAgLy8gfSwgKGVycl9yZXN1bHQpID0+IHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKFwiZGlzY29udmVyTm9kZXM6IGZhaWxlZFwiICsgZXJyX3Jlc3VsdCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICBmZXRjaFN1YnNjcmlwdGlvbnMoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5nZXRTdWJzY3JpcHRpb25zKChzdWJzY3JpcHRpb25zKSA9PiB7XG4gICAgICAvLyBUT0RPOiBEZXZpY2Ug44Kq44OW44K444Kn44Kv44OI44Gu44Oq44K544OI44Gr5Yqg5bel44GX44GmY2FsbGJhY2vjgpLlkbzjgbPlh7rjgZlcblxuICAgIH0pO1xuICB9XG5cbiAgc3Vic2NyaWJlKGRldmljZSkge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBsZXQgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIC8vIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkZXZpY2UuZ2V0RG9tYWluKCk7XG5cbiAgICAvLyB0aGlzLl9zdWJOb2RlKGRhdGFOb2RlLCBkZXZpY2UuZ2V0RG9tYWluKCkpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMudW5zdWJzY3JpYmUoZGV2aWNlLCAoKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCB1bnN1YnNjcmliZSBjYWxsYmFjayBjYWxsZWRcIik7XG4gICAgICBsZXQgY2IgPSAoKSA9PiB7XG4gICAgICB9O1xuICAgICAgdGhhdC5fc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBmYWxzZSwgY2IpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3N1Yk5vZGUgY2FsbGVkXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgX3N1Yk5vZGUobm9kZSwgZG9tYWluLCByZXF1ZXN0UmVjZW50LCBjYWxsYmFjaykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICAvLyBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZGV2aWNlLmdldERvbWFpbigpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIC8vIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLnN1YnNjcmliZShkYXRhTm9kZSk7XG4gICAgLy8gVE9ET1xuXG4gICAgLy8gbm9kZSBsaXN0IGdldCDjga7jgajjgY3jga5xdWVyeVxuICAgIC8vIGxldCBpcSA9ICRpcSh7IGZyb206IGppZCwgdG86IHNlcnZpY2UsIHR5cGU6IFwiZ2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pLmMoXG4gICAgLy8gICAncXVlcnknLCB7IHhtbG5zOiBTdHJvcGhlLlN0cm9waGUuTlMuRElTQ09fSVRFTVMgfVxuICAgIC8vICk7XG5cbiAgICAvLyBodHRwOi8vZ2dvemFkLmNvbS9zdHJvcGhlLnBsdWdpbnMvZG9jcy9zdHJvcGhlLnB1YnN1Yi5odG1sXG4gICAgLy8gY29uc29sZS5sb2coXCJAQEBAQEBAIHJhdyBqaWQgPSBcIiArIHRoaXMuX3Jhd0Nvbm4uamlkKTtcbiAgICBsZXQgcmF3SmlkID0gdGhpcy5fcmF3Q29ubi5qaWQ7XG4gICAgbGV0IGJhcmVKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIGxldCBpcSA9ICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiBcInNldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KVxuICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCIgfSlcbiAgICAgIC8vIC5jKCdzdWJzY3JpYmUnLCB7bm9kZTogbm9kZSwgamlkOiBiYXJlSmlkfSk7XG4gICAgICAuYygnc3Vic2NyaWJlJywge25vZGU6IG5vZGUsIGppZDogcmF3SmlkfSk7XG5cbiAgICBsZXQgc3VjID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInN1YnNjcmliZSBzdWNjZXNzPyBub2RlPVwiICsgbm9kZSk7XG5cbiAgICAgIC8vIGh0dHBzOi8veG1wcC5vcmcvZXh0ZW5zaW9ucy94ZXAtMDA2MC5odG1sI3N1YnNjcmliZXItcmV0cmlldmUtcmVxdWVzdHJlY2VudFxuXG4gICAgICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgICAgLy8gICAgIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAgIC8vICAgICB0bz0ncHVic3ViLnNoYWtlc3BlYXJlLmxpdCdcbiAgICAgIC8vICAgICBpZD0naXRlbXMyJz5cbiAgICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAgIC8vICAgICA8aXRlbXMgbm9kZT0ncHJpbmNlbHlfbXVzaW5ncycgbWF4X2l0ZW1zPScyJy8+XG4gICAgICAvLyAgIDwvcHVic3ViPlxuICAgICAgLy8gPC9pcT5cbiAgICAgIGlmIChyZXF1ZXN0UmVjZW50KSB7XG4gICAgICAgIGxldCB1bmlxdWVJZCA9IHRoYXQuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgICAgIGxldCBpcTIgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiB0aGF0Ll9yYXdDb25uLmppZCwgdG86IHNlcnZpY2UsIGlkOiB1bmlxdWVJZCB9KVxuICAgICAgICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBub2RlLCBtYXhfaXRlbXM6IDEgfSk7XG4gICAgICAgIC8vIHRoYXQuX3Jhd0Nvbm4uXG4gICAgICAgIGxldCBzdWMyID0gKGlxKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJyZWNlbnQgcmVxdWVzdCBzdWNjZXNzP1wiKTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBsZXQgZXJyMiA9IChpcSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicmVjZW50IHJlcXVlc3QgZmFpbGVkP1wiKTtcblxuICAgICAgICB9O1xuICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShpcTIsIHN1YzIsIGVycjIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwic3Vic2NyaWJlIGZhaWxlZD8gIFwiICsgU3RyaW5nKGlxKSk7XG4gICAgICAvLyBYbWxVdGlsLmR1bXBEb20oaXEpO1xuICAgIH07XG4gICAgdGhpcy5fcmF3Q29ubi5zZW5kSVEoaXEsIHN1YywgZXJyKTtcblxuICB9XG5cbiAgdW5zdWJzY3JpYmUoZGV2aWNlLCBjYWxsYmFjaykge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBsZXQgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBjYiA9ICgpID0+IHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgbXlKaWQgPSBTdHJvcGhlLlN0cm9waGUuZ2V0QmFyZUppZEZyb21KaWQodGhpcy5fcmF3Q29ubi5qaWQpO1xuXG4gICAgdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKGRhdGFOb2RlLCBkb21haW4sIChzdWIpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiX2dldFN1YnNjcmlwdGlvbiBjYWxsYmFjayBjYWxsZWQgaW4gdW5zdWJzY3JpYmVcIik7XG4gICAgICBpZiAoc3ViW215SmlkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1YltteUppZF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGxldCBzdWJpZHMgPSBzdWJbbXlKaWRdW2RhdGFOb2RlXTtcbiAgICAgIGlmIChzdWJpZHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBzdWJpZHMgPT09IHVuZGVmaW5lZCFcIik7XG4gICAgICAgIGNiKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIHN1Ymlkcy5sZW5ndGg9PT1cIiArIHN1Ymlkcy5sZW5ndGgpO1xuICAgICAgaWYgKHN1Ymlkcy5sZW5ndGggPT0gMCkge1xuICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgY2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGRlbE5leHRGdW5jID0gKGkpID0+IHtcbiAgICAgICAgICBpZiAoc3ViaWRzLmxlbmd0aCA8PSBpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGVsTmV4dEZ1bmMoaSsxKSwgc3ViaWRzW2ldKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF91bnN1Yk5vZGUgY2FsbGVkIGZvciBzdWJpZD1cIiArIHN1Ymlkc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBkZWxOZXh0RnVuYygxKSwgc3ViaWRzWzBdKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3Vuc3ViTm9kZSBjYWxsZWQgZm9yIHN1YmlkPVwiICsgc3ViaWRzWzBdKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vIHRoaXMuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCAoKSA9PiB7XG4gICAgLy8gICAvLyBUT0RPXG4gICAgLy8gfSk7XG4gIH1cblxuICBfdW5zdWJOb2RlKG5vZGUsIGRvbWFpbiwgY2FsbGJhY2ssIHN1YmlkKSB7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcbiAgICAvLyA8aXEgdHlwZT0nc2V0J1xuICAgIC8vIGZyb209J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdC9iYXJyYWNrcydcbiAgICAvLyB0bz0ncHVic3ViLnNoYWtlc3BlYXJlLmxpdCdcbiAgICAvLyBpZD0ndW5zdWIxJz5cbiAgICAvLyAgIDxwdWJzdWIgeG1sbnM9J2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1Yic+XG4gICAgLy8gICAgICA8dW5zdWJzY3JpYmVcbiAgICAvLyAgICAgICAgICBub2RlPSdwcmluY2VseV9tdXNpbmdzJ1xuICAgIC8vICAgICAgICAgIGppZD0nZnJhbmNpc2NvQGRlbm1hcmsubGl0Jy8+XG4gICAgLy8gICA8L3B1YnN1Yj5cbiAgICAvLyA8L2lxPlxuICAgIGxldCBiYXJlSmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKHRoaXMuX3Jhd0Nvbm4uamlkKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIl91bnN1Yk5vZGU6IGJhcmVKaWQ9XCIgKyBiYXJlSmlkKTtcblxuICAgIGxldCB1bnN1YkF0dHJzID0geyBub2RlOiBub2RlLCBqaWQ6IGJhcmVKaWQgfTtcbiAgICBpZiAoc3ViaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdW5zdWJBdHRycy5zdWJpZCA9IHN1YmlkO1xuICAgIH1cblxuICAgIGxldCBpcSA9ICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiBcInNldFwiLCBpZDogdGhpcy5fcmF3Q29ubi5nZXRVbmlxdWVJZChcInB1YnN1YlwiKSB9KVxuICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFwiaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViXCIgfSlcbiAgICAgIC5jKCd1bnN1YnNjcmliZScsIHVuc3ViQXR0cnMpO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ1bnN1YiBzdWNjZXNzXCIpO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKGlxKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidW5zdWIgZmFpbGVkXCIpO1xuICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGlxKTtcbiAgICB9O1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICB1bnN1YnNjcmliZUFsbCgpIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5mZXRjaFN1YnNjcmlwdGlvbnMoKGRldmljZXMpID0+IHtcbiAgICAgIGZvciAobGV0IGRldmljZSBvZiBkZXZpY2VzKSB7XG4gICAgICAgIHRoYXQudW5zdWJzY3JpYmUoZGV2aWNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZURldmljZShkZXZpY2UsIG1ldGEpIHtcbiAgICAvLyBjcmVhdGUgXCJfZGF0YVwiIGFuZCBcIl9tZXRhXCIgbm9kZXNcbiAgICBsZXQgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuY3JlYXRlTm9kZShkYXRhTm9kZSk7XG4gICAgbGV0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uUHViU3ViLmNyZWF0ZU5vZGUobWV0YU5vZGUpO1xuXG4gICAgLy8gcHVibGlzaCBtZXRhIGRhdGFcbiAgICBsZXQgbWV0YVhtbFN0cmluZyA9IG1ldGEudG9YbWxTdHJpbmcoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5wdWJsaXNoKG1ldGFOb2RlLCBbbWV0YVhtbFN0cmluZ10pO1xuICB9XG5cbiAgZGVsZXRlRGV2aWNlKGRldmljZSkge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5kZWxldGVOb2RlKGRhdGFOb2RlKTtcbiAgICBsZXQgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIuZGVsZXRlTm9kZShtZXRhTm9kZSk7XG4gIH1cblxuICBwdWJsaXNoKGRldmljZSwgZGF0YSkge1xuICAgIGxldCB4bWxTdHJpbmcgPSBkYXRhLnRvWG1sU3RyaW5nKCk7XG4gICAgbGV0IG5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgdGhpcy5fcmF3Q29ubi5QdWJTdWIucHVibGlzaChub2RlLCBbeG1sU3RyaW5nXSk7XG4gIH1cblxuICBfZ2VuUmFuZG9tSWQoKSB7XG4gICAgbGV0IGNoYXJzID0gXCJhYmNkZWYwMTIzNDU2Nzg5MFwiO1xuICAgIGxldCBuQ2hhcnMgPSBjaGFycy5sZW5ndGg7XG4gICAgbGV0IGxlbiA9IDEyODtcbiAgICB2YXIgcmV0ID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsZXQgaWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbkNoYXJzKTtcbiAgICAgIGxldCBjaGFyID0gY2hhcnMuY2hhckF0KGlkeCk7XG4gICAgICByZXQgPSByZXQgKyBjaGFyO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgX3JlZ2lzdGVyTWV0YUxpc3RlbmVyKGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yZWdpc3Rlckxpc3RlbmVyKHRoaXMuX21ldGFDYWxsYmFja3MsIGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spO1xuICB9XG5cbiAgX3JlZ2lzdGVyRGF0YUxpc3RlbmVyKGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yZWdpc3Rlckxpc3RlbmVyKHRoaXMuX2RhdGFDYWxsYmFja3MsIGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spO1xuICB9XG5cbiAgX3JlZ2lzdGVyTGlzdGVuZXIodGFibGUsIGRldmljZSwgbGlzdGVuZXJJZCwgY2FsbGJhY2spIHtcbiAgICBsZXQgZGV2aWNlTmFtZSA9IGRldmljZS5nZXROYW1lKCk7XG5cbiAgICBpZiAodGFibGVbZGV2aWNlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFibGVbZGV2aWNlTmFtZV0gPSB7fTtcbiAgICB9XG5cbiAgICB0YWJsZVtkZXZpY2VOYW1lXVtsaXN0ZW5lcklkXSA9IGNhbGxiYWNrO1xuICB9XG5cbiAgX2Jyb2FkY2FzdCh0YWJsZSwgYXJndW1lbnQpIHtcbiAgICBmb3IgKGxldCBsaXN0ZW5lcklkIG9mIE9iamVjdC5rZXlzKHRhYmxlKSkge1xuICAgICAgbGV0IGxpc3RlbmVyID0gdGFibGVbbGlzdGVuZXJJZF07XG4gICAgICAvLyBjb25zb2xlLmxvZygnJCQkJCBsaXN0ZW5lcklkPScgKyBsaXN0ZW5lcklkICsgXCIsIGxpc3RlbmVyPVwiICsgbGlzdGVuZXIpO1xuICAgICAgbGlzdGVuZXIoYXJndW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVNZXRhTGlzdGVuZXJXaXRoSWQobGlzdGVuZXJJZCkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyV2l0aElkKHRoaXMuX21ldGFDYWxsYmFja3MsIGxpc3RlbmVySWQpO1xuICB9XG5cbiAgX3JlbW92ZURhdGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJXaXRoSWQodGhpcy5fZGF0YUNhbGxiYWNrcywgbGlzdGVuZXJJZCk7XG4gIH1cblxuICBfcmVtb3ZlTGlzdGVuZXJXaXRoSWQodGFibGUsIGxpc3RlbmVySWQpIHtcbiAgICBmb3IgKGxldCBkZXZOYW1lIG9mIE9iamVjdC5rZXlzKHRhYmxlKSkge1xuICAgICAgbGV0IGRldlRhYmxlID0gdGFibGVbZGV2TmFtZV07XG4gICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGxzdG5JZCBvZiBPYmplY3Qua2V5cyhkZXZUYWJsZSkpIHtcbiAgICAgICAgaWYgKGxzdG5JZCA9PT0gbGlzdGVuZXJJZCkge1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgZGVsZXRlIGRldlRhYmxlW2xpc3RlbmVySWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNveENvbm5lY3Rpb247XG4iXX0=