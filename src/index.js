import * as monaco from './monaco';

// import custom contributions and commands
import './commands/ChangeLanguageModeAction';
import './commands/ChangeEditorThemeAction';
import './contributions/editMargin';
import './contributions/drive';
import './contributions/config';
import './contributions/welcomeModal';
import { GapiAuthController } from './contributions/gapiAuth';

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
