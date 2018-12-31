import * as monaco from 'monaco-editor';
import './commands/ChangeLanguageModeAction';
import './commands/ChangeEditorThemeAction';
import './contributions/editMargin';
import './contributions/drive';

/**
  * The Main App
  */
export class App {
    //static _instance;
    constructor() {
        // singleton
        if (App._instance) {
            return App._instance;
        }
        App._instance = this;

        const domNode = document.getElementById('container');
        this.editor = monaco.editor.create(domNode, {
            value: [
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}'
            ].join('\n'),
            language: 'javascript'
        });
        this.editor.focus();

        // add resize watcher
        window.addEventListener('resize', e => {
            this.editor.layout();
        });

        // freeze singleton
        Object.freeze(this);
    }
}
