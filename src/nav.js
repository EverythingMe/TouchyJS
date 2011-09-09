/**
* Providing the ability to navigate between content "pages" using a smoothe motion animation
* @class
*/
var Doat_Navigation = function(_cfg){
    var MainObj = typeof Doat != 'undefined' ? Doat : TouchyJS,
        classnamePrefix = typeof Doat != 'undefined' ? 'doml_' : 'touchyjs-',
        isMobile = MainObj.Env.isMobile(),
        $currentElement,
        $previousElement,
        currentElementHeight,
        cfg = _cfg || {},
        cbArr = {},
        addressCbArr = {},
        CSS_PREFIX,
        ADDRESS_FIRST = true,
        isNavigating = false,
        firstPageId;

    var b = MainObj.Env.getInfo().browser.name || MainObj.Env.getInfo().browser;
    CSS_PREFIX = b === 'webkit' ? '-webkit-' : b === 'mozilla' ? '-moz-' : '';

    var init = function(){
        if (cfg.includeChange) {
            initAddress();
        } 
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

            $currentElement.css({
                /*'left': '100%'*/
                'display': 'none'
            });

            onComplete($nextElement, options);
        }
        else if (options && options['transition'] == 'fade'){
        	$nextElement.css(CSS_PREFIX+'transition', 'opacity 0.5s linear');
                $nextElement.css({
                    'display': 'block',
                    'opacity': 1
                });

        	$currentElement.css(CSS_PREFIX+'transition', 'opacity 0.5s linear');
                $currentElement.css({
                    'opacity': 0
                });

                onComplete($nextElement, options);
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
            if (MainObj.Messenger) {MainObj.Messenger.trigger(MainObj.Events.USER_ACTION, props)};
        }

        return true;
    };

    var back = function(){
        if (cfg.includeChange){
            history.back();
        }
        else{
            goTo($previousElement, {'muteEventReport': true});  
        }
    };

    var goTo = function(toPage, options, bNoCallback){
        if (cfg.includeChange) {
            var $nextElement = (toPage.constructor === String) ? $('.'+classnamePrefix+'content#'+toPage) : $(toPage);
            
            var urlValue = "";
            if (options) {
                if (options.url) {
                    urlValue = "/" + options.url;
                } else if (options.id) {
                    urlValue = "/" + options.id;
                }
            }
            $.address.value($nextElement[0].id + urlValue);
        }
        
        //navigate.apply(this, arguments)
    };

    var onStart = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
        
        if (currId != nextId) {
            if (cbArr[nextId] && cbArr[nextId]['onstart'] && cbArr[nextId]['onstart']['in']){
                cbArr[nextId]['onstart']['in']($currentElement[0], $nextElement[0]);
            }
            if (cbArr[currId] && cbArr[currId]['onstart'] && cbArr[currId]['onstart']['out']){
                cbArr[currId]['onstart']['out']($currentElement[0], $nextElement[0]);
            }
        }
        
        if (options && options.onStart){
            options.onStart($currentElement[0], $nextElement[0]);
        }
    };
    var onComplete = function($nextElement, options){
        var currId = $currentElement[0].id,
            nextId = $nextElement[0].id;
            
        $previousElement = $currentElement;
        $currentElement = $nextElement;
            
        if (currId != nextId) {
            $previousElement.css('display', 'none');
            
            if (cbArr[nextId] && cbArr[nextId]['oncomplete'] && cbArr[nextId]['oncomplete']['in']){
                cbArr[nextId]['oncomplete']['in']($currentElement[0], $previousElement[0]);
            }
            if (cbArr[currId] && cbArr[currId]['oncomplete'] && cbArr[currId]['oncomplete']['out']){
                cbArr[currId]['oncomplete']['out']($currentElement[0], $previousElement[0]);
            }
        }
        
        if (options && options.onComplete){
            options.onComplete($currentElement[0], $previousElement[0]);
        }
        
        isNavigating = false;
    };

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

    var changed = function(_page, _cb) {
        if (typeof _page == "function") {
            _cb = _page;
            _page = "__default";
        } else if (typeof _page == "string") {
            if (_page == "") {
                _page = "__empty";
            }
            _page = [_page];
        }

        for (var i=0; i<_page.length; i++) {
            var page = _page[i];
            if (!addressCbArr[page]) addressCbArr[page] = [];
            addressCbArr[page].push(_cb);
        }
    };

    var addressChanged = function(event) {  
    
        var paths = event.pathNames,
            page = "__empty";
        
        if (paths.length > 0) {
            page = paths[0];
        }

        paths.splice(0, 1);
        
        if (!addressCbArr[page]) addressCbArr[page] = [];
        if (!addressCbArr["__default"]) addressCbArr["__default"] = [];
        
        var cbs = addressCbArr[page].concat(addressCbArr["__default"]);
        if (page == "__empty") page = firstPageId;
        
        if (ADDRESS_FIRST) {
            navigate(page, {
                "transition": "none"
            }, true);
            ADDRESS_FIRST = false;
        }
        else{
            navigate(page, {}, true);
        }

        for (var i=0; i<cbs.length; i++) {
            cbs[i](page, paths);
        }
    };

    var initAddress = function() {
        //cfg.includeChange = true;
        includeChanged();
        $.address.change(addressChanged);
    }   

    return {
        'init': init,
        'goTo': goTo,
        'back': back,
        'attachCallback': attachCallback,
        'initAddress': initAddress,
        'changed': changed,
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
            'top': '150px',
            'z-index': 200
        };
        
    var initCustomSpinner = function(customSpinnerCfg){
        var cfg = {};
        for (i in default_cfg) cfg[i] = default_cfg[i];
        for (i in customSpinnerCfg) cfg[i] = customSpinnerCfg[i];
        
        customSpinner = new Spinner(cfg);
        customSpinner.spin(cfg.parent);
    };
    
    var initMainSpinner = function(){
        $mainEl = $('<span class="touchyjs-progress-indicator" />');
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