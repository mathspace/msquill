/*global OpenAjax: true */

define(
    ['jquery', 'can/util/jquery', 'can/model', 'can/map/attributes', 'can/map/elements'],
    function($, can){
        $.Model = can.Model;

        $.Model.prototype.update = function( attrs, success, error ) {
            can.dev.log('$.Model.update is deprecated. You can use attr + save instead.');
            this.attr(attrs);
            return this.save(success, error);
        };
    }
);
