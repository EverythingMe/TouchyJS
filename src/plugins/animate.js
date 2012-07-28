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

function enableCssAnim(platform, browser, Log){
    Log && Log.info('platform='+platform);
    
    var supported = document.body.style.animationName,
        prefixes = ["Webkit","Moz","O","ms","Khtml"];
    
    if( !supported ) {
        for( var i = 0; i < prefixes.length; i++ ) {
            if( document.body.style[ prefixes[i] + 'AnimationName' ] !== undefined ) {
                CSS_PREFIX = '-' + prefixes[ i ].toLowerCase() + '-';
                supported = true;
                break;
            }
        }
    }
    
    if (!supported) { return false; }
    
    var transfromKeys = ['scale', 'rotate', 'skew', 'translate', 'matrix'];

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
