'use client'
import { type Form as FormType } from "@episerver/forms-react"
import {  useEffect, useState, useMemo, type FunctionComponent, type ReactNode } from "react"
import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic"
import { omit, type Optional } from "./lib/objectUtils"
import "./form.css"

/**
 * Loader to be shown while the form component is actually loaded from the server. Adjust this
 * component to customize what's visible to the user while the form is loading.
 * 
 * @param props 
 * @returns 
 */
export const FormLoading: (props: DynamicOptionsLoadingProps) => ReactNode = (props) => {
    if (props.error)
        console.error(props.error)
    return <div className="w-full aspect-video bg-gray-200 animate-pulse" />
}

/**
 *  Generate the browser only component, with the appropriate loader to ensure visitors will see
 * a loading state whilest awaiting the form to become available
 */
const OptimizelyForm = dynamic(async () => {
    const formsPackage = await import("@episerver/forms-react")
    return formsPackage.Form
}, { ssr: false, loading: FormLoading })

/**
 * Wrapper for the Optimizely Forms SDK, allowing it to be used in a Next.JS application. This component
 * can be used from both server and client components and ensures that the form is loaded completely 
 * client side.
 * 
 * This implementation assumes that there's a proxy inside the Next.JS application that forwards the REST
 * requests to the CMS. This proxy must be available at "/_forms/v1/forms/[[...path]]" and support both
 * GET and PUT requests.
 * 
 * @param       props   The properties for the form
 * @returns     The client side form
 */
export const Form: FunctionComponent<Optional<typeof FormType extends FunctionComponent<infer P> ? P : never, 'baseUrl'>> = (props) => {
    const [baseUrl, setBaseUrl] = useState(props.baseUrl)
    const formKey = useMemo(() => props.formKey?.replaceAll('-', ''), [props.formKey])
    const formProps = useMemo(() => omit(props, ['baseUrl','formKey']), [props])

    // Ensure we have a BaseURL, this is done a state/effect to allow running in the Browser
    useEffect(() => {
        if (!props.baseUrl) {
            try {
                setBaseUrl((new URL('/', window.location.href)).href)
            } catch {
                setBaseUrl(undefined)
            }
        } else
            setBaseUrl(props.baseUrl)
    }, [props.baseUrl])

    // Show loader while required props aren't present
    if (!baseUrl || baseUrl.length === 0)
        return <FormLoading isLoading={true} pastDelay={false} />
    if (!formKey || formKey.length !== 32)
        return <FormLoading isLoading={false} error={new Error("Missing required porperty 'formKey'")} />
    if (!props.language || ((props.language?.length ?? 0) !== 2 && (props.language?.length ?? 0) !== 5))
        return <FormLoading isLoading={false} error={new Error("Missing required porperty 'language'")} />

    // Render the actual form
    return <OptimizelyForm {...formProps} formKey={formKey} baseUrl={baseUrl} />
}

export default Form