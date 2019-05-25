import * as monaco from 'monaco-editor';
import './commands/ChangeLanguageModeAction';
import './commands/ChangeEditorThemeAction';
import './contributions/editMargin';
import './contributions/drive';
import './contributions/config';
import './contributions/welcomeModal';
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

const domNode = document.getElementById('container');
const editor = monaco.editor.create(domNode, {
	value: '',
	language: 'plaintext'
});
editor.focus();

// add resize watcher
window.addEventListener('resize', e => {
	editor.layout();
});

window.editor = editor;

window.handleClientLoad = () => {
	GapiAuthController.get(editor).loadGapi();
}
