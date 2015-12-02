suite('Mathspace Features', function() {
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
        mq = MathQuill.MathField($('<span></span>').appendTo('#mock')[0]);
        rootBlock = mq.__controller.root;
        controller = mq.__controller;
    });
    teardown(function() {
        $(mq.el()).remove();
    });

    test('delete nested editable box contents should not modify outside the box', function() {
        mq.latex('\\editable{1}+2');
        rootBlock.jQ.find('.mq-inner-editable').trigger('mousedown');
        mq.keystroke('Backspace');
        assert.equal(mq.latex(), '\\editable{}+2');
    });
});