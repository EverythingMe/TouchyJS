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
* Instantiated if a DOML:searchbar tag was found in the document during parse()
* Gives a set of properties and methods for easy access to the DOM element and value.
* In touch interfaces (tablet, mobile...) it enables the key board to display a "search" button with submition functionality.
* @class
*/
var Doat_Searchbar = function(cfg){
    var _this = this,
        inputEl, clearButton, $body, formEl,
        keyboardVisibleCallbacks = [],
        keyboardHiddenCallbacks = [],
        KEYBOARD_CLASSNAME = "tml-searchbar-keyboard-visible",
        defaultText,
        DEFAULT_TEXT_CLASSNAME = "default";

    this.clearValue = clearValue;
    this.fillValue = fillValue;
    this.setValue = setValue;
    this.getInputElement = getInputElement;
    this.submitFunc = validateSubmit;
    this.blur = blur;
    this.focus = focus;
    this.onKeyboardVisible = onKeyboardVisible;
    this.onKeyboardHidden = onKeyboardHidden;
    
    Doat.Events.ready(init);
    
    function init(){
        inputEl = document.getElementById('tml-searchbar-searchfield');
        if (inputEl){
            $body = $(document.body);
            
            formEl = document.getElementById('tml-searchbar-form');
            _this.submit = formEl.onsubmit;
             
            defaultText = inputEl.getAttribute("data-defaulttext");
            
            inputEl.addEventListener("focus", onFocus, false);
            inputEl.addEventListener("blur", onBlur, false);
            inputEl.addEventListener("touchstart", function(){
                Doat.Viewport.hideAddressBar();
            }, false);
            
            if (cfg && cfg.searchClearButton){
                addClearButton(cfg);   
            }
            
            setValue("");
            
            Doat.Nav.bind("*", "in", "onstart", function(data){
                if (!data || !data.urlParams) {
                    return;
                }
                
                var q = data.urlParams.do_query || "";
                setValue(q);
            });
        }
    }
    
    function addClearButton(cfg){
        if (getInputElement().getAttribute('data-clearbutton') !== ''){
            clearButton = new ClearButton();
            var css = cfg && cfg.css || {};
            !css['left'] && (css['left']= inputEl.offsetWidth);
            
            buttonEl = clearButton.init({
                'css': css,
                'onClick': function(){
                    setValue('', true);
                    focus();
                }
            });
            
            var form = getInputElement().parentNode;
            form.style.position = 'relative';
            form.appendChild(buttonEl);
        }
    }

    function clearValue(){
        inputEl.className = "";
        if (!defaultText){return;}
        if (getValue() === defaultText){
            setValue('', true);
        }
    }

    function fillValue(){
        if (!defaultText){return;}
        if (getValue() === ''){
            setValue(defaultText);
        }
    }
    
    function validateSubmit(submitFunc){
        Doat.Viewport.hideAddressBar();
        if (getValue() !== '' && getValue() !== defaultText){
            submitFunc && submitFunc();
        }
        blur();
    }
    
    function focus(){
        inputEl.focus();
    }
    
    function blur(){
        inputEl.blur();
    }
    
    function onKeyboardVisible(cb){
        keyboardVisibleCallbacks.push(cb);
    }
    
    function onKeyboardHidden(cb){
        keyboardHiddenCallbacks.push(cb);
    }

    /**
    * @method setValue
    * @description Sets a new value to the searchbar textfield
    * @param {string|integer} value New value to set
    */
    function setValue (value, force){
        if (!force && !value){
             value = defaultText || "";
        }
        
        if (defaultText) {
            inputEl.className = DEFAULT_TEXT_CLASSNAME;
        }
        
        inputEl.value = normalize(value);
    }

    /**
    * @method getValue
    * @description Returns the current value of the searchbar textfield
    * @return {string} Current value of the searchbar textfield
    */
    function getValue(){
        return normalize(inputEl.value);
    }

    /**
    * @method getInputElement
    * @description Returns the generated searchbar textfield
    * @return {object HTMLInputElement} input
    */
    function getInputElement(){
        return inputEl;
    }

    function onSubmit(){
        Doat.Messenger.trigger(Doat.Events.USER_ACTION,{
                'action': 'Search',
                'newQuery': getValue()
            }
        );
        blur();
    }
    
    function onFocus(){
        Doat.Viewport.hideAddressBar();
        $body.addClass(KEYBOARD_CLASSNAME);
        clearValue();
        for (var i=0,len=keyboardVisibleCallbacks.length; i<len; i++ ) {
            keyboardVisibleCallbacks[i].call(inputEl)
        }
    }
    
    function onBlur(){
        $body.removeClass(KEYBOARD_CLASSNAME);
        fillValue();
        for (var i=0,len=keyboardHiddenCallbacks.length; i<len; i++ ) {
            keyboardHiddenCallbacks[i].call(inputEl)
        }
    }
    
    function normalize(v) {
        return v.replace(/\+/g, " ");
    }
    
    
    this.getValue = function() {
        var val = getValue()
        return val !== defaultText ? val : "";
    };
};

function ClearButton(){
    var $el,
        css = {
           'position': 'absolute',
           'top': '5px',
           'cursor': 'pointer',
           'background-color': '#BBBBBB',
           'width': '16px',
           'height': '16px',
           'text-align': 'center',
           'line-height': '17px',
           'border-radius': '8px',
           '-webkitborder-radius': '8px',
           '-moz-border-radius': '8px',
           'color': 'white',
           'font-weight': 'bold',
           'font-size': '12px',
           'font-family': 'arial',
           'text-shadow': 'none',
           'leftOffset': -19
       };
    
    this.init = function(cfg){
        for (i in cfg.css) css[i] = cfg.css[i];
        css['left'] = css.left+css.leftOffset+'px';
        
        $el = $('<span/>');
        $el.addClass('tml-searchbar-clear')
           .html('X')
           .css(css)
           .click(function(e){
               e.preventDefault();
               cfg.onClick();
           });
        
        return $el[0];
    }
    
    this.show = function(){
        $el.show();
    };
        
    this.hide = function(){
        $el.hide();
    };
        
}
