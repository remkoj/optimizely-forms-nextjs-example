# Optimizely Headless Forms - Next.js
This is an example implementation of Optimizely Headless forms for CMS 12 in a Next.js application. This is an example of how documentation available on the [Optimizely Developer Documentation](https://docs.developers.optimizely.com/content-management-system/v1.2.0-forms/docs/get-started-with-headless-optimizely-forms) can be applied to Next.js.

***License:*** This code is provided "as-is" without any warranty under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

## Installation
Adding support for Optimizely Headless Forms to your Next.js application requires these steps.

### 1. Add package repository
Use the documentation of your preferred package manager to add the Optimizely Enginering package repository. For yarn this can be achieved by creating or modifing the `.yarnrc.yml` file. It must have the following section:

```yml
npmScopes:
  "episerver":
    "npmRegistryServer": "https://pkgs.dev.azure.com/EpiserverEngineering/netCore/_packaging/HeadlessForms/npm/registry"
```

If you already have a `npmScopes` entry, make sure to merge these entries such that there's only one `npmScopes` entry in your `.yarnrc.yml` file.

### 2. Install the dependencies
Install the following two packages into your project `@episerver/forms-react`, `@episerver/forms-sdk`.

### 3. Copy the code
Put the contents of this zip-file somewhere in your Next.js application, for example in `./src/components/Optimizely.Forms`. The `index.tsx` will then thus be available in `./src/components/Optimizely.Forms/index.tsx`. 

If you elect to put the files somewhere else, adjust the imports in the files mentionned below accordingly.

### 4. Add the request proxy
This service allows the frontend to create a secure connection with the Optimizely Forms service, without exposing the domain of the CMS to visitors of the site as well as performing the needed request authorization to make submissions work.

Create the following API endpoint file: `./app/api/forms/[[...path]]/route.ts` and add the following logic to it:

```typescript
import createOptimizelyFormsProxy from "@/components/Optimizely.Forms/api"

const proxy = createOptimizelyFormsProxy({
    // Here you can configure the proxy
})

export const GET = proxy
export const PUT = proxy
```

This will create the Next.js api endpoint, making the proxy available at `/api/forms` within your frontend application.

### 5. Rewrite the Optimizely CMS routes
The forms SDK uses a different pattern for the URLs it invokes, which cannot be routed directly by Next.js, hence we're rewriting the path for the request to the proxy we've created above.

For this, modify your `next.config.ts`, to ensure that your `rewrites.afterFiles` includes the appropriate rewrite. For example:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite the expected URL to the API endpoint in this application
  rewrites: async () => {
    return { 
      afterFiles: [
        {
          source: '/_forms/v1/forms/:path*',
          destination: '/api/forms/:path*'
        }
      ]
    }
  }
};

export default nextConfig;
```

## Usage
After the installation has been completed, and the service is available, you can use the form from either a server or client component. (The form is always a client component).

1. Import the form: `import Form from "@/components/Optimizely.Forms";`
2. Embed the form in your component `<Form formKey={ formKey } language={ formLocale } />`; the key parameters are:
    
   2.1: `formKey`: The GUID of the form as returned by Optimizely Graph or the APIs

   2.2: `language`: The locale identifier to load the form, allowing use the forms in multi-language sites.

## Customizing
This example implementation is provided "as-is" and without any warranty. It is expected that the provided files will be modified to fully meet the requirements of the implementation. 


