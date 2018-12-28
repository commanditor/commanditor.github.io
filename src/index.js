import * as monaco from 'monaco-editor';
import './commands/ChangeLanguageModeAction';

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

var container = document.getElementById('container');

// create editor
var editor = monaco.editor.create(container, {
	value: [
		'function x() {',
		'\tconsole.log("Hello world!");',
		'}'
	].join('\n'),
	language: 'javascript'
});

// add resize watcher
window.addEventListener("resize", e => {
	editor.layout();
});
