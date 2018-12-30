import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { defaultInsertColor, defaultRemoveColor } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
import { Disposable } from 'monaco-editor/esm/vs/base/common/lifecycle';
import { registerThemingParticipant } from 'monaco-editor/esm/vs/platform/theme/common/themeService';

export class EditMarginController extends Disposable {
	constructor(
		editor,
		// TODO how to use decorators for original monaco-editor dependency injection?
		instantiationService
	) {
		super();

        this._editor = editor;

        this._editor.onDidChangeModel(this.handleDidModelChange.bind(this));
        this._editor.onDidChangeModelContent(this.handleDidModelContentChange.bind(this));
    }
    
    handleDidModelChange(e) {
        // TODO
    }

    handleDidModelContentChange(e) {
        for (var c of e.changes.sort((a,b) => a.text.localeCompare(b.text))) {
            var startLine = c.range.startLineNumber;
            var endLine = c.range.endLineNumber + (c.text.split("\n").length - 1);
            var marginClassName = c.text === "" ? "editMargin--removed" : "editMargin--added";

            if (c.text === "" && c.range.endLineNumber != c.range.startLineNumber) {
                // if multiline delete, endline must be same as startline, or multiple lines will be marked as "removed"
                endLine = startLine;
            }

            for (var li = startLine; li <= endLine; li++) {
                var oldLineDecorations = this._editor.getLineDecorations(li)
                    .filter(d => d.options.marginClassName === "editMargin--added" || d.options.marginClassName === "editMargin--removed")
                    .map(d => d.id);

                var range = new self.monaco.Range(li, 0, li, 0);
                this._editor.deltaDecorations(oldLineDecorations, [
                    {
                        range: range,
                        options: {
                            isWholeLine: true,
                            marginClassName: marginClassName
                        }
                    }
                ]);
            }
        }
        // console.log(editor.getModel().getAllDecorations());
    }

	getId() {
		return EditMarginController.ID;
    }
    
    reset() {
        // TODO
    }
}

// TODO how to babel class properties
EditMarginController.ID = 'commanditor.contrib.EditMarginController';
/**
 * @returns {EditMarginController} the controller
 */
EditMarginController.get = (editor) => {
	return editor.getContribution(
		EditMarginController.ID
	);
};

registerEditorContribution(EditMarginController);

registerThemingParticipant((theme, collector) => {
    const insertColor = defaultInsertColor.transparent(3);
	if (insertColor) {
		collector.addRule(`.monaco-editor .editMargin--added { border-left: 6px solid ${insertColor}; }`);
	}

    const removeColor = defaultRemoveColor.transparent(3);
	if (removeColor) {
		collector.addRule(`.monaco-editor .editMargin--removed { border-left: 6px solid ${removeColor}; }`);
	}
});
