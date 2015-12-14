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
        assert.equal(rootBlock.jQ.children(':first').text().charCodeAt(0), 9651);
    });

    test('congruent', function() {
        mq.typedText('\\cong');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text().charCodeAt(0), 8801);
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

    test('less than or equal to', function() {
        mq.typedText('<=');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text().charCodeAt(0), 8804);
    });

    test('greater than or equal to', function() {
        mq.typedText('>=');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text().charCodeAt(0), 8805);
    });

    test('congruent', function() {
        mq.typedText('==');
        mq.keystroke('Tab');
        assert.equal(rootBlock.jQ.children(':first').text().charCodeAt(0), 8801);
    });
});
