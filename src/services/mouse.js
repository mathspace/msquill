/********************************************************
 * Deals with mouse events for clicking, drag-to-select
 *******************************************************/

Controller.open(function(_) {
  /**
   * 
   */
  _.delegateMouseEvents = function() {
    var ultimateRootjQ = this.root.jQ;
    //drag-to-select event handling
    this.container.bind('mousedown.mathquill', function(e) {
      // finds the closest parent root block to get an instance of Controller.
      // If none exists, fallback to ultimate root controller
      var rootjQ = $(e.target).closest('.mq-root-block'); 
      var root = Node.byId[rootjQ.attr(mqBlockId) || ultimateRootjQ.attr(mqBlockId)];
      var ctrlr = root.controller, 
          cursor = ctrlr.cursor, 
          blink = cursor.blink;
      var textareaSpan = ctrlr.textareaSpan, 
          textarea = ctrlr.textarea;

      var target;

      { // -- MATHSPACE Handle our inline-editable fields.
        // Get a reference to the MathQuill API via the ultimate root.
        var ultimateRoot = Node.byId[ultimateRootjQ.attr(mqBlockId)];
        var ultimateRootAPI = ultimateRoot.controller.API;
        if ((ultimateRootAPI instanceof MathQuill.StaticMath && $(e.target).parents(".mq-inner-editable").length) || // If the ultimate root is readonly (StaticMath)
          // and you clicked inside the editable box
          ctrlr.API.latex().indexOf("\\editable{") > -1) {
          // or if the selected element contains latex matching '\editable{'
          // ignore the event (no blinking cursor)
          return;
        }
      } // -- MATHSPACE

      function mousemove(e) { target = $(e.target); }
      
      function docmousemove(e) {
        // This seems like an edge case hack where a selection can start 
        // from outside the bounds of mathquill
        if (!cursor.anticursor) cursor.startSelection();

        // Regardless of position, if a drag event has occured,
        // seek to that position
        ctrlr.seek(target, e.pageX, e.pageY).cursor.select();

        // Make sure seek (defined below) does not execute when 
        // the cursor is outside of the mathquill area
        target = undefined;
      }
      // outside rootjQ, the MathQuill node corresponding to the target (if any)
      // won't be inside this root, so don't mislead Controller::seek with it
      function mouseup(e) {
        cursor.blink = blink;
        if (!cursor.selection) {
          if (ctrlr.editable) {
            cursor.show();
          }
          else {
            textareaSpan.detach();
          }
        }

        // delete the mouse handlers now that we're not dragging anymore
        rootjQ.unbind('mousemove', mousemove);
        $(e.target.ownerDocument).unbind('mousemove', docmousemove).unbind('mouseup', mouseup);
      }

      if (ctrlr.blurred) {
        if (!ctrlr.editable) rootjQ.prepend(textareaSpan);
        textarea.focus();
      }
      e.preventDefault(); // doesn't work in IE≤8, but it's a one-line fix:
      e.target.unselectable = true; // http://jsbin.com/yagekiji/1

      cursor.blink = noop;
      ctrlr.seek($(e.target), e.pageX, e.pageY).cursor.startSelection();

      rootjQ.mousemove(mousemove);

      // We want to make sure that we capture mouseup events even if the user's mouse 
      // is outside the mathquill container. This is common when clicking and dragging (as selection)
      $(e.target.ownerDocument).mousemove(docmousemove).mouseup(mouseup);
      // listen on document not just body to not only hear about mousemove and
      // mouseup on page outside field, but even outside page, except iframes: https://github.com/mathquill/mathquill/commit/8c50028afcffcace655d8ae2049f6e02482346c5#commitcomment-6175800
    });
  }
});

Controller.open(function(_) {
  _.seek = function(target, pageX, pageY) {
    var cursor = this.cursor;
    // Notify all listeners bound to the Controller that 
    // a selection has started
    this.notify('select')
    if (target) {
      // Grab a reference to the nodeId. This will be used to get a 
      // reference to the Node in the virtual "dom" tree
      var nodeId = target.attr(mqBlockId) || target.attr(mqCmdId);
      if (!nodeId) {
        var targetParent = target.parent();
        nodeId = targetParent.attr(mqBlockId) || targetParent.attr(mqCmdId);
      }
    }
    // If our node doesn't have an id for some reason, fallback to the root 
    // of the mathquill instance (defined in PublicApis)
    var node = nodeId ? Node.byId[nodeId] : this.root;
    pray('nodeId is the id of some Node that exists', node);

    // don't clear selection until after getting node from target, in case
    // target was selection span, otherwise target will have no parent and will
    // seek from root, which is less accurate (e.g. fraction)
    cursor.clearSelection().show();

    node.seek(pageX, cursor);
    this.scrollHoriz(); // before .selectFrom when mouse-selecting, so
                        // always hits no-selection case in scrollHoriz and scrolls slower
    return this;
  };
});
