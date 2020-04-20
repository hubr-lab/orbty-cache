/* !
* orbty-http-cache
* Copyright(c) 2020 Gleisson Mattos
* http://github.com/gleissonmattos
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

// Get hubr memory cache module
const Just = require("just-cache");

/**
 * Cache Manager @class
 */
class CacheManager {

  /**
   * Send cached value to response HTTP.
   * This forces the sending of HTTP 304 status (Not Modified).
   * @param {IncomingMessage} response
   * @param {ServerResponse} storedValue
   */
  static sendCached(response, storedValue) {
    // Send Not Modified Status
    response.statusCode = 304;
    response.send(storedValue);
  }

  /**
   * This method sends an empty response with a
   * status of 404. It will only be called based
   * on the Cache-Control header sent in the request
   * @param {ServerResponse} response
   */
  static sendNotFound(response) {
    response.statusCode = 404;
    response.send();
  }

  /**
   * Store body response cache value on just-cache
   * This method assigns a new function that, before
   * sending the request response, stores the response
   * body value in the cache.
   * @param {string} key - Key to store cache. In this module
   * the key will be the original url of the request
   * @param {ServerResponse} response
   * @param {NextFunction} next
   * @param {*} cache - Any cache value to store
   */
  static storage(key, response, next, cache) {
    // assigns original send function to a new key for the current response.
    response.sendAfter = response.send;

    // overwrites the original send function with a new function.
    // this new function will store the response body in the cache before sending the response
    response.send = (body) => {
      cache.put(key, body);
      response.sendAfter(body);
    };
    next();
  }

}

module.exports = (config) => {

  if (typeof config === "number") {
    config = {
      ttl: config
    };
  } else if (config === null || config === undefined) {
    config = {};
  } else if (typeof config !== "object") {
    throw new Error("Invalid configuration");
  }

  if (config.directives && typeof config.directives !== "boolean") {
    throw new Error("'directives' must be Boolean");
  }

  // Set just configuration
  const cache = new Just({
    ...config,
    ttl: config.ttl || 10
  });

  return function handler(request, response, next) {

    let onlyCached = false;
    let fromCache = true;

    // Check cache control directive config
    if (config.directives) {
      const control = request.headers["Cache-Control"];

      switch (control) {
          case "no-store":
            next();
            return;
          case "no-cache":
            fromCache = false;
            break;
          case "only-if-cached":
            onlyCached = true;
      }
    }

    const key = request.originalUrl || request.url;
    const stored = cache.get(key);

    if (stored && fromCache) {
      CacheManager.sendCached(response,stored);
    } else if (onlyCached) {
      CacheManager.sendNotFound(response);
    } else {
      CacheManager.storage(key, response, next, cache);
    }
  };
};
