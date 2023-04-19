import * as monaco from "../monaco";
import { IQuickInputService } from "monaco-editor/esm/vs/platform/quickinput/common/quickInput";

import {
    EditorAction,
    registerEditorAction,
} from "monaco-editor/esm/vs/editor/browser/editorExtensions";

export class ChangeLanguageModeAction extends EditorAction {
    static ID = "commanditor.action.changeLanguageMode";

    constructor() {
        super({
            id: ChangeLanguageModeAction.ID,
            label: "Change Language Mode",
            alias: "Change Language Mode",
            precondition: undefined,
            kbOpts: undefined,
        });
    }

    async run(accessor, editor) {
        const quickPick = accessor.get(IQuickInputService).createQuickPick();

        quickPick.placeholder = "Select a language mode to switch to";
        quickPick.matchOnDescription = true;
        quickPick.items = this.makeQuickPickItems();

        quickPick.onDidHide(() => {
            quickPick.dispose();
        });

        quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];

            monaco.editor.setModelLanguage(editor.getModel(), selectedItem.id);

            quickPick.hide();
        });

        quickPick.show();
    }

    makeQuickPickItems() {
        const monacoLangs = monaco.languages.getLanguages();

        return monacoLangs.map((l) => ({
            id: l.id,
            label: l.aliases?.[0] ?? l.id,
            description: l.aliases?.join(", "),
        }));
    }
}

registerEditorAction(ChangeLanguageModeAction);
