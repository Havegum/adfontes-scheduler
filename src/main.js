import App from './App.svelte';

const dev = process.env.dev;
const sheetId = process.env.sheetId;
const apiKey = process.env.apiKey;
const env = { dev, sheetId, apiKey };

const app = new App({
	target: document.body,
	props: { env }
});

export default app;
