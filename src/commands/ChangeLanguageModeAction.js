import { QuickOpenEntry, QuickOpenModel } from 'monaco-editor/esm/vs/base/parts/quickopen/browser/quickOpenModel';
import { registerEditorAction } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { BaseEditorQuickOpenAction } from 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/editorQuickOpen';
import { matchesFuzzy } from 'monaco-editor/esm/vs/base/common/filters/';

class LanguageModeEntry extends QuickOpenEntry {
    constructor(languageModeDesc, editor) {
        super();
        this._languageMode = languageModeDesc;
        this._editor = editor;

        this._label = this._languageMode.aliases
            ? this._languageMode.aliases[0] + ' (' + this._languageMode.id + ')'
            : this._languageMode.id;
    }

    getLabel() {
        return this._label;
    }

    run(mode, context) {
        if (mode == 0) {
            // run preview
        } else if (mode == 1) {
            // run open
            self.monaco.editor.setModelLanguage(this._editor.getModel(), this._languageMode.id);
            return true;
        }
    }
}

class ChangeLanguageModeAction extends BaseEditorQuickOpenAction {
    constructor() {
        super('type and select a language mode to switch to', {
            id: 'commanditor.action.changeLanguageMode',
            label: 'Change Language Mode',
            alias: 'Change Language Mode',
            precondition: null,
            kbOpts: null
        });
    }

    run(accessor, editor) {
        this._show(this.getController(editor), {
            getModel: (searchValue) => {
                const quickOpenLangEntries = [];
                const monacoLangs = self.monaco.languages.getLanguages();
                for (var i = 0; i < monacoLangs.length; i++)
                {
                    const lang = monacoLangs[i];
                    const entry = new LanguageModeEntry(lang, editor);

                    const highlights = matchesFuzzy(searchValue, entry.getLabel());
				    if (highlights) {
                        quickOpenLangEntries.push(entry);
				    }
                }

                return new QuickOpenModel(quickOpenLangEntries);
            },
            getAutoFocus: (searchValue) => {
                return {
                    autoFocusFirstEntry: searchValue.length > 0
                };
            }
        });
    }
}

registerEditorAction(ChangeLanguageModeAction);
