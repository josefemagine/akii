import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import sitemap from 'vite-plugin-sitemap';
// Import our blog routes generator function
// Wrap in try/catch in case the script doesn't exist yet
let getBlogRoutes = () => [];
try {
    getBlogRoutes = require('./scripts/generate-blog-routes');
}
catch (e) {
    console.warn('Blog routes generator not found, sitemap will not include blog posts');
}
// Check if we're doing a focused build for Bedrock API testing
const isFocusedBedrockBuild = process.env.FOCUS_BEDROCK === "true";
// Site URL for sitemap generation
const siteUrl = 'https://www.akii.com';
// Define your public routes for the sitemap
const staticRoutes = [
    '/',
    '/about',
    '/plans',
    '/blog',
    '/contact',
    '/products/web-chat',
    '/products/mobile-chat',
    '/products/whatsapp-chat',
    '/products/telegram-chat',
    '/products/shopify-chat',
    '/products/wordpress-chat',
    '/products/private-ai-api',
    '/products/integrations/zapier',
    '/products/integrations/n8n',
    '/terms-of-service',
    '/privacy-policy',
    '/legal/cookie-policy',
];
// Combine static routes with dynamically generated blog routes
const allRoutes = [...staticRoutes, ...getBlogRoutes()];
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tempo(),
        tsconfigPaths(),
        !isFocusedBedrockBuild && sitemap({
            hostname: siteUrl,
            dynamicRoutes: allRoutes,
            exclude: ['/dashboard/**', '/admin/**', '/auth/**'],
            outDir: 'dist'
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // Use a different entry point for focused Bedrock builds
    build: isFocusedBedrockBuild ? {
        // Simplified build configuration for Bedrock API testing
        outDir: 'dist-bedrock',
        lib: {
            entry: path.resolve(__dirname, 'src/bedrock-entry.ts'),
            name: 'BedrockApi',
            fileName: (format) => `bedrock.${format}.js`
        },
        // Skip minification for easier debugging
        minify: false,
        sourcemap: true
    } : {
        // Standard build configuration
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            // Exclude unused/transitional files from build to prevent errors
            external: [
                /supabase\/auth-helpers-nextjs/,
                /SimpleAuthContext\.tsx$/
            ],
            output: {
                manualChunks: {
                    'vendor': [
                        'react',
                        'react-dom',
                        'react-router-dom',
                    ],
                    'ui': [
                        '@/components/ui',
                    ],
                    'auth': [
                        '@/lib/supabase-client',
                        '@/lib/supabase-singleton',
                        '@/lib/supabase-auth',
                    ],
                    'dashboard': [
                        '@/components/dashboard',
                    ],
                }
            }
        },
    },
    server: {
        // @ts-ignore
        allowedHosts: process.env.TEMPO === "true" ? true : undefined,
        proxy: {
            '/api/super-action': {
                target: 'http://localhost:54321/functions/v1/super-action',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/super-action/, ''),
            },
            // Additional proxy configurations can be added here as needed
        }
    },
    define: {
        __WS_TOKEN__: JSON.stringify("development"),
        igIaHIU4q9G: JSON.stringify(""),
        vUzhMAVZaTg5: JSON.stringify(""),
        N: JSON.stringify(""),
        KV712XAgwaZt: JSON.stringify(""),
        JUyX_qKj5GBB: JSON.stringify(""),
        nT4N5TGIJaAs: JSON.stringify(""),
        bWpwo_: JSON.stringify(""),
        Mm8BkfYfT0kw: JSON.stringify(""),
        h: JSON.stringify(""),
        pK17mZ1I_JAT: JSON.stringify(""),
        T40Rs: JSON.stringify(""),
        vQhe_e4AHUL: JSON.stringify(""),
        fyPZ5D1qIoak: JSON.stringify(""),
        QYamNWwHnCwf: JSON.stringify(""),
        MffHQwyZu4aK: JSON.stringify(""),
        deGyyIeX8RdD: JSON.stringify(""),
        u: JSON.stringify(""),
        haBoTSSzzxa5: JSON.stringify(""),
    },
    // Add preview configuration for SPA routing
    preview: {
        port: 4173,
        // Add headers to allow React Router to work properly
        headers: {
            'Cache-Control': 'no-store',
        },
    },
});
