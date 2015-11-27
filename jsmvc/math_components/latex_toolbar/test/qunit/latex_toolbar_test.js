/*globals
    equal:false,
    module:false,
    define:false,
    start:false,
    test:false
 */
define([
    'jquery', 
    'funcunit', 
    'can/util/jquery', 
    'qunit', 
    'can/view/mustache', 
    'math_components/latex_toolbar/latex_toolbar'
], function($, S, can) {
    'use strict';


    module('mc-latex-toolbar', {
        setup: function() {
            $('#qunit-test-area').empty();
        },
        tearDown: function() {
            $('#qunit-test-area').empty();
        }
    });

    var toolbarButtons = [
        'AUTO_EQUATION'
    ];

    test('Toolbar will rendered correctly', 2, function() {
        var template = can.view.mustache(
            '<mc-latex-toolbar toolbar="{toolbarButtons}">' +
            '</mc-latex-toolbar>'
        );
        var map = new can.Map({
            toolbarButtons: toolbarButtons
        });
        $('#qunit-test-area').append(template(map));

        equal($('.math_toolbar_button_strip').length, 1);
        equal($('.math_toolbar_button_strip > .button').length, 8);
    });


    test('Click on toolbar button will emit relevant event', 2, function(){
        var $testArea = $('#qunit-test-area');
        var template = can.view.mustache(
            '<mc-latex-toolbar toolbar="{toolbarButtons}">' +
            '</mc-latex-toolbar>'
        );
        var map = new can.Map({
            toolbarButtons: toolbarButtons
        });
        $testArea.append(template(map));

        $testArea.one('buttonClick.mc-latex-toolbar', function(ev, command){
            equal(command.name, 'writeLatex');
            equal(command.args[0], '+');
        });

        S('.button.add').exists().click();
    });
});
