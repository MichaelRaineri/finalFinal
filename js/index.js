'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataStore = function () {
    function DataStore() {
        _classCallCheck(this, DataStore);

        this._graphData = window.bootstrap.graphData;
    }

    /**
    ** getGraphValues :: object -> array
    ** Returns array of values from graph data
    */

    DataStore.prototype._getGraphValues = function _getGraphValues(graphData, value) {
        return _.map(graphData, value);
    };

    /**
    ** getGraphTitles :: object -> array
    ** Returns array of titles from graph data
    */

    DataStore.prototype.getGraphTitles = function getGraphTitles(graphData) {
        return _.map(graphData, "title");
    };

    /**
    ** filterNaNs :: array -> array
    ** Returns array of safe number values 
    */

    DataStore.prototype._filterNaNs = function _filterNaNs(values) {
        return values.filter(function (value) {
            return !Number.isNaN(value);
        });
    };

    /**
    ** filterNotStrings :: array -> array
    ** Returns array of safe strings from array
    */

    DataStore.prototype._filterNotStrings = function _filterNotStrings(strings) {
        return strings.filter(function (string) {
            return _.isString(string);
        });
    };

    /**
    ** returnRange :: array -> array
    ** Returns array of appropriately stepped range values from sorted values based on spread offset
    */

    DataStore.prototype._returnRange = function _returnRange(sortedValues, spread) {
        var spreadOffset = this._determineSpread(sortedValues) / spread;
        var firstRangeValue = _.first(sortedValues) - spreadOffset;
        var lastRangeValue = _.last(sortedValues) + spreadOffset * 2;
        return _.range(firstRangeValue > 0 ? firstRangeValue : 0, lastRangeValue, spreadOffset);
    };

    /**
     ** roundValues :: array -> array
     ** Returns array of values rounded to the nearest tenth
     */

    DataStore.prototype._roundValues = function _roundValues(rangeValues) {
        return rangeValues.map(function (val) {
            return Math.round(10 * val) / 10;
        });
    };

    /**
    ** determineSpread :: array -> number
    ** Returns spread of sorted graph values
    */

    DataStore.prototype._determineSpread = function _determineSpread(sortedValues) {
        return _.last(sortedValues) - _.first(sortedValues);
    };

    /**
    ** getStringLengths :: array -> array
    ** Returns array of lengths of each string from an array of strings
    */

    DataStore.prototype._getStringLengths = function _getStringLengths(strings) {
        return strings.map(function (string) {
            return string.length;
        });
    };

    /**
    ** getGreatest :: array -> number
    ** Returns greatest value in an array of numbers
    */

    DataStore.prototype._getGreatest = function _getGreatest(values) {
        return values.reduce(function (prev, curr) {
            return curr - prev > 0 ? curr : prev;
        });
    };

    _createClass(DataStore, [{
        key: 'graphData',
        get: function get() {
            return this._graphData;
        }

        /**
        ** getSortedGraphValues :: object -> array
        ** Returns array of numerical graph values from graph data
        */

    }, {
        key: 'getSortedGraphValues',
        get: function get() {
            return _.flow([this._getGraphValues, this._filterNaNs, _.sortBy]);
        }

        /**
        ** getRangeValues :: array -> array
        ** Returns array of rounded range values from graph values
        */

    }, {
        key: 'getRangeValues',
        get: function get() {
            return _.flow([this._returnRange, this._roundValues]);
        }

        /**
        ** getRangeSpread :: array -> number
        ** Returns value of spread of array of range values
        */

    }, {
        key: 'getRangeSpread',
        get: function get() {
            return _.flow([this.getRangeValues, this._determineSpread]);
        }

        /**
        ** getInitialValue :: array -> number
        ** Returns first value of array of range values
        */

    }, {
        key: 'getInitialValue',
        get: function get() {
            return _.flow([this.getRangeValues, _.first]);
        }

        /**
        ** getLengthOfLongestString :: array -> number
        ** Returns length of longest string from an array
        */

    }, {
        key: 'getLengthOfLongestString',
        get: function get() {
            return _.flow([this._filterNotStrings, this._getStringLengths, _.uniq, this._getGreatest]);
        }
    }]);

    return DataStore;
}();

barGraph.$inject = ['$timeout', '$sce'];

function barGraph($timeout, $sce) {

    return {
        restrict: 'E',
        scope: {
            graphName: '=',
            spreadOffset: '='
        },
        replace: true,
        controller: 'BarGraphController',
        controllerAs: 'barGraphController',
        bindToController: true,
        templateUrl: $sce.trustAsResourceUrl('http://codepen.io/eehayman/pen/xEPRoy.html'),
        link: link
    };

    function link(scope, element, attrs, ctrl) {}
}

var BarGraphController = function () {
    _createClass(BarGraphController, null, [{
        key: '$inject',
        get: function get() {
            return ['dataStore'];
        }
    }]);

    function BarGraphController(dataStore) {
        _classCallCheck(this, BarGraphController);

        this._dataStore = dataStore;
        this._activeValue = -1;
    }

    BarGraphController.prototype.updateActiveValue = function updateActiveValue(value) {
        this._activeValue = value;
    };

    _createClass(BarGraphController, [{
        key: 'currentReportData',
        get: function get() {
            return this._dataStore.graphData[this.graphName];
        }
    }, {
        key: 'rangeSpread',
        get: function get() {
            return this._dataStore.getRangeSpread(this.sortedGraphValues, this.spreadOffset);
        }
    }, {
        key: 'isMobile',
        get: function get() {
            return window.innerWidth < 600 ? true : false;
        }
    }, {
        key: 'barWidth',
        get: function get() {
            return this.isMobile ? this.rangeSpread / this.currentReportData.length * 2 : this.rangeSpread / this.currentReportData.length;
        }
    }, {
        key: 'sortedGraphValues',
        get: function get() {
            return this._dataStore.getSortedGraphValues(this.currentReportData, "value");
        }
    }, {
        key: 'yAxisRange',
        get: function get() {
            return this._dataStore.getRangeValues(this.sortedGraphValues, this.spreadOffset);
        }
    }, {
        key: 'viewBoxWidth',
        get: function get() {
            return this.currentReportData.length * this.barWidth;
        }
    }, {
        key: 'viewBoxHeight',
        get: function get() {
            return this.rangeSpread;
        }
    }, {
        key: 'graphInitialValue',
        get: function get() {
            return this._dataStore.getInitialValue(this.sortedGraphValues, this.spreadOffset);
        }
    }, {
        key: 'viewBox',
        get: function get() {
            if (this.currentReportData) {
                return this.isMobile ? "0 0 " + this.viewBoxWidth / 2 + " " + this.viewBoxHeight * 2 : "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;
            }
        }
    }, {
        key: 'xAxisRange',
        get: function get() {
            if (this.currentReportData) {
                return this._dataStore.getGraphTitles(this.currentReportData);
            }
        }
    }, {
        key: 'activeValue',
        get: function get() {
            return this._activeValue;
        }
    }, {
        key: 'offsetPadding',
        get: function get() {
            if (this.xAxisRange) {
                return this._reportDataStore.getLengthOfLongestString(this.xAxisRange) * 7;
            }
        }
    }]);

    return BarGraphController;
}();

angular.module('PresidentialSpeeches', []).config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]).service('dataStore', DataStore).controller('BarGraphController', BarGraphController).directive('barGraph', barGraph);

angular.element(document).ready(function () {
    angular.bootstrap(document.getElementById("PresidentialSpeeches"), ['PresidentialSpeeches']);
});