/**
 * Retainful Cookie Utilities
 * Standalone JavaScript for reading popup conversion cookies
 *
 * Usage in Shopify/WooCommerce:
 * <script src="{{ 'cookie.js' | asset_url }}"></script>
 * <script>
 *   var email = RetainfulCookie.getEmail();
 *   var phone = RetainfulCookie.getPhone();
 *   console.log('User email:', email);
 * </script>
 */

(function (window) {
  'use strict';

  /**
   * Cookie name constants
   */
  var COOKIE_NAMES = {
    WOOCOMMERCE: '_wc_retainful_tk_session',
    SHOPIFY: '_shopify_rnoc_tk_session',
    TRACKING: 'rtl-gid',
  };

  /**
   * Detect platform (Shopify or WooCommerce)
   * @returns {string} 'shopify' or 'woocommerce'
   */
  function detectPlatform() {
    var isShopify = window.Shopify && window.ShopifyAnalytics;
    return isShopify ? 'shopify' : 'woocommerce';
  }

  /**
   * Get conversion cookie name based on platform
   * @returns {string} Cookie name
   */
  function getCookieName() {
    var platform = detectPlatform();
    return platform === 'shopify'
      ? COOKIE_NAMES.SHOPIFY
      : COOKIE_NAMES.WOOCOMMERCE;
  }

  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string} Cookie value or empty string
   */
  function getCookie(name) {
    try {
      var value = '; ' + document.cookie;
      var parts = value.split('; ' + name + '=');
      if (parts.length === 2) {
        return parts.pop().split(';').shift() || '';
      }
    } catch (error) {
      console.warn('Failed to get cookie:', name, error);
    }
    return '';
  }

  /**
   * Base64 decode (decrypt)
   * @param {string} str - Base64 encoded string
   * @returns {string} Decoded string
   */
  function base64Decode(str) {
    try {
      // Handle URL encoding
      if (str.indexOf('%') !== -1) {
        str = decodeURIComponent(str);
      }
      return atob(str);
    } catch (error) {
      console.warn('Failed to decode base64:', error);
      return '';
    }
  }

  /**
   * Get conversion cookie data
   * @returns {Object|null} { email: string, phone?: string } or null
   */
  function getConversionData() {
    try {
      var cookieName = getCookieName();
      var cookieValue = getCookie(cookieName);

      if (!cookieValue) {
        return null;
      }

      // Decrypt (base64 decode)
      var decrypted = base64Decode(cookieValue);
      if (!decrypted) {
        return null;
      }

      // Parse JSON
      var data = JSON.parse(decrypted);
      return data;
    } catch (error) {
      console.warn('Failed to get conversion data:', error);
      return null;
    }
  }

  /**
   * Get email from conversion cookie
   * @returns {string|null} Email or null
   */
  function getEmail() {
    var data = getConversionData();
    return data && data.email ? data.email : null;
  }

  /**
   * Get phone from conversion cookie
   * @returns {string|null} Phone or null
   */
  function getPhone() {
    var data = getConversionData();
    return data && data.phone ? data.phone : null;
  }

  /**
   * Check if user has converted (has email in cookie)
   * @returns {boolean} True if converted, false otherwise
   */
  function hasConverted() {
    var email = getEmail();
    return !!email;
  }

  /**
   * Get tracking cookie data (rtl-gid)
   * @returns {Object|null} { id: string, timestamp: number } or null
   */
  function getTrackingData() {
    try {
      var cookieValue = getCookie(COOKIE_NAMES.TRACKING);
      if (!cookieValue) {
        return null;
      }

      var parts = cookieValue.split(':');
      if (parts.length === 2) {
        return {
          id: parts[0],
          timestamp: parseInt(parts[1], 10),
        };
      }
    } catch (error) {
      console.warn('Failed to get tracking data:', error);
    }
    return null;
  }

  /**
   * Get tracking ID from rtl-gid cookie
   * @returns {string|null} Tracking ID or null
   */
  function getTrackingId() {
    var data = getTrackingData();
    return data ? data.id : null;
  }

  /**
   * Delete conversion cookie
   */
  function deleteConversionCookie() {
    try {
      var cookieName = getCookieName();
      document.cookie =
        cookieName + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      console.log('Conversion cookie deleted:', cookieName);
    } catch (error) {
      console.warn('Failed to delete conversion cookie:', error);
    }
  }

  /**
   * Get all conversion data as formatted string
   * @returns {string} Formatted conversion data
   */
  function getConversionInfo() {
    var data = getConversionData();
    if (!data) {
      return 'No conversion data found';
    }

    var info = 'Email: ' + (data.email || 'N/A');
    if (data.phone) {
      info += '\nPhone: ' + data.phone;
    }
    return info;
  }

  /**
   * Debug: Log all cookie information to console
   */
  function debugCookies() {
    console.group('🍪 Retainful Cookie Debug');
    console.log('Platform:', detectPlatform());
    console.log('Cookie Name:', getCookieName());
    console.log('Email:', getEmail());
    console.log('Phone:', getPhone());
    console.log('Has Converted:', hasConverted());
    console.log('Tracking ID:', getTrackingId());
    console.log('Raw Data:', getConversionData());
    console.groupEnd();
  }

  // Public API
  var RetainfulCookie = {
    // Main methods
    getEmail: getEmail,
    getPhone: getPhone,
    hasConverted: hasConverted,
    getConversionData: getConversionData,
    getConversionInfo: getConversionInfo,

    // Tracking methods
    getTrackingId: getTrackingId,
    getTrackingData: getTrackingData,

    // Utility methods
    getCookieName: getCookieName,
    detectPlatform: detectPlatform,
    deleteConversionCookie: deleteConversionCookie,

    // Debug
    debug: debugCookies,

    // Constants
    COOKIE_NAMES: COOKIE_NAMES,
  };

  // Expose to global scope
  window.RetainfulCookie = RetainfulCookie;

  // Auto-log on load if debug mode is enabled
  if (window.RETAINFUL_DEBUG) {
    debugCookies();
  }

  /**
   * Set cookie from URL parameter (rgid)
   * Reads ?rgid=base64_encoded_data from URL and sets conversion cookie
   */
  function setDefaultCookieFromURL() {
    var expiryDays = 30; // Default expiry in days
    var params = new URLSearchParams(window.location.search);
    var rgid = params.get('rgid');

    if (!rgid) {
      return; // No rgid parameter, exit
    }

    try {
      var decodedRgid = atob(rgid);
      var cookieValue;
      var expiryDate;

      try {
        // Try to parse as JSON
        var parsed = JSON.parse(decodedRgid);

        if (typeof parsed === 'object' && parsed !== null && parsed.email) {
          cookieValue = parsed.email;

          // If valid expiry window is provided
          if (parsed.window && !isNaN(new Date(parsed.window).getTime())) {
            expiryDate = new Date(parsed.window).toUTCString();
          } else {
            // Default expiry if no valid window
            var date = new Date();
            date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
            expiryDate = date.toUTCString();
          }
        } else {
          return; // Exit if no email in the object
        }
      } catch (e) {
        // If JSON parsing fails, treat as plain email string
        if (validateEmail(decodedRgid)) {
          cookieValue = decodedRgid;

          // Set default expiry
          var date = new Date();
          date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
          expiryDate = date.toUTCString();
        } else {
          return; // Exit if invalid email
        }
      }

      // Wrap the email in an object and encode as Base64
      var cookieObject = {
        email: cookieValue,
      };
      var encodedCookieValue = btoa(JSON.stringify(cookieObject));

      // Check if the cookie already exists
      var cookieName = getCookieName();
      var existingCookie = getCookie(cookieName);

      if (!existingCookie || existingCookie !== encodedCookieValue) {
        // Construct the cookie string
        var cookieString =
          cookieName +
          '=' +
          encodeURIComponent(encodedCookieValue) +
          '; path=/; SameSite=Lax;';

        // Add Secure flag for HTTPS
        if (location.protocol === 'https:') {
          cookieString += ' Secure;';
        }

        if (expiryDate) {
          cookieString += ' expires=' + expiryDate + ';';
        }

        // Save or update the cookie
        document.cookie = cookieString;

        console.log('🍪 Cookie set from URL parameter (rgid):', cookieValue);
      }
    } catch (error) {
      console.error('❌ Error processing rgid parameter:', error);
    }
  }

  /**
   * Helper function to validate email
   */
  function validateEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Auto-set cookie from URL parameter on page load
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setDefaultCookieFromURL);
    } else {
      setDefaultCookieFromURL();
    }
  }
})(window);
