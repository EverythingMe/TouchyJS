/**
* Instantiated if a DOML:searchbar tag was found in the document during parse()
* Gives a set of properties and methods for easy access to the DOM element and value.
* In touch interfaces (tablet, mobile...) it enables the key board to display a "search" button with submition functionality.
* @class
*/
var Doat_Searchbar = function(cfg){
    var inputEl, clearButton;

    this.autoinit = autoinit;
    this.clearValue = clearValue;
    this.fillValue = fillValue;
    this.setValue = setValue;
    this.getValue = getValue;
    this.getInputElement = getInputElement;
    this.onSubmit = onSubmit;
    this.blur = blur;
    this.focus = focus;
    
    Doat.Events.ready(init);
    
    function init(){
        inputEl = document.getElementById('doml-searchbar-searchfield');
        if (cfg && cfg.searchClearButton){
            addClearButton(cfg);   
        }
    }
    
    function addClearButton(cfg){
        if (getInputElement().getAttribute('clearbutton') !== ''){
            clearButton = new ClearButton();
            var css = cfg && cfg.css || {};
            !css['left'] && (css['left']= inputEl.offsetWidth);
            
            buttonEl = clearButton.init({
                'css': css,
                'onClick': function(){
                    setValue('');
                    focus();
                }
            });
            
            var form = getInputElement().parentNode;
            form.style.position = 'relative';
            form.appendChild(buttonEl);
        }
    }

    function clearValue(defaultText){
        if (defaultText === ''){return;}
        if (getValue() === defaultText){
            setValue('');
        }
    }

    function fillValue(defaultText){
        if (defaultText === ''){return;}
        if (getValue() === ''){
            setValue(defaultText);
        }
    }
    
    function focus(){
        inputEl.focus();
    }
    
    function blur(){
        inputEl.blur();
    }

    /**
    * @method setValue
    * @description Sets a new value to the searchbar textfield
    * @param {string|integer} value New value to set
    */
    function setValue (value){
        inputEl.value = value;
    }

    /**
    * @method getValue
    * @description Returns the current value of the searchbar textfield
    * @return {string} Current value of the searchbar textfield
    */
    function getValue(){
        return inputEl.value;
    }

    /**
    * @method getInputElement
    * @description Returns the generated searchbar textfield
    * @return {object HTMLInputElement} input
    */
    function getInputElement(){
        return inputEl;
    }

    /**
    * @method autoinit
    * @description Auto-searches the do_query value upon startup
    * @param {function} searchFunc The search function to be called
    * @ignore
    */
    function autoinit(searchFunc){
        setValue(Doat.getSearchQuery());
        searchFunc.call(this);
    }

    function onSubmit(){
        Doat.Messenger.trigger(Doat.Events.USER_ACTION,{
                'action': 'Search',
                'newQuery': getValue()
            }
        );
        blur();
    }
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
        $el.addClass('doml-searchbar-clear')
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
