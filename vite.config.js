import { defineConfig } from 'vite';

export default defineConfig({
    // Base path for deployment
    base: './',

    // Build configuration
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true
            }
        },
        rollupOptions: {
            input: {
                main: './index.html'
            },
            output: {
                // Chunk naming
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/css/i.test(ext)) {
                        return 'css/[name]-[hash][extname]';
                    }
                    if (/png|jpe?g|svg|gif|ico|webp/i.test(ext)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    },

    // Development server
    server: {
        port: 3000,
        open: true,
        cors: true
    },

    // Preview server
    preview: {
        port: 4173
    },

    // Optimize dependencies
    optimizeDeps: {
        include: []
    },

    // Define global constants
    define: {
        __APP_VERSION__: JSON.stringify('1.0.0'),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
});
