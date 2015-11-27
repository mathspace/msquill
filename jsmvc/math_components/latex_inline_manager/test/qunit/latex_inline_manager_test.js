/*globals
    equal:false,
    module:false,
    define:false,
    test:false
 */
define([
    'jquery', 
    'funcunit', 
    'can/util/jquery', 
    'qunit', 
    'can/view/mustache', 
    'math_components/latex_inline_manager/latex_inline_manager'
], function($, S, can) {
    'use strict';


    module('mc-latex-inline-manager', {
        setup: function() {
            $('#qunit-test-area').empty();
        },
        tearDown: function() {
            $('#qunit-test-area').empty();
        }
    });

    test('Test code transformation from <mc-answer>',  function() {
        var template = can.view.mustache(
            '<mc-latex-inline-manager values="{mapValue}" layout="{layout}"></mc-latex-inline-manager>'
        );
        var map = new can.Map({
            editable: false,
            mapValue: {
                "1": {"substatus": "correct", "value": ""},
                "2": {"substatus": "correct", "value": ""}
            },
            layout: '<p><mc-answer data-key="1"></mc-answer><mc-answer data-key="2"></mc-answer></p>'
        });
        $('#qunit-test-area').append(template(map));
        var instance = $('mc-latex-inline-manager');
        var result = '<p><mc-latex-editor data-key="1" latex="{values.1.value}" inline="true" class="latex-map-value {{values.1.substatus}}" editable="{editable}"></mc-latex-editor><mc-latex-editor data-key="2" latex="{values.2.value}" inline="true" class="latex-map-value {{values.2.substatus}}" editable="{editable}"></mc-latex-editor></p>';

        equal(result, instance.scope().attr('layout'));
    });

    test('Test code transformation from <mc-answer> 2 (no wrapping p element)',  function() {
        var template = can.view.mustache(
            '<mc-latex-inline-manager values="{mapValue}" layout="{layout}"></mc-latex-inline-manager>'
        );
        var map = new can.Map({
            editable: false,
            mapValue: {
                "1": {"substatus": "correct", "value": ""},
                "2": {"substatus": "correct", "value": ""}
            },
            layout: '<mc-answer data-key="1"></mc-answer><mc-answer data-key="2"></mc-answer>'
        });
        $('#qunit-test-area').append(template(map));
        var instance = $('mc-latex-inline-manager');
        var result = '<mc-latex-editor data-key="1" latex="{values.1.value}" inline="true" class="latex-map-value {{values.1.substatus}}" editable="{editable}"></mc-latex-editor><mc-latex-editor data-key="2" latex="{values.2.value}" inline="true" class="latex-map-value {{values.2.substatus}}" editable="{editable}"></mc-latex-editor>';

        equal(result, instance.scope().attr('layout'));
    });
});
