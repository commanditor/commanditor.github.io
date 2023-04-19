import { IQuickInputService } from "monaco-editor/esm/vs/platform/quickinput/common/quickInput";

import { EditorAction } from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import { EditorContextKeys } from "monaco-editor/esm/vs/editor/common/editorContextKeys";
import { DriveController, CONTEXTKEY_DRIVE_CANCREATENEWFILE } from ".";
import { GapiAuthController } from "../gapiAuth";

export class CreateFileAction extends EditorAction {
    static ID = "commanditor.action.createNewFile";

    constructor() {
        super({
            id: CreateFileAction.ID,
            label: "Create New File",
            alias: "Create New File",
            precondition: CONTEXTKEY_DRIVE_CANCREATENEWFILE,
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: undefined, // KeyMod.CtrlCmd | monaco.KeyCode.Escape,
                mac: undefined, // { primary: monaco.KeyMod.WinCtrl | monaco.KeyCode.Escape },
                weight: 100, // KeybindingWeight.EditorContrib,
            },
        });
    }

    run(accessor, editor) {
        const gapiAuth = GapiAuthController.get(editor);
        if (!gapiAuth.isLoggedIn) {
            alert("please authenticate before creating a new file");
            return;
        }

        const inputBox = accessor.get(IQuickInputService).createInputBox();
        inputBox.title = "Create New File";
        inputBox.description = "Enter the filename for your new file.";
        inputBox.placeholder = "New Textfile.txt";

        // event can be used for input validation
        // inputBox.onDidChangeValue((input) => {
        // inputBox.validationMessage = undefined;
        // inputBox.severity = 0;
        // });

        inputBox.onDidAccept(() => {
            if (inputBox.value) {
                console.log("accepted!!", inputBox.value);

                // create file and set up to edit
                DriveController.get(editor).createAndEditNewFile(
                    inputBox.value
                );

                inputBox.hide();
            }
        });

        inputBox.onDidHide(() => {
            inputBox.dispose();
        });

        inputBox.show();
    }
}
