/*
    I'm adding an interface over the old iOS one as a quick fix to provide a 
    unified interface for both iOS and android.
    This shall be however fix later, by placing the exec calls inside the new
    interface.
*/

var exec = function (methodName, options, success, error) {
    cordova.exec(success, error, "InAppPurchase", methodName, options);
};

// this is protects us from exceptions in external codes
var protectCall = function (callback, context) {
    try {
        var args = Array.prototype.slice.call(arguments, 2); 
        callback.apply(this, args);
    }
    catch (err) {
        log('exception in ' + context + ': "' + err + '"');
    }
};

var log = function (msg) {
    console.log("InAppBilling[js]: " + msg);
};

var InAppBilling = function () {
    this.options = {};
};

// this stores purchases and their callbacks as long as they are on the queue
InAppBilling.prototype._queuedPurchases = {};

// Merged with InAppPurchase.prototype.init
//TODO: load skus (productIds) if provided, after setup before success call
//TODO: match the arguments passed to success and fail callbacks with andorid
InAppBilling.prototype.init = function (success, fail, options, skus) {
    options || (options = {});

    this.options = {
        showLog: options.showLog || true
    };

    // maybe not needed any more, at best we would depend on storekit's functionality
    // this.receiptForTransaction = {};
    // this.receiptForProduct = {};
    // if (window.localStorage && window.localStorage.sk_receiptForTransaction)
    //     this.receiptForTransaction = JSON.parse(window.localStorage.sk_receiptForTransaction);
    // if (window.localStorage && window.localStorage.sk_receiptForProduct)
    //     this.receiptForProduct = JSON.parse(window.localStorage.sk_receiptForProduct);

    // show log or mute the log
    if (this.options.showLog) {
        exec('debug', [], noop, noop);
    }
    else {
        log = function() {};
    }

    var setupOk = function () {
        log('setup ok');
        protectCall(success, 'options.ready');

        // Is there a reason why we wouldn't like to do this automatically?
        // YES! it does ask the user for his password.
        // that.restore();
    };

    var setupFailed = function () {
        log('setup failed');
        protectCall(fail, 'options.error', InAppPurchase.prototype.ERR_SETUP, 'Setup failed');
    };

    exec('setup', [], setupOk, setupFailed);
};

/* 
    TODO: find/implement the right thing for iOS
    I dont think this function matches the InAppPurchase.prototype.loadReceipts one. as that function
    only tries to get receipt either from locally stored ones or from a URL.
    we need probably something to refresh the receipt like SKReceiptRefreshRequest from 
    https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/StoreKitGuide/Chapters/Restoring.html#//apple_ref/doc/uid/TP40008267-CH8-SW9
*/
InAppBilling.prototype.getPurchases = function (success, fail) {
    if (this.options.showLog) {
        log('getPurchases called!');
    }
    return cordova.exec(success, fail, "InAppBillingPlugin", "getPurchases", ["null"]);
};

// Merged with InAppPurchase.prototype.purchase
//TODO: sync fail and success callback params with android interface
InAppBilling.prototype.buy = function (success, fail, productId) {
    if (this.options.showLog) {
        log('buy called!');
    }

    // Many people forget to load information about their products from apple's servers before allowing
    // users to purchase them... leading them to spam us with useless issues and comments.
    // Let's chase them down!
    if ((!InAppBilling._productIds) || (InAppBilling._productIds.indexOf(productId) < 0)) {
        log('Purchasing ' + productId + ' failed.  Ensure the product was loaded first!');
        protectCall(fail, 'options.error', 'Trying to purchase an unknown product.', productId);
        return;
    }

    // after we call the native code, we have a queue and we dont really know how to map callbacks to items 
    // on the queue, for this reason we serialize the callbacks and put it together with productId on a cache.

    // allow only ONE purchase request per product id and keep callbacks under prod id and wait until it is finished
    if(InAppBilling._queuedPurchases.productId > 0) {
        log(productId + ' is already on the purchase queue.');
    }

    // enqueued does not mean bought! here we shall keep success callback for later when transaction is updated
    var purchaseEnqueued = function () {
        log('Purchase enqueued ' + productId);
        //here do nothing and keep the success callback for the time that queue is updated
        //we also have to keep the fail callback for queue update
        InAppBilling._queuedPurchases.productId = {
            'success': success,
            'fail': fail
        };

        //TODO: move this to after queue updated with success
        // if (typeof options.purchaseEnqueued === 'function') {
        //     protectCall(options.purchaseEnqueued, 'options.purchaseEnqueued', productId);
        // }
    };

    // fail is fail, even not being able to put on queue! 
    var purchaseEnqueueFailed = function () {
        var msg = 'Enqueuing ' + productId + ' failed';
        log(msg);
        if (typeof options.error === 'function') {
            protectCall(options.error, 'options.error', InAppPurchase.prototype.ERR_PURCHASE, productId);
        }
    };
    return exec('purchase', [productId, 1], purchaseEnqueued, purchaseEnqueueFailed);    
};

// on iOS, this does exactly what buy does!
InAppBilling.prototype.subscribe = function (success, fail, productId) {
    if (this.options.showLog) {
        log('subscribe called!');
    }
    return InAppBilling.buy(success, fail, productId);
};

////////// HERE!
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
    }else {
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

// ========= from here on, we have the original iOS JS interface. some parts are commented out 
// ========= in favour of the new ones before.

/** 
 * A plugin to enable iOS In-App Purchases.
 *
 * Copyright (c) Matt Kane 2011
 * Copyright (c) Guillaume Charhon 2012
 * Copyright (c) Jean-Christophe Hoelt 2013
 */


var InAppPurchase = function () {
    this.options = {};
};

// Error codes
// (keep synchronized with InAppPurchase.m)
var ERROR_CODES_BASE = 4983497;
InAppPurchase.prototype.ERR_SETUP               = ERROR_CODES_BASE + 1;
InAppPurchase.prototype.ERR_LOAD                = ERROR_CODES_BASE + 2;
InAppPurchase.prototype.ERR_PURCHASE            = ERROR_CODES_BASE + 3;
InAppPurchase.prototype.ERR_LOAD_RECEIPTS       = ERROR_CODES_BASE + 4;
InAppPurchase.prototype.ERR_CLIENT_INVALID      = ERROR_CODES_BASE + 5;
InAppPurchase.prototype.ERR_PAYMENT_CANCELLED   = ERROR_CODES_BASE + 6;
InAppPurchase.prototype.ERR_PAYMENT_INVALID     = ERROR_CODES_BASE + 7;
InAppPurchase.prototype.ERR_PAYMENT_NOT_ALLOWED = ERROR_CODES_BASE + 8;
InAppPurchase.prototype.ERR_UNKNOWN             = ERROR_CODES_BASE + 10;



/**
 * Asks the payment queue to restore previously completed purchases.
 * The restored transactions are passed to the onRestored callback, so make sure you define a handler for that first.
 * 
 */
InAppPurchase.prototype.restore = function() {
    this.needRestoreNotification = true;
    return exec('restoreCompletedTransactions', []);
};

/**
 * Retrieves localized product data, including price (as localized
 * string), name, description of multiple products.
 *
 * @param {Array} productIds
 *   An array of product identifier strings.
 *
 * @param {Function} callback
 *   Called once with the result of the products request. Signature:
 *
 *     function(validProducts, invalidProductIds)
 *
 *   where validProducts receives an array of objects of the form:
 *
 *     {
 *       id: "<productId>",
 *       title: "<localised title>",
 *       description: "<localised escription>",
 *       price: "<localised price>"
 *     }
 *
 *  and invalidProductIds receives an array of product identifier
 *  strings which were rejected by the app store.
 */
InAppPurchase.prototype.load = function (productIds, callback) {
    var options = this.options;
    if (typeof productIds === "string") {
        productIds = [productIds];
    }
    if (!productIds) {
        // Empty array, nothing to do.
        protectCall(callback, 'load.callback', [], []);
    }
    else if (!productIds.length) {
        // Empty array, nothing to do.
        protectCall(callback, 'load.callback', [], []);
    }
    else {
        if (typeof productIds[0] !== 'string') {
            var msg = 'invalid productIds given to store.load: ' + JSON.stringify(productIds);
            log(msg);
            protectCall(options.error, 'options.error', InAppPurchase.prototype.ERR_LOAD, msg);
            return;
        }
        log('load ' + JSON.stringify(productIds));

        var loadOk = function (array) {
            var valid = array[0];
            var invalid = array[1];
            log('load ok: { valid:' + JSON.stringify(valid) + ' invalid:' + JSON.stringify(invalid) + ' }');
            protectCall(callback, 'load.callback', valid, invalid);
        };
        var loadFailed = function (errMessage) {
            log('load failed: ' + errMessage);
            protectCall(options.error, 'options.error', InAppPurchase.prototype.ERR_LOAD, 'Failed to load product data: ' + errMessage);
        };

        InAppPurchase._productIds = productIds;
        exec('load', [productIds], loadOk, loadFailed);
    }
};

/**
 * Finish an unfinished transaction.
 *
 * @param {String} transactionId
 *    Identifier of the transaction to finish.
 *
 * You have to call this method manually when using the noAutoFinish option.
 */
InAppPurchase.prototype.finish = function (transactionId) {
    exec('finishTransaction', [transactionId], noop, noop);
};

/* This is called from native.*/
InAppPurchase.prototype.updatedTransactionCallback = function (state, errorCode, errorText, transactionIdentifier, productId, transactionReceipt) {
    if (transactionReceipt) {
        this.receiptForProduct[productId] = transactionReceipt;
        this.receiptForTransaction[transactionIdentifier] = transactionReceipt;
        if (window.localStorage) {
            window.localStorage.sk_receiptForProduct = JSON.stringify(this.receiptForProduct);
            window.localStorage.sk_receiptForTransaction = JSON.stringify(this.receiptForTransaction);
        }
    }
	switch(state) {
		case "PaymentTransactionStatePurchased":
            protectCall(this.options.purchase, 'options.purchase', transactionIdentifier, productId);
			return; 
		case "PaymentTransactionStateFailed":
            protectCall(this.options.error, 'options.error', errorCode, errorText);
			return;
		case "PaymentTransactionStateRestored":
            protectCall(this.options.restore, 'options.restore', transactionIdentifier, productId);
			return;
		case "PaymentTransactionStateFinished":
            protectCall(this.options.finish, 'options.finish', transactionIdentifier, productId);
			return;
	}
};

InAppPurchase.prototype.restoreCompletedTransactionsFinished = function () {
    if (this.needRestoreNotification)
        delete this.needRestoreNotification;
    else
        return;
    protectCall(this.options.restoreCompleted, 'options.restoreCompleted');
};

InAppPurchase.prototype.restoreCompletedTransactionsFailed = function (errorCode) {
    if (this.needRestoreNotification)
        delete this.needRestoreNotification;
    else
        return;
    protectCall(this.options.restoreFailed, 'options.restoreFailed', errorCode);
};

InAppPurchase.prototype.loadReceipts = function (callback) {

    var that = this;
    that.appStoreReceipt = null;

    var loaded = function (base64) {
        that.appStoreReceipt = base64;
        callCallback();
    };

    var error = function (errMessage) {
        log('load failed: ' + errMessage);
        protectCall(options.error, 'options.error', InAppPurchase.prototype.ERR_LOAD_RECEIPTS, 'Failed to load receipt: ' + errMessage);
    };

    var callCallback = function () {
        if (callback) {
            protectCall(callback, 'loadReceipts.callback', {
                appStoreReceipt: that.appStoreReceipt,
                forTransaction: function (transactionId) {
                    return that.receiptForTransaction[transactionId] || null;
                },
                forProduct:     function (productId) {
                    return that.receiptForProduct[productId] || null;
                }
            });
        }
    };

    exec('appStoreReceipt', [], loaded, error);
};

/*
InAppPurchase.prototype.verifyReceipt = function (success, error) {
    var receiptOk = function () {
        log("Receipt validation success");
        if (success)
            protectCall(success, 'verifyReceipt.success', reason);
    };
    var receiptError = function (reason) {
        log("Receipt validation failed: " + reason);
        if (error)
            protectCall(error, 'verifyReceipt.error', reason);
    };
    exec('verifyReceipt', [], receiptOk, receiptError);
};
*/

/*
 * This queue stuff is here because we may be sent events before listeners have been registered. This is because if we have 
 * incomplete transactions when we quit, the app will try to run these when we resume. If we don't register to receive these
 * right away then they may be missed. As soon as a callback has been registered then it will be sent any events waiting
 * in the queue.
 */
InAppPurchase.prototype.runQueue = function () {
	if(!this.eventQueue.length || (!this.onPurchased && !this.onFailed && !this.onRestored)) {
		return;
	}
	var args;
	/* We can't work directly on the queue, because we're pushing new elements onto it */
	var queue = this.eventQueue.slice();
	this.eventQueue = [];
    args = queue.shift();
	while (args) {
		this.updatedTransactionCallback.apply(this, args);
        args = queue.shift();
	}
	if (!this.eventQueue.length) {	
		this.unWatchQueue();
	}
};

InAppPurchase.prototype.watchQueue = function () {
	if (this.timer) {
		return;
	}
	this.timer = window.setInterval(function () {
        window.storekit.runQueue();
    }, 10000);
};

InAppPurchase.prototype.unWatchQueue = function () {
	if (this.timer) {
		window.clearInterval(this.timer);
		this.timer = null;
	}
};

InAppPurchase.prototype.eventQueue = [];
InAppPurchase.prototype.timer = null;

module.exports = new InAppPurchase();

