/** Maintainer-owned website integration; no user URL/key form and no fallback identity. */
export const accountDistribution=Object.freeze({schemaVersion:1,issuer:null,authorizationOrigins:Object.freeze([])})

/** Future trusted adapter owns browser authorization, PKCE and server verification.
 * A session returned by poll/refresh must already have its issuer, subject and
 * protocol proof verified. Do not accept a session posted by the renderer.
 */
export function createWebsiteAccountProvider(){return null}
