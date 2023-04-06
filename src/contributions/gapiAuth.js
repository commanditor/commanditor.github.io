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
import { Emitter } from "monaco-editor/esm/vs/base/common/event";
import * as GAPI_CONSTS from "../gapi_consts";
import { getUrlState } from "../Utils";

export class GapiAuthController extends Disposable {
    constructor(editor) {
        super();

        this._editor = editor;
        this._onLoggedInChangedEmitter = new Emitter();

        this.tokenClient = null;
    }

    get onLoggedInChanged() {
        return this._onLoggedInChangedEmitter.event;
    }

    get isLoggedIn() {
        return gapi.client.getToken() !== null;
    }

    loadGapi() {
        if (!!window.gapi && !!window.google) {
            window.handleClientLoad = () => {};

            this.initGapiClient();

            const urlState = getUrlState();
            this.initTokenClient(
                urlState !== null ? urlState.userId : undefined
            );
        }
    }

    /**
     *
     * @param {string|undefined} hint use email or user-id of signed in account as hint for token client,
     * to skip account selection when no new consent is needed
     */
    initTokenClient(hint) {
        // init token client
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            //apiKey: GAPI_CONSTS.API_KEY,
            client_id: GAPI_CONSTS.CLIENT_ID,
            scope: GAPI_CONSTS.SCOPES,
            hint: hint,
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    this.handleGapiAuthChange(this.isLoggedIn);
                }
            },
            error_callback: (error) => {
                console.error(error);
            },
        });

        if (hint) {
            this.tokenClient.requestAccessToken({ prompt: "" });
        }
    }

    initGapiClient() {
        gapi.load("client", () => {
            gapi.client
                .init({
                    discoveryDocs: GAPI_CONSTS.DISCOVERY_DOCS,
                })
                .then(() => this.onGapiInit())
                .catch((err) => {
                    console.error("gapi init error", err);
                    alert(
                        "GAPI client could not be initialized.\nCheck browser console for details."
                    );
                });
        });
    }

    onGapiInit() {
        // Handle the initial sign-in state.
        this.handleGapiAuthChange(this.isLoggedIn);
    }

    handleGapiAuthChange(newState) {
        this._onLoggedInChangedEmitter.fire(newState);
    }

    requestTokenForGapiError(err) {
        console.warn("error in gapi, probably need new token", err);

        if (
            err.result.error.code === 401 ||
            (err.result.error.code === 403 &&
                err.result.error.status === "PERMISSION_DENIED")
        ) {
            // The access token is missing, invalid, or expired, prompt user to obtain one.
            return new Promise((resolve, reject) => {
                try {
                    this.tokenClient.callback = (res) => {
                        if (res.error !== undefined) {
                            reject(res);
                        }
                        resolve(res);
                    };
                    this.tokenClient.error_callback = (err) => {
                        alert(
                            "error while trying to open the authorization popup.\n" +
                                err.message
                        );
                    };
                    this.tokenClient.requestAccessToken({ prompt: "" });
                } catch (err) {
                    console.log(err);
                }
            });
        } else {
            // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
            return Promise.reject(err.result.error.message);
        }
    }

    requestAuthorization() {
        this.tokenClient.requestAccessToken({ prompt: "" });
    }

    getId() {
        return GapiAuthController.ID;
    }
}

// TODO how to babel class properties
GapiAuthController.ID = "commanditor.contrib.GapiAuthController";
/**
 * @returns {GapiAuthController} the controller
 */
GapiAuthController.get = (editor) => {
    return editor.getContribution(GapiAuthController.ID);
};

registerEditorContribution(GapiAuthController);
