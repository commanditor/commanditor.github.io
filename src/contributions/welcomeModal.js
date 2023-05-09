import {
    EditorAction,
    EditorCommand,
    registerEditorAction,
    registerEditorCommand,
    registerEditorContribution,
} from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import {
    contrastBorder,
    editorWidgetBackground,
    widgetShadow,
    textLinkForeground,
} from "monaco-editor/esm/vs/platform/theme/common/colorRegistry";
import { Disposable } from "monaco-editor/esm/vs/base/common/lifecycle";
import * as dom from "monaco-editor/esm/vs/base/browser/dom";
import { registerThemingParticipant } from "monaco-editor/esm/vs/platform/theme/common/themeService";
import { renderFormattedText } from "monaco-editor/esm/vs/base/browser/formattedTextRenderer";
import {
    FastDomNode,
    createFastDomNode,
} from "monaco-editor/esm/vs/base/browser/fastDomNode";
import { Widget } from "monaco-editor/esm/vs/base/browser/ui/widget";
import { GapiAuthController } from "./gapiAuth";

export class WelcomeModalController extends Disposable {
    constructor(
        editor,
        // TODO how to use decorators for original monaco-editor dependency injection?
        instantiationService
    ) {
        super();

        this._editor = editor;
        this._widget = new WelcomeModalWidget(this._editor);
    }

    getId() {
        return WelcomeModalController.ID;
    }

    show() {
        this._widget.show();
    }

    hide() {
        this._widget.hide();
    }
}

// TODO how to babel class properties
WelcomeModalController.ID = "commanditor.contrib.WelcomeModalController";
/**
 * @returns {WelcomeModalController} the controller
 */
WelcomeModalController.get = (editor) => {
    return editor.getContribution(WelcomeModalController.ID);
};

class WelcomeModalWidget extends Widget {
    constructor(editor) {
        super();

        this._editor = editor;

        this._domNode = createFastDomNode(document.createElement("div"));
        this._domNode.setClassName("welcomeModalWidget");
        this._domNode.setDisplay("none");
        this._domNode.setAttribute("role", "dialog");
        this._domNode.setAttribute("aria-hidden", "true");

        this._contentDomNode = createFastDomNode(document.createElement("div"));
        this._contentDomNode.setAttribute("role", "document");
        this._domNode.appendChild(this._contentDomNode);

        this._isVisible = false;

        this._register(
            this._editor.onDidLayoutChange(() => {
                if (this._isVisible) {
                    this._layout();
                }
            })
        );

        // add auth event listener
        const authController = GapiAuthController.get(this._editor);
        this._register(
            authController.onLoggedInChanged((b) =>
                b ? this.hide() : this.show()
            )
        );

        this._editor.addOverlayWidget(this);

        this.show();
    }

    dispose() {
        this._editor.removeOverlayWidget(this);
        super.dispose();
    }

    getId() {
        return WelcomeModalWidget.ID;
    }

    getDomNode() {
        return this._domNode.domNode;
    }

    getPosition() {
        return {
            preference: null,
        };
    }

    show() {
        if (this._isVisible) {
            return;
        }
        this._isVisible = true;
        this._layout();
        this._domNode.setDisplay("block");
        this._domNode.setAttribute("aria-hidden", "false");
        this._buildContent();
        this._contentDomNode.domNode.focus();
    }

    _buildContent() {
        let text = "Welcome to commanditor!\n\n";
        text +=
            "Your simple text editor for all your editing needs for your text files on Google Drive™.\n\n";
        text +=
            "Get started by authorizing the App to access your Google Drive, and explore the available Commands by pressing the F1 key!\n";
        text +=
            "Make sure you check all relevant boxes, so commanditor can access your Google Drive File!\n\n";
        this._contentDomNode.domNode.appendChild(renderFormattedText(text));

        let authController = GapiAuthController.get(this._editor);
        let btnAuth = createFastDomNode(document.createElement("div"));
        btnAuth.domNode.innerText = "Authorize";
        btnAuth.domNode.addEventListener("click", () =>
            authController.requestAuthorization()
        );
        btnAuth.setAttribute("role", "button");
        btnAuth.setClassName("button");
        this._contentDomNode.domNode.appendChild(btnAuth.domNode);

        let text2 = "\nSome more info:\n";
        text2 +=
            'commanditor is based on the very solid foundation of "monaco-editor", the text-editor that also powers Visual Studio Code.\n\n';
        text2 += "Bugs can be reported on ";
        const text2Element = renderFormattedText(text2);
        const ghIssueLink = createFastDomNode(document.createElement("a"));
        ghIssueLink.domNode.href =
            "https://github.com/commanditor/commanditor.github.io";
        ghIssueLink.domNode.target = "_blank";
        ghIssueLink.domNode.rel = "noopener noreferrer";
        ghIssueLink.domNode.innerText = "GitHub";
        text2Element.appendChild(ghIssueLink.domNode);
        this._contentDomNode.domNode.appendChild(text2Element);

        // Per https://www.w3.org/TR/wai-aria/roles#document, Authors SHOULD provide a title or label for documents
        this._contentDomNode.domNode.setAttribute("aria-label", text);
    }

    hide() {
        if (!this._isVisible) {
            return;
        }
        this._isVisible = false;
        this._domNode.setDisplay("none");
        this._domNode.setAttribute("aria-hidden", "true");
        dom.clearNode(this._contentDomNode.domNode);

        this._editor.focus();
    }

    _layout() {
        let editorLayout = this._editor.getLayoutInfo();

        let w = Math.max(
            5,
            Math.min(WelcomeModalWidget.WIDTH, editorLayout.width - 40)
        );
        let h = Math.max(
            5,
            Math.min(WelcomeModalWidget.HEIGHT, editorLayout.height - 40)
        );

        this._domNode.setWidth(w);
        this._domNode.setHeight(h);

        let top = Math.round((editorLayout.height - h) / 2);
        this._domNode.setTop(top);

        let left = Math.round((editorLayout.width - w) / 2);
        this._domNode.setLeft(left);
    }
}
WelcomeModalWidget.ID = "commanditor.contrib.WelcomeModalWidget";
WelcomeModalWidget.WIDTH = 500;
WelcomeModalWidget.HEIGHT = 400;

registerEditorContribution(
    WelcomeModalController.ID,
    WelcomeModalController,
    0 /* EditorContributionInstantiation.Eager */
);

registerThemingParticipant((theme, collector) => {
    collector.addRule(`.monaco-editor .welcomeModalWidget { padding: 10px; }`);

    collector.addRule(`.monaco-editor .welcomeModalWidget .button {
		background: #0e639c;
		border: none;
		width: fit-content;
		color: #ffffff;
		margin: 0 auto;
		font-family: -apple-system,BlinkMacSystemFont,Segoe WPC,Segoe UI,HelveticaNeue-Light,Ubuntu,Droid Sans,sans-serif;
		font-weight: 600;
		padding: 8px 32px;
		font-size: 18px;
		cursor: pointer;
	}`);

    const textLinkForegroundColor = theme.getColor(textLinkForeground);
    if (textLinkForegroundColor) {
        collector.addRule(
            `.monaco-editor .welcomeModalWidget a { color: ${textLinkForegroundColor}; }`
        );
    }

    const widgetBackground = theme.getColor(editorWidgetBackground);
    if (widgetBackground) {
        collector.addRule(
            `.monaco-editor .welcomeModalWidget { background-color: ${widgetBackground}; }`
        );
    }

    const widgetShadowColor = theme.getColor(widgetShadow);
    if (widgetShadowColor) {
        collector.addRule(
            `.monaco-editor .welcomeModalWidget { box-shadow: 0 2px 8px ${widgetShadowColor}; }`
        );
    }

    const hcBorder = theme.getColor(contrastBorder);
    if (hcBorder) {
        collector.addRule(
            `.monaco-editor .welcomeModalWidget { border: 2px solid ${hcBorder}; }`
        );
    }
});
