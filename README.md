orbty-http-cache
======

Node JS HTTP cache middleware to [Orbty](https://hubr-lab.github.io/orbty.github.io) module.
It is also compatible with [ExpressJS](https://expressjs.com/) web framework.

The basic user of ***orbty-http-cache*** uses a simple syntax:

```js
const Orbty = require("orbty");
const oCache = require("orbty-http-cache");

const orb = new Orbty();

orb.use(oCache(30)); // 30 seconds default is 10 seconds

```

## Installation

```bash
$ npm install orbty-http-cache --save
```

## Examples

Storage after first request the response object for 10 seconds:

```js

orb.get("/post/:id", oCache(10), async ({ params }) => {

  // sleep...
  await new Promise(res => setTimeout(res, 2000));

  return {
    id: params.id,
    title: "Will be cached",
    content: "There is only this here"
  };
});

```

Define one limit of memory size storage in options

```js

// Use oCache([ttl]) or with config object

orb.use(oCache({
  ttl: 30,
  limit: 1534, // 30 seconds and 1534 bytes of limit
}));

```

## Directives

The middleware contains some HTTP implementation of Cache-Control directives. To activate, configure the *** directives *** setting. By default it is false.

Cache-Control supported headers:
- no-store
- no-cache
- only-if-cached

## Options

##### ttl
Time to live (TTL) is the time that an object is stored in a caching system before it’s deleted.
Value must be seconds number.

#### limit
Memory storage size limit in bytes.

#### directives
Enable directives by HTTP headers, such as the Cache-Control header.

TODO:

- Implements all HTTP Cache-Control directives.