import { gql, client } from "@/lib/graph-client"

type Maybe<T> = T | null | undefined

type SiteDefinition = {
  Id: string
  Name: string
  Languages: {
    IsMasterLanguage: Maybe<boolean>
    UrlSegment: Maybe<string>
    DisplayName: string
    Name: string
  }[]
  Hosts: {
    Name: string
    Type: Maybe<'Undefined' | 'Primary' | 'Edit'>
    Language: { Link: Maybe<string>, DisplayName: Maybe<string>, Name: Maybe<string> }
  }[]
}

type WebsitesQueryResult = { SiteDefinition?: {
  total: number
  items: SiteDefinition[]
} }

export async function getWebsites() : Promise<WebsitesQueryResult['SiteDefinition'] & {}>
{
    const data = await client.request<WebsitesQueryResult>(gql`query getWebsites {
        SiteDefinition (where: {Id: { exist: true }}) {
          total
          items {
            Id
            Name
            Languages {
              IsMasterLanguage
              UrlSegment
              DisplayName
              Name
            }
            Hosts {
              Name
              Type
              Language {
                Link
                DisplayName
                Name
              }
            }
          }
        }
      }`)
      return data.SiteDefinition ?? { total: 0, items: [] }
}

type PartialUrl = Pick<URL, 'host'|'pathname'>

export async function resolveByHostAndPath(url: PartialUrl) : Promise<{ site: SiteDefinition, defaultLocale?: string, currentLocale?: string } | undefined>
{
  const sites = await getWebsites()
    const firstSiteForRequestHost = sites.items?.filter(s => (s?.Hosts ?? [])?.some(h => h.Name == url.host))?.at(0)
    const firstSiteForCatchAllHost = sites.items?.filter(s => (s?.Hosts ?? [])?.some(h => h.Name == "*"))?.at(0)
    const website = firstSiteForRequestHost ?? firstSiteForCatchAllHost
    if (!website) 
      return undefined

    const masterLanguage = website.Languages.find(x => x.IsMasterLanguage) ?? website.Languages?.at(0)
    const requestLanguage = (website.Hosts.find(x => x.Name === url.host) ?? website.Hosts.find(x => x.Name === "*"))?.Language
    const defaultLanguage = requestLanguage?.Name ?? masterLanguage?.Name
    const pathLanguage = !requestLanguage?.Name ? website.Languages.find(x=>x.UrlSegment && url.pathname.startsWith(`/${x.UrlSegment}/`))?.Name ?? masterLanguage?.Name : defaultLanguage
    
    
    return {
      site: website,
      defaultLocale: defaultLanguage,
      currentLocale: pathLanguage
    }
}