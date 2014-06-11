/**
 * This file implements the same JS interface for android as for iOS one but with 
 * android native code behind.
 */


/**
 * Error codes returned to callback functions in different situations.
 * (keep synchronized with InAppPurchase.m, InAppBillingPlugin.java and ios_iab.js)
 * 
 */
var ERROR_CODES_BASE = 4983497;
InAppBilling.prototype.ERR_SETUP               = ERROR_CODES_BASE + 1;
InAppBilling.prototype.ERR_LOAD                = ERROR_CODES_BASE + 2;
InAppBilling.prototype.ERR_PURCHASE            = ERROR_CODES_BASE + 3;
InAppBilling.prototype.ERR_LOAD_RECEIPTS       = ERROR_CODES_BASE + 4;
InAppBilling.prototype.ERR_CLIENT_INVALID      = ERROR_CODES_BASE + 5;
InAppBilling.prototype.ERR_PAYMENT_CANCELLED   = ERROR_CODES_BASE + 6;
InAppBilling.prototype.ERR_PAYMENT_INVALID     = ERROR_CODES_BASE + 7;
InAppBilling.prototype.ERR_PAYMENT_NOT_ALLOWED = ERROR_CODES_BASE + 8;
InAppBilling.prototype.ERR_UNKNOWN             = ERROR_CODES_BASE + 10;

var log = function (msg) {
    console.log("InAppBilling[js]: " + msg);
};

var InAppBilling = function () {
    this.options = {};
};

InAppBilling.prototype.init = function (success, fail, options, skus) {
	options || (options = {});

	this.options = {
		showLog: options.showLog || true
	};
	
	if (this.options.showLog) {
		log('setup ok');
	}
	
	var hasSKUs = false;
	//Optional Load SKUs to Inventory.
	if(typeof skus !== "undefined"){
		if (typeof skus === "string") {
        	skus = [skus];
    	}
    	if (skus.length > 0) {
        	if (typeof skus[0] !== 'string') {
            	var msg = 'invalid productIds: ' + JSON.stringify(skus);
            	log(msg);
				fail(msg);
            	return;
        	}
        	log('load ' + JSON.stringify(skus));
			hasSKUs = true;
    	}
	}
	
	if(hasSKUs){
		return cordova.exec(success, fail, "InAppBillingPlugin", "init", [skus]);
    }else {
        //No SKUs
		return cordova.exec(success, fail, "InAppBillingPlugin", "init", []);
    }
};

InAppBilling.prototype.getPurchases = function (success, fail) {
	if (this.options.showLog) {
		log('getPurchases called!');
	}
	return cordova.exec(success, fail, "InAppBillingPlugin", "getPurchases", ["null"]);
};

InAppBilling.prototype.buy = function (success, fail, productId) {
	if (this.options.showLog) {
		log('buy called!');
	}
	return cordova.exec(success, fail, "InAppBillingPlugin", "buy", [productId]);
};

InAppBilling.prototype.subscribe = function (success, fail, productId) {
	if (this.options.showLog) {
		log('subscribe called!');
	}
	return cordova.exec(success, fail, "InAppBillingPlugin", "subscribe", [productId]);
};

InAppBilling.prototype.consumePurchase = function (success, fail, productId) {
	if (this.options.showLog) {
		log('consumePurchase called!');
	}
	return cordova.exec(success, fail, "InAppBillingPlugin", "consumePurchase", [productId]);
};

InAppBilling.prototype.getAvailableProducts = function (success, fail) {
	if (this.options.showLog) {
		log('getAvailableProducts called!');
	}
	return cordova.exec(success, fail, "InAppBillingPlugin", "getAvailableProducts", ["null"]);
};

InAppBilling.prototype.getProductDetails = function (success, fail, skus) {
	if (this.options.showLog) {
		log('getProductDetails called!');
	}
	
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
            log(msg);
			fail(msg);
            return;
        }
        log('load ' + JSON.stringify(skus));

		return cordova.exec(success, fail, "InAppBillingPlugin", "getProductDetails", [skus]);
    }
};

module.exports = new InAppBilling();