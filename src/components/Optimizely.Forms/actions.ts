"use server";
import "server-only";
import type { IdentityInfo } from "@episerver/forms-sdk"; // The SDK is not server side safe, so it's only possible import types
import { cache } from "react";

type OidcConfig = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
};

const getOpenIDConfiguration = cache(async (idpUrl?: string) => {
  const response = await fetch(
    new URL(
      "/.well-known/openid-configuration",
      idpUrl ?? process.env.OPTIMIZELY_CMS_URL
    )
  );
  if (!response.ok)
    throw new Error(
      `Unable to fetch OpenID Configuration: HTTP ${response.status} - ${response.statusText}`
    );
  return response.json() as Promise<OidcConfig>;
});

export const getAccessToken = cache(
  async (idpUrl?: string, clientId?: string, clientSecret?: string) => {
    // Read OpenID Connect configuration
    const oidcConfig = await getOpenIDConfiguration(idpUrl);
    const authUrl = oidcConfig.token_endpoint;

    // Construct headers
    const headers = new Headers();
    headers.append(
      "Authorization",
      `Basic ${_base64Encode(
        `${clientId ?? process.env.OPTIMIZELY_CMS_CLIENT_ID ?? ""}:${
          clientSecret ?? process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ""
        }`
      )}`
    );
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Connection", "close");

    // Use Client Credentials flow
    const body = new URLSearchParams();
    body.append("grant_type", "client_credentials");
    body.append("client_id", clientId ?? process.env.OPTIMIZELY_CMS_CLIENT_ID ?? "");

    const httpResponse = await fetch(authUrl, {
      method: "POST",
      headers: headers,
      body: body.toString(),
      cache: "no-store",
    });
    const response = (await (httpResponse.json() as Promise<AuthResponse>).catch(async e => {
      return { error: "non json body", error_description: e.message} as AuthResponse
    }));

    if (_isErrorResponse(response))
      throw new Error("Authentication error: " + response.error_description);

    return response.access_token;
  }
);

export async function getAnonymousIdentity(): Promise<IdentityInfo> {
  const accessToken = await getAccessToken();
  return {
    accessToken: accessToken,
    username: "Anonymous",
  };
}

function _base64Encode(input: string): string {
  if (btoa && typeof btoa == "function") return btoa(input);
  if (Buffer && typeof Buffer == "object")
    //@ts-expect-error
    return Buffer.from(input).toString("base64");

  throw new Error("Unable to base64Encode");
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
type ErrorResponse = { error: string; error_description: string };
type AuthResponse = TokenResponse | ErrorResponse;

function _isErrorResponse(response: AuthResponse): response is ErrorResponse {
  return typeof (response as ErrorResponse).error == "string";
}
