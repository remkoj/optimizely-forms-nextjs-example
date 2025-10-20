import FormTest from "@/components/test"
import { headers } from "next/headers";

export default async function Home() {
  const formKey = process.env?.FORM_KEY
  const h = await headers()
  const defaultFormLocale = h.get('x-currentLocale') ?? undefined
  console.log("Default form locale", defaultFormLocale)
  return (
  <div className="max-w-7xl mx-auto px-4">
    <div className="px-4 text-slate-900 border-slate-700 border-x bg-slate-300 py-2 text-2xl font-bold text-center">
        Optimizely CMS 12 - Headless Forms Example
    </div>
    <FormTest defaultFormKey={formKey} defaultFormLocale={ defaultFormLocale } />
  </div>
  );
}
