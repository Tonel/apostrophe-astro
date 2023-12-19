import { vitePluginApostropheDoctype } from './vite/vite-plugin-apostrophe-doctype.js';
import { vitePluginApostropheConfig } from './vite/vite-plugin-apostrophe-config.js';

export default function apostropheIntegration(options) {
  console.log('integrating');
  return {
    name: 'apostrophe-integration',
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig, injectScript }) => {
        if (!options.widgetsMapping || !options.templatesMapping) {
          throw new Error('Missing required options')
        }
        updateConfig({
          vite: {
            plugins: [
              vitePluginApostropheDoctype(
                options.widgetsMapping,
                options.templatesMapping
              ),
              vitePluginApostropheConfig(
                options.aposHost,
                options.forwardHeaders
              ),
            ],
          },
        });
        const inject = [
          '/apos-frontend/[...slug]',
          '/api/v1/[...slug]',
          '/[locale]/api/v1/[...slug]',
          '/api/v1/@apostrophecms/area/render-widget',
          '/[locale]/api/v1/@apostrophecms/area/render-widget',
          '/login',
          '/[locale]/login',
          '/uploads/[...slug]',
          ...(options.proxyRoutes || [])
        ];
        for (const pattern of inject) {
          // duplication of entrypoint needed for Astro 3.x support per
          // https://docs.astro.build/en/guides/upgrade-to/v4/#renamed-entrypoint-integrations-api
          injectRoute({
            pattern,
            entryPoint: '@apostrophecms/apostrophe-astro/endpoints/aposProxy.js',
            entrypoint: '@apostrophecms/apostrophe-astro/endpoints/aposProxy.js'
          });
        }
      }
    }
  };
};

