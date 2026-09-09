(function() {
    const SHOP_CONFIG = {};
    let PUBLISHER_CONFIGS = {};
    let isDebugLogging;
    const LS_PREFIX = 'taboola:shopify:';

    const TFA = {
        'ADD_TO_CART': 'add_to_cart',
        'PAGE_VIEW': 'page_view',
        'BUY': 'make_purchase',
        'CHECKOUT': 'start_checkout',
        'CART_VIEW': 'cart_view',
        'SEARCH': 'search_submitted',
        'COLLECTION_VIEW': 'collection_view',
        'PRODUCT_VIEW': 'product_view',
    };

    const LOCAL_STORAGE_KEYS = {
        'USER_ID': 'taboola global:user-id',
        'LAST_EXTERNAL_REFERRER': 'taboola global:last-external-referrer',
        'TBLCI': 'taboola global:tblci',
        'DEBUG_LOGGING': 'taboola:shopify:enable_debug_logging',
        'SHOP_ID': 'taboola global:shop-id',
        'KEYS': 'taboola global:local-storage-keys',
        'ALLOW_CHECKOUT_START': LS_PREFIX + 'pixel_allow_checkout_start',
        'TEST': LS_PREFIX + 'test',
        'ADD_TO_CART': LS_PREFIX + TFA.ADD_TO_CART,
        'PAGE_VIEW': LS_PREFIX + TFA.PAGE_VIEW,
        'CART_VIEW': LS_PREFIX + TFA.CART_VIEW,
        'SEARCH': LS_PREFIX + TFA.SEARCH,
        'COLLECTION_VIEW': LS_PREFIX + TFA.COLLECTION_VIEW,
        'PRODUCT_VIEW': LS_PREFIX + TFA.PRODUCT_VIEW
    };

    async function sendLogToDb(event, userAgent, message, taboolaId, step, orderId = null) {
        if (isDebugLogging) {
            console.log(`${message} - ${step}`);

            const url = new URL('https://spfy-pxl.archive-digger.com/log');
            url.searchParams.append('event_name', event);
            url.searchParams.append('user_agent', encodeURIComponent(userAgent));
            url.searchParams.append('log_message', message);
            url.searchParams.append('taboola_id', taboolaId);
            url.searchParams.append('step', step);

            fetch(url, { method: 'GET', keepalive: true, mode: 'no-cors' });
        }
    }

    function initializeConfigs() {
        try {
            let currentScriptUrl = document?.currentScript?.src;
            if (currentScriptUrl && !currentScriptUrl.startsWith('http')) {
                currentScriptUrl = 'https:' + currentScriptUrl;
            }

            const urlParams = new URL(currentScriptUrl).searchParams;
            SHOP_CONFIG.TABOOLA_ID = urlParams.get('taboolaId');

            if (!SHOP_CONFIG.TABOOLA_ID) {
                console.error('[TABOOLA DEBUG] - Taboola ID not found in the script tag URL');
                sendLogToDb('client_script', window.navigator.userAgent, '[TABOOLA DEBUG] - Taboola ID not found in the script tag URL', '', '', 'error');
            }

            SHOP_CONFIG.SHOP_ID = urlParams.get('shopId');

            PUBLISHER_CONFIGS = {
                'enable_logging': urlParams.get('espd') || 'true',  // Needs this FE fallback because it is set on pixel install only
                'enable_http': urlParams.get('eh'),
                ['enable_' + TFA.ADD_TO_CART]: urlParams.get('eatc'),
                ['enable_' + TFA.PAGE_VIEW]: urlParams.get('epv'),
                ['enable_' + TFA.BUY]: urlParams.get('ep'),
                ['enable_' + TFA.CART_VIEW]: urlParams.get('ecav'),
                ['enable_' + TFA.SEARCH]: urlParams.get('ess'),
                ['enable_' + TFA.COLLECTION_VIEW]: urlParams.get('ecv'),
                ['enable_' + TFA.PRODUCT_VIEW]: urlParams.get('eprv'),
                ['enable_' + TFA.CHECKOUT]: urlParams.get('esc')
            }

            isDebugLogging = PUBLISHER_CONFIGS.enable_logging === 'true';

            if (isDebugLogging) {
                localStorage.setItem(LOCAL_STORAGE_KEYS.DEBUG_LOGGING, 'true');
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEYS.DEBUG_LOGGING);
            }
        } catch (err) {
            console.error('[TABOOLA DEBUG] - Error occurred during variable initialization step - script_tag.js', err);
        }
    }

    function getTblciParam() {
        const params = new URL(window.location.href).searchParams;
        const tblci = params.get('tblci') || window.location.hash.split('tblci')[1];
        return tblci ? tblci : localStorage.getItem(LOCAL_STORAGE_KEYS.TBLCI);
    }

    function sendHttpEvent(query, taboolaId) {
        if (PUBLISHER_CONFIGS.enable_http === 'false') return;

        const tblciParam = getTblciParam();
        const userIdParam = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);

        if (tblciParam) query += `&tblci=${tblciParam}`;
        if (userIdParam) query += `&ui=${userIdParam}`;

        const itemUrl = `${document.location.origin}${document.location.pathname}`;
        const url = `https://trc.taboola.com/${taboolaId}/log/3/unip?${query}&item-url=${encodeURIComponent(itemUrl)}`;
        
        fetch(url, { method: 'GET', keepalive: true });
    }

    function handleTaboolaSetItem(key, value) {
        // Only process keys that start with Taboola prefix - skip all other localStorage calls
        if (!key || !key.startsWith(LS_PREFIX)) {
            return;
        }

        // *key* is tfa event name prefixed by LS_PREFIX, *value* is Shopify event data (it is used for *add_to_cart*)
        const tfaEventName = key.replace(LS_PREFIX, "");
        const lsEventName = key;
        const isTfaEvent = Object.values(TFA).includes(tfaEventName);

        if (PUBLISHER_CONFIGS[`enable_${tfaEventName}`] === 'true') {
            const sendEvent = (additionalData) => {
                if (isTfaEvent) {
                    // Log the event before processing (before_tfa)
                    sendLogToDb(
                        tfaEventName,
                        window.navigator.userAgent,
                        `[TABOOLA DEBUG] - Before [[${tfaEventName}]]`,
                        SHOP_CONFIG.TABOOLA_ID,
                        'before_tfa',
                    );

                    // Push the event to _tfa for Taboola tracking
                    _tfa.push({
                        notify: 'event',
                        name: tfaEventName,
                        it: 'SHOPIFY_APP',
                        id: SHOP_CONFIG.TABOOLA_ID,
                        ...additionalData
                    });

                    // Remove the event from localStorage after processing
                    localStorage.removeItem(lsEventName);

                    // Log the event after processing (after_tfa)
                    sendLogToDb(
                        tfaEventName,
                        window.navigator.userAgent,
                        `[TABOOLA DEBUG] - After [[${tfaEventName}]]`,
                        SHOP_CONFIG.TABOOLA_ID,
                        'after_tfa',
                    );

                    // Log the event after processing and before Taboola http request (after_tfa)
                    sendLogToDb(
                        tfaEventName,
                        window.navigator.userAgent,
                        `[TABOOLA DEBUG] - Before [[${tfaEventName}]] http method`,
                        SHOP_CONFIG.TABOOLA_ID,
                        'before_http',
                    )

                    // Build the query string for the HTTP event
                    let query = `en=${tfaEventName}_http&it=SHOPIFY_APP`;

                    if (additionalData) {
                        Object.entries(additionalData).forEach(([key, value]) => {
                            query += `&${key}=${value}`;
                        });
                    }

                    // Send the HTTP event to Taboola
                    sendHttpEvent(query, SHOP_CONFIG.TABOOLA_ID);

                    // Log the event after sending the Taboola http request
                    sendLogToDb(
                        tfaEventName,
                        window.navigator.userAgent,
                        `[TABOOLA DEBUG] - After [[${tfaEventName}]] http method`,
                        SHOP_CONFIG.TABOOLA_ID,
                        'after_http',
                    );
                } else {
                    console.error(`[TABOOLA DEBUG] - Event data not found for ${tfaEventName}`);
                }
            };

            try {
                if (tfaEventName === TFA.ADD_TO_CART) {
                    const shopifyCartData = JSON.parse(value);
                    const { cost, quantity } = shopifyCartData || {};

                    sendEvent({
                        revenue: cost?.totalAmount?.amount || '',
                        currency: cost?.totalAmount?.currencyCode || '',
                        quantity: quantity || ''
                    });
                } else {
                    sendEvent();
                }
            } catch (err) {
                console.error("[TABOOLA DEBUG] - Error parsing JSON:", err);
            }
        }
    }

    function initializeLocalStorageInterceptor() {
        // Wrap only the setItem method instead of replacing the entire localStorage object
        // This preserves native browser context and compatibility with third-party scripts
        const originalSetItem = localStorage.setItem.bind(localStorage);

        localStorage.setItem = function(key, value) {
            // Call Taboola event handling logic with error protection
            // Ensures originalSetItem always runs even if Taboola tracking fails
            try {
                handleTaboolaSetItem(key, value);
            } catch (err) {
                console.error('[TABOOLA DEBUG] - Error in handleTaboolaSetItem:', err);
            }
            // Always call the original method
            return originalSetItem(key, value);
        };

        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TEST, 'test');
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TEST);
        } catch (err) {
            console.error('[TABOOLA DEBUG] - LocalStorage is blocked', err);
            sendLogToDb('local_storage', window.navigator.userAgent, '[TABOOLA DEBUG] - LocalStorage is blocked', SHOP_CONFIG.TABOOLA_ID, '', 'init');
        }
    }

    function loadTfaScript() {
        console.log('[TABOOLA DEBUG] - Loading tfa.js');
        window._tfa = window._tfa || [];
        !function(t, f, a, x) {
            if (!document.getElementById(x)) {
                t.async = 1;
                t.src = a;
                t.id = x;
                f.parentNode.insertBefore(t, f);
            }
        }(document.createElement('script'), document.getElementsByTagName('script')[0], `//cdn.taboola.com/libtrc/unip/${SHOP_CONFIG.TABOOLA_ID}/tfa.js`, 'tb_tfa_script');
        console.log('[TABOOLA DEBUG] - tfa.js Loaded successfully');
    }

    function initializeCheckoutStart() {
        const enableCheckoutStart = PUBLISHER_CONFIGS.enable_start_checkout !== 'false';
        localStorage.setItem(LOCAL_STORAGE_KEYS.ALLOW_CHECKOUT_START, enableCheckoutStart ? 'true' : 'false');
    }

    function handleEventFromLocalStorage(lsEventName, tfaEventName) {
        const event = localStorage.getItem(lsEventName);

        if (event && PUBLISHER_CONFIGS[`enable_${tfaEventName}`] === 'true') {
            // Special handling for 'add_to_cart' event: remove from localStorage and return
            if (lsEventName === LOCAL_STORAGE_KEYS.ADD_TO_CART) {
                localStorage.removeItem(LOCAL_STORAGE_KEYS.ADD_TO_CART);
                return;
            }

             // Log the event before processing (before_tfa)
            sendLogToDb(
                tfaEventName,
                window.navigator.userAgent,
                `[TABOOLA DEBUG] - HEALTH LOG - Before [[${tfaEventName}]]`,
                SHOP_CONFIG.TABOOLA_ID,
                'before_tfa', 
            );

            // Push the event to _tfa for Taboola tracking
            _tfa.push({ 
                notify: 'event',
                name: tfaEventName,
                it: 'SHOPIFY_APP',
                id: SHOP_CONFIG.TABOOLA_ID,
            });

            // Push the event to _tfa for Taboola tracking
            localStorage.removeItem(lsEventName);

            // Log the event after processing (after_tfa)
            sendLogToDb(
                tfaEventName,
                window.navigator.userAgent,
                `[TABOOLA DEBUG] - HEALTH LOG - After [[${tfaEventName}]]`,
                SHOP_CONFIG.TABOOLA_ID,
                'after_tfa', 
            );

             // Log the event after processing and before Taboola http request (after_tfa)
             sendLogToDb(
                tfaEventName, 
                window.navigator.userAgent, 
                `[TABOOLA DEBUG] - HEALTH LOG - Before [[${tfaEventName}]] http method`, 
                SHOP_CONFIG.TABOOLA_ID, 
                'before_http', 
            )

            // Build the query string for the HTTP event
            let query = `en=${tfaEventName}_http&it=SHOPIFY_APP`;

            // Send the HTTP event to Taboola
            sendHttpEvent(query, SHOP_CONFIG.TABOOLA_ID);

            // Log the event after sending the HTTP request (after_http)
            sendLogToDb(
                tfaEventName, 
                window.navigator.userAgent, 
                `[TABOOLA DEBUG] - HEALTH LOG - After [[${tfaEventName}]] http method`, 
                SHOP_CONFIG.TABOOLA_ID, 
                'after_http', 
            );
        }
    }

    function handleEventsFromLocalStorage() {
        Object.keys(TFA).forEach((key) => {
            const lsEventName = LOCAL_STORAGE_KEYS[key];
            const tfaEventName = TFA[key];
            if (!lsEventName) return;

            handleEventFromLocalStorage(lsEventName, tfaEventName); 
        });
    }

    try {
        initializeConfigs();
        initializeLocalStorageInterceptor();
        loadTfaScript();
        initializeCheckoutStart();
        handleEventsFromLocalStorage();
    } catch (err) {
        console.error('[TABOOLA DEBUG] Runtime error while running script_tag.js', err);
        sendLogToDb('client_script', window.navigator.userAgent, `[TABOOLA DEBUG] - Error occurred on client script: ${err.message}`, SHOP_CONFIG.TABOOLA_ID, '', 'error');
    }
})();