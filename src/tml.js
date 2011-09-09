/**
* Providing the ability to embed DOML tags inside the document HTML, parse and replace with predefined code.
* @class
*/
function Doat_DOML(){
    var imageTemplate = 'http://doatresizer.appspot.com/?url={src}&width={width}&height={height}&cache=short&crop={crop}', 
    templates = {
        'searchbar':{type: 'replace', html:
                        '<form '+
                            'id="doml-searchbar-form" '+
                            'onsubmit="{onsubmit}();Doat.Searchbar.onSubmit();return false;" '+
                            '>'+
                                '<input type="text" '+
                                'value="{defaulttext}" '+
                                'onfocus="Doat.Searchbar.clearValue(\'{defaulttext}\')" '+
                                'onblur="Doat.Searchbar.fillValue(\'{defaulttext}\')" '+
                                'id="doml-searchbar-searchfield" '+
                                'name="searchfield" '+
                                'style="{style}" '+
                                'clearbutton={clearbutton}' +
                                '/>'+
                        '</form>'+
                        '<script>'+
                            'if ({autoinit}) Doat.Searchbar.autoinit({onsubmit});'+
                        '<'+'/script>'},
        'navigate': {type: 'replace', html: '<a href="javascript://" class="{class}" onclick="Doat.Navigation.goTo(\'{to}\')"><span>{label}</span></a>'},
        'image': {type: 'image', html: '<img src="'+imageTemplate+'" alt="{alt}" />'}
    },
    prefix = 'doml',
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
