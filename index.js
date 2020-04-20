/* !
* orbty
* Copyright(c) 2020 Gleisson Mattos
* http://github.com/gleissonmattos
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

// Get hubr memory cache module
const Just = require("just-cache");

class CacheManager {

  static sendCached(response, storedValue) {
    // Send Not Modified Status
    response.statusCode = 304;
    response.send(storedValue);
  }

  static sendNotFound(response) {
    response.statusCode = 404;
    response.send();
  }

  static storage(key, response, next, cache) {
    response.sendAfter = response.send;

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
