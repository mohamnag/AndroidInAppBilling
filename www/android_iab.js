/**
 * In App Billing Plugin
 * 
 * Details and more information under: https://github.com/mohamnag/InAppBilling/wiki
 * 
 * This file implements a JavaScript interface for Android to the native code. 
 * The signature of this interface has to match the one from iOS in `iso_iab.js`.
 */



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

InAppBilling.prototype.ERR_SETUP = ERROR_CODES_BASE + 1;
InAppBilling.prototype.ERR_LOAD = ERROR_CODES_BASE + 2;
InAppBilling.prototype.ERR_PURCHASE = ERROR_CODES_BASE + 3;
InAppBilling.prototype.ERR_LOAD_RECEIPTS = ERROR_CODES_BASE + 4;
InAppBilling.prototype.ERR_CLIENT_INVALID = ERROR_CODES_BASE + 5;
InAppBilling.prototype.ERR_PAYMENT_CANCELLED = ERROR_CODES_BASE + 6;
InAppBilling.prototype.ERR_PAYMENT_INVALID = ERROR_CODES_BASE + 7;
InAppBilling.prototype.ERR_PAYMENT_NOT_ALLOWED = ERROR_CODES_BASE + 8;
InAppBilling.prototype.ERR_UNKNOWN = ERROR_CODES_BASE + 10;
InAppBilling.prototype.ERR_LOAD_INVENTORY = ERROR_CODES_BASE + 11;
InAppBilling.prototype.ERR_HELPER_DISPOSED = ERROR_CODES_BASE + 12;
InAppBilling.prototype.ERR_NOT_INITIALIZED = ERROR_CODES_BASE + 13;
InAppBilling.prototype.ERR_INVENTORY_NOT_LOADED = ERROR_CODES_BASE + 14;
InAppBilling.prototype.ERR_PURCHASE_FAILED = ERROR_CODES_BASE + 15;
InAppBilling.prototype.ERR_JSON_CONVERSION_FAILED = ERROR_CODES_BASE + 16;
InAppBilling.prototype.ERR_INVALID_PURCHASE_PAYLOAD = ERROR_CODES_BASE + 17;
InAppBilling.prototype.ERR_SUBSCRIPTION_NOT_SUPPORTED = ERROR_CODES_BASE + 18;
InAppBilling.prototype.ERR_CONSUME_NOT_OWNED_ITEM = ERROR_CODES_BASE + 19;
InAppBilling.prototype.ERR_CONSUMPTION_FAILED = ERROR_CODES_BASE + 20;


var InAppBilling = function () {
    this.options = {};
};

/**
 * This function accepts and outputs all the logs, both from native and from JS
 * 
 * @param  {string} msg
 */
InAppBilling.prototype.log = function (msg) {
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
InAppBilling.prototype.init = function (success, fail, options, productIds) {
	options || (options = {});

	//shall we remove all references to (this.) ?
	this.options = {
		showLog: options.showLog || true
	};
	
	if (this.options.showLog) {
		InAppBilling.log('setup ok');
	}
	
	var hasProductIds = false;
	//Optional Load productIds to Inventory.
	if(typeof productIds !== "undefined"){
		if (typeof productIds === "string") {
        	productIds = [productIds];
    	}
    	if (productIds.length > 0) {
        	if (typeof productIds[0] !== 'string') {
            	var msg = 'invalid productIds: ' + JSON.stringify(productIds);
            	InAppBilling.log(msg);
				fail(msg);
            	return;
        	}
        	InAppBilling.log('load ' + JSON.stringify(productIds));
			hasProductIds = true;
    	}
	}
	
	if(hasProductIds){
		return cordova.exec(success, fail, "InAppBillingPlugin", "init", [productIds]);
    }else {
        //No SKUs
		return cordova.exec(success, fail, "InAppBillingPlugin", "init", []);
    }
};

InAppBilling.prototype.getPurchases = function (success, fail) {
	InAppBilling.log('getPurchases called!');
	return cordova.exec(success, fail, "InAppBillingPlugin", "getPurchases", ["null"]);
};

InAppBilling.prototype.buy = function (success, fail, productId) {
	InAppBilling.log('buy called!');
	return cordova.exec(success, fail, "InAppBillingPlugin", "buy", [productId]);
};

InAppBilling.prototype.subscribe = function (success, fail, productId) {
	InAppBilling.log('subscribe called!');
	return cordova.exec(success, fail, "InAppBillingPlugin", "subscribe", [productId]);
};

InAppBilling.prototype.consumePurchase = function (success, fail, productId) {
	InAppBilling.log('consumePurchase called!');
	return cordova.exec(success, fail, "InAppBillingPlugin", "consumePurchase", [productId]);
};

InAppBilling.prototype.getAvailableProducts = function (success, fail) {
	InAppBilling.log('getAvailableProducts called!');
	return cordova.exec(success, fail, "InAppBillingPlugin", "getAvailableProducts", ["null"]);
};

InAppBilling.prototype.getProductDetails = function (success, fail, skus) {
	InAppBilling.log('getProductDetails called!');
	
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
            InAppBilling.log(msg);
			fail(msg);
            return;
        }
        InAppBilling.log('load ' + JSON.stringify(skus));

		return cordova.exec(success, fail, "InAppBillingPlugin", "getProductDetails", [skus]);
    }
};

module.exports = new InAppBilling();