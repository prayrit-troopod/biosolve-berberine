



var next_run = "False";









function getCookieread (cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}

function read_code () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
    v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}


var c_read_url_hGDYF = window.location.href;








(() => {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        let ret = oldPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    let oldReplaceState = history.replaceState;
    history.replaceState = function replaceState() {
        let ret = oldReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
})();


MakeLog_hGDYF(c_read_url_hGDYF).then(function (value) {
    window.addEventListener('locationchange', function () {
        
        if (window.location.href != c_read_url_hGDYF) {
            c_read_url_hGDYF = window.location.href;
        
            MakeLog_hGDYF(c_read_url_hGDYF).then(function (value) { })
        }
    });
})


    
async function detectRealDeviceChecks() {
  const details = {};

  const ua = navigator.userAgent;
  let detectedDevice = 'desktop';
  if (/iphone|android.+mobile|windows phone/i.test(ua)) {
    detectedDevice = 'mobile';
  } else if (/ipad|tablet/i.test(ua)) {
    detectedDevice = 'tablet';
  }
  details.uaDeviceType = detectedDevice;

  details.pixelRatio = window.devicePixelRatio;
  details.touchPoints = navigator.maxTouchPoints;
  details.cpuCores = navigator.hardwareConcurrency;
  details.hasMotionSensors = ('DeviceMotionEvent' in window && 'DeviceOrientationEvent' in window);

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      details.gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } else {
      details.gpuRenderer = 'Unknown';
    }
  } catch {
    details.gpuRenderer = 'Error';
  }

  try {
    const battery = await navigator.getBattery();
    details.batteryLevel = Math.round(battery.level * 100);
    details.batteryCharging = battery.charging;
  } catch {
    details.batteryLevel = 'Unavailable';
    details.batteryCharging = 'Unavailable';
  }

  const gpuLower = (details.gpuRenderer || '').toLowerCase();
  const isDesktopGPU = gpuLower.includes('intel') || gpuLower.includes('nvidia') || gpuLower.includes('apple m');

  const tests = [
    { name: 'UA', passed: details.uaDeviceType === 'mobile' || details.uaDeviceType === 'tablet' },
    { name: 'PR >= 2', passed: details.pixelRatio >= 2 },
    { name: 'TP > 1', passed: details.touchPoints > 1 },
    { name: 'CC <= 8', passed: details.cpuCores <= 8 },
    { name: 'MS', passed: details.hasMotionSensors },
    { name: 'NDG', passed: !isDesktopGPU }
  ];

  details.testResults = tests.map(t => ({
    [t.name]: t.passed ? 'pass' : 'fail'
  }));

  details.status = tests.every(t => t.passed) ? 'pass' : 'fail';

  return details;
}
    
async function MakeLog_hGDYF (c_url) {

        
        var clickId = getCookieread('adzmachine_user')
        
    if (!clickId || clickId === '') clickId = read_code()
    var expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString()
        
    document.cookie = 'adzmachine_user=' + clickId + '; expires=' + expires + ';path=/;'
        
    document.cookie = 'page_refreshed=true' + '; expires=' + expires + ';path=/;'
        
    let device = await detectRealDeviceChecks();
        
    var data = {
        url: c_url,
        referrer: document.referrer,
        unique_id: clickId,
        device: JSON.stringify(device)
    }
    var log_url_hGDYF = 'https://static-cdn.adzmachine.com/hGDYF/?async=true&panel=17';
    
    try {
        if (document.currentScript.hasAttribute('async')) {
            var log_url_hGDYF = 'https://static-cdn.adzmachine.com/hGDYF/?async=true&panel=17';
            
        } else {
            var log_url_hGDYF = 'https://static-cdn.adzmachine.com/hGDYF/?async=false&panel=17';
            
        }
    } catch (error) {
    }

    try {
            let response = await fetch(
                log_url_hGDYF, {
                    method: 'POST',
                    body: new URLSearchParams(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                })
            if (response && response.ok) {
                    var resp_result = await response.json();
                    var expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
                    document.cookie = 'supersession=' + resp_result.session + '; expires=' + expires + '; path=/' + '; SameSite=Lax' + '; Secure';
                    if (resp_result.status == "success") {
                        let log_id = resp_result['id'];
                    } else {

                            
                            if (window.self === window.top) {
                            
                            
                            let script = document.createElement('script');
                            
                            script.src = 'https://static-cdn.adzmachine.com/data/failed.js?id='+resp_result.id;
                            
                            script.id = 'superuser';
                            script.async = true;
                            document.head.appendChild(script);
                            
                            
                            }
                            
                    }
                    
                    
                    
            }
    } catch (error) {
    }
    return ''
}


if (typeof hGDYF_check_cart_interval !== "undefined") {
    clearInterval(hGDYF_check_cart_interval);
}
var hGDYF_check_cart_interval = setInterval(() => {
    if (getCookieread("cart")) {
        MakeLog_hGDYF(`${c_read_url_hGDYF}cart.js`);
        clearInterval(hGDYF_check_cart_interval);
    }
    if (getCookieread("checkout-cart")) {
        MakeLog_hGDYF(`${c_read_url_hGDYF}cart.js`);
        clearInterval(hGDYF_check_cart_interval);
    }
}, 1000);






















    