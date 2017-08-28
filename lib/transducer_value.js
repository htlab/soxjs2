'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TransducerValue = function () {
  function TransducerValue(transducerId, rawValue, typedValue, timestamp) {
    _classCallCheck(this, TransducerValue);

    this.transducerId = transducerId;
    this.rawValue = rawValue;
    this.typedValue = typedValue;
    if (timestamp === undefined) {
      timestamp = new Date();
    }
    this.timestamp = timestamp;
  }

  _createClass(TransducerValue, [{
    key: 'getTransducerId',
    value: function getTransducerId() {
      return this.transducerId;
    }
  }, {
    key: 'getRawValue',
    value: function getRawValue() {
      return this.rawValue;
    }
  }, {
    key: 'getTypedValue',
    value: function getTypedValue() {
      return this.typedValue;
    }
  }, {
    key: 'getTimestamp',
    value: function getTimestamp() {
      return this.timestamp;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      var ts = this.timestamp.toISOString();

      return {
        '$': {
          'id': this.transducerId,
          'rawValue': this.rawValue,
          'typedValue': this.typedValue,
          'timestamp': ts
        }
      };
    }
  }]);

  return TransducerValue;
}();

module.exports = TransducerValue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2R1Y2VyX3ZhbHVlLmpzIl0sIm5hbWVzIjpbIlRyYW5zZHVjZXJWYWx1ZSIsInRyYW5zZHVjZXJJZCIsInJhd1ZhbHVlIiwidHlwZWRWYWx1ZSIsInRpbWVzdGFtcCIsInVuZGVmaW5lZCIsIkRhdGUiLCJ0cyIsInRvSVNPU3RyaW5nIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU1BLGU7QUFFSiwyQkFBWUMsWUFBWixFQUEwQkMsUUFBMUIsRUFBb0NDLFVBQXBDLEVBQWdEQyxTQUFoRCxFQUEyRDtBQUFBOztBQUN6RCxTQUFLSCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkEsVUFBbEI7QUFDQSxRQUFJQyxjQUFjQyxTQUFsQixFQUE2QjtBQUMzQkQsa0JBQVksSUFBSUUsSUFBSixFQUFaO0FBQ0Q7QUFDRCxTQUFLRixTQUFMLEdBQWlCQSxTQUFqQjtBQUNEOzs7O3NDQUVpQjtBQUNoQixhQUFPLEtBQUtILFlBQVo7QUFDRDs7O2tDQUVhO0FBQ1osYUFBTyxLQUFLQyxRQUFaO0FBQ0Q7OztvQ0FFZTtBQUNkLGFBQU8sS0FBS0MsVUFBWjtBQUNEOzs7bUNBRWM7QUFDYixhQUFPLEtBQUtDLFNBQVo7QUFDRDs7OzZDQUV3QjtBQUN2QjtBQUNBLFVBQUlHLEtBQUssS0FBS0gsU0FBTCxDQUFlSSxXQUFmLEVBQVQ7O0FBRUEsYUFBTztBQUNMLGFBQUs7QUFDSCxnQkFBTSxLQUFLUCxZQURSO0FBRUgsc0JBQVksS0FBS0MsUUFGZDtBQUdILHdCQUFjLEtBQUtDLFVBSGhCO0FBSUgsdUJBQWFJO0FBSlY7QUFEQSxPQUFQO0FBUUQ7Ozs7OztBQUlIRSxPQUFPQyxPQUFQLEdBQWlCVixlQUFqQiIsImZpbGUiOiJ0cmFuc2R1Y2VyX3ZhbHVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVHJhbnNkdWNlclZhbHVlIHtcblxuICBjb25zdHJ1Y3Rvcih0cmFuc2R1Y2VySWQsIHJhd1ZhbHVlLCB0eXBlZFZhbHVlLCB0aW1lc3RhbXApIHtcbiAgICB0aGlzLnRyYW5zZHVjZXJJZCA9IHRyYW5zZHVjZXJJZDtcbiAgICB0aGlzLnJhd1ZhbHVlID0gcmF3VmFsdWU7XG4gICAgdGhpcy50eXBlZFZhbHVlID0gdHlwZWRWYWx1ZTtcbiAgICBpZiAodGltZXN0YW1wID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCk7XG4gICAgfVxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xuICB9XG5cbiAgZ2V0VHJhbnNkdWNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZHVjZXJJZDtcbiAgfVxuXG4gIGdldFJhd1ZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLnJhd1ZhbHVlO1xuICB9XG5cbiAgZ2V0VHlwZWRWYWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlZFZhbHVlO1xuICB9XG5cbiAgZ2V0VGltZXN0YW1wKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVzdGFtcDtcbiAgfVxuXG4gIF9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSB7XG4gICAgLy8gYnVpbGQgY29udGVudCBmb3IgeG1sMmpzLkJ1aWxkZXJcbiAgICBsZXQgdHMgPSB0aGlzLnRpbWVzdGFtcC50b0lTT1N0cmluZygpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICckJzoge1xuICAgICAgICAnaWQnOiB0aGlzLnRyYW5zZHVjZXJJZCxcbiAgICAgICAgJ3Jhd1ZhbHVlJzogdGhpcy5yYXdWYWx1ZSxcbiAgICAgICAgJ3R5cGVkVmFsdWUnOiB0aGlzLnR5cGVkVmFsdWUsXG4gICAgICAgICd0aW1lc3RhbXAnOiB0c1xuICAgICAgfVxuICAgIH07XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZHVjZXJWYWx1ZTtcbiJdfQ==