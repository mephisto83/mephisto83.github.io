/**
 * @class Promise
 * built in  Promise.
 */
/**
 * @class MEPH
 * MEPH is the framework.
 */
var window = window || self;
var mephFrameWork = (function ($meph, $frameWorkPath, $promise, $offset) {

    if ($promise) {
        Promise = $promise;
    }
    var createClassPath = function (_class, offset) {
        var namespaceSplit = _class.split(".");
        offset = offset || window;
        var previous = null;
        for (var i = 0 ; i < namespaceSplit.length ; i++) {
            if (!offset[namespaceSplit[i]]) {
                previous = offset;
                offset[namespaceSplit[i]] = {};
                offset = offset[namespaceSplit[i]];
            }
            else {
                previous = offset;
                offset = offset[namespaceSplit[i]];
            }
        }
        return { previous: previous, name: namespaceSplit[i - 1] };
    }
    var meph;
    if (typeof $meph === 'string') {
        meph = createClassPath($meph, $offset);
        meph = meph.previous[meph.name];
    }
    meph.DebugMode = true;
    /**
     * Defines a class.
     * @param {String} className
     * @param {Object} config
     */
    meph.define = function (className, config) {
        var definedClass = getDefinedClass(className),
            undefinedClasses = [],
            undefinedTemplates = [],
            undefinedRequirements,
            requirements = [],
            requiredClasses;
        if (!definedClass) {
            requiredClasses = getRequiredClasses(config);
            requiredTemplates = getRequiredTemplates(config, className);
            if (requiredClasses.length > 0) {
                undefinedClasses = requiredClasses.where(function (x) {
                    return getDefinedClass(x) === null;
                }).select(function (x) {
                    return {
                        classifiedName: x,
                        path: getClassPath(x) + jsPostFix,
                        type: javascriptType
                    }
                });
            }
            if (requiredTemplates.length > 0) {
                undefinedTemplates = requiredTemplates.where(function (x) {
                    return getDefinedTemplate(x) === null;
                }).select(function (x) {
                    return {
                        classifiedName: x,
                        path: getClassPath(x) + templatePostFix,
                        type: templateType
                    }
                });
            }
            undefinedRequirements = undefinedClasses.concat(undefinedTemplates);
            if (undefinedRequirements.length > 0) {
                requirements = meph.Array(undefinedRequirements)
                                    .select(function (details) {
                                        return retrieveRequiredClass(details);
                                    });;
            }
            if (requirements.length === 0) {
                requirements.push(Promise.resolve());
            }

            return Promise.all(requirements).then(function (results) {
                return meph.beforeResourceDefined(className, results)
            }).then(function (results) {
                var addNoTemplateInfo = false;
                if (results.results && results.results[0]) {
                    meph.Array(results.results)
                        .where(function (x) {
                            if (!x || !x.details) {
                                addNoTemplateInfo = true;
                            }
                            return x && x.details;
                        })
                        .select(function (x) {
                            x.details.template = x.result;
                            x.details.alias = config.alias.toLowerCase();

                            return x.details;
                        })
                        .foreach(function (templateInfo) {
                            addTemplateInformation(templateInfo);
                            meph.fire(meph.events.definedClass + templateInfo.classifiedName + templateInfo.type, templateInfo);
                        });
                }

                if (config.alias && addNoTemplateInfo) {
                    addTemplateInformation({
                        template: null,
                        alias: config.alias,
                        classifiedName: className
                    });
                }



                var superclass = getExtendingClass(config);
                var nameAndSpace = createClassPath(className);
                nameAndSpace.previous[nameAndSpace.name] = superclass.extend(className, config);
                meph.fire(meph.events.definedClass, className);
                meph.fire(meph.events.definedClass + className + javascriptType, className);
                config.alternateNames = config.alternateNames && Array.isArray(config.alternateNames) ? config.alternateNames : (config.alternateNames ? [config.alternateNames] : []);
                addDefinedClassInformation({
                    alias: config.alias ? config.alias.toLowerCase() : className,
                    alternateNames: config.alternateNames,
                    classifiedName: className,
                    config: config
                });

                return getDefinedClass(className);
            });
        }
        return Promise.resolve().then(function () {
            return definedClass;
        });
    }
    /**
    * @method undefine
    * Removes the definition of the class
    * @param {String} className
    */
    meph.undefine = function (className) {
        var definedClass = getDefinedClass(className),
            result;
        if (definedClass) {
            result = createClassPath(className);
            result.previous[result.name] = undefined;
        }
    }

    var pubsubevents = [];
    /**
     * @method subscribe
     * Subscibe to an event.
     * @param {String} event
     * @param {Function} func
     **/
    meph.subscribe = function (event, func) {
        var guid = meph.GUID();
        pubsubevents.push({ event: event, func: func, reference: guid });
    }
    meph.Log = function (error) {
        //log stuff.
        console.log(error);

    };
    /**
     * @method createClass
     * Creates a class
     **/
    meph.createClass = function (namespace, alias, extend, templates, functions) {
        var $class = meph.getDefinedClass(namespace),
            config,
            templates = templates || false;
        if ($class) {
            return Promise.resolve().then(function () {
                return $class;
            });
        }
        else {
            config = {
                alias: alias,
                templates: templates,
                extend: extend
            }
            meph.applyIf(functions, config);
            return meph.define(namespace, config);
        }
    }
    //(namespace.join('.'), MEPH.GUID(), 'MEPH.control.Control');

    /**
     * @method unsubscribe
     * Unsubscribe.
     * @param {Array/string} ids
     */
    meph.unsubscribe = function (ids) {
        ids = Array.isArray(ids) ? ids : [ids];
        meph.Array(ids).foreach(function (id) {
            meph.Array(pubsubevents).removeWhere(function (x) { return x === id; });
        });
    }

    /**
     * @method publish
     * Publish an event.
     * @param {String} event
     **/
    meph.publish = function (event) {
        var args = arguments;
        meph.Array(pubsubevents).where(function (x) {
            return x.event === event;
        }).foreach(function (x) {
            x.func.apply(null, args);
        });
    }

    /**
     * @method create
     * Create an instance of the classname.
     */
    meph.create = function (className) {
        var definedClass = getDefinedClass(className);
        if (definedClass) {
            return Promise.resolve().then(function () { return definedClass; });
        }
        else {
            return meph.retrieveRequiredClass({
                classifiedName: className,
                path: getClassPath(className) + jsPostFix,
                type: javascriptType
            }).then(function () {
                nodejs.log('wait for class to define ' + definedClass);
                definedClass = getDefinedClass(className);
                if (definedClass) {
                    nodejs.log('returning defined class ' + definedClass);
                    return definedClass;
                }
                var eventResolve,
                    listenForClassDefining = function (className, name) {
                        if (className === name) {
                            definedClass = getDefinedClass(className);
                            eventResolve(definedClass);
                            meph.removeListeners(meph.events.definedClass, listenForClassDefining);
                        }
                    }.bind(meph, className),
                    promise = new Promise(function (resolve, result) {
                        eventResolve = resolve;
                    });
                meph.on(meph.events.definedClass, listenForClassDefining, listenForClassDefining);
                return promise;
            });
        }
    }
    /**
     * @method requires
     * Gets the required classes.
     * @returns {Promise}
     */
    meph.requires = function () {
        var args = meph.Array();
        for (i = 0 ; i < arguments.length ; i++) {
            args.push(arguments[i]);
        }
        return Promise.all(args.select(function (x) {
            return meph.create(x);
        }));
    }

    /**
     * @method beforeResourceDefined
     * Executes before resources are defined
     */
    meph.beforeResourceDefined = function (resourceName, results) {
        return {
            resourceName: resourceName,
            results: results
        };
    }
    /**
     * @method get
     * Makes a request via the url
     * @param {String} url
     * @param {Object} options
     */
    meph.get = function (url, options) {
        // Return a new promise.
        return new Promise(function (resolve, reject) {
            // Do the usual XHR stuff
            var req = new XMLHttpRequest();


            req.open('GET', url);

            req.onload = function () {
                // This is called even on 404 etc
                // so check the status
                if (req.status == 200) {
                    // Resolve the promise with the response text
                    resolve(req.response);
                }
                else {
                    // Otherwise reject with the status text
                    // which will hopefully be a meaningful error
                    reject(Error(req.statusText));
                }
            };

            // Handle network errors
            req.onerror = function () {
                reject(Error("Network Error"));
            };

            // Make the request
            req.send();
        });
    }
    meph.cancelBubble = function (e) {
        var evt = e ? e : window.event;
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.cancelBubble != null) evt.cancelBubble = true;
    }
    /**
     * @method getExtendingClass
     * Gets the extending class, based on the configuration.
     * @param {Object} config
     * @returns {Object}
     */
    var getExtendingClass = function (config) {
        if (config.extend) {
            return getDefinedClass(config.extend) || Class;
        }
        return Class;
    }

    /**
     * @method namespace
     * Creates a namespace.
     * @param {String} namespace A period delimited string.
     */
    meph.namespace = function (namespace) {
        createClassPath(namespace);
    }
    /**
     * @method retrieveRequiredClass
     * Retrieves the required class or file using the provided details.
     * @param {Object} details
     * @param {String} details.path
     * @param {String} details.type
     **/
    meph.retrieveRequiredClass = function (details) {
        var promise,
            resolutionReached,
            retrieving = meph.Array(listeners).contains(function (x) {
                return x.type === meph.events.definedClass + details.classifiedName + details.type
            }),
            definedClass;

        if (templateType === details.type) {
            definedClass = getDefinedTemplate(details.classifiedName);
        }
        else {
            definedClass = getDefinedClass(details.classifiedName);
        }

        promise = new Promise(function (resolve, reject) {
            resolutionReached = resolve;
        });

        if (definedClass) {
            resolutionReached();
            return promise.then(function () { return definedClass; });
        }
        else if (retrieving) {
            meph.on(meph.events.definedClass + details.classifiedName + details.type, function () {
                meph.un(meph.events.definedClass + details.classifiedName + details.type, details);
                resolutionReached.apply(details, arguments);
            }, details);
            return promise;
        }
        else {
            if (details.type === javascriptType) {
                meph.on(meph.events.definedClass + details.classifiedName + details.type, function () {
                    meph.un(meph.events.definedClass + details.classifiedName + details.type, details);
                    resolutionReached.apply(details, arguments);
                }, details);
                meph.loadJSCssFile(details.path, javascriptType, function () {
                    nodejs.log('loaded class ');

                }).then(function () {
                    nodejs.log('fire class retrieval event');

                    meph.fire(retrievalEventPrefix + details.path, {});
                });
                return promise;
            }
            else {
                return meph.get(details.path).then(function (result) {
                    return {
                        result: result,
                        details: details
                    };
                });
            }
        }
    }


    var retrieveRequiredClass = meph.retrieveRequiredClass;
    /**
     * Gets the classes path.
     * @param {String} path
     **/
    meph.getClassPath = function (path) {
        var closestMatch = paths.max(function (x) {
            if (path.startsWith(x.prefix)) {
                return x.prefix.length;
            }
            return -1;
        }),
        offset;
        offset = closestMatch.prefix.length + classPathSepartor.length;
        classPath = path.substring(offset, path.length).split('.').join(folderPathSeparator);
        return closestMatch.path + folderPathSeparator + classPath;
    }

    meph.getSource = function (name, extension) {
        var path = meph.getClassPath(name);
        return meph.get(path + extension);
    }

    meph.emptyFunction = function () { };
    meph.ajax = function (path, configure) {
        var promiseResolution,
            failureResolution,
            promise = new Promise(function (resolve, failure) {
                promiseResolution = resolve;
                failureResolution = failure;
            });
        configure = configure || {};
        configure = meph.applyIf({
            method: 'GET',
            async: true,
            requestHeaders: []
        }, configure);
        var xmlhttp = new XMLHttpRequest();


        configure.requestHeaders.push({ header: "Cache-Control", value: "no-cache" })
        //if (!configure.requestHeaders.some(function (x) { return x.header === 'Authorization'; }) && meph.getAuthorizationToken()) {
        //    //configure.requestHeaders.push({ header: 'Authorization', value: 'Bearer ' + meph.getAuthorizationToken() });
        //}
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                promiseResolution({
                    responseText: xmlhttp.responseText
                });
            } else if (xmlhttp.readyState == 4) {

                switch (status) {
                    default:
                        failureResolution({ status: status, path: path, configuration: configure });
                        break;
                }
            }
        }
        xmlhttp.onerror = function () {
            debugger
        }
        xmlhttp.addEventListener("error", function () {
            debugger
        }, false);
        xmlhttp.open(configure.method, path, configure.async);
        meph.Array(configure.requestHeaders).foreach(function (x) {
            xmlhttp.setRequestHeader(x.header, x.value);
        });
        xmlhttp.send();
        return promise;
    };
    //function sendFoodRequest() {
    //    var xhr = new XMLHttpRequest();

    //    xhr.open("POST", 'http://localhost:7777/services/rest/foods/2013/06/25', true);

    //    var boundary = '---------------------------';
    //    boundary += Math.floor(Math.random() * 32768);
    //    boundary += Math.floor(Math.random() * 32768);
    //    boundary += Math.floor(Math.random() * 32768);
    //    xhr.setRequestHeader("Content-Type", 'multipart/mixed; boundary=' + boundary);
    //    var body = '';
    //    body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="foodList"' + '\r\n';
    //    body += "Content-Type: application/json\r\n\r\n";
    //    body += '[   {"id":null,"name":"Spinach","recipe":null}   ]';
    //    body += '\r\n'
    //    body += '--' + boundary + '--';
    //    xhr.setRequestHeader('Content-length', body.length);
    //    xhr.onload = function () { }
    //    xhr.send(body);
    //}
    var authtoken;
    meph.setAuthorizationToken = function (token) {
        authtoken = token;
    }
    meph.getAuthorizationToken = function () {
        return authtoken;
    }

    meph.requestAuthentication = function (path, clientId, returnUri, scope, token, state, client_secret) {
        path = path || 'http://localhost:52154/OAuth/Authorize';
        scope = scope || 'agresso';
        client_secret = client_secret || 'secret';
        token = token || 'token';
        state = state || 'state';
        clientId = clientId || 'AgressoMobile';
        var configure = {};
        configure.method = 'OPTIONS'
        var uri = meph.addQueryString(path + '', {
            'client_id': clientId ? clientId : 'Demo',
            'redirect_uri': returnUri,
            'state': state,
            'scope': scope,
            'client_secret': client_secret,
            'response_type': token,
        });

        var toresolve,
            promise = new Promise(function (resolve, failure) {
                toresolve = resolve;
                tofail = failure;
            });

        try {
            var iframe = meph.createIframe(uri);
        }
        catch (error) {
            alert(error);
            if (error && error.message) {
                alert(error.message)
            }
        }

        var interval = setInterval(function () {
            try {
                if (iframe && iframe.contentWindow.location) {
                    var options = {},
                        hash = iframe.contentWindow.location.hash,
                        args = MEPH.Array(hash.split('&')).select(function (x) {
                            return {
                                key: x.split('=')[0],
                                value: x.split('=')[1]
                            }
                        }).foreach(function (x) {
                            options[x.key.replace('#', '')] = x.value;
                        });
                    if (options.access_token) {
                        toresolve(options);
                        iframe.parentNode.removeChild(iframe);
                        clearInterval(interval);
                    }
                }
            } catch (e) {
            }
        }, 100);

        return promise;
    }
    meph.createIframe = function (uri) {
        var iframe = document.createElement('iframe');

        iframe.setAttribute('src', uri);
        iframe.classList.add('u4-iframe');
        document.body.appendChild(iframe);
        return iframe;
    }

    meph.createWindow = function (uri) {
        var myWindow = window.open(uri || '', '_blank', 'location=yes');
        alert('myWindow ' + myWindow);
        myWindow.document.write("<p>This window's name is: " + myWindow.name + "</p>");
        return myWindow;
    }

    meph.addQueryString = function (uri, parameters) {
        var delimiter = (uri.indexOf('?') == -1) ? '?' : '&';
        for (var parameterName in parameters) {
            var parameterValue = parameters[parameterName];
            uri += delimiter + encodeURIComponent(parameterName) + '=' + encodeURIComponent(parameterValue);
            delimiter = '&';
        }
        return uri;
    }

    meph.IsEventable = function (object) {
        if (object && object[privateVariablePrefix + 'listeners']) {
            return true;
        }
        return false
    }

    meph.preflight = function (path, configure) {
        configure = configure || {};
        configure.method = 'OPTIONS'
        //configure.requestHeaders = configure.requestHeaders || [];
        //configure.requestHeaders.push({
        //    header: 'Origin',
        //    value: window.location.origin
        //})
        //configure.requestHeaders.push({ header: 'Access-Control-Request-Method', value: 'PUT' });
        //configure.requestHeaders.push({ header: 'Access-Control-Request-Headers', value: 'X-Custom-Header' });
        return meph.ajax(path, configure);
    }
    meph.ajaxJSON = function (path, configure) {
        return meph.ajax(path, configure).then(function (response) {
            try {
                var responseJSON = JSON.parse(response.responseText);
                response.responseJSON = responseJSON;
                return response;
            }
            catch (error) {
                response.responseText = response.responseText.replace(/\"/g, "'");
                response.responseText = response.responseText.replace(/'/g, "\"");
                response.responseJSON = JSON.parse(response.responseText);
                return response;
            }
        });
    }
    /**
     * @method loadJSCssFile
     * Loads a javascript or css file.
     * @param {String} filename
     * @param {String} filetype
     * @param {Function} callback
     **/
    meph.loadJSCssFile = function (filename, filetype, callback) {
        callback = callback || meph.emptyFunction;
        var toResolve,
            toReject,
            promise = new Promise(function (resolve, reject) {
                toReject = reject;
                toResolve = resolve;
            });
        if (filetype == javascriptType) {
            if ((!document) || ((document) && !document.getElementsByTagName)) {

                importScripts(filename);
                setTimeout(function () {
                    try {
                        callback();
                        toResolve();
                    }
                    catch (error) {
                        console.log('something went wrong')
                    }
                }, 1);
            }
            else {
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.onreadystatechange = function () {
                    if (this.readyState == 'complete') callback();
                }
                script.onload = callback;
                script.src = filename// 'helper.js';
                head.appendChild(script);
            }
            toResolve(filename, filetype);
        }
        else if (filetype === 'mp3') {

            var XHR = new XMLHttpRequest();
            XHR.open('GET', filename, true);
            XHR.responseType = 'arraybuffer';
            XHR.onload = function () {

                toResolve({ response: XHR.response })
            };

            XHR.onerror = function () {
                toFail({ error: new Error('AudioSampleLoader: XMLHttpRequest called onerror') })
            };
            XHR.send();

        }
        else if (filetype == "css") { //if filename is an external CSS file
            var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
        return promise;
    }

    /**
     * @method loadScript
     * Loads a script.
     * @param {Array} scripts
     * @return {Promise}
     */
    meph.loadScript = function (file) {
        var toresolve;
        var promise = new Promise(function (resolve, fail) {
            toresolve = resolve;
        });
        meph.loadJSCssFile(file, javascriptType, function () {
            toresolve.apply(this, arguments);
        });
        return promise;
    }

    /**
     * @method loadScripts
     * Loads scripts.
     * @param {Array} scripts
     * @return {Promise}
     */
    meph.loadScripts = function (scripts) {
        var i = 0;
        var promise = Promise.resolve();
        for (i = 0; i < scripts.length ; i++) {
            promise = promise.then(function () {
                return meph.loadScript(scripts[this]);
            }.bind(i))
        }
        return promise;
    }

    meph.namespace('MEPH.Loader');
    MEPH.Loader.loadScript = meph.loadScript;
    MEPH.Loader.loadScripts = meph.loadScripts;
    var bindPrefixShortCuts = [],
        classPathSepartor = '.',
        retrievalEventPrefix = 'onRetrival',
        folderPathSeparator = '/',
        templatePostFix = '.html',
        jsPostFix = '.js',
        getClassPath = meph.getClassPath,
        templateType = '.html.template',
        javascriptType = '.js',
        paths = [],
        nonEnumerablePropertyPrefix = ' ',
        jsync = nonEnumerablePropertyPrefix + 'j',
        dataBindPrefixes = [],
        reverseBindingPrefixes = [],
        eventDataBindingPrefixes = [],
        defaultBindPrefix = 'data-bind',
        defaultReversePrefix = 'data-push',
        defaultEventPrefix = 'data-events',
        listenersPropertyKey = nonEnumerablePropertyPrefix + 'listeners',
        domListenersPropertyKey = nonEnumerablePropertyPrefix + 'domlisteners',
        dataObjectReferenceAttribute = 'data-reference',
        privatePropertyPrefix = '$',
        privateClassPrefix = '$',
        bindPrefixDelimiter = '-',
        pipeString = '|',
        pathDelimiter = '.',
        isObservablePropertyKey = nonEnumerablePropertyPrefix + 'isObservable',
        isValidatablePropertyKey = nonEnumerablePropertyPrefix + 'isValidatable',
        connectableTypes = [
            { type: 'control', shortCut: 'c$' },
            { type: 'control', shortCut: 'control' },
            { type: 'view', shortCut: 'v$' },
            { type: 'view', shortCut: 'view' },
            { type: 'subcontrol', shortCut: 's$' },
            { type: 'parentcontrol', shortCut: 'pc$' },
            { type: 'html', shortCut: 'html' },
            { type: 'presenter', shortCut: 'p$' },
            { type: 'presenter', shortCut: 'presenter' },
            { type: 'viewmodel', shortCut: 'vm$' },
            { type: 'viewmodel', shortCut: 'viewmodel' },
            { type: 'model', shortCut: 'm$' },
            { type: 'model', shortCut: 'model' },
            { type: 'controller', shortCut: 'controller' },
            { type: 'controller', shortCut: 'ct$' }
        ];
    meph.patternTypes = ['presenter', 'controller', 'view', 'model', 'viewmodel'];
    meph.templateType = templateType;
    meph.folderPathSeparator = folderPathSeparator;
    meph.privatePropertyPrefix = privatePropertyPrefix;
    meph.defaultEventPrefix = defaultEventPrefix;
    meph.listenersPropertyKey = listenersPropertyKey;
    meph.nonEnumerablePropertyPrefix = nonEnumerablePropertyPrefix;
    meph.isObservablePropertyKey = isObservablePropertyKey;
    meph.isValidatablePropertyKey = isValidatablePropertyKey;
    meph.connectableTypes = connectableTypes;
    meph.dataObjectReferenceAttribute = dataObjectReferenceAttribute;
    meph.bindPrefixDelimiter = bindPrefixDelimiter;
    meph.defaultDataBindString = defaultBindPrefix;
    meph.defaultReversePrefix = defaultReversePrefix;
    meph.pathDelimiter = pathDelimiter;
    meph.pipeString = pipeString;
    meph.MaxTransitionTime = 500;
    meph.ParameterDelimiter = ',';
    meph.jsync = jsync;
    meph.prefixes = {
        retrievalEventPrefix: retrievalEventPrefix,
        templatePostFix: templatePostFix
    };
    meph.paths = paths;
    /**
     * @method setPath
     * Set the path that corresponds to the prefix.
     * @param {String} path
     * @param {String} prefix
     **/
    meph.setPath = function (path, prefix) {
        meph.Array(meph.paths);
        if (meph.paths.length > 0) {
            meph.paths.removeWhere(function (x) { return x.prefix === prefix; });
        }
        meph.paths.push({
            path: path,
            prefix: prefix
        });
    };
    meph.setInterval = function () {
        return setInterval.apply(null, arguments);
    }
    /**
     * @method getPath
     * Get the path.
     * @param {String} path
     **/
    meph.getPath = function (prefix) {
        meph.Array(paths);
        var path = paths.first(function (x) { return x.prefix === prefix; });
        if (path) {
            return path.path;
        }
        return null;
    }
    /**
     * @method addBindPrefixShortCuts
     * Adds binding prefixes to the library.
     * @param {String} prefix
     * @param {String} type
     **/
    meph.addBindPrefixShortCuts = function addBindPrefixShortCuts(prefix, type) {
        var has = bindPrefixShortCuts.some(function (x) {
            return x.prefix === prefix;
        });
        if (!has) {
            bindPrefixShortCuts.push({ prefix: prefix, type: type });
        }
    };

    /**
     * @method getBindPrefixShortCuts
     * Gets the binding prefixes.
     * @returns {Array}
     **/
    meph.getBindPrefixShortCuts = function () {
        return meph.Array(bindPrefixShortCuts);
    }

    /**
     * @method getBindPrefixShortCut
     * Gets a prefix short cut
     * @param {String} prefix
     * @returns {Object}
     */
    meph.getBindPrefixShortCut = function (prefix) {
        return meph.getBindPrefixShortCuts().first(function (x) { return x.prefix === prefix; });
    }

    /**
     * @method addDataBindPrefix
     * Adds a data-bind prefix.
     * @param {String} prefix
     */
    meph.addDataBindPrefix = function (prefix) {
        var has = meph.Array(dataBindPrefixes).some(function (x) { return x === prefix; });
        if (!has) {
            dataBindPrefixes.push(prefix);
        }
    }
    /**
     * @method removeDataBindPrefix
     * Removes the data bind prefix.
     * @param {String} prefix
     **/
    meph.removeDataBindPrefix = function (prefix) {
        return meph.Array(dataBindPrefixes).removeWhere(function (x) { return x === prefix; });
    }

    /**
     * @method addReverseDataBindPrefx
     * Adds a data-bind prefix for reverse binding.
     * @param {String} prefix
     **/
    meph.addReverseDataBindPrefx = function (prefix) {
        var has = reverseBindingPrefixes.some(function (x) { return x === prefix; });

        if (has) {
            reverseBindingPrefixes.push(prefix);
        }
    }

    /**
     * @method addEventDataBindingPrefixes
     * Adds a data-bind prefix for event binding.
     * @param {String} prefix
     **/
    meph.addEventDataBindingPrefixes = function (prefix) {
        var has = eventDataBindingPrefixes.some(function (x) { return x === prefix; });
        if (has) {
            eventDataBindingPrefixes.push(prefix);
        }
    }

    /**
     * @method getEventDataBindingPrefixes
     * Gets Event databinding prefixes;
     **/
    meph.getEventDataBindingPrefixes = function () {
        return meph.Array(eventDataBindingPrefixes.concat([defaultEventPrefix]));
    }

    /**
     * @method removeEventDataBindingPrefix
     * Remove event data-binding prefix.
     * @param {String} prefix;
     **/
    meph.removeEventDataBindingPrefix = function (prefix) {
    }
    /**
     * @method removeReverseDataBindPrefix
     * Removes the reverse data bind prefix.
     * @param {String} prefix
     **/
    meph.removeReverseDataBindPrefix = function (prefix) {
        return meph.Array(reverseBindingPrefixes).removeWhere(function (x) { return x === prefix; });
    }

    /**
     * @method getReverseDataBindingPrefixes
     * Gets Reverse databinding prefixes;
     **/
    meph.getReverseDataBindingPrefixes = function () {
        return meph.Array(reverseBindingPrefixes.concat([defaultReversePrefix]));
    }
    /**
     * @method getDataBindPrefixes
     * Gets the data-bind prefixes.
     * @returns {Array}
     */
    meph.getDataBindPrefixes = function () {
        return meph.Array(dataBindPrefixes.concat([defaultBindPrefix]));
    }

    /**
     * @method createEvent
     * Creates a DOM Event.
     * @param {String} type
     * @param {Object} config
     **/
    meph.createEvent = function createEvent(type, config) {
        var evnt,
            i;
        if (document.createEvent) {
            evnt = document.createEvent('Event');
            evnt.initEvent(type, true, true);

            for (i in config) {
                if (config.hasOwnProperty(i)) {
                    evnt[i] = config[i];
                }
            }
        }
        else {
            evnt = new Event(type);
            for (i in config) {
                if (config.hasOwnProperty(i)) {
                    evnt[i] = config[i];
                }
            }
        }
        return evnt;
    };

    /**
     * Gets the required classe paths
     * @param {Object} config
     * @param {String} config.extend
     * @param {Array} config.requires
     */
    meph.getRequiredClasses = function (config) {
        if (config.extend || (config.requires)) {
            return meph.Array(((config.extend ? [config.extend] : [])
                                .concat(config.requires || [])))
                        .where(function (x) { return x; });
        }
        return [];
    }
    var getRequiredClasses = meph.getRequiredClasses;

    /**
     * Gets the required template paths.
     * @param {Object} config
     * @param {String} config.extend
     * @param {Array} config.requires
     */
    meph.getRequiredTemplates = function (config, className) {
        if ((config.templates && config.templates.length > 0)) {
            return meph.Array(config.templates)
                        .where(function (x) { return x; });
        }
        else if (config.templates === true) {
            return meph.Array([className]);
        }
        return [];
    }
    var getRequiredTemplates = meph.getRequiredTemplates;
    /**
     * @method Array
     * Adds additional functionality to an array.
     * @param {Array} array
     * @return {Array}
     */
    meph.Array = function (array) {
        array = array || [];
        if (MEPH && MEPH.util && MEPH.util.Array) {
            MEPH.util.Array.create(array);
        }
        return array;
    }
    /**
     * @method createTemplateNode
     * Creates a template node.
     * @param {String} classifiedName
     * @returns {Object}
     */
    meph.createTemplateNode = function (classifiedName) {
        var templateinfo = getTemplate(classifiedName);
        return {
            alias: templateinfo.alias,
            node: document.createElement(templateinfo.alias)
        }
    }
    /**
     * @method Convert
     * Converts an object into an array.
     **/
    meph.Convert = function (arrayLike) {
        if (MEPH && MEPH.util && MEPH.util.Array) {
            return MEPH.util.Array.convert(arrayLike);
        }
        return arrayLike;
    }
    //var Array;
    meph.IsObject = function (object) {
        if ((typeof object === "object") && (object !== null) && !Array.isArray(object) &&
    !(isNode(object) || isElement(object))) {
            return true;
        }
        return false;
    }
    //Returns true if it is a DOM node
    function isNode(o) {
        return (
          typeof Node === "object" ? o instanceof Node :
          o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    }

    //Returns true if it is a DOM element    
    function isElement(o) {
        return (
          typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
          o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
      );
    }
    /**
    * Gets a defined class
    * @param {String} _class The requested class path.
    * @param {Object} offset An optional parameter.
    * @return {Object}
    */
    meph.getDefinedClass = function (_class, offset) {
        var namespaceSplit = _class.split(".");

        var offset = offset || window;
        for (var i = 0; i < namespaceSplit.length; i++) {
            if (offset[namespaceSplit[i]] === null || offset[namespaceSplit[i]] === undefined) {
                return null;
            }
            else {
                offset = offset[namespaceSplit[i]];
            }
        }
        return offset;
    };

    /**
     * @method getPathValue
     * Gets the value from the object
     * @param {String} path
     * @param {Object} object
     */
    meph.getPathValue = meph.getDefinedClass;

    /**
     * @method setPathValue
     * Sets the value on the path.
     * @param {Object} offset
     * @param {String} path
     * @param {Object} value
     * @returns {Boolean}
     **/
    meph.setPathValue = function (offset, path, value) {
        var pathSplit = path.split(".");
        var previous = null;
        for (var i = 0 ; i < pathSplit.length ; i++) {
            if (!offset || !meph.mephHasOwnProperty(offset, pathSplit[i]) && (pathSplit.length - 1 > i)) {
                return false;
            }
            else {
                previous = offset;
                offset = offset[pathSplit[i]];
            }
        }
        if (previous) {
            previous[pathSplit[i - 1]] = value;
        }
        return true;
    }
    /**
     * @method mephHasOwnProperty
     **/
    meph.mephHasOwnProperty = function (obj, property) {
        var i;
        if (obj.hasOwnProperty(property)) {
            return true;
        }

        for (i in obj) {
            if (property === i) {
                return true;
            }
        }
        return false;
    }

    /**
     * @method apply
     * Applies the properties of object1 on to object2.
     * @param {Object} object1
     * @param {Object} object2
     **/
    meph.apply = function (object1, object2) {
        var i;
        for (i in object1) {
            if (meph.mephHasOwnProperty(object1, i)) {
                object2[i] = object1[i];
            }
        }
        return object2;
    }

    /**
     * @method applyIf
     * Applies the properties of object1 on to object2.
     * @param {Object} object1
     * @param {Object} object2
     **/
    meph.applyIf = function (object1, object2) {
        var i;
        for (i in object1) {
            if (meph.mephHasOwnProperty(object1, i) && !meph.mephHasOwnProperty(object2, i)) {
                object2[i] = object1[i];
            }
        }
        return object2;
    }

    var templates = [];
    /**
     * Gets a defined template
     * @param {String} templateNameSpace The requested template path.
     * @return {Object}
     **/
    meph.getDefinedTemplate = function (templateNameSpace) {
        return meph.Array(templates).first(function (x) { return x.classifiedName === templateNameSpace; });
    }

    meph.getTemplates = function () {
        return templates.select();
    }

    /**
     * @method getTemplateByAlias
     * Gets template information by alias.
     * @param {String} name
     * @returns {Object}
     */
    meph.getTemplateByAlias = function (alias) {
        return meph.Array(templates).first(function (x) { return x.alias === alias; });
    }

    /**
     * @method getAllAliases
     * Gets all the alias names registerd in the framework.
     * @returns {Array}
     */
    meph.getAllAliases = function (alias) {
        return meph.Array(templates).select(function (x) { return x.alias; }).where(function (x) { return x; });
    }

    /**
     * @method getTemplateByNode
     * Gets the template information based on the node name.
     * @param {Object} node
     * @returns {Object}
     */
    meph.getTemplateByNode = function (node) {
        var nodename = node.nodeName.toLowerCase();
        return getTemplateByAlias(nodename);
    }

    var getTemplateByAlias = meph.getTemplateByAlias;
    var getDefinedTemplate = meph.getDefinedTemplate;
    /**
     * Gets template information by classified name or by alias.
     * @param {String} name
     */
    meph.getTemplate = function (name) {
        return getDefinedTemplate(name) || getTemplateByAlias(name);
    }
    var getTemplate = meph.getTemplate;
    /**
     * Adds template information to the global collection.
     * @param {Object} templateInfo
     */
    meph.addTemplateInformation = function (templateInfo) {
        var definedTemplate = getDefinedTemplate(templateInfo.classifiedName);
        if (!definedTemplate) {
            templates.push(templateInfo);
            meph.fire(meph.events.definedTemplate, templateInfo);
        }
    }
    var addTemplateInformation = meph.addTemplateInformation;

    var classes = [];
    /**
     * @method addDefinedClassInformation
     * Adds defined class information
     **/
    meph.addDefinedClassInformation = function (classInformation) {
        var info = getDefinedClassInformation(classInformation.alias);
        if (!info) {
            meph.Array(classInformation.alternateNames).foreach(function (name) {
                var info = createClassPath(name);
                info.previous[info.name] = getDefinedClass(classInformation.classifiedName);
            });
            classes.push(classInformation);
        }
    }
    var addDefinedClassInformation = meph.addDefinedClassInformation;
    /**
     * @method getDefinedClasses
     * Get defined classes.
     **/
    meph.getDefinedClasses = function () {
        return classes.select(function (x) { return x; });
    }
    /**
     * @method getDefinedClassInformation
     * Get defined class information.
     * @param {String} alias
     * @returns {Object}
     **/
    meph.getDefinedClassInformation = function (alias) {
        return meph.Array(classes).first(function (x) {
            return x.alias === alias || x.classifiedName === alias || x.alternateNames.some(function (x) { return x === alias; });
        });
    }

    meph.generateCustomVisualStudioTags = function () {
        var newline = '\r\n';
        var result = '<xsd:group name="flowContent">' + newline + '\t\t<xsd:choice>' + newline;
        meph.Array(classes).where(function (x) { return x.alias; }).select(function (x) {
            if (x.alias.indexOf('.') === -1 && x.alias.indexOf('-') === -1) {
                result += '\t\t\t<xsd:element ref="' + x.alias + '" />' + newline;
            }
        });
        result += '\t\t</xsd:choice>' + newline;
        result += '</xsd:group>' + newline;

        meph.Array(classes).where(function (x) { return x.alias; }).select(function (x) {
            if (x.alias.indexOf('.') === -1 && x.alias.indexOf('-') === -1) {
                result += '\t\t\t<xsd:element name="' + x.alias + '" type="simpleFlowContentElement" />' + newline;
            }
        });
        return result;
    }
    var getDefinedClassInformation = meph.getDefinedClassInformation;

    /**
     * Removes the template information.
     * @param {String} templateAlias
     * @returns {Array}
     */
    meph.removeTemplateInformation = function (templateAlias) {
        var definedTemplate = getTemplate(templateAlias);
        return meph.Array(templates).removeWhere(function (x) { return x === definedTemplate; });
    }
    var removeTemplateInformation = meph.removeTemplateInformation;
    /**
     * Creates a deep clone of an object.
     * @param {Object} obj
     * @return {Object}
     */
    meph.clone = function (obj, skip) {
        skip = skip || [];
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof String) {
            return obj;
        }
        if (obj instanceof Number) {
            return obj;
        }
        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (!skip.some(function (x) { return x === attr; })) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    var clone = meph.clone;

    /**
     * @method
     * Generates a globally unique identifier.
     **/
    meph.GUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }

    meph.Events = function (object) {
        if (object[privateVariablePrefix + 'listeners']) {
            return;
        }
        Object.defineProperty(object, listenersPropertyKey, {
            enumerable: false,
            configurable: false,
            writeable: true,
            get: function () {
                return this[privateVariablePrefix + 'listeners'];
            }.bind(object)
        });
        Object.defineProperty(object, domListenersPropertyKey, {
            enumerable: false,
            configurable: false,
            writeable: true,
            get: function () {
                return this[privateVariablePrefix + 'domlisteners'];
            }.bind(object)
        });

        Object.defineProperty(object, privateVariablePrefix + 'listeners', {
            enumerable: false,
            configurable: false,
            writeable: true,
            value: []
        });

        Object.defineProperty(object, privateVariablePrefix + 'domlisteners', {
            enumerable: false,
            configurable: false,
            writeable: true,
            value: []
        });

        Object.defineProperty(object, privateVariablePrefix + 'setProperty', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: function (propName, value) {
                this[privateVariablePrefix + propName] = value;
            }
        });

        Object.defineProperty(object, '_pause', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: function (context) {
                if (context) {
                    var pauseContext = this[privateVariablePrefix + 'context_paused'].first(function (x) {
                        return x.context === context;
                    });
                    if (!pauseContext) {
                        pauseContext = { context: context, paused: 0 };
                        this[privateVariablePrefix + 'context_paused'].push(pauseContext);
                    }
                    pauseContext.paused++;
                }
                else {
                    this[privateVariablePrefix + "paused"]++;
                }
            }
        });

        Object.defineProperty(object, 'is_paused', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: function (context) {
                if (context) {
                    var pausecontext = this[privateVariablePrefix + 'context_paused'].first(function (x) {
                        return x.context === context;
                    });
                    if (pausecontext) {
                        return pausecontext.paused;
                    }
                    else {
                        return false;
                    }
                }
                return this[privateVariablePrefix + 'paused'];
            }
        });

        Object.defineProperty(object, privateVariablePrefix + 'paused', {
            enumerable: false,
            writable: true,
            configurable: false,
            value: 0
        });

        Object.defineProperty(object, '_start', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: function (context) {
                if (context) {
                    var pauseContext = this[privateVariablePrefix + 'context_paused'].first(function (x) {
                        return x.context === context;
                    });
                    if (!pauseContext) {
                        pauseContext = { context: context, paused: 0 };
                        this[privateVariablePrefix + 'context_paused'].push(pauseContext);
                    }
                    pauseContext.paused--;
                    if (pauseContext.paused < 0) {
                        pauseContext.paused = 0;
                    }
                }
                else {
                    this[privateVariablePrefix + 'paused']--;
                    if (this[privateVariablePrefix + 'paused'] < 0) {
                        this[privateVariablePrefix + 'paused'] = 0;
                    }
                }
            }
        });

        Object.defineProperty(object, privateVariablePrefix + 'context_paused', {
            enumerable: false,
            writable: true,
            configurable: false,
            value: []
        });

        Object.defineProperty(object, 'don', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (type, dom, func, reference, capture) {
                dom.addEventListener(type, func);
                meph.Array(this[domListenersPropertyKey]).push({
                    type: type,
                    dom: dom,
                    func: func,
                    reference: reference || this,
                    capture: capture || false
                });
            }.bind(object)
        });

        Object.defineProperty(object, 'dun', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (reference, type, dom, func) {
                if (arguments.length === 0) {
                    reference = this;
                }
                meph.Array(this[domListenersPropertyKey]).removeWhere(function (x) {
                    if (func && type) {
                        return x.func = func && type === x.type;
                    }
                    else if (func) {
                        return x.func = func;
                    }
                    else if (reference && type) {
                        return x.type === type && reference === x.reference;
                    }
                    else if (type) {
                        return x.type === type;
                    }
                    else if (reference) {
                        return x.reference === reference;
                    }
                    return true;
                }).foreach(function (ops) {
                    ops.dom.removeEventListener(ops.type, ops.func, ops.capture);
                })
            }.bind(object)
        });


        Object.defineProperty(object, 'on', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (type, func, reference, pausekey) {
                meph.Array(this[listenersPropertyKey]).push({
                    type: type,
                    func: func,
                    pausekey: pausekey || null,
                    reference: reference || this
                })
                return this;
            }.bind(object)
        });
        Object.defineProperty(object, 'hasOn', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (type, reference) {
                return meph.Array(this[listenersPropertyKey]).contains(function (x) {
                    if (reference && type) {
                        return x.type === type && reference === x.reference;
                    }
                    else if (type) {
                        return x.type === type;
                    }
                    else if (reference) {
                        return x.reference === reference;
                    }
                    return true;
                });
            }.bind(object)
        });
        Object.defineProperty(object, 'onIf', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (type, reference) {
                if (!this.hasOn(type, reference)) {
                    this.on(type, reference);
                }
            }
        });
        Object.defineProperty(object, 'un', {
            enumerable: false,
            configurable: true,
            writeable: true,
            value: function (type, reference) {
                meph.Array(this[listenersPropertyKey]).removeWhere(function (x) {
                    if (reference && type) {
                        return x.type === type && reference === x.reference;
                    }
                    else if (type) {
                        return x.type === type;
                    }
                    else if (reference) {
                        return x.reference === reference;
                    }
                    return true;
                });
            }.bind(object)
        });

        Object.defineProperty(object, 'fire', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: function (type) {
                var args = meph.Convert(arguments);
                if (this.is_paused()) {
                    return this;
                }
                meph.Array(this[listenersPropertyKey]).where(function (x) {
                    return x.type === type;
                }).where(function (x) {
                    if (x.reference && x.reference.is_paused && x.pausekey) {
                        return !x.reference.is_paused(x.pausekey);
                    }
                    return true;
                }).foreach(function (x) {
                    x.func.apply(x.reference || null, args);
                })
                return this;
            }.bind(object)
        });
        return object;
    }
    var clone = meph.clone;
    var getDefinedClass = meph.getDefinedClass;
    var privateVariablePrefix = ' $ ';
    (function () {
        var initializing = false, fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\b_super\b/ : /.*/;

        // The base Class implementation (does nothing)
        this.Class = function () {
        };
        var extractPropsAndFunc = function (definedMixin) {
            var funcs = {};
            for (var f in definedMixin.prototype) {
                if (definedMixin.prototype.hasOwnProperty(f)) {
                    funcs[f] = definedMixin.prototype[f];
                }
            }
            return funcs;
        }
        // Create a new Class that inherits from this class
        Class.extend = function (type, prop) {
            var _super = this.prototype;

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;
            var mixins = {};

            prototype.mixins = prototype.mixins || _super.mixins || {};
            if (prop.mixins && !Array.isArray(prop.mixins)) {
                for (var mixin in prop.mixins) {
                    if (prop.mixins.hasOwnProperty(mixin)) {
                        mixins[mixin] = prop.mixins[mixin];
                    }
                }
            }
            else if (prop.mixins && Array.isArray(prop.mixins)) {
                meph.Array(prop.mixins);
                prop.mixins.foreach(function (mixin) {
                    var definedMixin = getDefinedClass(mixin);
                    if (definedMixin) {
                        var funcs = extractPropsAndFunc(definedMixin);
                        for (var name in funcs) {
                            if (name === 'requires' ||
                                   name === 'statics' ||
                                    name === 'constructor' ||
                                   name === 'extend' ||
                                   name === 'templates' ||
                                   name === 'mixins' ||
                                   name === 'observable' ||
                                   name === 'properties')
                                continue;
                            prototype[name] = funcs[name];
                        }
                    }
                });
            }


            for (var mixin in mixins) {
                var definedMixin = getDefinedClass(mixins[mixin]);
                if (definedMixin && definedMixin.prototype) {
                    var funcs = extractPropsAndFunc(definedMixin);
                    prototype.mixins[mixin] = funcs;
                }
            }
            // Copy the properties over onto the new prototype
            for (var name in prop) {
                if (name === 'requires' ||
                    name === 'statics' ||
                    name === 'extend' ||
                    name === 'templates' ||
                    name === 'mixins' ||
                    name === 'observable' ||
                    name === 'properties')
                    continue;
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this.callParent;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this.callParent = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this.callParent = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
                if (typeof prototype[name] == "function") {
                    var _addsuper = typeof prop[name] === "function" &&
                    typeof _super[name] === "function";
                    // 'script.soundfont.chunks.SoundFontChunk'
                    prototype[name] = (function (name, fn, requires, addsuper, _extends) {
                        return function () {
                            var t = 1;
                            var temp = {};
                            var longtemp = {};
                            var tempclassnames = requires.slice().concat(_extends.slice()).concat(type.slice());
                            if (addsuper) {
                                var tmp = this.callParent;
                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this.callParent = _super[name];
                                this.super = _super[name].bind(this, arguments);
                            }
                            //for (var i = 0; i < tempclassnames.length; i++) {
                            MEPH.Array(tempclassnames).foreach(function (t, i) {
                                var c = getDefinedClass(tempclassnames[i]);
                                var namespaceSplit = tempclassnames[i].split(".");
                                var cname = namespaceSplit[namespaceSplit.length - 1];
                                temp[cname] = window[cname];
                                longtemp[tempclassnames[i]] = window[tempclassnames[i]];
                                window[cname] = c;
                                window[tempclassnames[i]] = c; // longtemp[tempclassnames[i]] =
                            });
                            try {
                                var ret = fn.apply(this, arguments);
                            }
                            catch (ee) {
                                var error = ee;
                                if (!(ee instanceof Error)) {
                                    ee = new Error(ee);
                                }
                                if (meph.DebugMode) {
                                    console.log(ee.stack);
                                }
                                throw error;
                            }
                            finally {
                                for (var i in temp) {
                                    window[i] = temp[i];
                                }
                                for (var i in longtemp) {
                                    window[i] = longtemp[i];
                                }
                                if (addsuper) {
                                    this.callParent = tmp;
                                }

                            }
                            return ret;
                        }
                    })(name, prop[name], prop.requires || [], _addsuper, prop['extend'] || []);
                }
            }
            if (prop.templates) {
                var templates = prop.templates === true ? [type] : prop.templates;
                prototype.templates = _super.templates ? _super.templates.concat(templates) : templates;

            }
            if (prop.properties) {
                prop.properties.____type = type;
            }

            if (prop.properties) {
                for (var i in prop.properties) {
                    prototype[i] = clone(prop.properties[i]);
                }
            }

            if (prop.observable) {
                var observables = [];
                for (var i in prop.observable) {
                    prototype[i] = clone(prop.observable[i]);
                    observables.push(i);
                }
                prototype.$__observables = prototype.$__observables || [];
                observables.foreach(function (x) {
                    if (!prototype.$__observables.contains(function (y) {
                        return x == y;
                    })) {
                        prototype.$__observables.push(x);
                    }
                });
            }
            // The dummy class constructor
            function Class() {

                if (!this.$window) {
                    Object.defineProperty(this, '$window', {
                        enumerable: false,
                        writeable: true,
                        configurable: true,
                        get: function () {
                            return window;
                        }
                    })
                }
                this.____type = type;
                // All construction is actually done in the init method
                if (!initializing && this.initialize)
                    this.initialize.apply(this, arguments);
            }

            // Populate our constructed prototype object
            Class.prototype = prototype;

            // Enforce the constructor to be what we expect
            Class.prototype.constructor = Class;

            // And make this class extendable
            Class.extend = arguments.callee;

            if (prop.statics) {
                for (var i in prop.statics) {
                    Class[i] = prop.statics[i];
                }
            }

            return Class;
        };
    })();

    meph.events = {
        frameworkReady: 'frameworkReady',
        definedClass: 'definedClass',
        definedTemplate: 'definedTemplate'
    }
    meph.listeners = meph.listeners || [];

    var listeners = meph.listeners;

    meph.on = function (type, func, scope) {
        meph.listeners.push({
            type: type,
            func: func,
            scope: scope
        });
    }
    meph.fire = function (type, args) {
        meph.Array(meph.listeners).filter(function (listener) {
            return listener.type === type;
        }).forEach(function (listener) {
            listener.func.apply(listener.scope, meph.Array([args]));
        });
    }
    meph.removeListeners = function (type, reference) {
        meph.listeners.removeWhere(function (listeners) {
            if (type && reference) {
                return listeners.type == type && listeners.scope === reference;
            }
            else if (reference) {
                return listeners.scope === reference;
            }
            else if (type) {
                return listeners.type == type;
            }
            return true;
        });
    }
    meph.un = meph.removeListeners;

    var frameworkReady;
    var frameworkPromise;
    meph.ready = function () {
        if (frameworkPromise) {
            return frameworkPromise;
        }
        frameworkPromise = new Promise(function (resolve, failed) {
            frameworkReady = resolve;
        }).then(function () {
            meph.Array(meph.connectableTypes).foreach(function (x) {
                meph.addBindPrefixShortCuts(x.shortCut, x.type);
            });
        });
        return frameworkPromise;
    }
    meph.on(meph.events.definedClass, function (className) {
        if (getDefinedClass('util.Array', meph)) {
            meph.fire(meph.events.frameworkReady);
            meph.removeListeners(meph.events.definedClass, meph);
        }
    }, meph);
    meph.on(meph.events.frameworkReady, function () {
        if (!frameworkReady) {
            frameworkPromise = new Promise(function (resolve, failed) {
                frameworkReady = resolve;
            });
        }
        frameworkReady();
    });
    var loadpromise = null;
    if (getDefinedClass('util.Array', meph)) {
        meph.fire(meph.events.frameworkReady);

    }
    else {
        meph.requiredFiles = [
        ];
        loadpromise = meph.loadScripts(meph.requiredFiles);
    }

    meph.frameWorkPath = $frameWorkPath;
    meph.frameWorkPathSource = $frameWorkPath + '/meph.js';





    return { framework: meph, promise: loadpromise };
});
if (self) {
    self.onmessage = function (oEvent) {

        switch (oEvent.data.func) {
            case 'start':
                eval(oEvent.data.src);
                //self[oEvent.data.framework].ready().then(function () {
                //    postMessage({ "success": true });
                //});
                break;
            case 'import':
                importScripts(oEvent.data.src);
                postMessage({ "success": true });
                break;
            case 'load':
                self[oEvent.data.framework].requires(oEvent.data.script).then(function () {
                    postMessage({ "success": true });
                });
                break;
            case 'exec':
                Promise.resolve().then(function () {
                    eval('var work = ' + oEvent.data.work);
                    return work.apply(null, oEvent.data.args || []);
                }).then(function (result) {
                    postMessage(result);
                });
                break;
        }

    };
    //if (self === window)
    //    postMessage({ "success": true });
}

var exports = exports || null;
var nodejs = {
    log: function () {
    }
}
if (exports) {

    var vm = require("vm");
    window = global;
    var document = null;
    nodejs.log = function () {
        console.log(arguments);
    }

    exports.mephFrameWork = mephFrameWork;
}


(function (array, neveragain) {
    array = array || [];
    if (window.appliedToAllArrays && Array.isArray(array)) {
        return array;
    }
    if (!array.where) {
        Object.defineProperty(array, 'where', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = [];
                var collection = this;
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i], i)) {
                        result.push(collection[i]);
                    }
                }
                return result;
            }
        });
    }

    //if (!array.observable) {
    //    object.defineproperty(array, 'observable', {
    //        enumerable: false,
    //        writable: true,
    //        configurable: true,
    //        value: function () {
    //            var collection = this;
    //            return meph.util.observable.observable(collection);
    //        }
    //    });
    //}

    if (!array.orderBy) {
        Object.defineProperty(array, 'orderBy', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this.select(function (x) { return x; });
                return collection.sort(func);
            }
        });
    }

    if (!array.maxSelection) {
        Object.defineProperty(array, 'maxSelection', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = null;
                var _result = null;
                var collection = this;
                for (var i = 0 ; i < collection.length; i++) {
                    if (result == null || func(collection[i]) > result) {
                        result = func(collection[i]);
                        _result = collection[i];
                    }
                }
                return _result;
            }
        });
    }
    if (!array.intersection) {
        Object.defineProperty(array, 'intersection', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (othercollection, func) {
                var collection = this;
                var result = [];
                func = func || function (x, y) { return x === y; };
                for (var i = collection.length; i--;/**/) {
                    for (var j = othercollection.length; j--;/**/) {
                        if ((func(othercollection[j], collection[i]))) {
                            result.push(collection[i]);
                            break;
                        }
                    }
                }
                return result;
            }
        });
    }
    if (!array.intersectFluent) {
        Object.defineProperty(array, 'intersectFluent', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                var result = [];
                func = func || function (x, y) { return x === y; };
                result.push.apply(result, collection[0]);
                collection = collection.subset(1);
                collection.foreach(function (x) {
                    result = result.intersection(x, func);
                });
                return result;
            }
        });
    }
    if (!array.count) {
        Object.defineProperty(array, 'count', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                func = func || function () { return true; };
                return this.where(func).length;
            }
        });
    }

    if (!array.trim) {
        Object.defineProperty(array, 'trim', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                var result = [];
                var collection = this;
                for (var i = 0 ; i < collection.length; i++) {
                    result.push(collection[i].trim());
                }
                return result;
            }
        });
    }

    if (!array.indexWhere) {
        Object.defineProperty(array, 'indexWhere', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = [];
                var collection = this;
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i])) {
                        result.push(i);
                    }
                }
                return result;
            }
        });
    }

    if (!array.relativeCompliment) {
        var extrasection_relativeCompliment = {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (othercollection, func) {
                var collection = this;
                var result = [];
                func = func || function (x, y) { return x === y; };
                for (var i = collection.length; i--;/**/) {//function (x) { return x == collection[i]; }
                    if (othercollection.count(func.bind(window, collection[i])) == 0) {
                        result.push(collection[i]);
                    }
                }
                return result;
            }
        }
        if (!array.relativeCompliment) {
            Object.defineProperty(array, 'relativeCompliment', extrasection_relativeCompliment);
        }
    }
    if (!array.random) {
        Object.defineProperty(array, 'random', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                var result = [];
                var collection = this;
                for (var i = 0 ; i < collection.length; i++) {
                    result.splice(Math.floor(Math.random(0) * result.length), 0, (collection[i]));
                }
                return result;
            }
        });
    }


    if (!array.all) {
        Object.defineProperty(array, 'all', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                for (var i = 0 ; i < collection.length ; i++) {
                    if (!func(collection[i], i)) {
                        return false;
                    }
                }
                return true;
            }
        });
    }
    if (!array.removeWhere) {
        Object.defineProperty(array, 'removeWhere', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                func = func || function () { return true; }
                var result = collection.where(func);
                for (var i = 0 ; i < result.length; i++) {
                    collection.splice(collection.indexOf(result[i]), 1);
                }
                return result;
            }
        });
    }
    if (!array.clear) {
        Object.defineProperty(array, 'clear', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                return collection.removeWhere(function (x) { return true; });
            }
        });
    }
    if (!array.removeFirstWhere) {
        Object.defineProperty(array, 'removeFirstWhere', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                var result = collection.where(func);
                for (var i = 0 ; i < Math.min(result.length, 1) ; i++) {
                    collection.splice(collection.indexOf(result[i]), 1);
                }
                return result;
            }
        });
    }
    if (!array.remove) {
        Object.defineProperty(array, 'remove', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (from, to) {
                var collection = this,
                    rest = collection.slice((to || from) + 1 || collection.length);
                collection.length = from < 0 ? collection.length + from : from;
                return collection.push.apply(collection, rest);
            }
        });
    }

    if (!array.max) {
        Object.defineProperty(array, 'max', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = null,
                    resultValue = null;
                func = func || function (x) { return x; }
                var collection = this;
                for (var i = 0 ; i < collection.length; i++) {
                    if (resultValue == null || func(collection[i]) > resultValue) {
                        result = (collection[i]);
                        resultValue = func(collection[i]);
                    }
                }
                return result;
            }
        });
    }
    if (!array.foreach) {
        Object.defineProperty(array, 'foreach', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                for (var i = 0; i < collection.length; i++) {
                    func(collection[i], i);
                }
                return this;
            }
        });
    }

    if (!array.select) {
        Object.defineProperty(array, 'select', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = [];
                func = func || function (x) { return x; };
                var collection = this;
                for (var i = 0 ; i < collection.length ; i++) {
                    result.push(func(collection[i], i));
                }
                return result;
            }
        });
    }

    if (!array.contains) {
        Object.defineProperty(array, 'contains', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                return this.first(func) != null;
            }
        });
    }


    if (!array.first) {
        Object.defineProperty(array, 'first', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this.select(function (x) { return x });
                func = func || function () { return true; };
                if (typeof (func) !== 'function') {
                    var temp = func;
                    func = function (x) {
                        return temp === x;
                    }
                }
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i], i)) {
                        return (collection[i]);
                    }
                }
                return null;
            }
        });
    }

    if (!array.selectFirst) {
        Object.defineProperty(array, 'selectFirst', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this.select(function (x) { return x });
                func = func || function () { return true; };
                if (typeof (func) !== 'function') {
                    var temp = func;
                    func = function (x) {
                        return temp === x;
                    }
                }
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i])) {
                        return func(collection[i]);
                    }
                }
                return null;
            }
        });
    }

    if (!array.last) {
        Object.defineProperty(array, 'last', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                func = func || function () { return true; };
                if (typeof (func) !== 'function') {
                    var temp = func;
                    func = function (x) {
                        return temp === x;
                    }
                }
                var collection = MEPH.Array(this.select(function (x) {
                    return x
                }).reverse());
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i])) {
                        var result = (collection[i])
                        return result;
                    }
                }
                return null;
            }
        });
    }

    if (!array.interpolate) {
        Object.defineProperty(array, 'interpolate', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (start, stop, func) {
                var collection = this;
                for (var i = start; i < stop ; i++) {
                    collection.push(func(i));
                }
                return collection;
            }
        });
    }
    if (!array.groupBy) {
        Object.defineProperty(array, 'groupBy', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                var result = {};
                for (var i = 0 ; i < collection.length ; i++) {
                    var t = func(collection[i]);
                    result[t] = result[t] || [];
                    result[t].push(collection[i]);
                }
                return result;
            }
        });
    }

    if (!array.second) {
        Object.defineProperty(array, 'second', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this.select(function (x) { return x });
                var metcriteria = 0;
                func = func || function () { return true; };
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i])) {
                        metcriteria++;
                    }
                    if (metcriteria == 2) {
                        return (collection[i]);
                    }
                }
                return null;
            }
        });
    }

    if (!array.min) {
        Object.defineProperty(array, 'min', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = null;
                var collection = this;
                func = func || function (x) { return x; }
                for (var i = 0 ; i < collection.length; i++) {
                    if (result == null || func(collection[i]) < result) {
                        result = func(collection[i]);
                    }
                }
                return result;
            }
        });
    }

    if (!array.nth) {
        Object.defineProperty(array, 'nth', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (nth, func) {
                var collection = this.select(function (x) { return x });
                var metcriteria = 0;
                func = func || function () { return true; };
                for (var i = 0 ; i < collection.length ; i++) {
                    if (func(collection[i])) {
                        metcriteria++;
                    }
                    if (metcriteria == nth) {
                        return (collection[i]);
                    }
                }
                return null;
            }
        });
    }

    if (!array.unique) {
        Object.defineProperty(array, 'unique', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = [];
                var finalresult = [];
                func = func || function (x) { return x; };
                var collection = this;
                for (var i = 0 ; i < collection.length ; i++) {
                    //if (func(collection[i])) {
                    if (result.indexOf(func(collection[i])) === -1) {
                        result.push(func(collection[i]));
                        finalresult.push(collection[i]);
                    }
                    //}
                }
                return finalresult;
                //return result;
            }
        });
    }
    if (!array.summation) {
        Object.defineProperty(array, 'summation', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = 0;
                var collection = this;
                for (var i = 0; i < collection.length ; i++) {
                    result = func(collection[i], result, i);
                }
                return result;
            }
        });
    }

    if (!array.sum) {
        Object.defineProperty(array, 'sum', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = 0;
                var collection = this;
                for (var i = 0 ; i < collection.length; i++) {
                    result += func(collection[i], i);
                }
                return result;
            }
        });
    }

    if (!array.minSelect) {
        Object.defineProperty(array, 'minSelect', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var result = null;
                var selection = null
                var collection = this;
                func = func || function (x) { return x; }
                for (var i = 0 ; i < collection.length; i++) {
                    if (result == null || func(collection[i]) < result) {
                        result = func(collection[i]);
                        selection = collection[i];
                    }
                }
                return selection;
            }
        });
    }
    if (!array.concatFluentReverse) {
        Object.defineProperty(array, 'concatFluentReverse', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (func) {
                var collection = this;
                var result = [];
                for (var i = collection.length; i--;/**/) {
                    result = MEPH.util.Array.create(result.concat(func(collection[i], i)));
                }
                return result;
            }
        });
    }

    if (!array.subset) {
        Object.defineProperty(array, 'subset', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function (start, stop) {
                var collection = this;
                var result = [];
                stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                for (var i = start ; i < stop ; i++) {
                    result.push(collection[i]);
                }
                return MEPH.util.Array.create(result);
            }
        });
    }

    if (neveragain) {
        window.appliedToAllArrays = true;
    }
    return array;
})(Array.prototype);

mephFrameWork('MEPH', '')