/*global
    Helpers:true,
    window:false
*/
define([
], function($){
    "use strict";

    var Helpers =  window.Helpers;

    if (typeof Helpers === 'undefined') {
        window.Helpers = Helpers = {};
    }

    Helpers.keyCodes = {
        'ENTER': 13,
        'BACKSPACE': 8
    };

});