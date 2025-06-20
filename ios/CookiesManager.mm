#import "CookiesManager.h"

@implementation CookiesManager
RCT_EXPORT_MODULE()

// MARK: - Get Cookies
- (void)getCookies:(NSString *)url resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @try {
        NSURL *nsUrl = [NSURL URLWithString:url];
        if (!nsUrl) {
            reject(@"INVALID_URL", @"Invalid URL provided", nil);
            return;
        }

        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        NSArray<NSHTTPCookie *> *cookies = [cookieStorage cookiesForURL:nsUrl];

        NSMutableArray *cookieArray = [[NSMutableArray alloc] init];

        for (NSHTTPCookie *cookie in cookies) {
            NSMutableDictionary *cookieDict = [[NSMutableDictionary alloc] init];

            cookieDict[@"name"] = cookie.name;
            cookieDict[@"value"] = cookie.value;
            cookieDict[@"domain"] = cookie.domain ?: @"";
            cookieDict[@"path"] = cookie.path ?: @"/";

            // Convert expiry date to timestamp
            if (cookie.expiresDate) {
                cookieDict[@"expires"] = @([cookie.expiresDate timeIntervalSince1970] * 1000);
            }

            cookieDict[@"secure"] = @(cookie.isSecure);

            // Handle isHTTPOnly with version check
            BOOL isHttpOnly = NO;
            if (@available(iOS 13.0, *)) {
                isHttpOnly = cookie.isHTTPOnly;
            }
            cookieDict[@"httpOnly"] = @(isHttpOnly);
            [cookieArray addObject:cookieDict];
        }

        resolve(cookieArray);
    } @catch (NSException *exception) {
        reject(@"GET_COOKIES_ERROR", exception.reason, nil);
    }
}

// MARK: - Set Cookie
- (void)setCookie:(NSString *)url
             name:(NSString *)name
            value:(NSString *)value
           domain:(NSString *)domain
             path:(NSString *)path
          expires:(NSNumber *)expires
           secure:(NSNumber *)secure
         httpOnly:(NSNumber *)httpOnly
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
    @try {
        NSURL *nsUrl = [NSURL URLWithString:url];
        if (!nsUrl) {
            reject(@"INVALID_URL", @"Invalid URL provided", nil);
            return;
        }

        NSMutableDictionary *cookieProperties = [[NSMutableDictionary alloc] init];

        cookieProperties[NSHTTPCookieName] = name;
        cookieProperties[NSHTTPCookieValue] = value;

        // Handle domain
        if (domain && ![domain isEqual:[NSNull null]]) {
            cookieProperties[NSHTTPCookieDomain] = domain;
        } else {
            cookieProperties[NSHTTPCookieDomain] = nsUrl.host;
        }

        // Handle path
        if (path && ![path isEqual:[NSNull null]]) {
            cookieProperties[NSHTTPCookiePath] = path;
        } else {
            cookieProperties[NSHTTPCookiePath] = @"/";
        }

         // Handle expiry date
        if (expires && ![expires isEqual:[NSNull null]] && [expires doubleValue] > 0) {
            NSDate *expiryDate = [NSDate dateWithTimeIntervalSince1970:[expires doubleValue] / 1000.0];
            cookieProperties[NSHTTPCookieExpires] = expiryDate;
        }

        // Handle secure flag
        if (secure && ![secure isEqual:[NSNull null]] && [secure boolValue]) {
            cookieProperties[NSHTTPCookieSecure] = @"YES";
        }

        // Handle httpOnly flag
        if (httpOnly && ![httpOnly isEqual:[NSNull null]] && [httpOnly boolValue]) {
            cookieProperties[@"HttpOnly"] = @"YES";
        }

        NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];

        if (cookie) {
            NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
            [cookieStorage setCookie:cookie];
            resolve(@YES);
        } else {
            reject(@"SET_COOKIE_ERROR", @"Failed to create cookie", nil);
        }

    } @catch (NSException *exception) {
        reject(@"SET_COOKIE_ERROR", exception.reason, nil);
    }
}

// MARK: - Remove Cookie
- (void)removeCookie:(NSString *)url
                name:(NSString *)name
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
    @try {
        NSURL *nsUrl = [NSURL URLWithString:url];
        if (!nsUrl) {
            reject(@"INVALID_URL", @"Invalid URL provided", nil);
            return;
        }

        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        NSArray<NSHTTPCookie *> *cookies = [cookieStorage cookiesForURL:nsUrl];

        BOOL found = NO;
        for (NSHTTPCookie *cookie in cookies) {
            if ([cookie.name isEqualToString:name]) {
                [cookieStorage deleteCookie:cookie];
                found = YES;
                break;
            }
        }

        resolve(@(found));

    } @catch (NSException *exception) {
        reject(@"REMOVE_COOKIE_ERROR", exception.reason, nil);
    }
}

// MARK: - Clear All Cookies
- (void)clearCookies:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @try {
        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        NSArray<NSHTTPCookie *> *cookies = [cookieStorage cookies];

        for (NSHTTPCookie *cookie in cookies) {
            [cookieStorage deleteCookie:cookie];
        }

        resolve(@YES);

    } @catch (NSException *exception) {
        reject(@"CLEAR_COOKIES_ERROR", exception.reason, nil);
    }
}

// MARK: - Flush
- (void)flush:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @try {
        // On iOS cookies are automatically synchronized
        resolve([NSNull null]);
    } @catch (NSException *exception) {
        reject(@"FLUSH_ERROR", exception.reason, nil);
    }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCookiesManagerSpecJSI>(params);
}

@end
