/**
 * In App Billing Plugin
 * 
 * Details and more information under: https://github.com/mohamnag/InAppBilling/wiki
 * 
 * This file implements a JavaScript interface for Android to the native code. 
 * The signature of this interface has to match the one from iOS in `iso_iab.js`.
 */

var InAppBilling = function() {
    this.options = {};
};

/**
 * Error codes.
 * 
 * keep synchronized between: 
 *  * InAppPurchase.m
 *  * InAppBillingPlugin.java 
 *  * android_iab.js 
 *  * ios_iab.js
 * 
 * Be carefull assiging new codes, these are meant to express the REASON of 
 * the error as exact as possible!
 */
InAppBilling.prototype.ERROR_CODES_BASE = 4983497;

InAppBilling.prototype.ERR_SETUP = InAppBilling.prototype.ERROR_CODES_BASE + 1;
InAppBilling.prototype.ERR_LOAD = InAppBilling.prototype.ERROR_CODES_BASE + 2;
InAppBilling.prototype.ERR_PURCHASE = InAppBilling.prototype.ERROR_CODES_BASE + 3;
InAppBilling.prototype.ERR_LOAD_RECEIPTS = InAppBilling.prototype.ERROR_CODES_BASE + 4;
InAppBilling.prototype.ERR_CLIENT_INVALID = InAppBilling.prototype.ERROR_CODES_BASE + 5;
InAppBilling.prototype.ERR_PAYMENT_CANCELLED = InAppBilling.prototype.ERROR_CODES_BASE + 6;
InAppBilling.prototype.ERR_PAYMENT_INVALID = InAppBilling.prototype.ERROR_CODES_BASE + 7;
InAppBilling.prototype.ERR_PAYMENT_NOT_ALLOWED = InAppBilling.prototype.ERROR_CODES_BASE + 8;
InAppBilling.prototype.ERR_UNKNOWN = InAppBilling.prototype.ERROR_CODES_BASE + 10;
InAppBilling.prototype.ERR_LOAD_INVENTORY = InAppBilling.prototype.ERROR_CODES_BASE + 11;
InAppBilling.prototype.ERR_HELPER_DISPOSED = InAppBilling.prototype.ERROR_CODES_BASE + 12;
InAppBilling.prototype.ERR_NOT_INITIALIZED = InAppBilling.prototype.ERROR_CODES_BASE + 13;
InAppBilling.prototype.ERR_INVENTORY_NOT_LOADED = InAppBilling.prototype.ERROR_CODES_BASE + 14;
InAppBilling.prototype.ERR_PURCHASE_FAILED = InAppBilling.prototype.ERROR_CODES_BASE + 15;
InAppBilling.prototype.ERR_JSON_CONVERSION_FAILED = InAppBilling.prototype.ERROR_CODES_BASE + 16;
InAppBilling.prototype.ERR_INVALID_PURCHASE_PAYLOAD = InAppBilling.prototype.ERROR_CODES_BASE + 17;
InAppBilling.prototype.ERR_SUBSCRIPTION_NOT_SUPPORTED = InAppBilling.prototype.ERROR_CODES_BASE + 18;
InAppBilling.prototype.ERR_CONSUME_NOT_OWNED_ITEM = InAppBilling.prototype.ERROR_CODES_BASE + 19;
InAppBilling.prototype.ERR_CONSUMPTION_FAILED = InAppBilling.prototype.ERROR_CODES_BASE + 20;

/**
 * This function accepts and outputs all the logs, both from native and from JS
 * 
 * @param  {string} msg
 */
InAppBilling.prototype.log = function(msg) {
    console.log("InAppBilling[js]: " + msg);
};

/**
 * This initiates the plugin, you can optionally pass in one or multiple 
 * product IDs for their details to be loaded during initialization.
 * 
 * @param  {function()} success
 * @param  {[type]} fail
 * @param  {[type]} options
 * @param  {[type]} productIds
 * @return {[type]}
 */
InAppBilling.prototype.init = function(success, fail, options, productIds) {
    options || (options = {});

    //shall we remove all references to (this.) ?
    this.options = {
        showLog: options.showLog || true
    };

    if (this.options.showLog) {
        this.log('setup ok');
    }

    var hasProductIds = false;
    //Optional Load productIds to Inventory.
    if (typeof productIds !== "undefined") {
        if (typeof productIds === "string") {
            productIds = [productIds];
        }
        if (productIds.length > 0) {
            if (typeof productIds[0] !== 'string') {
                var msg = 'invalid productIds: ' + JSON.stringify(productIds);
                this.log(msg);
                fail(msg);
                return;
            }
            this.log('load ' + JSON.stringify(productIds));
            hasProductIds = true;
        }
    }

    if (hasProductIds) {
        return cordova.exec(success, fail, "InAppBillingPlugin", "init", [productIds]);
    } else {
        //No SKUs
        return cordova.exec(success, fail, "InAppBillingPlugin", "init", []);
    }
};

InAppBilling.prototype.getPurchases = function(success, fail) {
    this.log('getPurchases called!');
    return cordova.exec(success, fail, "InAppBillingPlugin", "getPurchases", ["null"]);
};

InAppBilling.prototype.buy = function(success, fail, productId) {
    this.log('buy called!');
    return cordova.exec(success, fail, "InAppBillingPlugin", "buy", [productId]);
};

InAppBilling.prototype.subscribe = function(success, fail, productId) {
    this.log('subscribe called!');
    return cordova.exec(success, fail, "InAppBillingPlugin", "subscribe", [productId]);
};

InAppBilling.prototype.consumePurchase = function(success, fail, productId) {
    this.log('consumePurchase called!');
    return cordova.exec(success, fail, "InAppBillingPlugin", "consumePurchase", [productId]);
};

InAppBilling.prototype.getAvailableProducts = function(success, fail) {
    this.log('getAvailableProducts called!');
    return cordova.exec(success, fail, "InAppBillingPlugin", "getAvailableProducts", ["null"]);
};

InAppBilling.prototype.getProductDetails = function(success, fail, skus) {
    this.log('getProductDetails called!');

    if (typeof skus === "string") {
        skus = [skus];
    }
    if (!skus.length) {
        // Empty array, nothing to do.
        return;
    }
    else {
        if (typeof skus[0] !== 'string') {
            var msg = 'invalid productIds: ' + JSON.stringify(skus);
            this.log(msg);
            fail(msg);
            return;
        }
        this.log('load ' + JSON.stringify(skus));

        return cordova.exec(success, fail, "InAppBillingPlugin", "getProductDetails", [skus]);
    }
};

module.exports = new InAppBilling();