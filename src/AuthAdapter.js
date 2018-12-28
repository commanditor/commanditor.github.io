import { App } from './App';
import * as GAPICONSTS from './gapi_consts';

export class AuthAdapter {
    /**
     * @param {App} app - the app
     */
    constructor(app) {
        this.app = app;
        this.loggedIn = false;
        this.listeners = {
            'loggedinchanged': []
        };
    }

    loadGapi() {
        gapi.load('client:auth2', this.initGapiAuth.bind(this));
    }

    initGapiAuth() {
        gapi.client.init({
            //apiKey: GAPICONSTS.API_KEY,
            clientId: GAPICONSTS.CLIENT_ID,
            discoveryDocs: GAPICONSTS.DISCOVERY_DOCS,
            scope: GAPICONSTS.SCOPES
        }).then(this.onGapiInit.bind(this));
    }

    onGapiInit() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.handleAuthChange.bind(this));

        // Handle the initial sign-in state.
        this.handleAuthChange(gapi.auth2.getAuthInstance().isSignedIn.get());
    }

    handleAuthChange(b) {
        this.loggedIn = b;
        console.log('new login state:', b);
        this.dispatchEvent('loggedinchanged', this.loggedIn);
    }

    requestAuthorization() {
        // TODO
        gapi.auth2.getAuthInstance().signIn();
    }

    requestSignOut() {
        // TODO
        gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * dispatches an event
     * @param {("loggedinchanged")} type - event type
     * @param {object} e - event args
     */
    dispatchEvent(type, e) {
        if (this.listeners[type])
            for (var callback of this.listeners[type]) {
                if (callback)
                    callback(e);
            }
    }

    /**
     * @param {("loggedinchanged")} type - event type
     * @param {function} callback - callback
     */
    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            throw new Error(`Event listeners for event \"${type}\" not supported`);
        }
        this.listeners[type].push(callback);
    }
}
