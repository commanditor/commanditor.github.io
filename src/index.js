import { App } from './App';
import { GapiAuthController } from './contributions/gapiAuth';

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css') {
			return './css.worker.bundle.js';
		}
		if (label === 'html') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
}

const app = new App();
window.app = app;

window.handleClientLoad = () => {
	GapiAuthController.get(app.editor).loadGapi();
}
