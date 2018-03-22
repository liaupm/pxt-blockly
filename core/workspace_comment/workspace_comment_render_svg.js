/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.WorkspaceCommentSvg');


/**
 * Size of the resize icon.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.RESIZE_SIZE = 8;

/**
 * Radius of the border around the comment.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.BORDER_RADIUS = 0;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET = 2;

/**
 * Offset from the top to make room for a top bar.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.TOP_OFFSET = 20;

/**
 * Returns a bounding box describing the dimensions of this comment.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
Blockly.WorkspaceCommentSvg.prototype.getHeightWidth = function() {
  return { width: this.getWidth(), height: this.getHeight() };
};

Blockly.WorkspaceCommentSvg.prototype.render = function() {
  if (this.rendered_) {
    return;
  }

  var size = this.getHeightWidth();

  // Add text area
  // TODO: Does this need to happen every time?  Or are we orphaning foreign
  // elements in the code?
  this.createEditor_();
  this.svgGroup_.appendChild(this.foreignObject_);

  this.svgHandleTarget_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyCommentHandleTarget',
        'fill': 'transparent',
        'x': 0,
        'y': 0
      });
  this.svgGroup_.appendChild(this.svgHandleTarget_);
  this.svgRectTarget_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyCommentTarget',
        'x': 0,
        'y': 0,
        'rx': Blockly.WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_RADIUS
      });
  this.svgGroup_.appendChild(this.svgRectTarget_);

  // Add the resize icon
  this.addResizeDom_();
  if (this.isDeletable()) {
    // Add the delete icon
    this.addDeleteDom_();
  }

  this.setSize_(size.width, size.height);

  // Set the content
  this.textarea_.value = this.content_;

  this.rendered_ = true;

  if (this.resizeGroup_) {
    Blockly.bindEventWithChecks_(
        this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
  }

  if (this.isDeletable()) {
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseup', this, this.deleteMouseUp_);
  }
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject class="blocklyCommentForeignObject" x="0" y="10" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.createSvgElement(
      'foreignObject',
      {
        'x': 0,
        'y': Blockly.WorkspaceCommentSvg.TOP_OFFSET,
        'class': 'blocklyCommentForeignObject'
      },
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(
      /* eslint-disable no-unused-vars */ e
      /* eslint-enable no-unused-vars */) {
    if (this.content_ != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.block_, 'comment', null, this.content_, textarea.value));
      this.content_ = textarea.value;
    }
  });
  return this.foreignObject_;
};

/**
 * Add the resize icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addResizeDom_ = function() {
  this.resizeGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'
      },
      this.svgGroup_);
  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  Blockly.utils.createSvgElement(
      'polygon',
      {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
      this.resizeGroup_);
  Blockly.utils.createSvgElement(
      'line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3
      }, this.resizeGroup_);
  Blockly.utils.createSvgElement(
      'line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3
      }, this.resizeGroup_);
};

/**
 * Add the delete icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addDeleteDom_ = function() {
  var iconColor = '#fff';
  this.deleteGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': 'blocklyCommentDeleteIcon'
      },
      this.svgGroup_);
  this.deleteIconBorder_ = Blockly.utils.createSvgElement('rect',
      {
        'x': '-2', 'y': '1',
        'width': '17', 'height': '17',
        'fill': 'transparent',
        'class': 'blocklyDeleteIconShape'
      },
      this.deleteGroup_);
  var deleteIconGroup = Blockly.utils.createSvgElement('g',
      {
        'transform': 'scale(0.8) translate(1, 3)'
      },
      this.deleteGroup_);
  // Lid
  var topX = 1;
  var topY = 2;
  var binWidth = 12;
  var binHeight = 12;
  Blockly.utils.createSvgElement(
      'rect',
      {
        'x': topX + (binWidth/2) - 2, 'y': topY,
        'width': '4', 'height': '2',
        'stroke': iconColor,
        'stroke-width': '1',
        'fill': 'transparent'
      },
      deleteIconGroup);
  // Top line.
  var topLineY = topY + 2;
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': topX, 'y1': topLineY,
        'x2': topX + binWidth, 'y2': topLineY,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  // Rect
  Blockly.utils.createSvgElement(
      'rect',
      {
        'x': topX + 1, 'y': topLineY,
        'width': topX + binWidth - 3, 'height': binHeight,
        'rx': '1', 'ry': '1',
        'stroke': iconColor,
        'stroke-width': '1',
        'fill': 'transparent'
      },
      deleteIconGroup);
  // ||| icon.
  var x = 5;
  var y1 = topLineY + 3;
  var y2 = topLineY + binHeight - 3;
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x, 'y1': y1,
        'x2': x, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x+2, 'y1': y1,
        'x2': x+2, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x+4, 'y1': y1,
        'x2': x+4, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
};

/**
 * Handle a mouse-down on comment's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseDown_ = function(e) {
  //this.promote_();
  this.unbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace.startDrag(e, new goog.math.Coordinate(
    this.workspace.RTL ? -this.width_ : this.width_, this.height_));

  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mouseup', this, this.resizeMouseUp_);
  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', this, this.resizeMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseDown_ = function(e) {
  // highlight the delete icon
  Blockly.utils.addClass(
      /** @type {!Element} */ (this.deleteIconBorder_), 'blocklyDeleteIconHighlighted');
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-out on comment's delete icon.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseOut_ = function(/*e*/) {
  // restore highlight on the delete icon
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.deleteIconBorder_), 'blocklyDeleteIconHighlighted');
};

/**
 * Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment
  this.dispose(true, true);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.unbindDragEvents_ = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/*
 * Handle a mouse-up event while dragging a comment's border or resize handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseUp_ = function(/*e*/) {
  Blockly.Touch.clearTouchIdentifier();
  this.unbindDragEvents_();
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var newXY = this.workspace.moveDrag(e);
  this.setSize_(this.RTL ? -newXY.x : newXY.x, newXY.y);
};

/**
 * Callback function triggered when the comment has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeComment_ = function() {
  var size = this.getHeightWidth();
  var topOffset = Blockly.WorkspaceCommentSvg.TOP_OFFSET;
  var textOffset = Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET * 2;

  this.foreignObject_.setAttribute('width',
      size.width);
  this.foreignObject_.setAttribute('height',
      size.height - topOffset);
  if (this.RTL) {
    this.foreignObject_.setAttribute('x',
        -size.width);
  }
  this.textarea_.style.width =
      (size.width - textOffset) + 'px';
  this.textarea_.style.height =
      (size.height - textOffset - topOffset) + 'px';
};

/**
 * Set size
 * @param {number} width width of the container
 * @param {number} height height of the container
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setSize_ = function(width, height) {
  // Minimum size of a comment.
  width = Math.max(width, 45);
  height = Math.max(height, 20 + Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  this.width_ = width;
  this.height_ = height;
  this.svgRect_.setAttribute('width', width);
  this.svgRect_.setAttribute('height', height);
  this.svgRectTarget_.setAttribute('width', width);
  this.svgRectTarget_.setAttribute('height', height);
  this.svgHandleTarget_.setAttribute('width', width);
  this.svgHandleTarget_.setAttribute('height', Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  if (this.RTL) {
    this.svgRect_.setAttribute('transform', 'scale(-1 1)');
    this.svgRectTarget_.setAttribute('transform', 'scale(-1 1)');
  }

  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  if (this.resizeGroup_) {
    if (this.RTL) {
      // Mirror the resize group.
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (-width + resizeSize) + ',' + (height - resizeSize) + ') scale(-1 1)');
      this.deleteGroup_.setAttribute('transform', 'translate(' +
        (-width + (2 * resizeSize)) + ',' + (0) + ') scale(-1 1)');
    } else {
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - resizeSize) + ',' +
        (height - resizeSize) + ')');
      this.deleteGroup_.setAttribute('transform', 'translate(' +
        (width - (2 * resizeSize)) + ',' +
        (0) + ')');
    }
  }

  // Allow the contents to resize.
  this.resizeComment_();
};

/**
 * Dispose of any rendered comment components.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.disposeInternal_ = function() {
  this.textarea_ = null;
  this.foreignObject_ = null;
  this.svgRectTarget_ = null;
  this.svgHandleTarget_ = null;
};

/**
 * Set the focus on the text area.
 * @public
 */
Blockly.WorkspaceCommentSvg.prototype.setFocus = function() {
  this.focused_ = true;
  var textarea = this.textarea_;
  this.svgRectTarget_.style.fill = "none";
  this.svgHandleTarget_.style.fill = "transparent";
  setTimeout(function() {
    textarea.focus();
  }, 0);
  this.addFocus();
};

/**
 * Remove focus from the text area.
 * @public
 */
Blockly.WorkspaceCommentSvg.prototype.blurFocus = function() {
  this.focused_ = false;
  var textarea = this.textarea_;
  this.svgRectTarget_.style.fill = "transparent";
  this.svgHandleTarget_.style.fill = "none";
  setTimeout(function() {
    textarea.blur();
  }, 0);
  this.removeFocus();
};