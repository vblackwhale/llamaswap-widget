import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import path from 'path';

export default defineConfig({
	root: __dirname,
	envDir: path.resolve(__dirname, '..'),
	plugins: [
		{
			name: 'load-source-js-as-jsx',
			async transform(code, id) {
				if (!id.replace(/\\/g, '/').includes('/src/') || !id.endsWith('.js')) return null;
				return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
			}
		},
		react()
	],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, '../src')
		},
		dedupe: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query', '@privy-io/react-auth', '@privy-io/wagmi']
	},
	optimizeDeps: {
		include: ['buffer'],
		esbuildOptions: {
			target: 'esnext'
		}
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			plugins: [inject({ Buffer: ['buffer', 'Buffer'] })]
		}
	},
	server: {
		host: '127.0.0.1',
		port: 3001,
		fs: {
			allow: [path.resolve(__dirname, '..')]
		}
	},
	define: {
		global: 'globalThis'
	}
});
