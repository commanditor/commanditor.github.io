import { QuickOpenEntry, QuickOpenModel } from 'monaco-editor/esm/vs/base/parts/quickopen/browser/quickOpenModel';
import { registerEditorAction } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { BaseEditorQuickOpenAction } from 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/editorQuickOpen';
import { matchesFuzzy } from 'monaco-editor/esm/vs/base/common/filters/';
import { ConfigController } from './../contributions/config';

class EditorThemeEntry extends QuickOpenEntry {
    constructor(editor, editorThemeId, editorThemeLabel) {
        super();
        this._editor = editor;
        this._themeId = editorThemeId;
        this._themeLabel = editorThemeLabel;
    }

    getLabel() {
        return this._themeLabel;
    }

    run(mode, context) {
        if (mode == 0) {
            // run preview
        } else if (mode == 1) {
            // run open
            ConfigController.get(this._editor).updateConfigValue('theme', this._themeId);
            return true;
        }
    }
}

class ChangeEditorThemeAction extends BaseEditorQuickOpenAction {
    constructor() {
        super('type and select an editor theme to switch to', {
            id: 'commanditor.action.changeTheme',
            label: 'Change Editor Theme',
            alias: 'Change Editor Theme',
            precondition: null,
            kbOpts: null
        });
    }

    run(accessor, editor) {
        this._show(this.getController(editor), {
            getModel: (searchValue) => {
                const quickOpenThemeEntries = [];
                const monacoThemes = [
                    { id: 'vs', label: 'default (light)' },
                    { id: 'vs-dark', label: 'dark' },
                    { id: 'hc-black', label: 'high contrast (dark)' }
                ];
                for (var i = 0; i < monacoThemes.length; i++)
                {
                    const theme = monacoThemes[i];
                    const entry = new EditorThemeEntry(editor, theme.id, theme.label);

                    const highlights = matchesFuzzy(searchValue, entry.getLabel());
				    if (highlights) {
                        quickOpenThemeEntries.push(entry);
				    }
                }

                return new QuickOpenModel(quickOpenThemeEntries);
            },
            getAutoFocus: (searchValue) => {
                return {
                    autoFocusFirstEntry: searchValue.length > 0
                };
            }
        });
    }
}

registerEditorAction(ChangeEditorThemeAction);
