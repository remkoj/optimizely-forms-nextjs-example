'use client'
import { useState, type FunctionComponent } from "react";
import Form from "@/components/Optimizely.Forms";

type TestProps = {
    defaultCmsDomain?: string,
    defaultFormKey?: string,
    defaultFormLocale?: string
}

export const Test : FunctionComponent<TestProps> = ({ defaultCmsDomain, defaultFormKey, defaultFormLocale }) => {
    const [ formKey, setFormKey ] = useState(defaultFormKey ?? '')
    const [ formLocale, setFormLocale ] = useState(defaultFormLocale ?? 'en')
    return <>    
        <div className="flex flex-row gap-4 px-4 text-slate-900 border-b border-slate-700 border-x rounded-b-lg bg-slate-300 mb-4">
            <div className="py-2">
                <label htmlFor="formKey">Form GUID:</label>
                <input id="formKey" value={formKey} onChange={(e) => setFormKey(e.target.value)} className="border-solid border border-slate-700 rounded-md ml-2 px-2 bg-slate-50" />
            </div>
            <div className="py-2">
                <label htmlFor="formKey">Form Locale:</label>
                <input id="formKey" value={formLocale} onChange={(e) => setFormLocale(e.target.value)} className="border-solid border border-slate-700 rounded-md ml-2 px-2 bg-slate-50" />
            </div>
        </div>
        
        <div className="w-full min-h-8" data-formkey={ formKey } data-locale={ formLocale }>
            <Form baseUrl={ defaultCmsDomain } formKey={ formKey } language={ formLocale } />
        </div>
    </>
}

export default Test