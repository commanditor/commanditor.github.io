import * as monaco from "../monaco";
import { IQuickInputService } from "monaco-editor/esm/vs/platform/quickinput/common/quickInput";

import {
    EditorAction,
    registerEditorAction,
} from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import { ConfigController } from "../contributions/config";

export class ChangeEditorThemeAction extends EditorAction {
    static ID = "commanditor.action.changeTheme";

    constructor() {
        super({
            id: ChangeEditorThemeAction.ID,
            label: "Change Editor Color Theme",
            alias: "Change Editor Color Theme",
            precondition: undefined,
            kbOpts: undefined,
        });
    }

    async run(accessor, editor) {
        const quickPick = accessor.get(IQuickInputService).createQuickPick();

        quickPick.placeholder = "Select the editor color theme";
        quickPick.items = this.makeQuickPickItems();

        quickPick.onDidHide(() => {
            quickPick.dispose();
        });

        quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];

            monaco.editor.setTheme(selectedItem.id);
            ConfigController.get(editor).updateConfigValue(
                "theme",
                selectedItem.id
            );

            quickPick.hide();
        });

        quickPick.show();
    }

    makeQuickPickItems() {
        return [
            { id: "vs", label: "default (light)" },
            { id: "vs-dark", label: "dark" },
            { id: "hc-light", label: "high contrast (light)" },
            { id: "hc-black", label: "high contrast (dark)" },
        ];
    }
}

registerEditorAction(ChangeEditorThemeAction);
