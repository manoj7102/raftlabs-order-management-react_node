# Deployment

This repository uses Netlify for the React site and Render for the Express API. Both services build from the repository root, which contains the npm workspaces. The included `.node-version` pins Node.js for both hosts, and `package-lock.json` pins dependencies. These files prepare deployment; no public service exists until the repository is pushed and the hosting accounts are configured. The Render Blueprint requests the free plan, subject to the account's available free service capacity.

## 1. Publish the repository

Push the full project to a public GitHub repository. Keep environment variables and order tokens out of Git.

## 2. Deploy the API on Render

In Render, create a Blueprint from the GitHub repository. The root `render.yaml` defines one Node web service and checks `/api/menu` for health. Copy the resulting HTTPS URL, for example `https://raftlabs-order-management-api.onrender.com`. Confirm that `<API_URL>/api/menu` returns the menu.

## 3. Deploy the site on Netlify

Import the same repository into Netlify. Leave the base directory at the repository root. The root `netlify.toml` builds the `frontend` workspace and publishes `frontend/dist`. Before the first build, set the Netlify environment variable `VITE_API_BASE_URL` to the Render HTTPS origin, **without** a trailing slash or `/api` path. Deploy the site and copy its HTTPS origin.

## 4. Allow the site to call the API

In the Render web service's Environment settings, set `FRONTEND_ORIGIN` to the exact Netlify HTTPS origin, for example `https://your-site.netlify.app`, with no trailing slash or path. Save and redeploy the service. The browser can now call the API. Do not put `ORDER_ADMIN_TOKEN` or any order access token in Netlify variables.

## 5. Check the public flow

Open the Netlify site, load the menu, place a sample order, and confirm the tracking screen updates. Reload the page to check that it can still retrieve the order while the same API process is running. Use the browser's Network panel if a request fails: `404` on `/api/*` at Netlify usually means `VITE_API_BASE_URL` was missing during the build; a CORS error usually means `FRONTEND_ORIGIN` differs from the site's actual origin. After changing `VITE_API_BASE_URL`, rebuild the Netlify site because Vite embeds it in the static bundle.

Orders and status timers live in the API process's memory. A restart, redeploy, or Render free service sleep clears existing orders; this setup is suitable for an assessment demo, not durable order processing. Render documents the [free service limits](https://render.com/docs/free). A database and durable worker would be needed before using this for real orders.

Platform references: [Netlify monorepo builds](https://docs.netlify.com/build/configure-builds/monorepos/), [Netlify file configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/), [Render Blueprints](https://render.com/docs/blueprint-spec), and [Render web services](https://render.com/docs/web-services).
