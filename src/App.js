/*
 * - ?? promise die feuert, wenn jeweiliger adapter fertig initialisiert ist, wo andere adapter sich draufhängen können
 * edit-marker in margin lassen sich machen mit sample(rendering glyphs in the margin), decorationOption: "marginClassName" : "myMarginClass", und .myMarginClass{background:lime;width:5px !important;}
 * dann listener auf editor.getModel().onDidChangeContent() der durch changes loopt und für change.range eine decoration setzt)
 * problem noch: add, remove, wieder add, bleibt rot
 */
import { AuthAdapter } from './AuthAdapter';
import { DriveAdapter } from './DriveAdapter';
import { EditorAdapter } from './EditorAdapter';

/**
  * The Main App
  */
export class App {
    //static _instance;
    constructor() {
        // singleton
        if (App._instance) {
            return App._instance;
        }
        App._instance = this;

        // init modules
        //this.config = new AppConfig();
        this.auth = new AuthAdapter(this);
        this.drive = new DriveAdapter(this, this.auth);
        this.editor = new EditorAdapter(this, this.auth, this.drive);
        // freeze singleton
        Object.freeze(this);
    }

    handleClientLoad() {
        this.auth.loadGapi();
    }
}
