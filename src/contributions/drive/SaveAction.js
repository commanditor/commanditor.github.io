import { EditorAction } from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import { EditorContextKeys } from "monaco-editor/esm/vs/editor/common/editorContextKeys";
import * as monaco from "./../../monaco"; // HINT must reimport keys from here, because in 'monaco-editor/esm/vs/base/common/keyCodes' they are an enum and will fail at runtime
import { DriveController } from "./";

export class SaveAction extends EditorAction {
    static ID = "commanditor.drive.action.save";

    constructor() {
        super({
            id: SaveAction.ID,
            label: "Save File to Google Drive",
            alias: "Save File to Google Drive",
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                mac: { primary: monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS },
                weight: 100, // KeybindingWeight.EditorContrib,
            },
        });
    }

    run(accessor, editor) {
        const driveController = DriveController.get(editor);
        return driveController.saveCurrentFile();
    }
}
