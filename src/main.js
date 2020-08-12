import App from './App.svelte';

const dev = process.env.dev;
const sheetId = process.env.sheetId;
const env = { dev, sheetId };

const app = new App({
	target: document.body,
	props: { env }
});

export default app;
