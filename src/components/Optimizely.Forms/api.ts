import 'server-only'
import { type NextRequest, NextResponse } from "next/server";
import { getAccessToken } from './actions';

const restrictedHeaders: string[] = ["connection","host","upgrade-insecure-requests"];
const anonHeaderValues = [`bearer undefined`,`bearer `];

type OptimizelyFormsProxyOptions = {
  /**
   * The path to be prepended to the "path" parameter to construct the path
   * within Optimizely CMS. Defaults to: "/_forms/v1/forms/"
   */
  basePath?: string
  /**
   * The Bearer token sent by the form for anonymous request, in this case
   * the frontend should perform server-to-server authentication
   */
  anonymousToken?: string
  /**
   * Set this value to `true` to prevent passing of cookies to Optimizely CMS
   */
  hideCookies?: boolean
  /**
   * A request filter, which allows adding bot-filters and detection of other
   * malicious form submissions. Use the provided body data if you need to perform
   * introspection as the request body can only be read once.
   * 
   * @param     request   The received request
   * @param     path      The path URL parameters
   * @param     body      The request body
   * @returns   `true` if the request is allowed, `false` otherwise
   */
  requestFilter?: ((request: NextRequest, path: string[], body?: Uint8Array<ArrayBuffer>) => Promise<boolean>) | ((request: NextRequest, path: string[], body?: Uint8Array<ArrayBuffer>) => boolean),
  /**
   * Replace the default header selector, to control which headers are forwarded
   * to Optimizely CMS.
   * 
   * @param     headerName  The header name to 
   * @returns 
   */
  headerSelector?: (headerName: string) => boolean
  /**
   * The URL of the OIDC compliant Identity Provider for the server-2-server 
   * authentication, this IDP must support the 'client credentials' flow
   */
  idpUrl?: string,
  /**
   * The Client ID to be used for the server-2-server authentication
   */
  clientId?: string,
  /**
   * The Client Secret to be used for the server-2-server authentication
   */
  clientSecret?: string
}

/**
 * Create a proxy to prevent a direct connection between Optimizely Headless
 * forms and the browser. This proxy allows to 
 * 
 * @param     options   
 * @returns 
 */
export const createOptimizelyFormsProxy = (options?: OptimizelyFormsProxyOptions) => {
  const {
    basePath = "/_forms/v1/forms/",
    hideCookies = false,
    requestFilter,
    headerSelector = (headerName: string) => {
      return !restrictedHeaders.includes(headerName) && !headerName.startsWith('x-') && !headerName.startsWith('sec-')
    },
    idpUrl,
    clientId,
    clientSecret
  } = options ?? {}
  return async function(
    req: NextRequest,
    { params }: { params: Promise<{path?: string[]}>}
  ): Promise<NextResponse | Response> {
    // Read the request
    const { path = [] } = await params;
    const body = req.method.toLowerCase() !== 'get' ? await req.bytes().catch(() => undefined) : undefined

    // Apply request filtering
    if (requestFilter && !await requestFilter(req, path, body))
      return NextResponse.json({error: "Bad request" }, { status: 400 })
    
    // Construct headers
    const headers = new Headers();
    for (const [headerName, headerValue] of req.headers.entries()) {
      const headerNameLc = headerName.toLowerCase();

      // Handle authentication
      if (headerNameLc === "authorization" && anonHeaderValues.includes(headerValue.toLowerCase())) {
        const token = await getAccessToken(idpUrl, clientId, clientSecret)
        headers.set(headerName, `Bearer ${token}`)
      }

      // Hide cookies if required
      else if (hideCookies && headerNameLc === "cookie") {
        // No action needed, we're hiding cookies explicitly
      }

      // Filter headers that must be propagated
      else if (headerSelector(headerNameLc)) {
        headers.set(headerName, headerValue)
      }
    }

    // Construct URL
    const cmsUrl = new URL(
      basePath + path.join("/"),
      process.env.OPTIMIZELY_CMS_URL
    );
    req.nextUrl.searchParams.forEach((queryParamValue, queryParamKey) => {
      if (queryParamValue && queryParamValue.length > 0)
        cmsUrl.searchParams.set(queryParamKey, queryParamValue)
    })

    // Run fetch
    return fetch(cmsUrl, {
      method: req.method,
      headers,
      body
    });
  }
}

export default createOptimizelyFormsProxy