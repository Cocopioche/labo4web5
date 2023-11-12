import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";
import {log} from "../log.js";

let requestCachesExpirationTime = serverVariables.get("main.request.CacheExpirationTime");

// Repository file data models cache
globalThis.requestCaches = [];

export default class CachedRequestManager {

    static add(url, content, ETag= "") {
        requestCaches.push({url, content, ETag,Expire_Time: utilities.nowInSeconds() + requestCachesExpirationTime});
        log(`${url} added to cache with Etag: ${ETag} `)
    }
    static find(url) {
        for (let requestCache of requestCaches) {
            if (requestCache.url === url){
                requestCache.Expire_Time = utilities.nowInSeconds() + requestCachesExpirationTime
                console.log(`${requestCache.url} retreived from request caches`)
                return requestCache
            }
        }
        return null;
    }
    static clear(url) {
        let i = 0;
        for (let requestCache of requestCaches) {
            if (requestCache.url === url){
               return;
            }
            i++
        }
        if (i !== requestCaches.length){
            utilities.deleteByIndex(requestCaches,[i])
        }
    }
    static flushExpired() {
        let urlToDelete = []
        let i = 0;
        for (let requestCache of requestCaches) {
            if (requestCache.Expire_Time < utilities.nowInSeconds()){
                console.log(`Cached request url:${requestCache.url} expired`)
                urlToDelete.push(i)
            }
            i++
        }
        utilities.deleteByIndex(requestCaches,urlToDelete)
    }
    static get(HttpContext) {
        let cache = CachedRequestManager.find(HttpContext.req.url)
        if (cache == null){
            return false;
        }

        return HttpContext.response.JSON(cache.content,cache.ETag,true)
    }
}

setInterval(CachedRequestManager.flushExpired, requestCachesExpirationTime * 10);
log(BgWhite, FgBlack, "Periodic request caches cleaning process started...");