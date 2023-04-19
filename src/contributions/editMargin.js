import * as monaco from "../monaco";
import {
    EditorAction,
    EditorCommand,
    registerEditorAction,
    registerEditorCommand,
    registerEditorContribution,
} from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import {
    defaultInsertColor,
    defaultRemoveColor,
} from "monaco-editor/esm/vs/platform/theme/common/colorRegistry";
import { Disposable } from "monaco-editor/esm/vs/base/common/lifecycle";
import { Color, RGBA } from "monaco-editor/esm/vs/base/common/color";
import { registerThemingParticipant } from "monaco-editor/esm/vs/platform/theme/common/themeService";

export class EditMarginController extends Disposable {
    constructor(
        editor,
        // TODO how to use decorators for original monaco-editor dependency injection?
        instantiationService
    ) {
        super();

        this._editor = editor;

        this._editor.onDidChangeModel(this.handleDidModelChange.bind(this));
        this._editor.onDidChangeModelContent(
            this.handleDidModelContentChange.bind(this)
        );
    }

    handleDidModelChange(e) {
        // TODO
    }

    handleDidModelContentChange(e) {
        for (var c of e.changes.sort((a, b) => a.text.localeCompare(b.text))) {
            var startLine = c.range.startLineNumber;
            var endLine =
                c.range.endLineNumber + (c.text.split("\n").length - 1);
            var marginClassName =
                c.text === "" ? "editMargin--removed" : "editMargin--added";

            if (
                c.text === "" &&
                c.range.endLineNumber != c.range.startLineNumber
            ) {
                // if multiline delete, endline must be same as startline, or multiple lines will be marked as "removed"
                endLine = startLine;
            }

            for (var li = startLine; li <= endLine; li++) {
                var oldDecorationIds = this._editor
                    .getLineDecorations(li)
                    .filter(
                        (d) =>
                            d.options.marginClassName === "editMargin--added" ||
                            d.options.marginClassName ===
                                "editMargin--removed" ||
                            d.options.marginClassName === "editMargin--saved"
                    )
                    .map((d) => d.id);

                this._editor.deltaDecorations(oldDecorationIds, [
                    {
                        range: new monaco.Range(li, 0, li, 0),
                        options: {
                            isWholeLine: true,
                            marginClassName: marginClassName,
                        },
                    },
                ]);
            }
        }
        // console.log(editor.getModel().getAllDecorations());
    }

    getId() {
        return EditMarginController.ID;
    }

    reset() {
        // TODO think about not removing markers, but changing their color from red/green to maybe blue?
        const oldLineDecorations = this._editor
            .getModel()
            .getAllDecorations()
            .filter(
                (d) =>
                    d.options.marginClassName === "editMargin--added" ||
                    d.options.marginClassName === "editMargin--removed" ||
                    d.options.marginClassName === "editMargin--saved"
            );

        const oldDecorationIds = oldLineDecorations.map((d) => d.id);
        const newDecorations = oldLineDecorations.map((d) => ({
            range: new monaco.Range(
                d.range.startLineNumber,
                0,
                d.range.startLineNumber,
                0
            ),
            options: {
                isWholeLine: true,
                marginClassName: "editMargin--saved",
            },
        }));

        this._editor.deltaDecorations(oldDecorationIds, newDecorations);
    }
}

// TODO how to babel class properties
EditMarginController.ID = "commanditor.contrib.EditMarginController";
/**
 * @returns {EditMarginController} the controller
 */
EditMarginController.get = (editor) => {
    return editor.getContribution(EditMarginController.ID);
};

registerEditorContribution(
    EditMarginController.ID,
    EditMarginController,
    0 /* EditorContributionInstantiation.Eager */
);

registerThemingParticipant((theme, collector) => {
    const insertColor = defaultInsertColor.transparent(3);
    if (insertColor) {
        collector.addRule(
            `.monaco-editor .editMargin--added { border-left: 6px solid ${insertColor}; }`
        );
    }

    const removeColor = defaultRemoveColor.transparent(3);
    if (removeColor) {
        collector.addRule(
            `.monaco-editor .editMargin--removed { border-left: 6px solid ${removeColor}; }`
        );
    }

    //const dark = new Color(new RGBA(12, 125, 157, 0.6));
    const light = new Color(new RGBA(102, 175, 224, 0.6));
    const savedColor = light;
    if (savedColor) {
        collector.addRule(
            `.monaco-editor .editMargin--saved { border-left: 6px solid ${savedColor}; }`
        );
    }
});
