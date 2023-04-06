import * as monaco from './monaco';

// import custom contributions and commands
import './commands/ChangeLanguageModeAction';
import './commands/ChangeEditorThemeAction';
import './contributions/editMargin';
import './contributions/drive';
import './contributions/config';
import './contributions/welcomeModal';
import { GapiAuthController } from './contributions/gapiAuth';

// was placed in the user-worker in the sample, but does not work there
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

const domNode = document.getElementById('container');
const editor = monaco.editor.create(domNode, {
	value: '',
	language: 'plaintext',
	wordWrap: 'on'
});
editor.focus();

// add resize watcher
window.addEventListener('resize', e => {
	editor.layout();
});

window.editor = editor;

window.handleClientLoad = () => {
	GapiAuthController.get(editor).loadGapi();
};

window.handleClientLoad?.();
