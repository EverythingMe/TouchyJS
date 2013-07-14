function L10n(cfg, TouchyJS) { 
  
    var path,
        currLang,
        currLocale,
        langsMap,
        defaultLang;

    function init() {
        cfg = cfg || {};
        
        if (!cfg.l10n) return ;
        
        langsHash   = {};
        path        = cfg.l10n.folderPath  || 'locales';
        defaultLang = cfg.l10n.defaultLang || 'en'; 
        
        extendString();
        setLangLocale(getBrowserLang());
    }

    // this should be accessable for future outside events.
    function setLangLocale(lang) {
        var lang_locale = lang.split('-');
        currLang = lang_locale[0];
        currLocale = lang_locale[1] || "";
        loadTranslationFile();
    }

    function extendString() {
        String.prototype.interpolate = function ( jsonParams ) {
            return this.replace(/{{([^{}]*)}}/g, function ( match, actualVal ) {
                    return jsonParams[ actualVal ];
                }
            );
        };
    }

    function getBrowserLang() {
        return window.navigator.language;
    } 

    function loadTranslationFile(fallbackLang) {
        var url;

        currLang = fallbackLang || currLang;
        url      = '/' + path + '/' + 'strings.' + currLang + '.json';
       
        $.ajax({
            dataType: "json",
            url: url,
            success: function(response) {
                if (response) {
                    langsHash[currLang] = response;
                    setHtmlText();     

                    // translations ready.
                    TouchyJS.Events.dispatchEvent('translationReady');         
                } else {
                    retry(fallbackLang)
                }
            },
            error: function() {
                retry(fallbackLang)
            }
        });

    } 

    function retry(fallbackLang) {
        try {
            if (!fallbackLang) 
                loadTranslationFile(defaultLang);    
            else 
                throw( "TouchyJS L10n: Can\'t load translation files." ); 
        } catch(e) {
            console.error("Error: " + e);}
    }

    function setHtmlText() {
        var $elemes, strings;

        strings = langsHash[currLang];
        
        $elemes = $('*[data-l10n-id]');
        $elemes.each(function(index) {
            var $this, key, value;

            $this = $(this);
            key   = $this.attr('data-l10n-id');
            args  = $this.attr('data-l10n-args');
           
            if (args) {
                try {
                    args  = JSON.parse(args);    
                    value = strings[key].interpolate(args); 
                } catch(e){ 
                    console.error( "TouchyJS L10n: Can\'t parse json, check data-l10n-args. " + e.message );  }
            } else {
                value = strings[key]; 
            }
            
            $this.html( value );
        });
    }
 
    window._ = function(key, jsonParams) {
        var value, strings;

        strings = langsHash[currLang];
        return strings[key].interpolate(jsonParams);
    }

    init();
}

