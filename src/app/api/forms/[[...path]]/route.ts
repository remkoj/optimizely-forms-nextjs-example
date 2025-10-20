import createOptimizelyFormsProxy from "@/components/Optimizely.Forms/api"

const proxy = createOptimizelyFormsProxy({
    // Here you can configure the proxy
})

export const runtime = "edge"
export const GET = proxy
export const PUT = proxy