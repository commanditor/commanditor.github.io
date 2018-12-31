import * as monaco from 'monaco-editor';
import './commands/ChangeLanguageModeAction';
import './commands/ChangeEditorThemeAction';
import './contributions/editMargin';
import { App } from './App';
import { DriveAdapter } from './DriveAdapter';

export class EditorAdapter {
    /**
     * @param {App} app - the app
     * @param {DriveAdapter} drive - the drive adapter
     */
    constructor(app, drive) {
        this.app = app;
        this.drive = drive;
        this.editor = null;
        
        this.createEditorDom();
    }

    /**
     * Creates the main dom for the Editor
     */
    createEditorDom() {
        // this.container = document.createElement("div");
        // this.container.classList.add("editor-container");
        // for (var c of document.body.children)
        //     document.body.removeChild(c);
        // document.body.appendChild(this.container);
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
    }

    /**
     * Sets the Content of the Editor to something new
     * @param {string} content - New Content
     * @param {string} languageId - Monaco Language ID for syntax highlighting
     */
    setContent(content, languageId) {
        // TODO create new model in editor
        var newModel = monaco.editor.createModel(content, languageId);
        this.editor.setModel(newModel);
        this.editor.focus();
    }

    /**
     * Gets the current Content of the Editor
     */
    getContent() {
        return this.editor.getModel().getValue();
    }

    /**
     * tries to get the monaco-language for a specific file extension (plaintext is fallback)
     * @param {string} ext the file extension
     */
    getMonacoLanguageForFileExtension(ext) {
        ext = ext.startsWith('.') ? ext : '.' + ext;
        const monacoLanguages = monaco.languages.getLanguages();
        const matches = monacoLanguages.filter(lang => lang.extensions.includes(ext));
        if (matches.length > 0)
            // every extension only appears for one language
            return matches[0];
        // plaintext as fallback
        return monacoLanguages[0];
    }
}
