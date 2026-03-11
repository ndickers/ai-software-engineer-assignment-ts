import { HttpClient } from "../src/httpClient";
import { OAuth2Token } from "../src/tokens";
import { describe, test, expect, vi } from "vitest";

describe("HttpClient OAuth2 behavior", () => {
  //existing passing tests

  test("api=true sets Authorization header when token is valid", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("ok", Math.floor(Date.now() / 1000) + 3600);

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer ok");
  });

  test("api=true refreshes when token is missing", () => {
    const c = new HttpClient();
    c.oauth2Token = null;

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  // tests failed on original code

  test("api=true refreshes when token is a plain object", () => {
    const c = new HttpClient();
    c.oauth2Token = { accessToken: "stale", expiresAt: 0 };

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true refreshes when token is an empty plain object", () => {

    const c = new HttpClient();
    c.oauth2Token = {};

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true refreshes when OAuth2Token is expired", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("old", Math.floor(Date.now() / 1000) - 1);

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });


  test("api=false does not set Authorization header", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("ok", Math.floor(Date.now() / 1000) + 3600);

    const resp = c.request("GET", "/public", { api: false });

    expect(resp.headers.Authorization).toBeUndefined();
  });

  test("api=false does not call refreshOAuth2", () => {
    const c = new HttpClient();
    const spy = vi.spyOn(c, "refreshOAuth2");

    c.request("GET", "/public");

    expect(spy).not.toHaveBeenCalled();
  });
});
