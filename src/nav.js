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
* Providing the ability to navigate between content "pages" using a smoothe motion animation
* @class
*/
var Doat_Navigation = function(){
    var mainObj = Doat,
        classnamePrefix = 'tml_',
        isMobile = mainObj.Env.isMobile(),
        $currentElement,
        $previousElement,
        currentElementHeight,
        cfg = {},
        cbArr = {},
        CSS_PREFIX,
        ADDRESS_FIRST = true,
        isNavigating = false,
        firstPageId,
        globalOptions,
        hashArr = [],
        isCurrentFirstInHistory = false,
        currentHistoryState,
        historyEnabled;

    var b = mainObj.Env.getInfo().browser.name || mainObj.Env.getInfo().browser;
    CSS_PREFIX = b === 'webkit' ? '-webkit-' : b === 'mozilla' ? '-moz-' : '';

    var init = function(_cfg){
        _cfg && (cfg = aug(cfg, _cfg));
        
        var firstPage = document.querySelector(".tml_content");
        firstPageId = cfg.firstPageId || firstPage && firstPage.id; 
    };
    
    /**
     * Responsible for creating the motion animation between the current page and the one provided
     * @param {string | object HTMLElement} toPage The id or DOM element referencing the content wrapper ("page") to move to.
     * @param {object} [options] An object with a set of configuration property/value pairs, specifying the configuration for the navigation.<br/><br/>
     * <ul>
     * <li>onComplete -  a function to be executed when the animation is complete
     * <br />
     *       Recieves two arguments:<br />
     *      &nbsp; outElement - the DOM element that animated out
     *      &nbsp; inElement - the DOM element that animated in</li>
     * <li>
     *      direction -  The direction of the page transition animation.
     *      <br />
     *      Accepts "rtl" or "ltr"
     *      <br /><br />
     *      <em>If not specified, the direction will be determined automatically</em>
     *      </li>
     * </ul>
     * Supports "onComplete" property with a value of . <br />
     */
    var attachCallback = function(){
        var a = arguments;

        var pageId = (typeof a[0] === 'string') ? a[0] : a[0].get ? a[0].get(0).getAttribute('id') : a[0].getAttribute('id'),
            direction = a[1], // 'in'/'out'
            timing = (typeof a[2] === 'string') ? a[2].toLowerCase() : 'oncomplete', // 'onstart'/'oncomplete'
            cb = (typeof a[2] === 'string') ? a[3] : a[2];

        cbArr[pageId] = cbArr[pageId] || {};
        cbArr[pageId][timing] = cbArr[pageId][timing] || {};
        cbArr[pageId][timing][direction] = cb;
    };

    var navigate = function(toPage, options, bNoCallback){
        !options && (options = getCurrentHistoryState().urlParams);
        if (!toPage || isNavigating){return false;}
        isNavigating = true;
        
        var $nextElement = (toPage.constructor === String) ? $('.'+classnamePrefix+'content#'+toPage) : $(toPage);

        if (!bNoCallback) {
            onStart($nextElement, options);
        }
        
        if ($currentElement[0].id == $nextElement[0].id && $currentElement.css("display") == "block"){
            onComplete($nextElement, options);
            return false;
        }
        else if (options && options['transition'] == 'none'){
            var nextElCss = {
                'left': '0%',
                'display': 'block'
            };
            nextElCss[CSS_PREFIX+'transition-duration'] = '0';
            nextElCss[CSS_PREFIX+'transform'] =  'translateX(0)';
            $nextElement.css(nextElCss);

            var currElCss = {
                'display': 'none'
            };
            
            if ('outElementStyle' in  options) {
                for (var k in options['outElementStyle']) {
                    currElCss[k] = options['outElementStyle'][k];
                }
            }
                        
            $currentElement.css(currElCss);

            onComplete($nextElement, options);
        }
        else if (options && options['transition'] == 'fade'){            
            
            $currentElement.
               css('z-index', 2);
            
            if (isMobile){
                $nextElement.css(CSS_PREFIX+'transition-duration', '0');
                $nextElement.css(CSS_PREFIX+'transform', 'translateX(0)');
            }
            else{
                $nextElement.css('left', 0);
            }
            $nextElement.css('display', 'block');

            $currentElement.
               css(CSS_PREFIX+'transition', 'opacity 0.5s linear').
               css('opacity', 0);

            setTimeout(function(){
                $currentElement.
                    css('display', 'none').
                    css(CSS_PREFIX+'transition-duration', '0').
                    css({
                        'z-index': 1,
                        'opacity': 1
                    });
                 onComplete($nextElement, options);
            }, 200);
        }
        else{
            var direction = options && options.direction || determineDirection($nextElement),
                nextStart = (direction === 'rtl') ? '100%' : '-100%',
                currentEnd = (direction === 'rtl') ? '-100%' : '100%';

            if (isMobile){
                $nextElement.css(CSS_PREFIX+'transition-duration', '0');
                $nextElement.css(CSS_PREFIX+'transform', 'translateX('+nextStart+')');
            }
            else{
                $nextElement.css('left', nextStart);
            }
            $nextElement.css('display', 'block');

            setTimeout(function(){
                $nextElement.animate({'left': '0%'});
                $currentElement.animate({'left': currentEnd}, function(){
                    onComplete($nextElement, options);
                });
            }, 200);
        }

        // If muteEventReport == true, don't continue to reporting the message
        if (!options || options.muteEventReport !== true){
            var props = {
                'action': 'Navigate',
                'to': $nextElement[0].id
            };
            if (options && options.title){
                props.title = options.title.replace('/', '-');
            }
            if (options && options.id && options.id.replace){
                props.id = options.id.replace('/', '-');
            }
            if (mainObj.Messenger) {mainObj.Messenger.trigger(mainObj.Events.USER_ACTION, props)};
        }
        
        Doat.Viewport.hideAddressBar();

        return true;
    };

    var back = function(){
        if (historyEnabled){
            var isFirstPage = getCurrentHistoryState().firstPage;
            if (isFirstPage) {
                goTo(firstPageId, {"direction": "ltr"});
            } else {
                history.back();
            }
        }
        else{
            goTo($previousElement, {'muteEventReport': true});
        }
        Doat.Viewport.hideAddressBar();
    };

    var goTo = function(toPage, options, bNoCallback){
        !options && (options = {});
        if (historyEnabled) {
            toPage.constructor !== String && ( toPage = $(toPage)[0].id);

            var qs = getCurrentHistoryState().urlParams;
            
            if (options.url){
                for (var k in options.url) {
                    qs[k] = options.url[k];
                }
                delete options.url;
            }
            
            qs["topage"] = toPage;
            
            if (objectEqual(qs, encodedParseQuery())){
                return false;
            }
            
            var params = [];
            for (var k in qs){
                // Don't include topage in the url if it's the default page
                if (!(k === "topage" && qs[k] === firstPageId)) {
                    params.push(k+"="+(qs[k] || ""));    
                }
            }
            
            var url = "?"+params.join("&");
            
            aug(options, {"firstPage": false, "urlParams": qs});
            window.history.pushState(options, null, url);
        }
        navigate.apply(this, arguments);
    };
    
    var next = function(options, bNoCallback) {
        var $nextEl = $currentElement.next();
        if ($nextEl && $nextEl.hasClass("tml_content")) {
            goTo($nextEl, options, bNoCallback);
        }
    };
    
    var previous = function(options, bNoCallback) {
        var $prevEl = $currentElement.prev();
        if ($prevEl && $prevEl.hasClass("tml_content")) {
            goTo($prevEl, options, bNoCallback);
        }
    };

    var onStart = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
            
        aug(options, {
            "currentElement": $currentElement[0],
            "nextElement": $nextElement[0]
        });

        execCallback(options, ['*', 'onstart', 'in']);
        execCallback(options, [nextId, 'onstart', 'in']);
        
        if (currId != nextId) {
            execCallback(options, [currId, 'onstart', 'out']);
        }
        
        execCallback(options, options, ['onStart']);
    };
    
    var onComplete = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
            
        $previousElement = $currentElement;
        $currentElement = $nextElement;
        
        aug(options, {
            "currentElement": $currentElement[0],
            "nextElement": $previousElement[0]
        });
        
        execCallback(options, ['*', 'oncomplete', 'in']);
        execCallback(options, [nextId, 'oncomplete', 'in']);
            
        if (currId != nextId) {
            $previousElement.css('display', 'none');            
            execCallback(options, [currId, 'oncomplete', 'out']);
        }
        
        execCallback(options, options, ['onComplete']);
        
        isNavigating = false;
    };
    
    var execCallback = function(data, obj, keys){
        var flag = true;
        
        // if no obj was sent then make cbArr is the default
        if (!keys) {
            keys = obj;
            obj = cbArr;
        }
        
        if (!obj) { return false; }
        
        // check if the keys exist in the obj (obj[key1][key2][key3]...)
        for (var i=0,len=keys.length; i<len; i++){
            obj = obj[keys[i]];
            if (!obj) {
                flag = false;
                break;
            }
        }
        
        // execute callback
        flag && obj(data);
    }

    /**
     * @method determineDirection
     * @description Determines direction by the next element's current position.
     * If the element is on the left (style.left === '-100%') then the direction will be 'ltr'
     * If it's on the right ('100%') or if 'left' was never set, the direction will be 'rtl'
     * @param {object jQuery element} $el the element in question
     * @ignore
     */
    var determineDirection = function($el){
        var transformVal = getTransformValue($el);
        var condition = (transformVal && transformVal !== '' && transformVal !== 'none')
                            ? (transformVal === 'translateX(-100%)')
                                : ($el.get(0).style.left === '-100%');
        return condition ? 'ltr' : 'rtl';
    };

    var getTransformValue = function($el){
        var $value = $el.css(CSS_PREFIX+'transform'),
            value = $el[0].style[CSS_PREFIX+'transform'];

        return $value && $value !== '' && $value !== 'none' ? $value : value;
    };

    /**
     * @method setCurrent
     * @description Sets the DOM element argument as the current content wrapper "page" that is viewed.
     * When navigating to another "page", this element will be moved out.
     * @param {object HTMLElement} currentEl A DOM element to be set as the current content wrapper "page"
     * @ignore
     */
    var setCurrent = function(currentEl){
        if (currentEl.constructor === String){
            $currentElement = $('#'+currentEl);
        }
        else{
            $currentElement = $(currentEl);
        }
        !firstPageId && (firstPageId = currentEl.id);
    };

    /**
     * @method getCurrent
     * @description Gets the DOM element that is the current content wrapper "page".
     * @return {object HTMLElement} A DOM element that has been set as the current content wrapper "page"
     */
    var getCurrent = function(){
        return $currentElement[0];
    };
    
    var hasNewContentHeight = function(){
        if ($currentElement &&
            currentElementHeight !== $currentElement[0].offsetHeight){
            currentElementHeight = $currentElement[0].offsetHeight;
            return currentElementHeight;
        }

        return false;
    };

    /*
     * Callback triggered on window.popstate
     */
    var onAddressChanged = function(data) {
        if (data && data.state) {
            var state = setCurrentHistoryState(data);
            var page = state.urlParams.topage || firstPageId;
    
            navigate(page, state);    
        }
    };
    
    /*
     * Callback triggered for first browser history page
     */
    var onFirstPage = function() {
        var parsedQuery = encodedParseQuery(),
            page = parsedQuery["topage"] || firstPageId,
            options = { "transition": "none", "outElementStyle": {} };
            
         if (Doat.Env.isMobile()) {
            options["outElementStyle"][CSS_PREFIX+"transform"] = "translateX(-100%)" ;
        } else {
            options["outElementStyle"]["left"] = "-100%";
        }
            
        var state = getCurrentHistoryState();
        if (!state || state.firstPage === undefined) {
            state = {
                "firstPage": true,
                "urlParams": parsedQuery    
            };
            setCurrentHistoryState({
                "state": state
            });
            
            window.history.replaceState(state, null);
        }
        aug(options, {"firstPage": true, "urlParams": parsedQuery});
        navigate(page, options);
    };

    /*
     * Initiates the browser history logic
     */
    var initHistory = function() {
        historyEnabled = true;
        window.addEventListener("popstate", onAddressChanged, false);
        onFirstPage();
    };
    
    /*
     * returns url decoded parsed querystring
     */
    var encodedParseQuery = function(){
        var p = parseQuery();
        for (var k in p) {
            p[k] = decodeURIComponent(p[k]);
        }
        return p;
    };
    
    var getCurrentHistoryState = function(){
        var state = {};
        if (currentHistoryState){
            for (var k in currentHistoryState) {
                state[k] = currentHistoryState[k];
            }
        }
        return state;
    };
    
    var setCurrentHistoryState = function(data){
        return currentHistoryState = data && data.state;
    };

    return {
        'init': init,
        'initHistory': initHistory,
        'goTo': goTo,
        'next': next,
        'previous': previous,
        'back': back,
        'attachCallback': attachCallback,
        'bind': attachCallback,
        'setCurrent': setCurrent,
        'getCurrent': getCurrent,
        'hasNewContentHeight': hasNewContentHeight,
        'Indicator': new Doat_Progress_Indicator()
    };
};

function Doat_Progress_Indicator(){
    var mainSpinner, customSpinner, mainEl,
        default_cfg = {
            lines: 10, // The number of lines to draw
            length: 7, // The length of each line
            width: 3, // The line thickness
            radius: 7, // The radius of the inner circle
            color: '#ffffff', // #rbg or #rrggbb
            speed: 1.4, // Rounds per second
            trail: 72, // Afterglow percentage
            shadow: true, // Whether to render a shadow,
            parent: document.body
        },
        default_css = {
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'z-index': 200
        };
        
    var initCustomSpinner = function(customSpinnerCfg){
        var cfg = {};
        for (i in default_cfg) cfg[i] = default_cfg[i];
        for (i in customSpinnerCfg) cfg[i] = customSpinnerCfg[i];

        var parent = customSpinnerCfg.parent || $(document.body);

        $mainEl = parent.find('.doml-progress-indicator');
        if ($mainEl.length === 0) {
            $mainEl = $('<span class="doml-progress-indicator" />');
            $mainEl.css(default_css);
            parent.append($mainEl);
        }

        mainEl = $mainEl[0];

        customSpinner = new Spinner(cfg);
        customSpinner.spin(mainEl);
    };
    
    var initMainSpinner = function(){
        $mainEl = $('<span class="doml-progress-indicator" />');
        $mainEl.css(default_css);
        $(document.body).append($mainEl);
        
        mainEl = $mainEl[0];
        
        mainSpinner = new Spinner(default_cfg);
    };
    
    this.show = function(customSpinnerCfg){
        if (customSpinnerCfg){
            initCustomSpinner(customSpinnerCfg);
        }
        else{
            if (!mainSpinner){
                initMainSpinner();
            }
            mainSpinner.spin(mainEl);
        }
    };
    
    this.hide = function(){
        if (customSpinner){
            customSpinner.stop();
        }
        if (mainSpinner){
            mainSpinner.stop();    
        }        
    };
}
