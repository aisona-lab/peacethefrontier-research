import { defineConfig, devices } from '@playwright/test';

const PUERTO = 4321;

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: { baseURL: `http://localhost:${PUERTO}` },
	// Prueba el build real (dist/), no el servidor de desarrollo.
	webServer: {
		command: `npm run preview -- --port ${PUERTO} --ignore-lock`,
		url: `http://localhost:${PUERTO}`,
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{ name: 'chromium', use: devices['Desktop Chrome'] },
		{ name: 'firefox', use: devices['Desktop Firefox'] },
		{ name: 'webkit', use: devices['Desktop Safari'] },
		{ name: 'movil', use: devices['iPhone 13'] },
	],
});
