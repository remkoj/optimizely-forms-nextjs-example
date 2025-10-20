import { GraphQLClient } from 'graphql-request'
export { gql } from 'graphql-request'

const graphKey = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY ?? ''
const graphEndpoint = 'https://cg.optimizely.com/content/v2?cache=true&stored=false'

export const client = new GraphQLClient(graphEndpoint, {
    headers: {
        "Authorization": `epi-single ${ graphKey }`
    }
})

export default client