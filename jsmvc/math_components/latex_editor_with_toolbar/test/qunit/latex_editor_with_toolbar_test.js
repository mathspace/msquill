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
    'math_components/latex_editor_with_toolbar/latex_editor_with_toolbar'
], function($, S, can) {
    'use strict';

    module('mc-latex-editor-with-toolbar', {
        setup: function() {
            $('#qunit-test-area').empty();
        },
        tearDown: function(){
            $('#qunit-test-area').empty();
        }
    });

    var toolbar = [
        'AUTO_EQUATION'
    ];



    test('Editor will display latex editor and toolbar', 2, function() {
        var template = can.view.mustache(
            '<mc-latex-editor-with-toolbar toolbar="{toolbar}">' +
            '</mc-latex-editor-with-toolbar>'
        );
        var map = new can.Map({
            toolbar : toolbar
        });
        $('#qunit-test-area').append(template(map));

        equal($('mc-latex-editor').length, 1);
        equal($('mc-latex-toolbar').length, 1);
    });


    test('Size of toolbar should be same as the size of input box', 1, function(){
        var $testArea = $('#qunit-test-area');
        var template = can.view.mustache(
            '<mc-latex-editor-with-toolbar toolbar="{toolbar}">' +
            '</mc-latex-editor-with-toolbar>'
        );
        var map = new can.Map({
            toolbar: toolbar
        });
        $testArea.append(template(map));

        S('mc-latex-editor').exists(function(){
            // toolbar has padding
            equal($('mc-latex-editor').width(),
                $('mc-latex-toolbar').outerWidth());
        });


    });

    test('Prefix and Suffix displays properly when provided', 2, function(){
        var template = can.view.mustache(
            '<mc-latex-editor-with-toolbar editable="true" prefix="1" suffix="$" >' +
            '</mc-latex-editor-with-toolbar>'
        );
        var data = new can.Map({});
        $('#qunit-test-area').append(template(data));

        S('.prefix').exists(function(){
            ok(!$('.prefix').hasClass('invisible'));
        });
        S('.suffix').exists(function(){
            ok(!$('.suffix').hasClass('invisible'));
        });
    });
});
