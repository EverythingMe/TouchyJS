function enableMobileAnalytics(Messenger, isMobile){
    var Log = Doat.Log || new Logger()
    var gaObj = new doat_GoogleAnalytics();
    gaObj.load(Log);

    if (isMobile){
        var nativeObj = new doat_nativeAppReporter();
        nativeObj.load(Log);
    }

    // USER_ACTION, PAGE_VIEW
    Messenger.bind([Doat.Events.USER_ACTION, Doat.Events.PAGE_VIEW], actionEventsCallback);
    // TRACING
    Messenger.bind([Doat.Events.WINDOW_LOADED, Doat.Events.RENDER_END], tracingEventsCallback);
    // No result
    Messenger.bind(Doat.Events.NO_RESULTS, noresultEventCallback);
    // When starting a new search - disable RENDER_END reporting
    Messenger.bind([Doat.Events.RENDER_END, Doat.Events.NO_RESULTS], function(event, data){
        Messenger.unbind(Doat.Events.RENDER_END, tracingEventsCallback);
        if (nativeObj) {nativeObj.report(event.type);}
    });
    // USER_ACTION, PAGE_VIEW
    Messenger.bind(Doat.Events.SEARCH_ERROR, searchErrorEventsCallback);

    function noresultEventCallback(event, data){
        gaObj.report([
            '_trackEvent', // trackType
            'Tracing', // category
            event.type, // action
            data.query // label
        ]);
    }

    function searchErrorEventsCallback(event, data){
        Log.error('Error getting search results '+JSON.stringify(data));
        noresultEventCallback(event, data);
    }

    function actionEventsCallback(event, data){
        var pageUrl;
        switch (data.action){
            case 'Navigate':
                pageUrl = '/'+data['to'];
                pageUrl+= (data.title) ? '/'+data.title.replace('/', '-') : '';
                break;
            case 'Search':
            case 'PageView':
                var query = data.newQuery || data.query;
                data.page = data.page || 'search';
                pageUrl = '/'+data.page;
                pageUrl+= (query) ? '/'+query.replace('/', '-') : '';
                break;
            default:
                return false;
        }

        gaObj.report([
            '_trackPageview', // trackType
            pageUrl // page URL
        ]);

        return true;
    }


    function tracingEventsCallback(event){
        var time = -1;
        if (typeof doat_ts !== 'undefined'){
            time = new Date().getTime()-doat_ts;
        }

        gaObj.report([
            '_trackEvent', // trackType
            'Tracing', // category
            event.type, // action
            getTracingLabel(time), // label
            time // value
        ]);
    }

    function getTracingLabel(time){
        var i;
        for (i=0; i<=5; i++){
            if (time/1000<i){
                return 'under '+i+' sec';
            }
        }
        return 'over '+(i-1)+' sec';
    }
}

function doat_GoogleAnalytics(){
    var ga_account, ga_domain, Log;

    if (/loc\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-2';
        ga_domain = '.loc.flyapps.me';
    }
    else if (/test\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-8';
        ga_domain = '.test.flyapps.me';
    }
    else if (/stg\.flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-7';
        ga_domain = '.stg.flyapps.me';
    }
    else if (/flyapps\.me/.test(location.host)){
        ga_account = 'UA-16876190-4';
        ga_domain = '.flyapps.me';

    }

    this.report = function(params){
        try{
            _gaq.push(params);
            var _gaq_status = (!_gaq.length) ? 'GA object' : 'temp array';
            Log.info('Pushed event to _gaq ('+_gaq_status+') -> '+JSON.stringify(params));
        }
        catch(err){
            Log.error('An error occured when performing _gaq.push ('+JSON.stringify(params)+')');
        }
    };

    this.load = function(_Log){
        Log = _Log;
        var appName = (typeof doat_appName == 'undefined') ? location.host.split('.')[0] : doat_appName;
        _gaq = (typeof _gaq !== 'undefined') ? _gaq : [];
        _gaq.push(
            ['_setAccount', ga_account],
            ['_setDomainName', ga_domain],
            ['_setCustomVar', 1, 'appname', appName]
        );
        Log.info('Loading GA for account "'+ga_account+'" under domain "'+ga_domain+'" with appname "'+appName+'"');

        create(
            'script',
            document.getElementsByTagName('HEAD')[0],
            {
                'type': 'text/javascript',
                'src': (("https:" == document.location.protocol) ? "https://ssl." : "http://www.") + 'google-analytics.com/ga.js',
                'async': 'true'
            }
        );
    };
}

function doat_nativeAppReporter(){
    var Log;

    this.load = function(_Log){
        Log = _Log;
    };

    this.report = function(eventType, time){
        var url = 'doatJS://report/'+eventType
        Log.info('Reporting to native app -> "'+url+'"');
        //location.href = url;
    };
}