import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { resolveByHostAndPath } from './lib/cms/get-websites';
 
export async function middleware(req: NextRequest, event: NextFetchEvent) {
    const siteInfo = await resolveByHostAndPath(req.nextUrl)
    
    const siteHeaders = new Headers()
    if (siteInfo?.site?.Id) siteHeaders.set('x-siteId', siteInfo.site.Id)
    if (siteInfo?.site?.Name) siteHeaders.set('x-siteName', siteInfo.site.Name)
    if (siteInfo?.defaultLocale) siteHeaders.set('x-defaultLocale', siteInfo.defaultLocale)
    if (siteInfo?.currentLocale) siteHeaders.set('x-currentLocale', siteInfo.currentLocale)

    return NextResponse.next({
        request: {
            headers: siteHeaders
        }
    });
}