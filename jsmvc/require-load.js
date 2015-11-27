/**
 * This script allows DRY loading of RequireJS modules, automatically including
 * `require.js` and `require-config.js` and calculating `baseUrl`.
 * This reduces boilerplate in each HTML page.
 *
 *
 * Example of loading a main module, `app/main.js`:
 *
 *   <script src="../require-load.js" data-load-main="app/main">
 *
 *
 * Example of loading an inline main module:
 *
 *   <script src-"../require-load.js">
 *   <script>
 *       require(['jquery', 'some/model'], function($, Model) {
 *           // do things
 *       });
 *   </script>
 *
 */
/*globals require */
(function() {
    'use strict';

    // Configurable paths, relative to baseUrl.
    var requireJsPath = 'requirejs/require.js';
    var requireLoadPath = 'require-load.js'; // This script.

    // Internal.
    // Stores any require() call arguments, for playback after RequireJS loads.
    var requireQueue = [];

    function main() {
        // Get the script tag for this script.
        var requireLoadScript = getRequireLoadScript();

        // Get reference to the <head> tag.
        var headTag = document.getElementsByTagName('head')[0];

        // Calculate the baseUrl.
        var baseUrl = getBaseUrl(requireLoadScript);

        // Inject our own `require()` to queue up calls that occur while we
        // wait for RequireJS to load.
        injectFakeRequire();

        // Inject a <script> tag to load RequireJS.
        var absoluteRequireJsPath = baseUrl + requireJsPath;
        var requireJsScript = injectScriptTag(absoluteRequireJsPath, headTag);

        // Handler for when RequireJS has finished loading.
        requireJsScript.addEventListener('load', function() {

            // Find name of main module from the `data-main` attribute.
            var mainModule = getMainModule(requireLoadScript);

            // Go reinstall the actual require().
            replaceFakeRequireWithRealRequire();

            // Set path to find JS modules.
            require.config({
                baseUrl: baseUrl
            });
            // Load config first.
            require(['require-config'], function() {
                // Now load main module.
                require(mainModule ? [mainModule] : [], function() {
                    // Play any `require()` calls that were queued up before
                    // RequireJS was loaded.
                    playRequireQueue();
                });
            });
        }, false);
    }

    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function getBaseUrl(requireLoadScript) {
        var src = requireLoadScript.src;
        return src.replace(requireLoadPath, '');
    }

    function getMainModule(requireLoadScript) {
        return requireLoadScript.getAttribute('data-load-main');
    }

    function getRequireLoadScript() {
        var requireLoadScript = null;
        var findRegex = new RegExp(requireLoadPath);
        eachReverse(getScripts(), function(script) {
            if (findRegex.test(script.src)) {
                return (requireLoadScript = script);
            }
        });
        return requireLoadScript;
    }

    function getScripts() {
        return document.getElementsByTagName('script');
    }

    function injectScriptTag(src, headTag) {
        var node = document.createElement('script');
        node.charset = 'utf-8';
        node.type = 'text/javascript';
        node.src = src;
        headTag.appendChild(node);
        return node;
    }

    function addToRequireQueue() {
        requireQueue.push(Array.prototype.slice.apply(arguments));
    }

    function injectFakeRequire() {
        window.require = addToRequireQueue;
    }

    function replaceFakeRequireWithRealRequire() {
        if (window.require === addToRequireQueue) {
            window.require = window.requirejs;
        }
    }

    function playRequireQueue() {
        requireQueue.forEach(function(args) {
            // This is expected to be the real `require()`:
            window.require.apply(window, args);
        });
    }

    main();

})();
