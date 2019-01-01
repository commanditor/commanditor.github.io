import { EditorAction } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'monaco-editor/esm/vs/editor/common/editorContextKeys';
import { DriveController } from './';
import { KeyMod, KeyCode } from 'monaco-editor';

export class SaveAction extends EditorAction {
	constructor() {
		super({
			id: SaveAction.Id,
			label: "Save File to Drive",
			alias: 'Refactor',
			//precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
			kbOpts: {
				kbExpr: EditorContextKeys.editorTextFocus,
				primary: KeyMod.CtrlCmd | KeyCode.KEY_S,
				mac: {
					primary: KeyMod.WinCtrl | KeyCode.KEY_S
				}
			}
		});
	}

	run(accessor, editor) {
        const driveController = DriveController.get(editor);
        return driveController.saveCurrentFile();
	}
}

SaveAction.Id = 'commanditor.drive.action.save';
