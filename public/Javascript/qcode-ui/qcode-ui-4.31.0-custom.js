/*
 * This file contains a custom build of qcode-ui JavaScript Libary for Qcode Software Limited.
 *
 * https://github.com/qcode-software/qcode-ui
 *
 * Custom build components:
 *    0.jquery-ui-hacks.js
 *    scrollIntoView() polyfill
 *    jquery.dbFormCombo.js
 *    jquery.dirtyForm.js
 *    jquery.mouseTrack.js
 *    jquery.textrange.js
 *    jquery.utils.js
 *      coalesce
 *      stripHTML
 *      urlSet
 *      urlDataSet
 *      parseBoolean
 *      setZeroTimeout / clearZeroTimeout
 *      isEditingKeyEvent
 *      scrollToElement
 *    jquery.validation.js
 *
 * Copyright (c) 2004-2018, Qcode Software Limited <hackers@qcode.co.uk> 
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of Qcode Software Limited nor the names of its contributors may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/* ==== 0.jquery-ui-hacks.js ==== */
;(function($) {
    if ( $.isFunction($.widget) ) {
	var slice = Array.prototype.slice;

	$.widget.bridge = function( name, object ) {
	    var fullName = object.prototype.widgetFullName || name;
	    $.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
		args = slice.call( arguments, 1 ),
		returnValue = this;
		
		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
		    $.widget.extend.apply( null, [ options ].concat(args) ) :
		    options;

		if ( isMethodCall ) {
		    this.each(function() {
			var methodValue,
			instance = $.data( this, fullName );
			if ( !instance ) {
                            // Create widget with default when method is called before init.
			    $.data( this, fullName, new object( undefined, this ) );
			    instance = $.data( this, fullName );
			}
			if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
			    return $.error( "no such method '" + options + "' for " + name + " widget instance" );
			}
			methodValue = instance[ options ].apply( instance, args );
			if ( methodValue !== instance && methodValue !== undefined ) {
			    returnValue = methodValue && methodValue.jquery ?
				returnValue.pushStack( methodValue.get() ) :
				methodValue;
			    return false;
			}
		    });
		} else {
		    this.each(function() {
			var instance = $.data( this, fullName );
			if ( instance ) {
			    instance.option( options || {} )._init();
			} else {
			    $.data( this, fullName, new object( options, this ) );
			}
		    });
		}

		return returnValue;
	    };
	}
    }
}) (jQuery);

//*******************************************
// Polyfill for smooth scroll behaviour of scrollIntoView()
//******************************************

;(function() {
    'use strict';
  
  // polyfill
  function polyfill() {
    // aliases
    var w = window;
    var d = document;
  
    // return if scroll behavior is supported and polyfill is not forced
    if (
      'scrollBehavior' in d.documentElement.style &&
      w.__forceSmoothScrollPolyfill__ !== true
    ) {
      return;
    }
  
    // globals
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;
  
    // object gathering original scroll methods
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elementScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };
  
    // define timing method
    var now =
      w.performance && w.performance.now
        ? w.performance.now.bind(w.performance)
        : Date.now;
  
    /**
     * indicates if a the current browser is made by Microsoft
     * @method isMicrosoftBrowser
     * @param {String} userAgent
     * @returns {Boolean}
     */
    function isMicrosoftBrowser(userAgent) {
      var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];
  
      return new RegExp(userAgentPatterns.join('|')).test(userAgent);
    }
  
    /*
     * IE has rounding bug rounding down clientHeight and clientWidth and
     * rounding up scrollHeight and scrollWidth causing false positives
     * on hasScrollableSpace
     */
    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
  
    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }
  
    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }
  
    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} firstArg
     * @returns {Boolean}
     */
    function shouldBailOut(firstArg) {
      if (
        firstArg === null ||
        typeof firstArg !== 'object' ||
        firstArg.behavior === undefined ||
        firstArg.behavior === 'auto' ||
        firstArg.behavior === 'instant'
      ) {
        // first argument is not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }
  
      if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }
  
      // throw error when behavior is not supported
      throw new TypeError(
        'behavior member of ScrollOptions ' +
          firstArg.behavior +
          ' is not a valid value for enumeration ScrollBehavior.'
      );
    }
  
    /**
     * indicates if an element has scrollable space in the provided axis
     * @method hasScrollableSpace
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function hasScrollableSpace(el, axis) {
      if (axis === 'Y') {
        return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
      }
  
      if (axis === 'X') {
        return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
      }
    }
  
    /**
     * indicates if an element has a scrollable overflow property in the axis
     * @method canOverflow
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function canOverflow(el, axis) {
      var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];
  
      return overflowValue === 'auto' || overflowValue === 'scroll';
    }
  
    /**
     * indicates if an element can be scrolled in either axis
     * @method isScrollable
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function isScrollable(el) {
      var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
      var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');
  
      return isScrollableY || isScrollableX;
    }
  
    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
  
      do {
        el = el.parentNode;
  
        isBody = el === d.body;
      } while (isBody === false && isScrollable(el) === false);
  
      isBody = null;
  
      return el;
    }
  
    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     * @returns {undefined}
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;
  
      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;
  
      // apply easing to elapsed time
      value = ease(elapsed);
  
      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;
  
      context.method.call(context.scrollable, currentX, currentY);
  
      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }
  
    /**
     * scrolls window or element with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();
  
      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }
  
      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }
  
    // ORIGINAL METHODS OVERRIDES
    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }
  
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scroll.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object'
              ? arguments[0]
              : w.scrollX || w.pageXOffset,
          // use top prop, second argument if present or fallback to scrollY
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined
              ? arguments[1]
              : w.scrollY || w.pageYOffset
        );
  
        return;
      }
  
      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        arguments[0].left !== undefined
          ? ~~arguments[0].left
          : w.scrollX || w.pageXOffset,
        arguments[0].top !== undefined
          ? ~~arguments[0].top
          : w.scrollY || w.pageYOffset
      );
    };
  
    // w.scrollBy
    w.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }
  
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object' ? arguments[0] : 0,
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined ? arguments[1] : 0
        );
  
        return;
      }
  
      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };
  
    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }
  
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        // if one number is passed, throw error to match Firefox implementation
        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
          throw new SyntaxError('Value could not be converted');
        }
  
        original.elementScroll.call(
          this,
          // use left prop, first number argument or fallback to scrollLeft
          arguments[0].left !== undefined
            ? ~~arguments[0].left
            : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,
          // use top prop, second argument or fallback to scrollTop
          arguments[0].top !== undefined
            ? ~~arguments[0].top
            : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
        );
  
        return;
      }
  
      var left = arguments[0].left;
      var top = arguments[0].top;
  
      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        this,
        this,
        typeof left === 'undefined' ? this.scrollLeft : ~~left,
        typeof top === 'undefined' ? this.scrollTop : ~~top
      );
    };
  
    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }
  
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.elementScroll.call(
          this,
          arguments[0].left !== undefined
            ? ~~arguments[0].left + this.scrollLeft
            : ~~arguments[0] + this.scrollLeft,
          arguments[0].top !== undefined
            ? ~~arguments[0].top + this.scrollTop
            : ~~arguments[1] + this.scrollTop
        );
  
        return;
      }
  
      this.scroll({
        left: ~~arguments[0].left + this.scrollLeft,
        top: ~~arguments[0].top + this.scrollTop,
        behavior: arguments[0].behavior
      });
    };
  
    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scrollIntoView.call(
          this,
          arguments[0] === undefined ? true : arguments[0]
        );
  
        return;
      }
  
      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();
  
      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
  
        // reveal parent in viewport unless is fixed
        if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
          w.scrollBy({
            left: parentRects.left,
            top: parentRects.top,
            behavior: 'smooth'
          });
        }
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }
  
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }
  })()

/* ==== jquery.dbFormCombo.js ==== */
;(function($, window, document, undefined) {
    $.widget('qcode.dbFormCombo', {
        options: {
	    searchURL: "",
	    searchLimit: 10,
	    comboHeight: 200,
	    hideIfNoMatches: false
        },
        _create: function() {
            this.options.comboWidth = coalesce(this.options.comboWidth, this.element.outerWidth());
	    this.div = $('<div>')
	        .css({
		    'position': 'absolute',
		    'width': this.options.comboWidth,
		    'height': this.options.comboHeight,
		    'overflow': 'auto',
		    'border': "1px solid black",
		    'background': "white",
		    'z-index':"99"
	        })
	        .appendTo('body')
	        .hide()
	        .hover(
		    function(){$(this).addClass('hover');},
		    function(){$(this).removeClass('hover');}
	        );
	    this.lastValue = this.element.val();
	    this._on({
	        'keydown': this._onKeyDown,
	        'keyup': this._onKeyUp,
	        'blur': this._onBlur
            });
	    this._on(this.div, {
                'click': this._divOnClick,
	        'mouseover': this._divOnMouseOver
            });
	    var $this = this;
	    $(window).on('resize.' + this.element.attr('id'), function() {
		$this.div.css('width', $this.element.outerWidth());
		$this.hide();
	    });
        },
	show: function(){
	    this.div
                .show()
	        .css({
		    'top': this.element.offset().top + this.element.outerHeight(),
		    'left': this.element.offset().left
	        });
	},
	hide: function() {
	    this.div.removeClass('hover').hide();
	},
	highlight: function(index) {
	    this.currentItem.css({
		'background': "",
		'color': ""
	    });
	    this.currentItem = this.div.children().eq(index);
	    this.currentItem.css({
		'background': "highlight",
		'color': "highlighttext"
	    });
	},
	select: function(index) {
	    var option = $(this.xmlDoc).find('records > record > option').eq(index);
	    this.element.val( option.text() );
	    this.lastValue = this.element.val();
	    this.hide();
	    this.currentItem = undefined;
	    this.element.focus();
	    this.element.trigger('comboSelect');
	},
	updateList: function() {
	    this.div.empty();
	    var dbForm = this;
	    this.xmlDoc.find('records > record > option').each(function(){
		var field = $(this);
		$('<div>')
		    .css({
			'width': "100%",
			'cursor': "pointer"
		    })
		    .text( $(field).text() )
		    .appendTo( dbForm.div );
	    });
	    if ( this.div.children().length >= this.options.searchLimit ) {
		this.div.append('.....');
	    }
	    this.currentItem = this.div.children().first();
	    this.highlight(0);
	},
        _onKeyDown: function(event) {
	    if ( typeof this.currentItem == "undefined" ) {
	        return;
	    }
	    var index = this.currentItem.index();
	    switch (event.which) {
	    case 38:
	        if ( index != 0 ) {
		    this.highlight(index - 1);
	        }
	        break;
	    case 40:
	        if ( index != (this.div.children().length - 1) ){
		    this.highlight(index + 1);
	        }
	        break;
	    case 13: //return
	        this.select(index);
	        event.preventDefault();
	        event.stopPropagation();
	        break;
	    case 9: //tab
	        this.select(index);
	        break;
	    }
        },
        _onKeyUp: function(event) {
	    if ( this.element.val() != this.lastValue ) {
	        this.lastValue = this.element.val();
	        this.search();
	    }
        },
        _onBlur: function(event) {
	    if ( ! this.div.is('.hover') ) {
	        this.hide();
	        this.currentItem = undefined;
                this.element.trigger('comboBlur');
	    }
        },
        _divOnClick: function(event) {
	    if ( ! this.div.is(event.target) ) {
	        this.select($(event.target).index());
	    }
        },
        _divOnMouseOver: function(event) {
	    if ( ! this.div.is(event.target) ) {
	        this.highlight($(event.target).index());
	    }
        },
	_destroy: function() {
	    this.div.remove();
	    $(window).off('resize.' + this.element.attr('id'));
	},
        search: function() {
	    this.currentItem = undefined;
	    if (!this.options.hideIfNoMatches) {
		this.div.text('Searching ...');
		this.show();
	    }
	    this.div.off('click.dbFormCombo');
	    this.div.off('mouseover.dbFormCombo');
	    this.xmlDoc = undefined;
	    var dbForm = this;
	    $.get(this.options.searchURL, {
	        'name': this.element.attr('name'),
	        'value': this.element.val(),
	        'searchLimit': this.options.searchLimit
	    }, "xml").success(function(data, textStatus, jqXHR){
	        dbForm.xmlDoc = $(data);
	        if ( dbForm.xmlDoc.find('error').length > 0 ) {
		    dbForm.show();
		    dbForm.div.text( dbForm.xmlDoc.find('error').text() );
	        } else {
		    if ( dbForm.xmlDoc.find('record').length > 0 ) {
			dbForm.show();
		        dbForm.updateList();
		    } else if (dbForm.options.hideIfNoMatches) {
			dbForm.hide();
		    } else {
		        dbForm.div.text("No Matches");
		    }
	        }
	    }).error(function(jqXHR, textStatus, errorThrown){
	        dbForm.div.text("Software Bug ! " + errorThrown);
	    });
        }
    });
})(jQuery, window, document);

/* ==== jquery.dirtyForm.js ==== */
// Plugin to check if form is dirty (has unsaved data)
;(function($, undefined) {
    $.widget('qcode.dirtyForm',{
	_create: function(){
	    // Event listener
	    this._on(this.element, {
		'keyup': this._onKeyUp,
		'change select, input[type="checkbox"], input[type="radio"]': this._onChange,
		'cut': this._onCut,
		'paste': this._onPaste,
	    });
	},
	_onKeyUp: function(e) {
	    if ( isEditingKeyEvent(e) ) {
		this.setDirty();
		return;
	    } 

	    if ( e.which == 13 // return key
		 && $(e.target).is('textarea') ) {
		this.setDirty();
	    }
	},
	_onChange: function(e) {
	    this.setDirty();
	},
	_onCut: function(e) {
	    if($(e.target).attr('type')=='text' || $(e.target).is('textarea')){
		this.setDirty();
	    }
	},
	_onPaste: function(e) {
	    if($(e.target).attr('type')=='text' || $(e.target).is('textarea')){
		this.setDirty();
	    }
	},
	setDirty: function() {
	    this.element.trigger('formDirty');
	}
	
    });
})(jQuery);

/* ==== jquery.mouseTrack.js ==== */
/*
  mouseTrack plugin
  Track mouse movement over an area of the page,
  provide methods to report position, speed, acceleration, and bearing.

  nb. Recommend always calling on $(body), and calling "update" within any
  mouse event handler where this plugin is to be used.

  For acceleration, speed, position, and bearing, time2 defaults to now,
  time1 defaults to interval ms ago, interval defaults to 100, times will
  be matched as closely as possible, up to a maximum 500ms difference.
  These methods may return null if there is insufficient tracking data recorded.

  Usages:

  # $(element).mouseTrack();
  # $(element).mouseTrack('track');
  Begin recording mousemove events for the target element

  # $(element).mouseTrack('update', event)
  Call from within a mousemove event handler to ensure that the current
  event has been recorded by mouseTrack.

  # $(element).mouseTrack('acceleration')
  # $(element).mouseTrack('acceleration', interval)
  # $(element).mouseTrack('acceleration', time1, time2)
  Return mouse acceleration (change in speed) in px/(ms^2) between time1 and time2

  # $(element).mouseTrack('bearing')
  # $(element).mouseTrack('bearing', interval)
  # $(element).mouseTrack('bearing', time1, time2)
  Return mouse bearing in radians clockwise from north, between time1 and time2

  # $(element).mouseTrack('speed')
  # $(element).mouseTrack('speed', interval)
  # $(element).mouseTrack('speed', time1, time2)
  Return mouse speed in px/ms, between time1 and time2

  # $(element).mouseTrack('position')
  # $(element).mouseTrack('position', interval)
  Return the last known mouse position, if recorded with the last "interval" ms
*/
;(function(undefined) {
    "use strict";
    var trail = [];
    var maxTrailLength = 1000;
    var maxTimeDifference = 500;

    $.fn.mouseTrack = function(method) {
        var $target = this;
        var args = Array.prototype.slice.call(arguments, 1);
        switch (method) {
        case undefined:
        case 'track':
            $target.on('mousemove', trackMouse);
            break;
        case 'update':
            trackMouse.apply(this, args);
            break;
        case 'acceleration':
            return mouseAcceleration.apply(this, args);
        case 'bearing':
            return mouseBearing.apply(this, args);
        case 'speed':
            return mouseSpeed.apply(this, args);
        case 'position':
            return mousePosition.apply(this, args);
        default:
            throw new Error('Unknown mouseTrack method ' + method);
        }
        return $target;
    }

    // Use best available time measuring
    if ( window.performance ) {
        var now = function() {
            return window.performance.now();
        }
    } else if ( Date.now ) {
        var now = function() {
            return Date.now();
        }
    } else {
        var now = function() {
            return new Date().getTime();
        }
    }

    // Trail - array of captured mouse movement
    // (nb - how often mouse events fire depends on the user's mouse)
    // Brief research suggest it's usually less than 100 times per second
    var lastAdded;
    function trackMouse(event) {
        if ( lastAdded !== event.originalEvent ) {
            lastAdded = event.originalEvent;
            trail.push({
                time: now(),
                pageX: event.pageX,
                pageY: event.pageY
            });
            if ( trail.length > maxTrailLength ) {
                trail.shift();
            }
        }
    }

    // Return mouse acceleration (change in speed) px/(ms^2)
    function mouseAcceleration(t1, t2) {
        if ( trail.length < 3 ) {
            return null;
        }
        var settings = timePeriod(100, t1, t2);
        var timeFrom = settings.from;
        var timeTo = settings.to;
        var timeMiddle = (timeFrom + timeTo) / 2;

        // Find 3 different points that fit the specified times as closely as possible
        var i1 = indexOfClosest(trail, timeFrom);
        var i2 = indexOfClosest(trail, timeMiddle);
        var i3 = indexOfClosest(trail, timeTo);
        if ( i1 === null || i2 === null || i3 === null ) {
            return null;
        }
        if ( i1 === i2 ) {
            i1--;
            if ( i1 < 0 || Math.abs(trail[i1].time - timeFrom) > maxTimeDifference ) {
                return null;
            }
        }
        if ( i3 === i2 ) {
            i3++;
            if ( i3 >= trail.length || Math.abs(trail[i3].time - timeTo) > maxTimeDifference ) {
                return null;
            }
        }

        // Calculate deltas (x, y, time, displacement)
        var dX1 = trail[i2].pageX - trail[i1].pageX;
        var dX2 = trail[i3].pageX - trail[i1].pageX;
        var dY1 = trail[i2].pageY - trail[i1].pageY;
        var dY2 = trail[i3].pageY - trail[i1].pageY;
        var dT1 = trail[i2].time - trail[i1].time;
        var dT2 = trail[i3].time - trail[i1].time;
        var s1 = Math.sqrt( Math.pow(dX1, 2) + Math.pow(dY1, 2) );
        var s2 = Math.sqrt( Math.pow(dX2, 2) + Math.pow(dY2, 2) );

        return ((s2 * dT1) - (s1 * dT2)) / (dT1 * dT2 * (dT2 - dT1));
    }

    // Return mouse bearing (radians clockwise from north, 0 to 2PI)
    function mouseBearing(t1, t2) {
        if ( trail.length < 2 ) {
            return null;
        }
        var settings = timePeriod(100, t1, t2);
        var timeFrom = settings.from;
        var timeTo = settings.to;
        
        var range = closestRange(trail, timeFrom, timeTo);
        if ( range === null ) {
            return null;
        }
        var dX = trail[range.to].pageX - trail[range.from].pageX;
        var dY = trail[range.to].pageY - trail[range.from].pageY;

        return Math.PI + Math.atan2(-dX,dY);
    }

    // Return mouse speed px/ms
    function mouseSpeed(t1, t2) {
        if ( trail.length < 2 ) {
            return null;
        }
        var settings = timePeriod(100, t1, t2);
        var timeFrom = settings.from;
        var timeTo = settings.to;

        var range = closestRange(trail, timeFrom, timeTo);
        if ( range === null ) {
            return null;
        }
        var dX = trail[range.to].pageX - trail[range.from].pageX;
        var dY = trail[range.to].pageY - trail[range.from].pageY;
        var dT = trail[range.to].time - trail[range.from].time;
        if ( dT == 0 ) {
            throw new Error("Invalid mouse trail");
        }
        var distance = Math.sqrt( Math.pow(dX, 2) + Math.pow(dY, 2) );
        return distance / dT;
    }

    // Return mouse position (top/left)
    function mousePosition(interval) {
        if ( trail.length == 0 ) {
            return null;
        }
        if ( interval === undefined ) {
            interval = 100;
        }
        var index = indexOfClosest(trail, now() - interval);
        if ( index === null ) {
            return null;
        }
        return {
            top: trail[index].pageX,
            left: trail[index].pageY
        }
    }

    // User-defined range, as two times, or interval to now, or default interval to now
    function timePeriod(defaultInterval, t1, t2) {
        if ( typeof t2 == 'undefined' ) {
            if ( typeof t1 == 'undefined' ) {
                t1 = now() - defaultInterval;
            } else {
                t1 = now() - t1;
            }
            t2 = now();
        }
        return {
            from: t1,
            to: t2
        }
    }

    // Return an object containing 2 array indicies (from and to), representing 2 different
    // array elements which most closely match the search times.
    // Returns null if a matching range cannot be found within maxTimeDifference of the
    // specified times.
    function closestRange(trail, timeFrom, timeTo) {
        if ( trail.length < 2 ) {
            throw new Error("Cannot select a range from an array of less than 2 items");
        }
        var indexFrom = indexOfClosest(trail, timeFrom);
        var indexTo = indexOfClosest(trail, timeTo);
        if ( indexFrom === null || indexTo === null ) {
            return null;
        }
        if ( indexFrom != indexTo ) {
            return {
                from: indexFrom,
                to: indexTo
            }
        }
        if ( indexFrom == 0 ) {
            if ( Math.abs(trail[1].time - timeTo) > maxTimeDifference ) {
                return null;
            }
            return {
                from: 0,
                to: 1
            }
        }
        var end = trail.length - 1;
        if ( indexTo == end ) {
            if ( Math.abs(trail[end - 1].time - timeFrom) > maxTimeDifference ) {
                return null;
            }
            return {
                from: end - 1,
                to: end
            }
        }
        if ( (trail[indexFrom].time - trail[indexFrom - 1].time)
             <
             (trail[indexTo + 1].time - trail[indexTo]) ) {
            if ( Math.abs(trail[indexFrom - 1].time - timeFrom) > maxTimeDifference ) {
                return null;
            }
            return {
                from: indexFrom - 1,
                to: indexTo
            }
        } else {
            if ( Math.abs(trail[indexTo + 1].time - timeTo) > maxTimeDifference ) {
                return null;
            }
            return {
                from: indexFrom,
                to: indexTo + 1
            }
        }
    }

    // Return array index of the element in trail closest to searchTime,
    // within maxTimeDifference of searchTime.
    // Returns null if such an element cannot be found.
    function indexOfClosest(trail, searchTime) {
        if ( trail.length == 0 ) {
            throw new Error("Cannot search an empty array");
        }
        var index;
        if ( trail.length == 1 ) {
            index = 0;

        } else if ( trail.length == 2 ) {
            if ( (searchTime - trail[0].time) < (trail[1].time - searchTime) ) {
                index = 0;
            } else {
                index = 1;
            }

        } else {
            var end = trail.length - 1;
            var oldest = trail[0].time;
            var newest = trail[end].time;

            if ( searchTime < oldest ) {
                index = 0;

            } else if ( searchTime > newest ) {
                index = end;

            } else {
                // Interpolated search (similar to binary search)
                var searchIndex = Math.round(end * (searchTime - oldest) / (newest - oldest));
                if ( searchIndex == 0 ) {
                    searchIndex = 1;
                }
                if ( searchIndex == end ) {
                    searchIndex = end - 1;
                }

                if ( trail[searchIndex].time == searchTime ) {
                    return searchIndex;

                } else if ( trail[searchIndex].time > searchTime ) {
                    var i = 0;
                    var j = searchIndex;
                    
                } else {
                    var i = searchIndex;
                    var j = end;

                }
                var subTrail = trail.slice(i, j);
                index = i + indexOfClosest(subTrail, searchTime);
            }
        }
        if ( Math.abs(trail[index].time - searchTime) > maxTimeDifference ) {
            return null;
        } else {
            return index;
        }
    }
})();

/* ==== jquery.textrange.js ==== */
(function($, undefined) {
    var textrange = {
        get: function(property) {
            var selectionText="";
            var selectionAtStart=false;
            var selectionAtEnd=false;
            var selectionStart;
            var selectionEnd
            var text = this.is(':input') ?  this.val() :  this.text();

            if (this.is(':input') && this[0].selectionStart !== undefined) {
                // Standards compliant input elements
                selectionStart = this[0].selectionStart;
                selectionEnd = this[0].selectionEnd;
                selectionText = text.substring(this[0].selectionStart, this[0].selectionEnd);
                if (selectionStart == 0) {
                    selectionAtStart = true
                } else {
                    selectionAtStart = false
                }
                if (selectionEnd == text.length) {
                    selectionAtEnd = true
                } else {
                    selectionAtEnd = false
                }
            } else {
                // Content editable HTML areas
                var selection =  window.getSelection();
                if (selection.rangeCount>0) {
                    var selectedRange = selection.getRangeAt(0);
                    var elmtRange = document.createRange();
		    elmtRange.selectNodeContents(this[0]);

		    if (elmtRange.toString().search(/\S/)!=-1) {
			// Find the index of the first text not markup or whitespace.
			var editStartPosition = getRangePosition(this,elmtRange.toString().search(/\S/));
		    } else {
			var editStartPosition = getRangePosition(this,0);
		    }
		    if (elmtRange.toString().search(/\s+$/)!=-1) {
			// index of whitespace at the end of the string
			editEndPosition = getRangePosition(this,elmtRange.toString().search(/\s+$/));
		    } else {
			editEndPosition = getRangePosition(this,elmtRange.toString().length);
		    }

		    // editRange spans the editable text
		    editRange  = document.createRange();
		    editRange.setStart(editStartPosition.node,editStartPosition.offset);
		    editRange.setEnd(editEndPosition.node,editEndPosition.offset);

		    // At edit start or edit end
		    selectionAtStart = Boolean(selectedRange.compareBoundaryPoints(Range.START_TO_START,editRange)<=0);
		    selectionAtEnd = Boolean(selectedRange.compareBoundaryPoints(Range.END_TO_END,editRange)>=0);

                    // selectionStart
                    var myRange = document.createRange();
                    myRange.setStart(elmtRange.startContainer,elmtRange.startOffset);
                    myRange.setEnd(selectedRange.startContainer,selectedRange.startOffset);
                    selectionStart = myRange.toString().length;
                    // selectionEnd
                    myRange.setStart(selectedRange.endContainer,selectedRange.endOffset);
                    myRange.setEnd(elmtRange.endContainer,elmtRange.endOffset);
                    selectionEnd = elmtRange.toString().length - myRange.toString().length;
                    // selectedText
                    selectionText = selectedRange.toString();
                }
            }
            
            var props = {
                selectionText: selectionText,
                selectionAtStart: selectionAtStart,
                selectionAtEnd: selectionAtEnd,
                selectionStart: selectionStart,
                selectionEnd: selectionEnd,
                text: text

            };

            return typeof property === 'undefined' ? props : props[property];
        },

        set: function(selectionStart, selectionEnd) {
            if ( ! $(this).is(':focus') ) {
                this.focus();
            }
            var text = this.is(':input') ?  this.val() :  this.text();
            if (selectionStart === 'start') {
                selectionStart = 0;
            } 
            if (selectionStart === 'end') {
                selectionStart = text.length;
            }
            if (selectionEnd === 'start') {
                selectionEnd = 0;
            }
            if (selectionEnd === 'end') {
                selectionEnd = text.length;
            }
            if (selectionStart === 'all' && selectionEnd===undefined ) {
                selectionStart=0
                selectionEnd = text.length;
            }
            if (this.is(':input') && this[0].selectionStart != undefined) {
                // Standards compliant input elements
                this[0].selectionStart = selectionStart;
                this[0].selectionEnd = selectionEnd;
            } else if (this.is('[contenteditable=true]') && window.getSelection && window.getSelection().rangeCount > 0) {
                // Content editable
                var selection = window.getSelection();
                var range = document.createRange();

                var startPosition = getRangePosition(this, selectionStart);
                var endPosition = getRangePosition(this, selectionEnd);

                range.setStart(startPosition.node, startPosition.offset);
                range.setEnd(endPosition.node, endPosition.offset);
                selection.removeAllRanges();
                selection.addRange(range);
            } 
            return this;
        }
    };
    function getRangePosition(node, index) {
        // Find the text node (possibly nested) and corresponding offset on the left of 
	// character at index from start of this node
        var childNodes = node.contents();
	var myRange =  document.createRange();
        if (childNodes.size()) {
            for (var i = 0; i < childNodes.size(); i++) {
                var childNode = childNodes.eq(i);
		myRange.selectNode(childNode[0]);
                textLength = myRange.toString().length;
                if ((textLength > 0 && index < textLength) || (i==childNodes.size()-1 && index==textLength)) {
		    // The point we are looking for is in this child
                    return getRangePosition(childNode, index);
                }
                index -= textLength;
            }
        } else {
            return {
                node: node[0],
                offset: index
            }
        }
    }

    $.fn.textrange = function(method) {
        if (!this.is(':input') && !this.is('[contenteditable=true]')) {
            $.error('jQuery.textrange requires that only input or contenteditable elements are contained in the jQuery object');
        }

	if (typeof textrange[method] === 'function') {
            return textrange[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error("Method " + method + " does not exist in jQuery.textrange");
        }
    };
})(jQuery);

/* ==== jquery.transition.js ==== */
;(function($, undefined) {
    // ======================================================================
    // Transition jQuery function to animate Height/Width changes
    // ======================================================================
    $.fn.transition = function(options) {
        // options.property (required) eg. 'height' or 'width'
        // options.endValue (required) eg. 'auto', '' (initial value) or '100px' (absolute value)
        // options.duration (optional) eg. '0.3s', '300ms' etc.
        // options.timingFunction (optional) eg 'linear', 'ease' etc.

        // Default option values
        options = $.extend({
            duration: '0.3s',
            timingFunction: 'ease'
        }, options);
        
        this.each(function() {
            var autoValue;
            var $element = $(this);

            // remove any existing transitionend.transition events bound to this element.
            $element.off('transitionend.transition');
            
            if ( ! $element.data('transition-in-progress') ) {
                // If not currently transitioning...
                $element.data('transition-in-progress', true);

                // Turn off transitions so JavaScript width/height changes are not animated
                $element.css('transition', 'none'); 

                var initialValue = $element[options.property]();

                // calculate auto width/height value and store in data-attribute
                $element.css(options.property, 'auto');
                autoValue = $element[options.property]();
                $element.data('transition-auto-value', autoValue);
                
                if (initialValue === options.endValue || options.endValue === 'auto' && initialValue === autoValue) {
                    // Element width/height already equals endValue, nothing to do
                    $element.data('transition-in-progress', false);
                    return;
                }

                // Reset element width/height to initialValue and force browser repaint by querying offsetWidth
                $element.css(options.property, initialValue);
                $element.get(0).offsetWidth;

                // Add inline css transition property to element
                $element.css('transition', options.property + ' ' + options.duration + ' ' + options.timingFunction);
            } else {
                // If currently transitioning...
                autoValue = $element.data('transition-auto-value');
            }

            // Set element width/height with inline css, specifying absolute pixel value
            if (options.endValue === 'auto') {
                $element.css(options.property, autoValue);
            } else {
                $element.css(options.property, options.endValue);
            }
            
            $element.one('transitionend.transition', function(event) {
                // when transition completes, clean up data attributes and inline CSS
                $element.removeData('transition-in-progress');
                $element.removeData('transition-auto-value');
                $element.css('transition', '');
                if (options.endValue === 'auto') {
                    // Set height to 'auto' to instead of autoHeight to accommodate responsive layouts
                    $element.css(options.property, 'auto');
                }
            });
        });

        return this;
    }
})(jQuery);


/* ==== jquery.utils.js ==== */

// Returns the first non-undefined argument
function coalesce() {
    for(var i = 0; i < arguments.length; i++){
	if ( typeof arguments[i] != "undefined" ) {
	    return arguments[i];
	}
    }
};

function stripHTML(html) {
    return html.replace(/<[^>]+>/gi,"");
};

function urlSet(url,name,value) {
    var re = /([^\?\#]+)(?:\?([^\#]*))?(\#.*)?/;
    re.exec(url);
    var path = RegExp.$1;
    var queryString = RegExp.$2;
    var fragment = RegExp.$3;
    url = path + "?" + urlDataSet(queryString,name,value) + fragment;
    return url;
}

function urlDataSet(data,name,value) {
    var list = new Array();
    var a = new Array();
    var b = new Array();
    var c = new Array();
    
    if ( data != "" ) {
	var a = data.split('&');
    }
    for (var i=0;i<a.length;i++) {
	b = a[i].split('=');
	var n = decodeURIComponent(b[0].replace(/\+/g,' '));
	var v = decodeURIComponent(b[1].replace(/\+/g,' '));
	c[n]=v;
    }
    c[name] = value;
    for (key in c) {
	list.push(encodeURIComponent(key) + "=" + encodeURIComponent(c[key]));
    }
    
    data=list.join("&");
    return data;
};

function parseBoolean(value) {
    value = stripHTML(String(value)).toLowerCase();
    var truth = ['true','yes','y','1','t'];
    for (var i=0;i<truth.length;i++) {
      if ( value == truth[i].toLowerCase() ) {
        return true;
      } 
    }
    return false;
}

// setZeroTimeout / clearZeroTimeout
// equivalent to setTimeout(function, 0) but uses window.postMessage to bypass browser minimum timeouts
// In other words, schedule a function to be executed after all the other event handlers are finished
// Does not take additional arguments (to pass additional arguments to the callback, use closures instead)
(function(window, undefined) {
    if ( window.postMessage ) {
        var timeouts = []; // Array of functions
        var ids = {}; // Hash of keys, used by clearZeroTimeout, referencing indices of timeouts
        var messageName = "zero-timeout-message";
        var nextID = 0;

        function setZeroTimeout(fn) {
            nextID++;
            timeouts.push(fn);
            ids[nextID] = timeouts.length - 1;
            window.postMessage(messageName, "*");
            return nextID;
        }

        function clearZeroTimeout(index) {
            if ( ids[index] !== undefined ) {
                timeouts.splice(ids[index], 1);
                delete ids[nextID];
            }
        }

        function handleMessage(event) {
            if (event.source == window && event.data == messageName) {
                if ( event.stopPropagation ) {
                    event.stopPropagation();
                }
                if (timeouts.length > 0) {
                    var fn = timeouts.shift();
                    for (index in ids) {
                        if ( ids[index] === timeouts.length ) {
                            delete ids[index];
                            break;
                        }
                    }
                    fn();
                }
                return false;
            }
        }

        if ( window.addEventListener ) {
            window.addEventListener("message", handleMessage, true);
        } else if ( window.attachEvent ) {
            window.attachEvent("onmessage", handleMessage);
        } else {
            window.onmessage = handleMessage;
        }

        window.setZeroTimeout = setZeroTimeout;
        window.clearZeroTimeout = clearZeroTimeout;
    } else {
        window.setZeroTimeout = function(fn) {
            return window.setTimeout(fn, 0);
        }
        window.clearZeroTimeout = function(timeout) {
            window.clearTimeout(timeout);
        }
    }
})(window);

// isEditingKeyEvent
// takes a jQuery keyboard event (keyup, keydown, keypress)
// returns true if the event would modify the contents of the currently focussed input
// (Does not match cuy/paste events, returns false for the return key)
function isEditingKeyEvent(e) {
    if ( e.altkey ) { // Modifying with the alt key prevents editing.
        return false;

    } else if ( e.which == 8 || e.which == 46 ) { // backspace and delete
        return true;

    } else if ( e.ctrlKey ) { // Modifying with ctrl prevents *most* editing
        return false;
        
    } else if ( (e.which > 47 && e.which < 58) // number keys
                || e.which == 32 // spacebar
                || (e.which > 64 && e.which < 91) // letter keys
                || (e.which > 95 && e.which < 112) // numpad key (as numbers)
                || (e.which > 185 && e.which < 193) // ;=,-./` keys
                || (e.which > 218 && e.which < 223) // [\]' keys
              ) {
        return true;

    } else {
        return false;
    }
}

function scrollToElement($element, duration) {
    // Scrolls to the top of the given element if it isn't fully visible in the viewport.
    var $window = $(window);
    var viewportTop = $window.scrollTop();
    var viewportBottom = viewportTop + $window.height();
    var elementTop = $element.offset().top;
    var elementBottom = elementTop + $element.height();
    
    if ( elementBottom > viewportBottom || elementTop < viewportTop ) {                                
        // Element is not fully visible - scroll page to the element
        if ( $('html').scrollTop()) {            
            $('html').animate({
                scrollTop: $element.offset().top
            }, duration);
            return;
        }
        if ( $('body').scrollTop()) {            
            $('body').animate({
                scrollTop: $element.offset().top
            }, duration);
            return;
        }
    }
}

/* ==== jquery.validation.js ==== */
// Server-side validation plugin
;(function($, window, document) {

    $.widget('qcode.validation', {

        options: {
            qtip: {
                position: {
                    my: 'bottom center',
                    at: 'bottom center',
                    viewport: $(window)
                },
                show: {
                    event: false,
                    ready: true
                },
                hide: {
                    event: 'click focus blurs reset keydown paste cut',
                    delay: 0
                },
                style: {
                    classes: 'qtip-qcode'
                },
                events: {
                    render: function(event, api) {
                        // Clicking on the tooltip causes the target element to gain focus and hides the tooltip.
                        api.elements.tooltip.on('click', function(event) {
                            api.elements.target.focus();
                            // Call the hide method in case the default hide events were overwritten
                            api.hide();
                        });
                    }
                }
            },
            hints: {},
            messages: {
                error: {
                    classes: 'message-area error'
                },
                notify: {
                    classes: 'message-area notify'
                },
                alert: {
                    classes: 'message-area alert'
                }
            },
            submit: true,
            timeout: 20000,
            scrollToFeedback: {
                enabled: true, // true, false
                behavior: 'smooth' // smooth, instant, auto
            }
        },

        _create: function() {
            var widget = this;
            var $form = $(this.element);
            this.validationState = "clean";
            this.message = [];
            this.validationAJAX;

            // Logic for default http method to be used for validation service.
            if ( typeof this.options.method === 'undefined' ) {
                if ( typeof $form.attr('method') === 'undefined' || $form.attr('method') === 'GET' ) {
                    var method = 'VALIDATE';
                } else {
                    var method = 'POST';
                }
            } else {
                method = this.options.method;
            }

            // Click handlers for submit buttons on the form.
            // Used to add hidden input elements with the button's name and value because jQuery form.serialize() function does not
            // include submit button data since it has no way of knowing which button was used to submit the form.
            $form.find('button:not([type]), button[type="submit"], input[type="submit"]').click(function(event) {
                var name = $(this).attr('name');
                var value = $(this).attr('value');

                if ($form.find('input[type="hidden"][name="' + name + '"]').length === 0) {
                    $(this).before('<input type="hidden" name="' + name  + '" value="' + value  + '">');
                }
            });

            // Handler function for submit event.
            $form.on('submit.validate', function(event) {

                // Default url used for validation service.
                if ( typeof widget.options.url === 'undefined' ) {
                    var url = $form.attr('action');
                }

                if ( typeof FormData === "function"
                     && typeof FormData.prototype.get === "function"
                   ) {
                    // AJAX file upload fully supported

                    // Stop the form submission.
                    event.preventDefault();

                    // Set up form data
                    var data = new FormData($form[0]);

                    // perform validation
                    $form.validation('validate', method, url, data);


                } else if ( typeof FormData === "function" ) {
                    // AJAX file upload append-only supported

                    // Stop the form submission.
                    event.preventDefault();

                    // Cannot modify FormData once created,
                    // so fix "_method" before calling validate method
                    var ajax_method;
                    if ( method === 'POST' || method === 'GET' ) {
                        ajax_method = method;
                        var data = new FormData($form[0]);

                    } else {
                        ajax_method = 'POST';

                        var hidden = $form.find('[name="_method"]');
                        if ( hidden.length > 0 ) {
                            var _method = hidden.val();
                            hidden.val(method);
                            var data = new FormData($form[0]);
                            hidden.val(_method);

                        } else {
                            var hidden = $('<input type="hidden" name="_method"/>')
                                .val(method)
                                .appendTo($form);
                            var data = new FormData($form[0]);
                            hidden.remove();
                        }
                    }
                    $form.validation('validate', ajax_method, url, data);

                } else if ( $form.prop('enctype') === "application/x-www-form-urlencoded" ) {
                    // File upload not supported, but unneeded

                    // Stop the form submission.
                    event.preventDefault();

                    // Set up form data
                    var data = $form.serializeArray();

                    // perform validation
                    $form.validation('validate', method, url, data);

                }
                // Otherwise fall back to default form submission
            });
        },

        validate: function(method, url, post_data) {
            // Function to perform validation

            var isFormData = typeof FormData === "function"
                && FormData.prototype.isPrototypeOf(post_data);

            var widget = this;
            var $form = $(widget.element);
            data = post_data || [];

            // Do not allow concurrent validation requests
            if ( $form.validation('state') !== 'validating' && $form.validation('state') !== 'redirecting' ) {
                // update plugin state
                $form.validation('state','validating');
                $form.addClass('validating');

                // blur() then focus() any text inputs in the form that currently have focus
                // hack to fix bug where autocomplete popup can become detached from input when page layout changes (when error messages displayed/hidden)
                $('input:focus', $form).filter('[type=text],[type=email],[type=tel],[type=password]').blur().focus();

                // Hide any existing validation messages
                $form.validation('hideValidationMessage');
                $form.validation('hideMessage', 'alert');
                $form.validation('hideMessage', 'notify');
                $form.validation('hideMessage', 'error');

                // AJAX method
                var ajax_method;
                if ( method === 'POST' || method === 'GET' ) {
                    ajax_method = method;

                } else {
                    // Emulate HTTP method
                    ajax_method = 'POST';

                    if ( isFormData ) {
                        data.set('_method',method);

                    } else {
                        var found = false;

                        $.each(data, function(index, item) {
                            if ( item.name === '_method' ) {
                                item.value = method;
                                found = true;
                                return;
                            }
                        });

                        if ( !found ) {
                            data.push({
                                name: '_method',
                                value: method
                            });
                        }
                    }
                }

                // Send the form data
                var ajaxOptions = {
                    url: url,
                    data: data,
                    method: ajax_method,
                    dataType: 'JSON',
                    cache: false,
                    headers: {
                        'X-Authenticity-Token': Cookies.get('authenticity_token')
                    },
                    timeout: widget.options.timeout,
                    success: function(response, success, request) {
                        $form.validation('parseResponse', response);

                        // Deprecated (replaced by valid, invalid & redirect events) - Trigger validationComplete event
                        $form.trigger({
                            type: 'validationComplete',
                            response: response
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if ( errorThrown != "abort" ) {
                            var returnType = jqXHR.getResponseHeader('content-type');

                            if ( returnType == "application/json; charset=utf-8" && jqXHR.status != 200 && jqXHR.status != 0 ) {
                                // HTTP Error with JSON response
                                var response = $.parseJSON(jqXHR.responseText)
                                $form.validation('parseResponse', response);

                                // Deprecated (replaced by valid, invalid & redirect events) - Trigger validationComplete event
                                $form.trigger({
                                    type: 'validationComplete',
                                    response: response
                                });

                            } else {
                                // Update plugin state
                                $form.validation('state', 'error');

                                if ( textStatus == "parsererror" ) {
                                    // Parse error
                                    var errorMessage = "Sorry, we were unable to parse the server's response. Please try again.";
                                } else if ( textStatus == "timeout" ) {
                                    // Timeout
                                    var errorMessage = "Sorry, your request timed out. Please try again.";
                                } else {
                                    // Generic error message
                                    var errorMessage = "Sorry, something went wrong. Please try again.";
                                }

                                // Show error message
                                $form.validation('showMessage', 'error', errorMessage);
                                
                                if ( widget.options.scrollToFeedback.enabled ) {
                                    // scroll to highest feedback element
                                    $form.validation('scrollToFeedback');
                                }

                                // Deprecated (replaced by error event) - Trigger validationError event
                                $form.trigger({
                                    type: 'validationError',
                                    errorMessage: errorMessage
                                });
                                // Trigger error event
                                $form.trigger({
                                    type: 'error.validation',
                                    errorMessage: errorMessage
                                });
                            }
                        }
                    },
                    complete: function(jqXHR, textStatus) {
                        $form.removeClass('validating');
                    }
                };
                if ( isFormData ) {
                    ajaxOptions.processData = false;
                    ajaxOptions.contentType = false;
                }
                widget.validationAJAX = $.ajax(ajaxOptions);
            }
        },

        parseResponse: function(response) {
            // Parses the response to show qtips and messages where necessary.
            var $form = $(this.element);

            if ( response.action && response.action.redirect ) {
                // Redirect if the redirect action was given

                // Update plugin state
                $form.validation('state', 'redirecting');

                // Initiate redirect
                window.location.href = response.action.redirect.value;

                // Trigger redirect event
                $form.trigger({
                    type: 'redirect.validation',
                    response: response
                });
                return;
            }

            // Check each record item is valid.
            $.each(response.record, function (name, object) {
                var $element = $form.find('[name=' + name + ']:not(input[type=hidden])');
                if ( ! object.valid ) {
                    // Record item not valid - mark invalid and display message to user.
                    if ( $element.length !== 0 ) {
                        $form.validation('showValidationMessage', $element, object.message);
                        $element.addClass('invalid');
                    }
                } else {
                    $element.removeClass('invalid');
                }
            });

            // Show messages if action redirect is not given
            var showMessages = true;
            if ( response.action && response.action.resubmit && $form.data('resubmit-disabled')!==true ) {
                // don't show messages if resubmit action was given and resubmission has not been disabled
                showMessages = false;
            }
            if ( showMessages && response.message ) {
                $.each(response.message, function(type, object) {
                    $form.validation('showMessage', type, object.value);
                });
            }

            if ( response.status === 'valid' ) {
                // submission was valid
                $form.validation('state', 'valid');

                // re-enable future resubmit actions
                $form.data('resubmit-disabled',false);

                if ( this.options.submit ) {
                    // default action
                    // resubmit form without validation
                    $form.off('submit.validate').submit();
                    return;
                }

                // Trigger valid event
                $form.trigger({
                    type: 'valid.validation',
                    response: response
                });
            } else {
                // submission was invalid
                $form.validation('state', 'invalid');

                // resubmit action - used for authenticity token errors
                if ( response.action && response.action.resubmit && $form.data('resubmit-disabled')!==true ) {
                    // remove the validating flag before auto-resubmission
                    $form.removeClass('validating');
                    // resubmit the form
                    $form.submit();
                    // disable future resubmit actions to prevent inifite loop
                    $form.data('resubmit-disabled',true);
                    return;
                } else {
                    // re-enable future resubmit actions
                    $form.data('resubmit-disabled',false);
                }

                // Trigger invalid event
                $form.trigger({
                    type: 'invalid.validation',
                    response: response
                });
            }

            if ( this.options.scrollToFeedback.enabled ) {
                // scroll to highest feedback element
                $form.validation('scrollToFeedback');
            }
        },

        showValidationMessage: function($element, message) {
            // Show the validation message with the message as the content for the given element.
            var api = $element.qtip('api');
            if ( api === undefined ) {
                var qtipOptions = {
                    content: message,
                    position: {
                        target: $element
                    }
                };
                $.extend(true, qtipOptions, this.options.qtip);
                $.each(this.options.hints, function(selector, hintOptions) {
                    if ( $element.is(selector) ) {
                        $.extend(true, qtipOptions, hintOptions);
                    }
                });
                // initialise qtip
                $element.qtip(qtipOptions);
            } else {
                // Update existing qtip and show
                api.set('content.text', message);
                api.reposition();
                api.show();
            }
            return $element;
        },

        hideValidationMessage: function($element) {
            // Hide the validation tooltip for the given element or all tooltips
            // if no arguments given.
            if ( arguments.length == 0 ) {
                return $('[data-hasqtip]:visible',$(this.element)).each(function(index, element) {
                    $(element).qtip('hide');
                });
            } else {
                $element.qtip('hide');
                return $element;
            }
        },

        showMessage: function(type, message) {
            // Show the message of the type given with message as the content.
            if (! this.message[type]) {
                // Message area doesn't exist so create it.
                var messageDiv = $('<div></div>').addClass(this.options.messages[type].classes)
                var messageContent = $('<div></div>').html(message).addClass('message-content');

                messageDiv.append(messageContent).hide();
                var validationElement = $(this.element);
                messageDiv.click(function(event){
                    validationElement.validation('hideMessage', type);
                    validationElement.validation('reposition');
                });

                if (this.options.messages[type].before) {
                    $(this.options.messages[type].before).before(messageDiv);
                } else if (this.options.messages[type].after) {
                    $(this.options.messages[type].after).after(messageDiv);
                } else {
                    $('body').append(messageDiv);
                }

                this.message[type] = messageDiv;
                messageDiv.show(200, $.proxy(function() {
                    this.reposition();
                }, this));
            } else {
                // Update the message
                this.message[type].find('.message-content').html(message);
                this.message[type].show(200, $.proxy(function() {
                    this.reposition();
                }, this));
            }
        },

        hideMessage: function(type) {
            // Hide the message with the given type.
            if (this.message[type]) {
                this.message[type].hide(100, $.proxy(function() {
                    this.reposition();
                }, this));
            }
        },

        getMessage: function(type) {
            // Returns the jquery object for the message of the given type
            if ( this.message[type] ) {
                return this.message[type]
            } else {
                return $([]);
            }
        },

        reposition: function() {
            // Reposition or hide all validation messages.
            $('[data-hasqtip]').each(function() {
                if ( ! $(this).is(':visible') ) {
                    $(this).qtip('hide');
                } else {
                    $(this).qtip('reposition');
                }
            });
        },

        _destroy: function() {
            // Remove the elements created by this plugin.
            this.element.unbind('submit.validate');
            $(this.element).removeClass('validating');
            this._validationMessagesDestroy();
            this._messagesDestroy();
        },

        _validationMessagesDestroy: function() {
            // Destroy any tooltips associated with this element or it's descendants.
            $(this.element).find('[data-hasqtip]').qtip('destroy');
        },

        _messagesDestroy: function() {
            // Remove all messages added by this plugin.
            if ( this.message['alert'] ) {
                this.message['alert'].remove();
            }
            if ( this.message['error'] ) {
                this.message['error'].remove();
            }
            if ( this.message['notify'] ) {
                this.message['notify'].remove();
            }
        },

        setValuesFromResponse: function(response) {
            // Set form values from the response
            var $form = $(this.element);
            if (typeof response !== "undefined" && 'record' in response) {
                $.each(response.record, function(name, object) {
                    var $element = $form.find('[name=' + name + ']');
                    if ('valid' in object && object.valid && 'value' in object) {
                        if ($element.is("input[type='checkbox']")) {
                            // Checkbox - set checked property
                            if ($element.val() === object.value) {
                                // Check checkbox if values match
                                $element.prop("checked", true);
                            } else {
                                // Check checkbox if casted values are both true
                                var checked = parseBoolean($element.val()) && parseBoolean(object.value);
                                $element.prop("checked", checked);
                            }
                        } else {
                            // Set the value of the field
                            $element.val(object.value);
                        }
                    }
                });
            }
        },

        state: function(newState) {
            // Get/set the state of the plugin
            if(typeof(newState)=== "undefined") {
                return this.validationState;
            } else {
                this.validationState= newState;
            }
        },

        abort: function() {
            // Abort current validation request
            var widget = this;
            var $form = $(widget.element);
            // abort current AJAX request
            widget.validationAJAX.abort()
            // set validation plugin state to error
            $form.validation('state', 'error');
            // remove validating class
            $form.removeClass('validating');
            // re-enable future resubmit actions
            $form.data('resubmit-disabled',false);
        },
        
        scrollToFeedback: function() {
            // Scroll to highest feedback element.
            var $form = $(this.element);
            var $element = $([]);
            
            // notification messages - find highest element.
            var $messages = $([])
                .add($form.validation('getMessage', 'error'))
                .add($form.validation('getMessage', 'alert'))
                .add($form.validation('getMessage', 'notify'));
            $messages.each(function() {
                var $message = $(this);
                
                if ( $message.is(':visible')
                     && ( $element.length === 0 
                          || $message.offset().top < $element.offset().top
                        )
                   ) {
                    $element = $message;              
                }
            });
            
            // invalid inputs - find highest element.
            $('.invalid[name]:not(input[type=hidden])', $form).each(function() {
                var $input = $(this);
                if ( $element.length === 0
                     || $input.offset().top < $element.offset().top
                   ) {
                    $element = $input;  
                } 
            });
            
            // scroll to highest element.
            if ( $element.length ) {
                $element.get(0).scrollIntoView(this.options.scrollToFeedback);
                
            }         
        }
    });

})(jQuery, window, document);
