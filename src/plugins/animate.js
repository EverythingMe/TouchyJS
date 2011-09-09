function enableCssAnim(platform, browser, Log){
    Log && Log.info('platform='+platform);
    var transfromKeys = ['scale', 'rotate', 'skew', 'translate', 'matrix'],    
    CSS_PREFIX = browser === 'webkit' ? '-webkit-' : browser === 'mozilla' ? '-moz-' : '';

    css();

    $.fn.fadeIn = function(){
        var a = normalizeArguments(arguments);
        return $(this).animate({'opacity': 1}, a.dur, a.ease, a.cb);
    };

    $.fn.fadeOut = function(){
        var a = normalizeArguments(arguments);
        return $(this).animate({'opacity': 0}, a.dur, a.ease, a.cb);
    };

    $.fn.animate = function(){
        var $el = this;
        var k, props, dur, ease, callbacks = [];
        for (var i=1; i<arguments.length; i++){
            var arg = arguments[i];
            if (typeof arg === 'function'){
                callbacks.push(arg);
            }
            else if (arg === 'fast' || arg === 'slow'){
                dur = arg;
            }
            else if (typeof arg === 'string'){
                ease = arg;
            }
            else {
                dur = arg;
            }
        }

        // CSS properties
        props = arguments[0];
        props[CSS_PREFIX+'transform'] = '';
        for (k in props){
            var val;
            if (props[k].toString().indexOf('=')!==-1){
                props[k] = getIncVal($el, k, props[k]);
            }
            if (isTransform(k)){
                props[CSS_PREFIX+'transform']+= k+'('+props[k]+')';
                delete props[k];
            }
            else if (k === 'left' || k === 'right'){
                val = (k === 'right') ? reverse(props[k]) : props[k];
                props[CSS_PREFIX+'transform']+= 'translateX('+val+')';
                delete props[k];
            }
            else if (k === 'bottom' || k === 'top'){
                val = (k === 'bottom') ? reverse(props[k]) : props[k];
                props[CSS_PREFIX+'transform']+= 'translateY('+val+')';
                delete props[k];
            }
        }

        // Duration
        dur = (dur === 'fast') ? 0.2 : (dur === 'slow') ? 0.6 : dur/1000 || 0.3;

        // Easing
        ease = (!ease || ease === 'swing') ? 'ease-in-out' : ease;

        // Callback
        if (callbacks.length > 0){
            setTimeout(function(){
                var i, len = callbacks.length;
                for (i=0; i<len; i++){
                  callbacks[i].call($el);
                }
            }, dur*1000);
        }

        // Execute CSS properties
        props[CSS_PREFIX+'transition'] = 'all '+dur+'s '+ease;
        return $el.css(props);
    }

    function isTransform(k){
        for (var i=0; i<transfromKeys.length; i++){
            if (k.indexOf(transfromKeys[i])!==-1){
                return true;
                break;
            }
        }
        return false;
    }

    function reverse(v){
        v = v.toString();
        return (v.indexOf('-') === 0) ? v.substring(1, v.length) : '-'+v;
    }

    function getIncVal(el, propName, value){
        var inc = (value.indexOf('-=')!==-1) ? -1 : 1;
        value = value.toString();
        var num = parseInt(value.substring(2, value.length), 10).toString();
        var unit = value.substring(2+num.length, value.length);
        var curValue = el.css(propName);
        curValue = (curValue && curValue !== '') ? parseInt(curValue, 10) : 0;
        var newValue = curValue+(inc*num)+unit;
        return newValue;
    }

    function css(){
        var cfg = {};

        if (platform !== 'android'){
            cfg[CSS_PREFIX+'transform'] = 'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)';
            cfg[CSS_PREFIX+'box-sizing'] =  'border-box';
            cfg[CSS_PREFIX+'backface-visibility'] = 'hidden';
            Log && Log.info('Including cfg[\''+CSS_PREFIX+'transform\'] = \'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)\'');
        }
        else{
            Log && Log.info('not including cfg[\''+CSS_PREFIX+'transform\'] = \'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)\'');
        }
        $('.doml_content').css(cfg);
    }
}

function normalizeArguments(args){
    var val = {};
    for (var i=0; i<args.length; i++){
        var arg = args[i];
        if (typeof arg === 'function'){
            val.cb = arg;
        }
        else if (arg === 'fast' || arg === 'slow'){
            val.dur = arg;
        }
        else if (typeof arg === 'string'){
            val.ease = arg;
        }
        else {
            val.dur = arg;
        }
    }
    return val;
}