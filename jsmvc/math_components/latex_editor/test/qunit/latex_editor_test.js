/*globals
    equal:false,
    module:false,
    define:false,
    test:false,
    ok:false
 */
define([
    'jquery', 
    'funcunit', 
    'can/util/jquery', 
    'qunit', 
    'can/view/mustache', 
    'math_components/latex_editor/latex_editor'
], function($, S, can) {
    'use strict';


    module('mc-latex-editor', {
        setup: function() {
            $('#qunit-test-area').empty();
        },
        teardown:function() {
            $('#qunit-test-area').empty();
        }

    });


    test('it will render a readonly latex', function() {
        var template = can.view.mustache(
            '<mc-latex-editor latex="{expression}"></mc-latex-editor>'
        );
        var data = new can.Map({
            expression: 'c \\times d'
        });
        $('#qunit-test-area').append(template(data));

        equal($('.mathquill-rendered-math').length, 1);
    });


    test('inline mode will not display placeholder text', 1, function(){
        var template = can.view.mustache(
            '<mc-latex-editor inline="true" editable="true" latex="">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({});
        $('#qunit-test-area').append(template(data));

        S('.math-input-label').exists(function(){
            ok(S('.math-input-label').hasClass('invisible'));
        });
    });

    test('it can trigger latex update through event', 1, function(){
        var template = can.view.mustache(
            '<mc-latex-editor editable="true">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({});
        $('#qunit-test-area').append(template(data));

        var commandObject = {
            name: 'writeLatex',
            args: ['+']
        };
        $('#qunit-test-area').find('mc-latex-editor')
            .trigger('command.mc-latex-editor',commandObject);

        var plusSymbol = $('.mathquill-element > span:nth-child(2)');
        equal(plusSymbol.text(), '+');
    });

    test('it receives keyboard event properly (write pi)', 2, function() {
        var template = can.view.mustache(
            '<mc-latex-editor editable="true">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({});
        $('#qunit-test-area').append(template(data));
        $('#qunit-test-area').find('mc-latex-editor')
            .trigger('key.uc-shortcut-keys', 'p');
        var piSymbol = $('.mathquill-element > span:nth-child(2)');

        ok(piSymbol.hasClass('nonSymbola'));
        equal(piSymbol.text(), 'π');
    });

    // this should not auto focus, we should do this consistently
    // it should focus imperatively, or some input will unnecessarily
    // focus twice
    //test('It should auto focus on input after initialisation under editable mode', 1, function() {
    //    var template = can.view.mustache(
    //        '<mc-latex-editor editable="true">' +
    //        '</mc-latex-editor>'
    //    );
    //    var data = new can.Map({});
    //    $('#qunit-test-area').append(template(data));
    //    S.wait(0, function(){
    //        ok($('.mathquill-container').hasClass('hasCursor'));
    //    });
    //});

    test('if latex contains inline editables, the border should not display regardlessly', function(){
        var template = can.view.mustache(
            '<mc-latex-editor latex="\\editable{}" editable="true">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({});
        $('#qunit-test-area').append(template(data));
        S('.mathquill-container').exists(function(){
            equal($('.mathquill-container-border').length, 0);
        });
    });
    

    test('if the editor has no inline editable and is not in inline box mode, the box border should appear if in editable mode', function(){
        var template = can.view.mustache(
            '<mc-latex-editor inline="false" editable="{isEditable}">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({
            'isEditable': true
        });
        $('#qunit-test-area').append(template(data));
        S('.mathquill-container').exists(function(){
            equal($('.mathquill-container-border').length, 1);
        });
    });



    test('focus on inline editable box should working', 1, function(){
        var template = can.view.mustache(
            '<mc-latex-editor latex="{latex}" inline="true" editable="true">' +
            '</mc-latex-editor>'
        );
        var data = new can.Map({
            'latex': '\\editable{3}+\\editable{}'
        });
        $('#qunit-test-area').append(template(data));
        S('.mathquill-container').exists(function(){
            $('mc-latex-editor').trigger('requestFocus');
            S.wait(0, function(){
                ok($('.mathquill-nested-editable:last').hasClass('hasCursor'));
            });
        });
    });

    test('it will render latex correctly when it requires escaping', function() {
        var template = can.view.mustache(
            '<mc-latex-editor latex="{expression}"></mc-latex-editor>'
        );
        var data = new can.Map({
            expression: '1<x'
        });
        $('#qunit-test-area').append(template(data));
        equal($('.mathquill-rendered-math .selectable').text(), '$1<x$');
        equal(
            $('.mathquill-rendered-math').html(),
            '<span class="selectable">$1&lt;x$</span><span>1</span><span class="binary-operator">&lt;</span><var>x</var>'
        );
    });
});
