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
    key: 'getXmlAttrs',
    value: function getXmlAttrs() {
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

      return attrs;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder()
      return { '$': this.getXmlAttrs() };
    }
  }]);

  return MetaTransducer;
}();

module.exports = MetaTransducer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhX3RyYW5zZHVjZXIuanMiXSwibmFtZXMiOlsiTWV0YVRyYW5zZHVjZXIiLCJkZXZpY2UiLCJuYW1lIiwidGRySWQiLCJfY2FuQWN0dWF0ZSIsIl9oYXNPd25Ob2RlIiwidW5pdHMiLCJ1bml0U2NhbGFyIiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsInJlc29sdXRpb24iLCJhdHRycyIsImlkIiwiY2FuQWN0dWF0ZSIsIlN0cmluZyIsImhhc093bk5vZGUiLCJnZXRYbWxBdHRycyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxjO0FBRUosMEJBQVlDLE1BQVosRUFBb0JDLElBQXBCLEVBQTBCQyxLQUExQixFQUFpQ0MsV0FBakMsRUFBOENDLFdBQTlDLEVBQTJEQyxLQUEzRCxFQUNJQyxVQURKLEVBQ2dCQyxRQURoQixFQUMwQkMsUUFEMUIsRUFDb0NDLFVBRHBDLEVBQ2dEO0FBQUE7O0FBQzlDLFNBQUtULE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNEOzs7O2dDQUVXO0FBQ1YsYUFBTyxLQUFLVCxNQUFaO0FBQ0Q7Ozs4QkFFUztBQUNSLGFBQU8sS0FBS0MsSUFBWjtBQUNEOzs7NEJBRU87QUFDTixhQUFPLEtBQUtDLEtBQVo7QUFDRDs7O2lDQUVZO0FBQ1gsYUFBTyxLQUFLQyxXQUFaO0FBQ0Q7OztpQ0FFWTtBQUNYLGFBQU8sS0FBS0MsV0FBWjtBQUNEOzs7K0JBRVU7QUFDVCxhQUFPLEtBQUtDLEtBQVo7QUFDRDs7O29DQUVlO0FBQ2QsYUFBTyxLQUFLQyxVQUFaO0FBQ0Q7OztrQ0FFYTtBQUNaLGFBQU8sS0FBS0MsUUFBWjtBQUNEOzs7a0NBRWE7QUFDWixhQUFPLEtBQUtDLFFBQVo7QUFDRDs7O29DQUVlO0FBQ2QsYUFBTyxLQUFLQyxVQUFaO0FBQ0Q7OztrQ0FFYTtBQUNaLFVBQUlDLFFBQVE7QUFDUlQsY0FBTSxLQUFLQSxJQURIO0FBRVJVLFlBQUksS0FBS1QsS0FGRDtBQUdSVSxvQkFBWUMsT0FBTyxLQUFLRCxVQUFMLEVBQVAsQ0FISjtBQUlSRSxvQkFBWUQsT0FBTyxLQUFLQyxVQUFMLEVBQVA7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVFEsT0FBWjs7QUFZQSxVQUFJLEtBQUtULEtBQVQsRUFBZ0I7QUFDZEssY0FBTUwsS0FBTixHQUFjLEtBQUtBLEtBQW5CO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLQyxVQUFULEVBQXFCO0FBQ25CSSxjQUFNSixVQUFOLEdBQW1CLEtBQUtBLFVBQXhCO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLQyxRQUFULEVBQW1CO0FBQ2pCRyxjQUFNSCxRQUFOLEdBQWlCLEtBQUtBLFFBQXRCO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLQyxRQUFULEVBQW1CO0FBQ2pCRSxjQUFNRixRQUFOLEdBQWlCLEtBQUtBLFFBQXRCO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLQyxVQUFULEVBQXFCO0FBQ25CQyxjQUFNRCxVQUFOLEdBQW1CLEtBQUtBLFVBQXhCO0FBQ0Q7O0FBRUQsYUFBT0MsS0FBUDtBQUNEOzs7NkNBRXdCO0FBQ3ZCO0FBQ0EsYUFBTyxFQUFFLEtBQUssS0FBS0ssV0FBTCxFQUFQLEVBQVA7QUFDRDs7Ozs7O0FBS0hDLE9BQU9DLE9BQVAsR0FBaUJsQixjQUFqQiIsImZpbGUiOiJtZXRhX3RyYW5zZHVjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBNZXRhVHJhbnNkdWNlciB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlLCBuYW1lLCB0ZHJJZCwgX2NhbkFjdHVhdGUsIF9oYXNPd25Ob2RlLCB1bml0cyxcbiAgICAgIHVuaXRTY2FsYXIsIG1pblZhbHVlLCBtYXhWYWx1ZSwgcmVzb2x1dGlvbikge1xuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy50ZHJJZCA9IHRkcklkO1xuICAgIHRoaXMuX2NhbkFjdHVhdGUgPSBfY2FuQWN0dWF0ZTtcbiAgICB0aGlzLl9oYXNPd25Ob2RlID0gX2hhc093bk5vZGU7XG4gICAgdGhpcy51bml0cyA9IHVuaXRzO1xuICAgIHRoaXMudW5pdFNjYWxhciA9IHVuaXRTY2FsYXI7XG4gICAgdGhpcy5taW5WYWx1ZSA9IG1pblZhbHVlO1xuICAgIHRoaXMubWF4VmFsdWUgPSBtYXhWYWx1ZTtcbiAgICB0aGlzLnJlc29sdXRpb24gPSByZXNvbHV0aW9uO1xuICB9XG5cbiAgZ2V0RGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLmRldmljZTtcbiAgfVxuXG4gIGdldE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIHJldHVybiB0aGlzLnRkcklkO1xuICB9XG5cbiAgY2FuQWN0dWF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FuQWN0dWF0ZTtcbiAgfVxuXG4gIGhhc093bk5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc093bk5vZGU7XG4gIH1cblxuICBnZXRVbml0cygpIHtcbiAgICByZXR1cm4gdGhpcy51bml0cztcbiAgfVxuXG4gIGdldFVuaXRTY2FsYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5pdFNjYWxhcjtcbiAgfVxuXG4gIGdldE1pblZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLm1pblZhbHVlO1xuICB9XG5cbiAgZ2V0TWF4VmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWF4VmFsdWU7XG4gIH1cblxuICBnZXRSZXNvbHV0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdXRpb247XG4gIH1cblxuICBnZXRYbWxBdHRycygpIHtcbiAgICBsZXQgYXR0cnMgPSB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgaWQ6IHRoaXMudGRySWQsXG4gICAgICAgIGNhbkFjdHVhdGU6IFN0cmluZyh0aGlzLmNhbkFjdHVhdGUoKSksXG4gICAgICAgIGhhc093bk5vZGU6IFN0cmluZyh0aGlzLmhhc093bk5vZGUoKSksXG4gICAgICAgIC8vIHVuaXRzOiB0aGlzLnVuaXRzLFxuICAgICAgICAvLyB1bml0U2NhbGFyOiB0aGlzLnVuaXRTY2FsYXIsXG4gICAgICAgIC8vIG1pblZhbHVlOiB0aGlzLm1pblZhbHVlLFxuICAgICAgICAvLyBtYXhWYWx1ZTogdGhpcy5tYXhWYWx1ZSxcbiAgICAgICAgLy8gcmVzb2x1dGlvbjogdGhpcy5yZXNvbHV0aW9uXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudW5pdHMpIHtcbiAgICAgIGF0dHJzLnVuaXRzID0gdGhpcy51bml0cztcbiAgICB9XG5cbiAgICBpZiAodGhpcy51bml0U2NhbGFyKSB7XG4gICAgICBhdHRycy51bml0U2NhbGFyID0gdGhpcy51bml0U2NhbGFyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1pblZhbHVlKSB7XG4gICAgICBhdHRycy5taW5WYWx1ZSA9IHRoaXMubWluVmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWF4VmFsdWUpIHtcbiAgICAgIGF0dHJzLm1heFZhbHVlID0gdGhpcy5tYXhWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXNvbHV0aW9uKSB7XG4gICAgICBhdHRycy5yZXNvbHV0aW9uID0gdGhpcy5yZXNvbHV0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRycztcbiAgfVxuXG4gIF9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSB7XG4gICAgLy8gYnVpbGQgY29udGVudCBmb3IgeG1sMmpzLkJ1aWxkZXIoKVxuICAgIHJldHVybiB7ICckJzogdGhpcy5nZXRYbWxBdHRycygpIH07XG4gIH1cblxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWV0YVRyYW5zZHVjZXI7XG4iXX0=