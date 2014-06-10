**WARNING** this plugin is in a very unstable state and may even not work! use it only if you know what you are doing!

## Intention
I'm trying to merge these two cordova plugins into one, which can be simply used for both iOS and Andorid without further troubles:

1. https://github.com/poiuytrez/AndroidInAppBilling
2. https://github.com/j3k0/PhoneGap-InAppPurchase-iOS

Fill free to contribute, specially because I'm not really familiar with Objective-C, **there a huge help is needed**!

I prefered the android plugin style more mainly because:
* it is more similar to the promise pattern in JavaScript than the other
* it allows for individual callbacks as simple as global ones

Until the unified documentations is ready, you can access the platform specific documentations on
* for Android on ANDROIDREADME.md
* for iOS on IOSREADME.md

## Variations
There is a big difference between how Play Store handles the in-app purchasing and how iTunes does it.
* Play Store does not create a new order id or purchase for auto-renewed items, iTunes creates a new transaction for each renewal.
* Play Store does not allow cancelling and refunding a purchase, iTunes allowes it therefore not only expiration but also cancelation of a purchase shloud be taken care of.
* iTunes provide a way to finish a transaction when content is delivered, Play Store does only let you consume a product and that should be done before delivering the content.
* Play Store v3 has only two types of purchases, managed and subscription which map to consumed and auto-renewed subscriptions in iTunes. iTunes however provides some more options.
* iTunes has some additional functionality like restore transactions which acts in some strange ways which does not exist in Play Store. iTunes may even create **new** transaction for an existing purchases.
* iTunes handles the purchase flow in a queue style but Play Store does it as a synced function call.
* iTunes allows you to set quantity of product you want to buy but Play Store simply does not!

We have to provide a unified way for all platforms, this means many differences and extra features has to be put out. You have the good common functionalities. 
Here comes some restrictions that should have been applied because of this differences:

### Available types
If you are thinking about a unified interface, you have to limit yourself to the minimum set of in app purchase items, for iOS and Play Store the common parts are:
1. auto-renewable subscriptions (simply subscription on Play Store)
2. consumable managed items

You can not buy any other kind of items using this plugin

### iOS auto finish
As Play Store finishes the transactions on its own, this additional functionality of iOS is discouraged to be used in a unified environment. You can always call the `inappbilling.getPurchases()` on startup in order to get the list of all purchases and see if you have to do something to deliver some content which you could not deliver because of a crash or something else. For this reason this plugin sets the auto finish on the original iOS plugin to permanently true.

### Buy flow limits on iOS
Consider if your app launches multiple purchases for one product, on android it is easy to track which callback belongs to which purchase flow, becuase it is a synced action, but on iOS this is kind of impossible. For this reason, this plugin limits one purchase flow per product on iOS until that flow is finished (either success or fail). This should not really impact many applications as this is an extreme case.

Another limit is the quantity of purchase which is not supported on iOS, therefore is not also supported in this plugin.

## Roadmap
1. Make a unified interface in the easiest way, only to make it usable in both iOS and Android easily
2. On android src, bring all the errors to JS level, in order to make it easier to pass it to UI or handle it in a customized way
3. On iOS, change some of the functionality from JS level to native, in order to have a more stable functionality
4. Make the data structures returned to the callbacks look as possible the same
5. Unify the error codes

MIT License
----------------

Copyright (c) 2012-2014 Guillaume Charhon - Smart Mobile Software

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
