var Doat_Facebook = function() {
    var _this = this, options = {}, head = document.getElementsByTagName('head')[0], $body = $(document.body),
        $elLogin = null, $elOverlay = null, $elLoginButton = null, $elLoginButtonReal = null, $elLoginButtonLoading = null, loggedIn = false,
        textDialog = textConnect = textConnecting = null, userPermissions = null;

    var inited = false,
        cacheUserResponse = null,
        loginCallbacks = [];

    var APP_ID = null,
        CHANNEL_FILE = null,
        STORAGE_KEY_FB_USER = "isFBUser",
        OG_NAMESPACE = "",
        FB_USER_NEW = 1,
        FB_USER_RETURN = 2,
        CLASS_FACEBOOK = 'doml-facebook',
        CLASS_FACEBOOK_LOGGEDIN = 'doml-facebook-loggedin';

    var DEFAULT_TEXTS = {
    	textDialog : 'Welcome<br />Please login',
    	textConnect : 'Login with Facebook',
    	textConnecting : 'Connecting...'
    };

    this.init = function(_options, forceInit) {
        _options && (options = _options);

        if (inited || (!forceInit && !options.login && !fbUser())) {
            return;
        }

        APP_ID = options.appId;
        CHANNEL_FILE = options.channel || 'http://' + window.location.hostname + '/channel.php';

        textDialog = options.textDialog || DEFAULT_TEXTS.textDialog;
        textConnect = options.textConnect || DEFAULT_TEXTS.textConnect;
        textConnecting = options.textConnecting || DEFAULT_TEXTS.textConnecting;
        OG_NAMESPACE = options.namespace || "";

        renderCSS();
        renderHTML();

        $elLoginCancel = $("#doat-fb-login-cancel");
        $elLogin = $("#doat-fb-login");
        $elLoginButton = $elLogin.find(".button");
        $elLoginButtonLoading = $elLoginButton.find(".button-loading");
        $elLoginButtonReal = $elLoginButton.find(".button-real");

       	$elLogin.find(".content").html(textDialog);
        $elLoginButtonReal.find(".text").html(textConnect);
        $elLoginButtonLoading.find(".text").html(textConnecting);

        $elLoginButton.bind("touchstart", function(e){
            e.preventDefault();
            e.stopPropagation();
            _this.login();
        });

        $elOverlay = $('<div id="doat-fb-overlay"></div>');
        $body.append($elOverlay);
        $elOverlay.bind("touchstart", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $body.addClass(CLASS_FACEBOOK);

        if (options.permissions) {
            userPermissions = options.permissions;
        }

        uiInit();
        fbInit();

        inited = true;
    };

    this.forceInit = function() {
        _this.init(null, true);
    };

    function uiInit() {
        if (Storage.get(STORAGE_KEY_FB_USER) != FB_USER_RETURN) {
            $(document.body).addClass("loggedout");

            $elLoginButton.find(".button-loading").removeClass("active");
            $elLoginButton.find(".button-real").addClass("active");

            $elOverlay && $elOverlay.show();
            $elLogin.show();

            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var top = window.innerHeight/2 + scrollTop;
            
            $elLogin.css({
                "top": top + "px",
                "margin-top": -($elLogin.height()/2+20) + "px"
            });

            $elLogin.bind("touchstart", function(e) {
                e.preventDefault();
            });

            if (Spinner) {
                var opts = {
                  "lines": 8,
                  "length": 2,
                  "width": 3,
                  "radius": 3,
                  "color": "#fff",
                  "speed": 1,
                  "trail": 60,
                  "shadow": false
                };
                loading = new Spinner(opts).spin($elLoginButtonLoading.find(".icon")[0]);
            }
        }
    }

    function fbInit() {
        var $fbroot = $('<div id="fb-root"></div>');
        $body.append($fbroot);

        var d = document, js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }

    this.onFBInit = function() {
        FB.init({
            "appId"      : APP_ID,
            "channelUrl" : CHANNEL_FILE,
            "status"     : true,
            "cookie"     : true,
            "xfbml"      : false
        });

        FB.getLoginStatus(function(response) {
            loggedIn = response.status === 'connected';

            if (response.status === 'connected') {
                checkPermissions(userPermissions, cbLoginSuccess, function() { _this.login(); });
            } else {
                _this.showLogin();
            }
        });
    };
    window.fbAsyncInit = _this.onFBInit;

    this.showLogin = function() {
        Storage.set(STORAGE_KEY_FB_USER, FB_USER_NEW);

        uiInit();

        FB.Event.subscribe('auth.statusChange', function(response) {
            loggedIn = response.status === 'connected';

            if (loggedIn) {
            	cbLoginSuccess();
            } else {
                cbLoginFail();
            }
        });
    };

    this.hideLogin = function() {
        $elLogin.hide();
        $elOverlay && $elOverlay.hide();
        $(document.body).removeClass("loggedout");
        loggedIn = true;
    };

    this.login = function() {
        if (!inited) {
            _this.forceInit();
            return;
        }

        if (!Storage.get(STORAGE_KEY_FB_USER)) {
            Storage.set(STORAGE_KEY_FB_USER, FB_USER_NEW);
        }

        FB.login(function(response) {
            if (response.status !== 'connected') {
                cbLoginFail();
            } else {
            	cbLoginSuccess();
            }
        }, (userPermissions ? { "scope" : userPermissions} : null));
    };

    this.logout = function() {

    };

    this.loggedIn = function() {
        return loggedIn;
    };

    this.action = function(options) {
        var namespace = options.fb.namespace || OG_NAMESPACE;

        var link = null;

        var token = new FB_Token();
        token.init(options.fb.shortname);

        for (key in options.fb.data) {
            options.fb.data[key] = token.addToLink(options.fb.data[key]);
        }

        FB.api(
            '/me/' + namespace + ':' + options.fb.action, 'post', options.fb.data, function(response) {
                token.handleAPICallback(options, response);
            }
        );
    };

    this.share = function(options) {
    	if (!options || !options.fb || !options.app) return;

        if (!inited) {
            _this.onLogin(function(){
                _this.share(options);
            });
            _this.forceInit();
            return;
        }

        var params = {
            "method": 'feed',
            "link": options.fb.link || 'http://'+ window.location.hostname,
            "message": options.fb.message || null,
            "picture": options.fb.picture || null,
            "name": options.fb.name || null,
            "description": options.fb.description || null,
            "caption": options.fb.caption || null
        };

        var token = new FB_Token();

        token.init(options.fb.shortname);

        params.link = token.addToLink(params.link);

        FB.ui(params, function(response) {
            token.handleAPICallback(options, response);
        });
    }

    function FB_Token() {

        var token = '',
            tokenRequest = null,
            flyappsHost = 'flyapps.me';

        this.init = function(shortname) {

            var a = window.location.host.split('.');
            if (!shortname) {
                shortname = a[0];
            }

            a.splice(0, 1);

            flyappsHost = a.join(".");

            token = shortname + '-' + (new Date()).getTime();
        }

        this.addToLink = function(link) {
            if (link) {
                if (link.indexOf('?') !== -1 ) {
                        link += '&token=' + token;
                    } else {
                        link += '?token=' + token;
                    }
                    return link;
            }
            return false;
        }

        this.handleAPICallback = function(options, response) {
            if (!response || response.error) {
                options.fb.onError && options.fb.onError();
            } else {
                options.app.onSuccessInit && options.app.onSuccessInit();

                var user = null;
                var postId = null;

                if (response) {
                    postId = response.post_id;
                }

                var params = {
                            app : {
                                'id':options.app.app_id,
                                'name': options.app.app_name,
                                'link': options.app.app_link || options.fb.link,
                                'image': options.app.app_image || null
                            },

                            fb: options.fb,

                            post : {
                                'profile_id': null,
                                'profile_name': null,
                                'profile_image': null,
                                'message': null,
                                'created': null
                            }
                        };

                Doat.FB.getUser(function(response) {
                    options.app.getUser && options.app.getUser(response);

                    params.post.profile_id = response.id;
                    params.post.profile_name = response.name;
                    params.post.profile_image = 'http://graph.facebook.com/'+ response.id +'/picture';


                    if (postId) {
                        storeDB(params);

                        Doat.FB.getPostData(postId, function(data) {
                            options.app.onGetPostData && options.app.onGetPostData(data);

                            if (data.picture) {
                                params.app.image = decodeURIComponent(data.picture.match(/&src=(.+)/)[1]);
                            }

                            if (data.message) {
                                params.post.message = data.message;
                            }

                            if (data.created) {
                                params.post.created = data.created;
                            }

                            storeDB(params, function() {
                                options.fb.onSuccess && options.fb.onSuccess();
                            });
                        }, function() {
                            options.fb.onSuccess && options.fb.onSuccess();
                        });
                    } else {
                        storeDB(params, function() {
                            options.fb.onSuccess && options.fb.onSuccess();
                        });
                    }
                });
            }
        }

        function storeDB(data, callback) {
            tokenRequest && tokenRequest.abort();
            tokenRequest = $.getJSON('http://developer.'+ flyappsHost +'/facebook/updateToken.php?token='+token+'&data='+encodeURIComponent(JSON.stringify(data))+'&callback=?', function(response){
                callback && callback(response);
            });
        }
    }

    this.getUser = function(cbSuccess, cbError) {
        if (cacheUserResponse) {
            getUserCallback(cacheUserResponse, cbSuccess, cbError);
        } else {
            FB.api('/me', function(response){
                getUserCallback(response, cbSuccess, cbError);
            });
        }
    };

    function getUserCallback(response, cbSuccess, cbError) {
        cacheUserResponse = response;

        if (!response || response.error) {
            cbError && cbError(response);
        } else {
            cbSuccess && cbSuccess(response);
        }
    }

    this.getPostData = function(postId, cbSuccess, cbError) {
    	if (!postId) {
            return null;
    	}

    	FB.api(postId, 'get', function(response) {
            if (!response || response.error) {
                cbError && cbError(response);
            } else {
                cbSuccess && cbSuccess(response);
            }
        });

        return true;
    };

    function fbUser() {
    	return Storage.get(STORAGE_KEY_FB_USER);
    }

    function checkPermissions(permissions, cbSuccess, cbNoPerm) {
    	if (!permissions) {
            cbSuccess && cbSuccess();
            return;
    	}

        var queryString = 'select ' + permissions + ' from permissions where uid=me()';
        var query = FB.Data.query(queryString);

        query.wait(function(perms){
            var success = true;
            var permArray = new Array();
            permArray = permissions.split(",");

            $.each(permArray, function(index, perm){
                    if (perms[0][perm] != 1) {
                            success = false;
                            return;
                    }
            });

            if (success) {
                    cbSuccess && cbSuccess();
            } else {
                    cbNoPerm && cbNoPerm();
            }
        });
    }

    this.onLogin = function(cb) {
        loginCallbacks.push(cb);
    };

    function cbLoginSuccess() {
        Storage.set(STORAGE_KEY_FB_USER, FB_USER_RETURN);
    	$body.addClass(CLASS_FACEBOOK_LOGGEDIN);
        _this.hideLogin();

        for (var i=0; i<loginCallbacks.length; i++) {
            loginCallbacks[i]();
        }
    }
    function cbLoginFail() {

    }

    function renderCSS() {
        var CSS =
            '#doat-fb-login {' +
                'position: absolute;' +
                'left: 50%;' +
                'width: 260px;' +
                'margin: 0 0 0 -150px;' +
                'background: rgba(0, 0, 0, .8);' +
                'padding: 20px;' +
                'border-radius: 10px;' +
                'color: #fff;' +
                'text-shadow: 0 1px 3px rgba(0, 0, 0, .3);' +
                'text-align: center;' +
                'font-size: 18px;' +
                'z-index: 600;' +
                'display: none;' +
            '}' +

            '#doat-fb-login .button {' +
                'position: relative;' +
                'font-weight: bold;' +
                'margin-top: 20px;' +
                'height: 44px;' +
                'line-height: 44px;' +
                'font-size: 17px;' +
                'border: 1px solid #2e4687;' +
                'text-shadow: 0 1px 0 rgba(0, 0, 0, .5);' +
                'cursor: pointer;' +
                '-moz-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                '-webkit-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                '-ms-box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                'box-shadow: 0 1px 0 0 #8d9fc8 inset, 0 2px 0 0 #6880b6 inset;' +
                'background: #485f9a;' +
                'background: -moz-linear-gradient(center top, #5670ad 0, #3c4e88 100%);' +
                'background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #5670ad), color-stop(1, #3c4e88));' +
                'border-radius: 5px;' +
            '}' +

            '#doat-fb-login .button .c {' +
                'position: absolute;' +
                'top: 0;' +
                'bottom: 0;' +
                'left: 0;' +
                'right: 0;' +
                'padding-left: 45px;' +
                'opacity: 0;' +
                'pointer-events: none;' +
                '-moz-transition: all .3s linear;' +
                '-webkit-transition: all .3s linear;' +
                '-ms-transition: all .3s linear;' +
                'transition: all .3s linear;' +
            '}' +

            '#doat-fb-login .button .c.active {' +
                'opacity: 1;' +
                'pointer-events: auto;' +
            '}' +

            '#doat-fb-login .button .button-loading .text {' +
                'opacity: .5;' +
            '}' +

            '#doat-fb-login .button .icon {' +
                'position: absolute;' +
                'top: 0;' +
                'bottom: 0;' +
                'left: 0;' +
                'width: 45px;' +
                'border-right: 1px solid #2e4687;' +
                '-moz-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                '-webkit-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                '-ms-box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                'box-shadow: -1px 1px 0 0 #8d9fc8 inset;' +
                'border-radius: 5px 0 0 5px;' +
            '}' +

            '#doat-fb-login .button .button-real .icon:before {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 50%;' +
                'width: 32px;' +
                'height: 32px;' +
                'margin: -15px 0 0 -16px;' +
                'background-image:url(http://cdn0.flyapps.me/developer/facebook/fb.png);' +
                'background-size: 31px 32px' +
            '}' +

            '#doat-fb-login-cancel {' +
                'color: #ccc;' +
                'cursor: pointer;' +
                'font-size: 15px;' +
                'margin-top: 20px;' +
                'display: none;' +
            '}' +

            '#doat-fb-login-cancel span {' +
                'text-decoration: underline;' +
            '}' +

            '#doat-fb-overlay {' +
                'position: absolute;' +
                'height: 1000px;' +
                'top: 0;' +
                'left: 0;' +
                'right: 0;' +
                'bottom: 0;' +
                'background: rgba(0,0,0,.5);' +
                'z-index: 500;' +
                'display: none;' +
            '}';

        create('style', head, {'innerHTML': CSS});
    }

    function renderHTML() {
        var el = document.createElement('div');
        el.id = 'doat-fb-login';
        el.innerHTML =  '<div class="content"></div>'+
                        '<div class="button">'+
                                '<div class="c button-loading">'+
                                '<span class="icon"></span>'+
                                '<span class="text"></span>'+
                                '</div>'+
                                '<div class="c button-real">'+
                                '<span class="icon"></span>'+
                                '<span class="text"></span>'+
                                '</div>'+
                        '</div>'+
                        '<div class="cancel" id="doat-fb-login-cancel"></div>';

        document.body.appendChild(el);
    }

    var Storage = new function() {
        this.get = function(key) {
            var value = null;

            if ("localStorage" in window) {
                try {
                    value = localStorage[key];
                } catch(ex) {

                }
            }

            return value;
        };

        this.set = function(key, value) {
            if (!"localStorage" in window) {
                return false;
            }

            try {
                localStorage[key] = value;
            } catch(ex) {
                return false;
            }

            return true;
        };
    };
}