import { EditorAction } from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import * as monaco from "./../../monaco"; // HINT must reimport keys from here, because in 'monaco-editor/esm/vs/base/common/keyCodes' they are an enum and will fail at runtime
import { DriveController } from "./";

export class SaveAction extends EditorAction {
    constructor() {
        super({
            id: SaveAction.Id,
            label: "Save File to Google Drive",
            alias: "Save File to Google Drive",
            kbOpts: {
                kbExpr: null,
                primary: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            },
        });
    }

    run(accessor, editor) {
        const driveController = DriveController.get(editor);
        return driveController.saveCurrentFile();
    }
}

SaveAction.Id = "commanditor.drive.action.save";
