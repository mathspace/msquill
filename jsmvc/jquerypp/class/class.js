//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.
//!steal-clean
define(
 ['jquery', 'can/construct', 'can/construct/proxy', 'can/construct/super'],
 function($, Construct) {
     /**
      * @class jQuery.Class
      * @property {Function} extend
      * @property {Function} _super
      */
     $.Class = Construct;
 }
);
