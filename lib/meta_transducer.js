'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MetaTransducer = function () {
  function MetaTransducer(device, name, tdrId, _canActuate, _hasOwnNode, units, unitScalar, minValue, maxValue, resolution) {
    _classCallCheck(this, MetaTransducer);

    this.device = device;
    this.name = name;
    this.tdrId = tdrId;
    this._canActuate = _canActuate;
    this._hasOwnNode = _hasOwnNode;
    this.units = units;
    this.unitScalar = unitScalar;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.resolution = resolution;
  }

  _createClass(MetaTransducer, [{
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this.tdrId;
    }
  }, {
    key: 'canActuate',
    value: function canActuate() {
      return this._canActuate;
    }
  }, {
    key: 'hasOwnNode',
    value: function hasOwnNode() {
      return this._hasOwnNode;
    }
  }, {
    key: 'getUnits',
    value: function getUnits() {
      return this.units;
    }
  }, {
    key: 'getUnitScalar',
    value: function getUnitScalar() {
      return this.unitScalar;
    }
  }, {
    key: 'getMinValue',
    value: function getMinValue() {
      return this.minValue;
    }
  }, {
    key: 'getMaxValue',
    value: function getMaxValue() {
      return this.maxValue;
    }
  }, {
    key: 'getResolution',
    value: function getResolution() {
      return this.resolution;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder()
      var attrs = {
        name: this.name,
        id: this.tdrId,
        canActuate: String(this.canActuate()),
        hasOwnNode: String(this.hasOwnNode())
        // units: this.units,
        // unitScalar: this.unitScalar,
        // minValue: this.minValue,
        // maxValue: this.maxValue,
        // resolution: this.resolution
      };

      if (this.units) {
        attrs.units = this.units;
      }

      if (this.unitScalar) {
        attrs.unitScalar = this.unitScalar;
      }

      if (this.minValue) {
        attrs.minValue = this.minValue;
      }

      if (this.maxValue) {
        attrs.maxValue = this.maxValue;
      }

      if (this.resolution) {
        attrs.resolution = this.resolution;
      }

      return { '$': attrs };
    }
  }]);

  return MetaTransducer;
}();

module.exports = MetaTransducer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhX3RyYW5zZHVjZXIuanMiXSwibmFtZXMiOlsiTWV0YVRyYW5zZHVjZXIiLCJkZXZpY2UiLCJuYW1lIiwidGRySWQiLCJfY2FuQWN0dWF0ZSIsIl9oYXNPd25Ob2RlIiwidW5pdHMiLCJ1bml0U2NhbGFyIiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsInJlc29sdXRpb24iLCJhdHRycyIsImlkIiwiY2FuQWN0dWF0ZSIsIlN0cmluZyIsImhhc093bk5vZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUEsYztBQUVKLDBCQUFZQyxNQUFaLEVBQW9CQyxJQUFwQixFQUEwQkMsS0FBMUIsRUFBaUNDLFdBQWpDLEVBQThDQyxXQUE5QyxFQUEyREMsS0FBM0QsRUFDSUMsVUFESixFQUNnQkMsUUFEaEIsRUFDMEJDLFFBRDFCLEVBQ29DQyxVQURwQyxFQUNnRDtBQUFBOztBQUM5QyxTQUFLVCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkEsVUFBbEI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkEsVUFBbEI7QUFDRDs7OztnQ0FFVztBQUNWLGFBQU8sS0FBS1QsTUFBWjtBQUNEOzs7OEJBRVM7QUFDUixhQUFPLEtBQUtDLElBQVo7QUFDRDs7OzRCQUVPO0FBQ04sYUFBTyxLQUFLQyxLQUFaO0FBQ0Q7OztpQ0FFWTtBQUNYLGFBQU8sS0FBS0MsV0FBWjtBQUNEOzs7aUNBRVk7QUFDWCxhQUFPLEtBQUtDLFdBQVo7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxLQUFLQyxLQUFaO0FBQ0Q7OztvQ0FFZTtBQUNkLGFBQU8sS0FBS0MsVUFBWjtBQUNEOzs7a0NBRWE7QUFDWixhQUFPLEtBQUtDLFFBQVo7QUFDRDs7O2tDQUVhO0FBQ1osYUFBTyxLQUFLQyxRQUFaO0FBQ0Q7OztvQ0FFZTtBQUNkLGFBQU8sS0FBS0MsVUFBWjtBQUNEOzs7NkNBRXdCO0FBQ3ZCO0FBQ0EsVUFBSUMsUUFBUTtBQUNSVCxjQUFNLEtBQUtBLElBREg7QUFFUlUsWUFBSSxLQUFLVCxLQUZEO0FBR1JVLG9CQUFZQyxPQUFPLEtBQUtELFVBQUwsRUFBUCxDQUhKO0FBSVJFLG9CQUFZRCxPQUFPLEtBQUtDLFVBQUwsRUFBUDtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFUUSxPQUFaOztBQVlBLFVBQUksS0FBS1QsS0FBVCxFQUFnQjtBQUNkSyxjQUFNTCxLQUFOLEdBQWMsS0FBS0EsS0FBbkI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFVBQVQsRUFBcUI7QUFDbkJJLGNBQU1KLFVBQU4sR0FBbUIsS0FBS0EsVUFBeEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFFBQVQsRUFBbUI7QUFDakJHLGNBQU1ILFFBQU4sR0FBaUIsS0FBS0EsUUFBdEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFFBQVQsRUFBbUI7QUFDakJFLGNBQU1GLFFBQU4sR0FBaUIsS0FBS0EsUUFBdEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFVBQVQsRUFBcUI7QUFDbkJDLGNBQU1ELFVBQU4sR0FBbUIsS0FBS0EsVUFBeEI7QUFDRDs7QUFFRCxhQUFPLEVBQUUsS0FBS0MsS0FBUCxFQUFQO0FBQ0Q7Ozs7OztBQUtISyxPQUFPQyxPQUFQLEdBQWlCakIsY0FBakIiLCJmaWxlIjoibWV0YV90cmFuc2R1Y2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWV0YVRyYW5zZHVjZXIge1xuXG4gIGNvbnN0cnVjdG9yKGRldmljZSwgbmFtZSwgdGRySWQsIF9jYW5BY3R1YXRlLCBfaGFzT3duTm9kZSwgdW5pdHMsXG4gICAgICB1bml0U2NhbGFyLCBtaW5WYWx1ZSwgbWF4VmFsdWUsIHJlc29sdXRpb24pIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudGRySWQgPSB0ZHJJZDtcbiAgICB0aGlzLl9jYW5BY3R1YXRlID0gX2NhbkFjdHVhdGU7XG4gICAgdGhpcy5faGFzT3duTm9kZSA9IF9oYXNPd25Ob2RlO1xuICAgIHRoaXMudW5pdHMgPSB1bml0cztcbiAgICB0aGlzLnVuaXRTY2FsYXIgPSB1bml0U2NhbGFyO1xuICAgIHRoaXMubWluVmFsdWUgPSBtaW5WYWx1ZTtcbiAgICB0aGlzLm1heFZhbHVlID0gbWF4VmFsdWU7XG4gICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbjtcbiAgfVxuXG4gIGdldERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2U7XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cblxuICBnZXRJZCgpIHtcbiAgICByZXR1cm4gdGhpcy50ZHJJZDtcbiAgfVxuXG4gIGNhbkFjdHVhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbkFjdHVhdGU7XG4gIH1cblxuICBoYXNPd25Ob2RlKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNPd25Ob2RlO1xuICB9XG5cbiAgZ2V0VW5pdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5pdHM7XG4gIH1cblxuICBnZXRVbml0U2NhbGFyKCkge1xuICAgIHJldHVybiB0aGlzLnVuaXRTY2FsYXI7XG4gIH1cblxuICBnZXRNaW5WYWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5taW5WYWx1ZTtcbiAgfVxuXG4gIGdldE1heFZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLm1heFZhbHVlO1xuICB9XG5cbiAgZ2V0UmVzb2x1dGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHV0aW9uO1xuICB9XG5cbiAgX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpIHtcbiAgICAvLyBidWlsZCBjb250ZW50IGZvciB4bWwyanMuQnVpbGRlcigpXG4gICAgbGV0IGF0dHJzID0ge1xuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIGlkOiB0aGlzLnRkcklkLFxuICAgICAgICBjYW5BY3R1YXRlOiBTdHJpbmcodGhpcy5jYW5BY3R1YXRlKCkpLFxuICAgICAgICBoYXNPd25Ob2RlOiBTdHJpbmcodGhpcy5oYXNPd25Ob2RlKCkpLFxuICAgICAgICAvLyB1bml0czogdGhpcy51bml0cyxcbiAgICAgICAgLy8gdW5pdFNjYWxhcjogdGhpcy51bml0U2NhbGFyLFxuICAgICAgICAvLyBtaW5WYWx1ZTogdGhpcy5taW5WYWx1ZSxcbiAgICAgICAgLy8gbWF4VmFsdWU6IHRoaXMubWF4VmFsdWUsXG4gICAgICAgIC8vIHJlc29sdXRpb246IHRoaXMucmVzb2x1dGlvblxuICAgIH1cblxuICAgIGlmICh0aGlzLnVuaXRzKSB7XG4gICAgICBhdHRycy51bml0cyA9IHRoaXMudW5pdHM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudW5pdFNjYWxhcikge1xuICAgICAgYXR0cnMudW5pdFNjYWxhciA9IHRoaXMudW5pdFNjYWxhcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5taW5WYWx1ZSkge1xuICAgICAgYXR0cnMubWluVmFsdWUgPSB0aGlzLm1pblZhbHVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1heFZhbHVlKSB7XG4gICAgICBhdHRycy5tYXhWYWx1ZSA9IHRoaXMubWF4VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVzb2x1dGlvbikge1xuICAgICAgYXR0cnMucmVzb2x1dGlvbiA9IHRoaXMucmVzb2x1dGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4geyAnJCc6IGF0dHJzIH07XG4gIH1cblxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWV0YVRyYW5zZHVjZXI7XG4iXX0=