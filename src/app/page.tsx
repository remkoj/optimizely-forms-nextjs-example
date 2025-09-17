import FormTest from "@/components/test"

export default function Home() {
  const formKey = process.env?.FORM_KEY
  return (
  <div className="max-w-7xl mx-auto px-4">
    <div className="px-4 text-slate-900 border-slate-700 border-x bg-slate-300 py-2 text-2xl font-bold text-center">
        Optimizely CMS 12 - Headless Forms Example
    </div>
    <FormTest defaultFormKey={formKey} />
  </div>
  );
}
