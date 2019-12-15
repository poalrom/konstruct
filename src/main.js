import App from './App.svelte';
import { configValidator } from './configValidator';

window.konstruct = {
	render(selector, config) {
		const el = document.querySelector(selector);
		if (!el) {
			throw new Error(`Element ${selector} not present in DOM`);
		}
		configValidator(config);
		new App({
			target: el,
			props: { config }
		});
	}
};