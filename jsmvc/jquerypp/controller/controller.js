define(
    ['jquery', 'can/control', 'jquerypp/class/class', 'can/control/plugin'],
    function($, Control) {
        /**
         * @class jQuery.Controller
         * @property {Function} extend
         * @property {Object} options
         * @property {jQuery} element
         * @property {Function} on
         * @property {Function} _super
         */
        $.Controller = Control;
        $.fn.controller = $.fn.control;
        $.fn.controllers = $.fn.controls;
        can.Control.prototype.find = can.Control.prototype.find || function(s) {
            return this.element.find(s);
        };
        $.Controller.prototype.bind = $.Controller.prototype.on;
        $.Controller.prototype.delegate = $.Controller.prototype.on;
    }
);
