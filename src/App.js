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
        this.drive = new DriveAdapter(this);
        this.editor = new EditorAdapter(this, this.drive);
        this.drive.init();
        // freeze singleton
        Object.freeze(this);
    }
}
