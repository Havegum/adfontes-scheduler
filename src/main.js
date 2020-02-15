import App from './App.svelte';

const dev = process.env.dev;
const sheetURL = process.env.sheetURL;
const env = { dev, sheetURL };

const app = new App({
	target: document.body,
	props: { env }
});

export default app;
