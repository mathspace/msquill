define([
    'funcunit/qunit',
    'css!funcunit/qunit.css'
], function(QUnit) {

    // on ready because that is when the window is loaded AND when
    // steal has finished
    QUnit.config.autostart = true;
    QUnit.config.autorun = false;
    QUnit.config.reorder = false;
    // MaThSpaCE HacK: Required to integrate Testee, otherwise
    // tests executed from CLI will timeout.
    if (window.Testee) {
        window.Testee.init();
    }


    var appendToBody = function(type, id, html){
        var el = document.createElement(type);
        el.setAttribute("id", id);
        if(html){
            el.innerHTML = html;
        }
        document.body.appendChild( el );
    },
    id = function(id){
        return document.getElementById(id);
    };


    var gCS = window.getComputedStyle;
    window.getComputedStyle = function(elem){
        if(elem.ownerDocument.defaultView && window.getComputedStyle !== elem.ownerDocument.defaultView.getComputedStyle) {
            return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
        }
        try {
            return gCS(elem, null);
        } catch (ex) {
            // Here's to IE 8 and under:
            return elem.currentStyle;
        }
    };

    //var startFile = steal.config("startId"),
    //    title = document.title || (startFile ? startFile.replace(/\/.*/,"") +" tests": "")
    //// set up page if it hasn't been
    //steal("funcunit/qunit/qunit.css!")
    var title = document.title;
    if(!id("qunit-header")){
        appendToBody("h1", "qunit-header", title);
    }
    if(!id("qunit-banner")){
        appendToBody("h2", "qunit-banner");
    }
    if(!id("qunit-testrunner-toolbar")){
        appendToBody("div", "qunit-testrunner-toolbar");
    }
    if(!id("qunit-userAgent")){
        appendToBody("h2", "qunit-userAgent");
    }
    if(!id("test-content")){
        appendToBody("div", "test-content");
    }
    if(!id("qunit-tests")){
        appendToBody("ol", "qunit-tests");
    }
    if(!id("qunit-test-area")){
        appendToBody("div", "qunit-test-area");
    }
    // backwards compatibility
    window.equals = window.equal;
    QUnit.equals = QUnit.equal;
    window.same = window.deepEqual;
    QUnit.same = QUnit.deepEqual;
    window.QUnit = QUnit;

    QUnit.load();

    return QUnit;
});
