import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { defaultInsertColor, defaultRemoveColor } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
import { Disposable } from 'monaco-editor/esm/vs/base/common/lifecycle';
import { Emitter } from 'monaco-editor/esm/vs/base/common/event';
import * as GAPI_CONSTS from '../gapi_consts';

export class GapiAuthController extends Disposable {
	constructor(
		editor
	) {
		super();

        this._editor = editor;
        this._onLoggedInChangedEmitter = new Emitter();
    }

    get onLoggedInChanged() {
        return this._onLoggedInChangedEmitter.event;
    }

    get isLoggedIn() {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    loadGapi() {
        gapi.load('client:auth2', () => this.initGapiAuth());
    }

    initGapiAuth() {
        gapi.client.init({
            //apiKey: GAPI_CONSTS.API_KEY,
            clientId: GAPI_CONSTS.CLIENT_ID,
            discoveryDocs: GAPI_CONSTS.DISCOVERY_DOCS,
            scope: GAPI_CONSTS.SCOPES
        }).then(() => this.onGapiInit());
    }

    onGapiInit() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(b => this.handleGapiAuthChange(b));

        // Handle the initial sign-in state.
        this.handleGapiAuthChange(this.isLoggedIn);
    }

    handleGapiAuthChange(newState) {
        this._onLoggedInChangedEmitter.fire(newState);
    }

    requestAuthorization() {
        // TODO
        gapi.auth2.getAuthInstance().signIn();
    }

    requestSignOut() {
        // TODO
        gapi.auth2.getAuthInstance().signOut();
    }

	getId() {
		return GapiAuthController.ID;
    }
}

// TODO how to babel class properties
GapiAuthController.ID = 'commanditor.contrib.GapiAuthController';
/**
 * @returns {GapiAuthController} the controller
 */
GapiAuthController.get = (editor) => {
	return editor.getContribution(
		GapiAuthController.ID
	);
};

registerEditorContribution(GapiAuthController);
