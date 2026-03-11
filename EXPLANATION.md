# Explanation

## What was the bug?

In HttpClient.request(), `oauth2Token` was set to plain object
(Record<string, unknown> truthy, but not OAuth2Token instance),
hence refresh guard never fired and no `Authorization` header was set.

## Why did it happen?

The original condition was:

```typescript
if (
  !this.oauth2Token ||
  (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired)
) {
  this.refreshOAuth2();
}
```

Plain object is truthy, so `!this.oauth2Token` is `false`.
The second branch only evaluates `expired` when the token _is_ an `OAuth2Token`
instance, so the plain object falls through both branches without triggering a
refresh. The subsequent header-setting block also guards on instanceof
`OAuth2Token`, so no `Authorization` header is written either.

## Why does the fix solve it?

The fix replaces the second branch with:

```typescript
!(this.oauth2Token instanceof OAuth2Token) || this.oauth2Token.expired;
```

Any value that is not `OAuth2Token` instance triggers a refresh, leaving only valid, non-expired `OAuth2Token` values untouched. One operator change and no other behaviour is altered.

## One edge case the tests still don't cover

Race condition where two concurrent calls both see an expired token,
both call `refreshOAuth2()`, and the second write overwrites a token that
was already fresh. The tests are synchronous and single threaded, so this
interleaving isn't exercised.
