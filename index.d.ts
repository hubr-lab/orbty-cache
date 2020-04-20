/* !
* orbty-http-cache
* Copyright(c) 2020 Gleisson Mattos
* http://github.com/gleissonmattos
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

interface JustCacheOptions {
  ttl?: number;
  limit?: number;
  directives?: boolean;
}

interface Handler {
  (req: any, res: any, next: any): any;
}

declare function OrbtyCache (options?: JustCacheOptions | number): Handler;

export = OrbtyCache;