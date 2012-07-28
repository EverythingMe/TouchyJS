/* 
 * Copyright 2011 DoAT. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this list of
 *      conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright notice, this list
 *      of conditions and the following disclaimer in the documentation and/or other materials
 *      provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Do@ ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of DoAT.
 */

/**
* Instantiated if a DOML:swiper tag was found in the document during parse()
* @class
*/
function Doat_Swiper() {
    var $el = null, $navEl = null, $itemsEl = null, selectCallback = null;
    var current = 0, currentTabs = 0, active = false, stopAutoplayOnTouch = true, thumbsSwipe = false;
    var ITEM_WIDTH = 320, THUMB_WIDTH = 0, NUMBER_OF_VISIBLE_THUMBS = 5, NUMBER_OF_ITEMS = 0, autoplayInterval = null;
    var ANIMATION_SPEED = "0.5", AUTOPLAY_SPEED = 4000;
    var _this = this;

    this.init = function(options) {
        options = options || {};
        
        $el = options.element || null;
        $navEl = options.navElement || null;
        $itemsEl = options.itemsElement || null;
        
        selectCallback = options.onSelect || null;
        
        options.itemWidth && (ITEM_WIDTH = options.itemWidth);
        options.thumbWidth && (THUMB_WIDTH = options.thumbWidth);
        options.numVisibleThumbs && (NUMBER_OF_VISIBLE_THUMBS = options.numVisibleThumbs);

        options.animationSpeed && (ANIMATION_SPEED = options.animationSpeed);
        
        options.autoplay && (typeof options.autoplay == "number") && (AUTOPLAY_SPEED = options.autoplay);
        stopAutoplayOnTouch = (typeof options.stopAutoplayOnTouch == "boolean")? options.stopAutoplayOnTouch : true;
        thumbsSwipe = (typeof options.thumbsSwipe == "boolean")? options.thumbsSwipe : false;

        onHitStartArr = [],
        onHitEndArr = [],
        onHitStart = function(){
            onHitStartArr.forEach(function(cb){
                cb.apply(arguments);
            });
        };
        onHitEnd = function(){
            onHitEndArr.forEach(function(cb){
                cb.apply(arguments);
            });
        };
        
        options.onHitStartCallback && onHitStartArr.push(options.onHitStartCallback);
        options.onHitEndCallback && onHitEndArr.push(options.onHitEndCallback);

        NUMBER_OF_ITEMS = $itemsEl.find("li").length;
        
        initDesign();
        addNavigationEvents();

        if ($navEl) {
            var $tabs = $navEl.find("li");
            $tabs.click(function(){
                _this.setItemByThumb(this);
            });
            $($tabs[0]).addClass("active");
        }

        show();
        if (options.autoplay) {
            _this.autoplayStart();
            if (options.stopAutoplayOnFocus) {
                Doat.Events.focused(function(){
                    _this.autoplayStop();
                });
                Doat.Events.blurred(function(){
                    _this.autoplayStart();
                });
            }
        }
    };

    function addNavigationEvents() {
        var element = $itemsEl.parent().get(0);
        Doat.Env.addEventListener(element, 'touch', function(e, data){
            switch (data.type){
                case "start":
                    disableAnimation($itemsEl);
                    stopAutoplayOnTouch && _this.autoplayStop();
                    break;
                case 'move':
                    _this.move(data.delta.x);
                    break;
                case 'end':
                    if (!data['swipeEvent']) {
                        _this.showCurrentItem();
                    } else {
                        e = e.originalEvent || e;
                        e.preventDefault();
                        enableAnimation($itemsEl);
                        if (data.direction == "rtl") {
                            _this.next();
                        } else {
                            _this.prev();
                        }
                    }
                    break;
            }
        });

        if ($navEl && thumbsSwipe) {
            element = $navEl.parent().get(0);
            Doat.Env.addEventListener(element, 'touch', function(e, data){
                switch (data.type){
                    case "start":
                        disableAnimation($navEl);
                        stopAutoplayOnTouch && _this.autoplayStop();
                        break;
                    case 'move':
                        _this.moveTabs(data.delta.x);
                        break;
                    case 'end':
                        if (!data['swipeEvent']) {
                            _this.showCurrentItem(true);
                        } else {
                            e = e.originalEvent || e;
                            e.preventDefault();
                            enableAnimation($navEl);
                            if (data.direction == "rtl") {
                                _this.nextTabs();
                            } else {
                                _this.prevTabs();
                            }
                        }
                        break;
                }
            });
        }

        $(document).bind("keyup", function(e) {
            if (active) {
                switch(e.keyCode) {
                    case 36: // HOME
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.setItem(0);
                        break;
                    case 35: // END
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.setItem(NUMBER_OF_ITEMS-1);
                        break;
                    case 39: // RIGHT
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.next();
                        break;
                    case 37: // LEFT
                         stopAutoplayOnTouch && _this.autoplayStop();
                         _this.prev();
                        break;
                }
            }
        });
    }

    function initDesign() {
        preventFlicker($el);
        preventFlicker($navEl);
        preventFlicker($itemsEl);

        $itemsEl.parent().css({
            "width": ITEM_WIDTH + "px",
            "overflow": "hidden"
        });
        $itemsEl.find("li").css({
            "float": "left",
            "width": ITEM_WIDTH + "px"
        });
        $itemsEl.css({
            "width": (ITEM_WIDTH*NUMBER_OF_ITEMS) + "px",
            "list-style-type": "none",
            "overflow": "hidden"
        });
        
        if ($navEl && THUMB_WIDTH !== 0) {
            $navEl.css({
                "width": (THUMB_WIDTH*NUMBER_OF_ITEMS) + "px",
                "list-style-type": "none",
                "overflow": "hidden"
            });
        }
    }
    
    this.autoplayStart = function(){
        if (autoplayInterval !== null) {
            _this.autoplayStop();
        }
        
    	autoplayInterval = setInterval(function(){
            _this.next(true);
        }, AUTOPLAY_SPEED);
    };
    
    this.autoplayStop = function(){
    	clearInterval(autoplayInterval);
        autoplayInterval = null;
    };

    this.show = function(cfg) {
    	if (cfg && cfg.delay) {
            setTimeout(show, cfg.delay);
    	} else {
            show();
    	}
    };
    this.hide = function() {
        $el.hide();
        active = false;
    };
    
    function show(){
        $el.show();
        active = true;
    }

    this.removeItem = function(item) {
        var el = (typeof item == "number")? $itemsEl.children()[item] : item;
        var i = _this.index(el);
        
        $(el).remove();
        $navEl && $($navEl.children()[i]).remove();

        NUMBER_OF_ITEMS--;
        if (current == i) {
            current--;
            if (current <= 0) {
                current = 0;
            }
        }
        _this.showCurrentItem();
    };

    this.move = function(x) {
    	$itemsEl.css({
            "-webkit-transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)",
            "-moz-transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)",
            "transform": "translate(" + -(current*ITEM_WIDTH-x) + "px)"
        });
    };
    this.moveTabs = function(x) {
    	$navEl && $navEl.css({
            "-webkit-transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)",
            "-moz-transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)",
            "transform": "translate(" + -(currentTabs*THUMB_WIDTH-x) + "px)"
        });
    };
    this.prev = function() {
        current--;
        if (current < 0) {
            current = 0;
            onHitStart();
        }
        _this.showCurrentItem();
    };
    this.next = function(bFromAutoplay) {
        current++;
        if (current == NUMBER_OF_ITEMS) {
            current = (bFromAutoplay)? 0 : NUMBER_OF_ITEMS-1;
            onHitEnd();
        }
        _this.showCurrentItem();
    };
    this.prevTabs = function() {
        currentTabs-=NUMBER_OF_VISIBLE_THUMBS;
        if (currentTabs <= 0) {
            currentTabs = 0;
        }
        _this.showCurrentItem(true);
    };
    this.nextTabs = function() {
        currentTabs+=NUMBER_OF_VISIBLE_THUMBS;
        
        if (currentTabs >= NUMBER_OF_ITEMS - NUMBER_OF_VISIBLE_THUMBS) {
            currentTabs = NUMBER_OF_ITEMS - NUMBER_OF_VISIBLE_THUMBS;
        }
        _this.showCurrentItem(true);
    };

    this.setItemByThumb = function(el) {
        _this.setItem(_this.index(el));
    };

    this.getCurrent = function() {
        return current;
    };

    this.index = function($el) {
        $el = $($el);
        var items = $el.parent().children();
        for (var i=0; i<items.length; i++) {
            if (items[i] == $el[0]) {
                return i;
            }
        }
        return -1;
    };
    
    this.setItem = function(index) {
        current = index;
        _this.showCurrentItem();
    };

    this.showCurrentItem = function(changeTabs) {
        var $elToMove = (changeTabs && $navEl)? $navEl : $itemsEl;
        var newPos = (changeTabs && $navEl)? -(currentTabs*THUMB_WIDTH) : -(current*ITEM_WIDTH);
        
        enableAnimation($elToMove);
    	$elToMove.css({
            "-webkit-transform": "translate(" + newPos + "px)",
            "-moz-transform": "translate(" + newPos + "px)",
            "transform": "translate(" + newPos + "px)"
        });
        
        selectCallback && selectCallback(current);

        $itemsEl.find(".active").removeClass("active");
        $($itemsEl.children("li")[current]).addClass("active");
        
        if ($navEl) {
            $navEl.find(".active").removeClass("active");
            $($navEl.children("li")[current]).addClass("active");
        }

        if (!changeTabs) {
            var newTabsPosition = Math.floor(current/NUMBER_OF_VISIBLE_THUMBS)*NUMBER_OF_VISIBLE_THUMBS;
            if (newTabsPosition != currentTabs) {
                currentTabs = newTabsPosition;
                _this.showCurrentItem(true);
            }
        }
    };

    function disableAnimation($el) {
        $el.css({
            "-moz-transition": "-moz-transform 0s",
            "-webkit-transition": "-webkit-transform 0s",
            "transition": "transform 0s"
        });
    }

    function enableAnimation($el) {
        $el && $el.css({
            "-moz-transition": " -moz-transform " + ANIMATION_SPEED + "s ease-out",
            "-webkit-transition": "-webkit-transform " + ANIMATION_SPEED + "s ease-out",
            "transition": "transform " + ANIMATION_SPEED + "s ease-out"
        });
    }

    function preventFlicker($el) {
        $el && $el.css({
            "-webkit-transform": "translate3d(0px, 0px, 0px) rotate(0deg) scale(1)",
            "-webkit-box-sizing": "border-box",
            "-webkit-backface-visibility": "hidden"
        });
    }
}
