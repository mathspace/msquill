suite('Mathspace Features: Thousand Separator', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function() {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });
    teardown(function() {
        $(mq.el()).remove();
    });

    test('thousand separators: 1000', function() {
        mq.latex('1000');
        var thousandElm = rootBlock.jQ.children('span:first');
        assert.equal(thousandElm.attr('class'), 'thousands-separator-after');
    });

    test('thousand separators: 11.000', function() {
        mq.latex('11.000');
        // Test no thousand seperator
        assert.equal(rootBlock.jQ.children('.thousands-separator-after').length, 0);
    });

    test('thousand separators: 11.2345', function() {
        mq.latex('11.2345');
        assert.equal(rootBlock.jQ.children('.thousands-separator-after').length, 1);
        assert.equal(rootBlock.jQ.find('.thousands-separator-after').text(), '4');
    });

    test('thousand separators: .1', function() {
        mq.latex('.1');
        // Code should not break
        assert.equal(mq.latex(), '.1');
    });
});


suite('Mathspace Features: Nested inline editable', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function() {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0], {
            autoCommands: 'pi sum'
        });
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });
    teardown(function() {
        $(mq.el()).remove();
    });

    test('can create nested editable box using \\editable{}', function() {
        mq.latex('x+\\editable{}');
        assert.equal(rootBlock.jQ.children('.mq-inner-editable').length, 1);
    });

    test('nested ediable latex should contain \\editable{}', function() {
        mq.latex('\\editable{1}');
        assert.equal(mq.latex(), '\\editable{1}');
    });

    test('delete nested editable box contents should not modify outside the box', function() {
        mq.latex('\\editable{1}+2');
        rootBlock.jQ.find('.mq-inner-editable').trigger('mousedown');
        mq.keystroke('Backspace');
        assert.equal(mq.latex(), '\\editable{}+2');
    });

    test('write() should write within nested editable box', function() {
        mq.latex('\\editable{}+\\editable{}');
        mq.write('1');
        assert.equal(mq.latex(), '\\editable{1}+\\editable{}');
    });

    test('cmd() should write within nested editable box', function() {
        mq.latex('\\editable{}+\\editable{}');
        mq.cmd('\\pi');
        assert.equal(mq.latex(), '\\editable{\\pi}+\\editable{}');
    });

    test('typedText() should write within nested editable box', function() {
        mq.latex('\\editable{}+\\editable{}');
        mq.typedText('a');
        assert.equal(mq.latex(), '\\editable{a}+\\editable{}');
    });

    test('keystroke() should write within nested editable box', function() {
        mq.latex('\\editable{1}+\\editable{}');
        mq.keystroke('Backspace');
        assert.equal(mq.latex(), '\\editable{}+\\editable{}');
    });

    test('mousedown outside editable area doesnt activate cursor', function() {
      mq.latex('\\editable{}+\\editable{}');
      rootBlock.jQ.find('.mq-binary-operator').trigger('mousedown').trigger('mouseup');
      assert.equal(rootBlock.jQ.find('.mq-cursor').length, 0,
        'Cursor was created outside editable areas');
    });

    test('autoCommands should work inside nested editable field', function(){
        mq.latex('\\editable{}');
        mq.typedText('pi');
        assert.equal(mq.latex(), '\\editable{\\pi}');
    });

    test('readonly editalbe box should not activate cursor when tapped', function() {
        $(mq.el()).remove();
        mq = MathQuill.StaticMath($('<span>\\editable{} + 1</span>').appendTo('#mock')[0], {
            autoCommands: 'pi sum'
        });
        rootBlock = mq.__controller.root;
        var field = rootBlock.jQ.find('.mq-inner-editable .mq-root-block');
        assert.equal(field.length, 1);

        field.trigger('mousedown').trigger('mouseup');
        // This indicates no element was focused
        assert.equal(rootBlock.jQ.find('.mq-focused').length, 0);
    });

});

suite('Mathspace Features: Custom Latex Symbols', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function() {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function() {
        $(mq.el()).remove();
    });

    test('triangle', function() {
        mq.typedText('\\triangle');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text(), '△');
    });

    test('congruent', function() {
        mq.typedText('\\cong');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text(), '≡');
    });

    test('degree', function() {
        mq.typedText('\\deg');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text(), '°');
    });

    test('percent latex should not have backslash', function() {
        mq.typedText('%');
        assert.equal(mq.latex(), '%');
    });

    test('* should be times, not dot', function() {
        mq.typedText('*');
        assert.equal(rootBlock.jQ.children(':first').text(), '×');
    });

    test('similar symbol', function() {
        mq.typedText('\\simeq');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text(), '⫻');
    });

    test('overrightarrow', function() {
        mq.typedText('\\overrightarrow');
        mq.keystroke('Tab');
        mq.typedText('A');
        assert.equal(mq.latex(), '\\overrightarrow{A}');

    });

    test('hat symbol', function() {
        mq.typedText('\\hat');
        mq.keystroke('Tab');
        mq.typedText('C');
        assert.equal(mq.latex(), '\\hat{C}');
        assert.equal(rootBlock.jQ.find('.mq-hat-inner').length, 1);
    });

    test('limit', function() {
        mq.typedText('\\lim');
        mq.keystroke('Tab');
        mq.typedText('A');
        mq.keystroke('Right');
        mq.typedText('B');
        assert.equal(mq.latex(), '\\lim{A}{B}');
        assert.equal(rootBlock.jQ.find('.mq-large-operator').length, 1);
    });

    test('integral limits', function() {
        mq.typedText('\\definite');
        mq.keystroke('Tab');
        mq.typedText('1');
        mq.keystroke('Right');
        mq.typedText('2');
        mq.keystroke('Right');
        mq.typedText('3');
        assert.equal(mq.latex(), '\\definite{1}{2}{3}');
        assert.equal(rootBlock.jQ.find('.mq-integral-limits').length, 1);
        assert.equal(rootBlock.jQ.find('.mq-paren-close').length, 1);
    });
});

suite('Mathspace Features: Special key events', function() {

    var mq;
    var rootBlock;
    var controller;
    setup(function () {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function () {
        $(mq.el()).remove();
    });

    test('Disable $', function() {
        var container = rootBlock.jQ.parent();
        var textarea = container.find('textarea');
        var event = jQuery.Event('keydown', {
            which: 52, shiftKey:true
        });
        container.keydown(function(e) {
            assert.fail('This keydown event should not trigger');
        });
        textarea.val('$').trigger(event);
    });

    test('4 should not be blocked', function() {
        var container = rootBlock.jQ.parent();
        var textarea = container.find('textarea');
        var event = jQuery.Event('keydown', {
            which: 52, shiftKey: false
        });
        container.keydown(function(e) {
            assert.equal(e.which, 52);
        });
        textarea.val('4').trigger(event);
    });
});


suite('Mathspace Features: Custom Latex Commands', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function () {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function () {
        $(mq.el()).remove();
    });

    test('nPr', function() {
        // Test empty nPr
        mq.typedText('\\nPr');
        mq.keystroke('Tab');
        assert.equal(mq.latex(), '\\nPr{}{}');

        // Test filling up nPr
        mq.typedText('1');
        mq.keystroke('Right');
        mq.typedText('2');
        assert.equal(mq.latex(), '\\nPr{1}{2}');
    });

    test('nCr', function() {
        mq.typedText('\\nCr');
        mq.keystroke('Tab');
        assert.equal(mq.latex(), '\\nCr{}{}');

        // Test filling up nCr
        mq.typedText('1');
        mq.keystroke('Right');
        mq.typedText('2');
        assert.equal(mq.latex(), '\\nCr{1}{2}');
    });
});


suite('Mathspace Features: Custom Binary Operators', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function () {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function () {
        $(mq.el()).remove();
    });

    test('comma should have mq-comma class', function() {
        // comma needs to have mq-comma class
        // so it will adds extra white space after it
        mq.typedText(',');
        assert.equal(mq.latex(), ',');
        assert.equal(rootBlock.jQ.find('.mq-comma').length, 1);
    });
});


suite('Mathspace Features: Inequality Shortcut Keys', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function() {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function() {
        $(mq.el()).remove();
    });

    test('typing less than or equal to', function() {
        mq.typedText('<=');
        assert.equal(rootBlock.jQ.children(':first').text(), '≤');
    });

    test('rendering less than or equal to', function() {
        mq.latex('<=');
        assert.equal(rootBlock.jQ.children(':first').text(), '≤');
    });

    test('typing greater than or equal to', function() {
        mq.typedText('>=');
        assert.equal(rootBlock.jQ.children(':first').text(), '≥');
    });

    test('typing greater than or equal to', function() {
        mq.latex('>=');
        assert.equal(rootBlock.jQ.children(':first').text(), '≥');
    });

    test('typing congruent', function() {
        mq.typedText('==');
        assert.equal(rootBlock.jQ.children(':first').text(), '≡');
    });

    test('rendering congruent', function() {
        mq.latex('==');
        assert.equal(rootBlock.jQ.children(':first').text(), '≡');
    });
});

suite('Mathspace Patches: General MathQuill Bugs', function() {
    var mq;
    var rootBlock;
    var controller;
    setup(function () {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });

    teardown(function () {
        $(mq.el()).remove();
    });

    test('Ctrl-Shift-Backspace error on Mac', function() {
        mq.typedText('a');
        mq.keystroke('Ctrl-Shift-Backspace');
        assert.equal(mq.latex(), '');
    });

});

suite('Mathspace Features: disableBackslash option', function() {
    var mq, rootBlock, cursor;
    test('backslash allows direct latex input by default', function () {
        mq = MathQuill.MathField( $('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        cursor = mq.__controller.cursor;
        var container = rootBlock.jQ.parent();
        var textarea = container.find('textarea');

        // check event firing
        var event = jQuery.Event('keydown', { which: 220 });
        container.keydown(function(e) {
            assert.equal(e.which, 220);
        });
        textarea.val('\\').trigger(event);

        $(mq.el()).remove();
    })

    test('backslash has no effect when disabled', function () {
        var opts = { preventBackslash: true };
        mq = MathQuill.MathField( $('<span></span>').appendTo('#mock')[0], opts);
        rootBlock = mq.__controller.root;
        cursor = mq.__controller.cursor;
        var container = rootBlock.jQ.parent();
        var textarea = container.find('textarea');

        // check event firing
        var event = jQuery.Event('keydown', { which: 220 });
        container.keydown(function(e) {
            assert.fail('This keydown event should not trigger: ' + e.which);
        });
        textarea.val('\\').trigger(event);

        $(mq.el()).remove();
    });

    test('backslash has no effect when globally set to true', function () {
        MathQuill.config({ preventBackslash: true });

        mq = MathQuill.MathField( $('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        cursor = mq.__controller.cursor;
        var container = rootBlock.jQ.parent();
        var textarea = container.find('textarea');

        // check event firing
        var event = jQuery.Event('keydown', { which: 220 });
        container.keydown(function(e) {
            assert.fail('This keydown event should not trigger: ' + e.which);
        });
        textarea.val('\\').trigger(event);

        $(mq.el()).remove();
    });
});

suite('Mathspace Features: AutoOperator "and" / "or" Support', function () {
    var mq;
    var rootBlock;
    var controller;
    var mqStatic;
    setup(function () {
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0], {
            autoOperatorNames: [
                'and', 'or'
            ].join(' ')
        });
        rootBlock = mq.__controller.root;
        controller = mq.__controller;

        mqStatic = MathQuill.StaticMath($('<span></span>').appendTo('#mock')[0], {
            autoOperatorNames: [
                'and', 'or'
            ].join(' ')
        });
        rootStatic = mqStatic.__controller.root;
        controller = mqStatic.__controller;
    });

    teardown(function () {
        $(mq.el()).remove();
    });

    test('display field rendering of "and"', function () {
        mqStatic.latex('\\operatorname{and}');
        assert.equal(rootStatic.jQ.find('.mq-operator-name').length, 3);
    });

    test('display field rendering of "or"', function () {
        mqStatic.latex('\\operatorname{or}');
        assert.equal(rootStatic.jQ.find('.mq-operator-name').length, 2);
    });

    test('editable field rendering of "and"', function () {
        mq.typedText('and');
        assert.equal(rootBlock.jQ.find('.mq-operator-name').length, 3);
    });

    test('editable field rendering of "or"', function () {
        mq.typedText('or');
        assert.equal(rootBlock.jQ.find('.mq-operator-name').length, 2);
    });
});
