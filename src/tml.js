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
* Providing the ability to embed DOML tags inside the document HTML, parse and replace with predefined code.
* @class
*/
function Doat_DOML(){
    var imageTemplate = 'http://doatresizer.appspot.com/?url={src}&width={width}&height={height}&cache=short&crop={crop}&default={default}', 
    templates = {
        'searchbar':{
        			type: 'replace',
        			html: '<form '+
                            'id="tml-searchbar-form" '+
                            'onsubmit="TouchyJS.Searchbar.submitFunc({onsubmit}); return false;" '+
                            '>'+                            
                                '<input type="text" '+
                                'data-defaulttext="{defaulttext}" '+
                                'onfocus="TouchyJS.Searchbar.clearValue(\'{defaulttext}\')" '+
                                'onblur="TouchyJS.Searchbar.fillValue(\'{defaulttext}\')" '+
                                'id="tml-searchbar-searchfield" '+
                                'name="searchfield" '+
                                'style="{style}" '+
                                'data-clearbutton={clearbutton}' +
                                '/>'+
                        '</form>'
                    },                           
        'searcharea':{
        			type: 'replace',
        			html: '<form '+
                            'id="tml-searchbar-form" '+
                            'onsubmit="TouchyJS.Searchbar.submitFunc({onsubmit}); return false;" '+
                            '>'+                            
                                '<textarea '+                                
                                'onfocus="TouchyJS.Searchbar.clearValue(\'{defaulttext}\')" '+
                                'onblur="TouchyJS.Searchbar.fillValue(\'{defaulttext}\')" '+
                                'id="tml-searchbar-searchfield" '+
                                'name="searchfield" '+
                                'style="{style}" '+
                                'clearbutton={clearbutton}' +
                                '>{defaulttext}'+
                                '</textarea>'+
                        '</form>'
                    },                    
        'navigate': {type: 'replace', html: '<a href="javascript://" class="{class}" onclick="TouchyJS.Navigation.goTo(\'{to}\')"><span>{label}</span></a>'},
        'image': {type: 'image', html: '<img src="'+imageTemplate+'" alt="{alt}" />'}
    },
    prefix = 'tml',
    keyDefaultValues = {
        'autoinit': 'false'
    };

    var regex = /\{([^}]*)\}/g;
    
    var _renderAttributes = function(DOMLTag, templateString){
      var values = {};
      return templateString ? (''+templateString).replace(regex, function(ignored, key) {
          if (!values.hasOwnProperty(key)) {
              // Don't use hasAttribute - fails in IE8
              values[key] = DOMLTag.getAttribute(key) ? DOMLTag.getAttribute(key) :
                  keyDefaultValues.hasOwnProperty(key) ? keyDefaultValues[key] : '';
          }
          return values[key];
      }) : templateString;
    };

    var replace = function(replacedEl, newHTML){
        if ($(replacedEl).replaceWith){
            $(replacedEl).replaceWith($(newHTML));
        }
        else{
            var newEl = $(newHTML)[0];
            replacedEl.parentNode.replaceChild(newEl, replacedEl);
        }
    };

    /**
    * Searches for DOML tags inside the document, replacing them with DOML UI element code and functionality.
    */
    this.parse = function(container){
        !container && (container = document.body);
        // Loop through every template in 'templates' array
        for (var suffix in templates){
            if (templates.hasOwnProperty(suffix)){// Simply a 'for each' best practice
                // Essemble tag name (e.g. 'do:header')
                var DOMLTagName = prefix+':'+suffix;

                // Get all DOML tags, within the wrapper element, that match the doTagName
                var DOMLTagsArr = container.getElementsByTagName(DOMLTagName);

                // Loop through all tags found and wrap them with the specified element
                for (var i=0; i<DOMLTagsArr.length; i++){
                    var templateHTML = _renderAttributes(DOMLTagsArr[i], templates[suffix].html);
                    replace(DOMLTagsArr[i], templateHTML);
                    i--;
                }
            }
        }
    };
    
    this.getImage = function(cfg){
        var pseudoTag = new function(cfg){
            this.getAttribute = function(key){
                return cfg[key];
            }
        }(cfg);
        return _renderAttributes(pseudoTag, imageTemplate);
    }
}
