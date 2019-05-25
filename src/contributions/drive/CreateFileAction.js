import { QuickOpenEntry, QuickOpenModel } from 'monaco-editor/esm/vs/base/parts/quickopen/browser/quickOpenModel';
import { BaseEditorQuickOpenAction } from 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/editorQuickOpen';
import { DriveController } from './index';
import { CONTEXTKEY_DRIVE_CANCREATENEWFILE } from './index';

class CreateFileEntry extends QuickOpenEntry {
    constructor(editor, newFileName) {
        super();
        this._editor = editor;
        this.newFileName = newFileName;
    }

    getLabel() {
        if (!this.newFileName || this.newFileName.length === 0) {
            return 'type a name for the new file, or click somewhere to cancel';
        }

        return `Create File "${this.newFileName}"`;
    }

    run(mode, context) {
        if (mode == 0) {
            // run preview
        } else if (mode == 1) {
            // run open
            if (!this.newFileName || this.newFileName.length === 0) {
                return false;
            }

            // create file and set up to edit
            DriveController.get(this._editor).createAndEditNewFile(this.newFileName);

            return true;
        }
    }
}

export class CreateFileAction extends BaseEditorQuickOpenAction {
    constructor() {
        super('type a name for the new file, or click somewhere to cancel', {
            id: CreateFileAction.ID,
            label: 'Create new File',
            alias: 'Create new File',
            precondition: CONTEXTKEY_DRIVE_CANCREATENEWFILE,
            kbOpts: null
        });
    }

    run(accessor, editor) {
        this._show(this.getController(editor), {
            getModel: (inputValue) => {
                return new QuickOpenModel([ new CreateFileEntry(editor, inputValue) ]);
            },
            getAutoFocus: (inputValue) => {
                return {
                    autoFocusFirstEntry: inputValue.length > 0
                };
            }
        });
    }
}

CreateFileAction.ID = 'commanditor.action.createNewFile';
