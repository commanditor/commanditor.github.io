import { Disposable } from 'monaco-editor/esm/vs/base/common/lifecycle';
import { registerEditorContribution, registerEditorAction } from 'monaco-editor/esm/vs/editor/browser/editorExtensions';
import { EditMarginController } from '../editMargin';
import { GapiAuthController } from '../gapiAuth';
import { getUrlState, getMonacoLanguageForFilename, monacoLanguageSupportedForFilename } from '../../Utils';
import { IContextKeyService, RawContextKey } from 'monaco-editor/esm/vs/platform/contextkey/common/contextkey';
import { SaveAction } from './SaveAction';
import { CreateFileAction } from './CreateFileAction';

export const CONTEXTKEY_DRIVE_CANCREATENEWFILE = new RawContextKey('canCreateNewDriveFile', false);

export class DriveController extends Disposable {
    constructor(editor, /*@IContextKeyService*/ _contextKeyService) {
        super();

        this._editor = editor;
        this._contextKeyService = _contextKeyService;

        // maybe sometimes get the decorators to work? see at the bottom of the file on how the registering works here
        // https://babeljs.io/docs/en/babel-plugin-proposal-decorators
        // https://github.com/WarnerHooh/babel-plugin-parameter-decorator
        this._contextKey_canCreateNewFile = CONTEXTKEY_DRIVE_CANCREATENEWFILE.bindTo(this._contextKeyService);

        this.currentFileModel = undefined
        this.currentFileInfo = undefined;
        this.currentFileSavedContent = undefined;

        GapiAuthController.get(this._editor).onLoggedInChanged((b) => this.handleLoggedInChange(b));
    }

    handleLoggedInChange(b) {
        if (!b)
            return;

        // try to load file from url-state
        const state = getUrlState();
        this.state = state;
        console.log('state', state);
        if (state) {
            if (state.action === 'open') {
                if (state.userId && state.ids.length > 0) {
                    // try to load file
                    const id = state.ids[0];
                    this.openDriveFile(id);
                }
            } else if(state.action === 'create') {
                // ask for filename (and instantly deactivate the create command again)
                this._contextKey_canCreateNewFile.set(true);
                this._editor.getAction(CreateFileAction.ID).run();
                this._contextKey_canCreateNewFile.set(false);
            }
        }
    }

    openDriveFile(id) {
        console.log('will now try to load file ', id);
        this.getFileInfo(id).then((fi) => {
            console.log('file info:', fi);
            if (monacoLanguageSupportedForFilename(fi.name)) {
                this.currentFileInfo = fi;
                this.setDocumentFileTitle(this.currentFileInfo.name);

                console.log('will now try to get file content');
                return this.getFileContent(id);
            }

            alert('The extension of the file you tried to open is not supported.');
            return Promise.reject('extension is not supported');
        }).then((fileContent) => {
            console.log('received file content with length: ', fileContent.length);
            this.currentFileSavedContent = fileContent;
            const lang = getMonacoLanguageForFilename(this.currentFileInfo.name) || 'plaintext';

            // create new model in editor
            this.currentFileModel = monaco.editor.createModel(fileContent, lang.id);
            this._editor.setModel(this.currentFileModel);
            this._editor.focus();
        }).catch(e => console.log('an error occured while trying to open the file', e));
    }

    createAndEditNewFile(fileName) {
        // TODO more or less the same as openDriveFile(id), should probably refactor
        const folderId = this.state && this.state.folderId ? this.state.folderId : 'root';
        this.createFile(fileName, folderId).then(fi => {
            console.log('file info:', fi);
            // dont care for extension when creating files
            this.currentFileInfo = fi;
            this.setDocumentFileTitle(this.currentFileInfo.name);

            // empty file
            return Promise.resolve('');
        }).then((fileContent) => {
            console.log('created new file with content length: ', fileContent.length);
            this.currentFileSavedContent = fileContent;
            const lang = getMonacoLanguageForFilename(this.currentFileInfo.name) || 'plaintext';

            // create new model in editor
            this.currentFileModel = monaco.editor.createModel(fileContent, lang.id);
            this._editor.setModel(this.currentFileModel);
            this._editor.focus();
        }).catch(e => console.log('an error occured while trying to create the file', e));
    }

    saveCurrentFile() {
        if (!this.currentFileModel) {
            // no file currently opened
            alert('No File is currently opened. Please first open your File from Google Drive.');
            return;
        }

        const currentModelContent = this.currentFileModel.getValue();
        if (currentModelContent === this.currentFileSavedContent) {
            console.log('nothing changed, no need to save');
            return;
        }

        console.log('will now try to save file');
        return this.uploadSimple(this.currentFileInfo.id, currentModelContent)
            .then(fi => {
                this.currentFileSavedContent = currentModelContent;
                
                const editMarginController = EditMarginController.get(this._editor);
                editMarginController.reset();

                console.log('file successfully saved');

                return fi;
            })
            .catch(e => console.log('an error occcured during file saving', e));
    }

    /**
     * lists files on Google Drive
     * @param {string} parent - Parent, which Child-Files should be listed, default is root
     * @param {boolean} includeDirectories - Indicates, if folders shall be included in the list
     * @returns {Promise<Array<Object>>} - List of File Metadata (use model obj??)
     */
    listFiles(parent = 'root', includeDirectories = true) {
        // list files with parent xy or in root
        // includeDirectories setzt capabilities.canhavechildren (glaube es hieß so)
        // TODO
        return gapi.client.drive.files.list({
            'pageSize': 200,
            'fields': 'nextPageToken, files(id, name, parents,mimeType,description,fileExtension,properties,iconLink,folderColorRgb,size)", //ordner haben mimetype "application/vnd.google-apps.folder',
            'q': /*"mimeType = 'application/vnd.google-apps.folder' and"*/'\''+parent+'\' in parents and trashed = false'
        }).then(response => {
            return response.result.files;
        });
    }

    /**
     * Gets the Drive File Info (Metadata) for a File
     * @param {string} id - Drive File ID
     * @returns {Promise<object>} - File Metadata (use model obj??)
     */
    getFileInfo(id) {
        // TODO
        return gapi.client.drive.files.get({
            fileId: id,
            fields: 'id,name,mimeType,description,parents,fileExtension'
        }).then(response => {
            return response.result;
        });
    }

    /**
     * Retrieves the Content of a File from Google Drive
     * @param {string} id - Drive File ID
     * @returns {Promise<string>} - Content of the File
     */
    getFileContent(id) {
        // TODO
        return gapi.client.drive.files.get({
            fileId: id,
            alt: 'media',
            /*headers: {
                contentType: 'charset=utf-8'
            }*/
        }).then(response => {
            return response.body;
        });
    }

    /**
     * saves/uploads only content of a File to Google Drive
     * @param {string} id - Drive File ID
     * @param {string} content - new content of the File
     * @returns {Promise<object>} - File Metadata (use model obj??)
     */
    uploadSimple(id, content) {
        // https://developers.google.com/drive/api/v3/manage-uploads
        return gapi.client.request({
            path: '/upload/drive/v3/files/' + id,
            method: 'PATCH',
            params: {
              uploadType: 'media'
            },
            headers: {
              'Content-Type': 'text/plain'
            },
            body: content
        }).then(response => response); // HINT then() to instantly execute the request
    }

    /**
     * updates Metadata of a File on Google Drive
     * @param {string} id - Drive File ID
     * @param {object} meta - Metadata changes (not included keys will be unchagned) (use model obj??)
     * @returns {Promise<object>} - New File Metadata (use model obj??)
     */
    updateFileMeta(id, meta = {}) {
        return gapi.client.drive.files.update({
            fileId: id,
            ...meta
        }).then(response => response.result);
    }

    rename(id, newName) {
        return this.updateFileMeta(id, {
            name: newName
        });
    }

    /**
     * Creates a new File in Google Drive
     * @param {string} name - Name of the created File
     * @param {string} parent - ID of the Parent of the created File, default is root
     * @returns {Promise<object>} - New File Metadata (use model obj??)
     */
    createFile(name, parent = 'root') {
        return gapi.client.drive.files.create({
            name: name,
            parents: [ parent ],
            //media: { body: JSON.stringify({date: Date.now()}) }
            // daten anhängen geht hier nicht direkt. außer man sagt multipart upload und erzeugt file und content gleichzeitig, dann aber nur per generic request
            // https://stackoverflow.com/questions/51559203/uploading-a-file-to-google-drive-using-gapi
            // https://stackoverflow.com/questions/34905363/create-file-with-google-drive-api-v3-javascript/35182924#35182924
            // https://github.com/drivenotepad/app/blob/gh-pages/js/using_apis.js#L216
        }).then(response => response.result);
    }

    // #region --- config stuff ---

    /**
     * Retrieves the File Info of the application config file
     * @returns {Promise<object>} - File Metadata (use model obj??) or null if it does not exist
     */
    getAppConfigFileInfo() {
        return gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            q: 'name = \'config.json\''
        }).then(response => response.result.files.length > 0 ? response.result.files[0] : null);
    }

    createEmptyAppConfigFile() {
        return gapi.client.drive.files.create({
            name: 'config.json',
            parents: [ 'appDataFolder' ],
            //media: { body: JSON.stringify({date: Date.now()}) }
            // daten anhängen geht hier nicht direkt. außer man sagt multipart upload und erzeugt file und content gleichzeitig, dann aber nur per generic request
            // https://stackoverflow.com/questions/51559203/uploading-a-file-to-google-drive-using-gapi
            // https://stackoverflow.com/questions/34905363/create-file-with-google-drive-api-v3-javascript/35182924#35182924
            // https://github.com/drivenotepad/app/blob/gh-pages/js/using_apis.js#L216
        }).then(response => response.result);
    }

    // #endregion

    setDocumentFileTitle(filename) {
        if (!filename || filename.length == 0) {
            document.title = 'commanditor';
            return;
        }
        
        document.title = `commanditor (${filename})`;
    }

	getId() {
		return DriveController.ID;
    }
    
    /*
    // example with generic request
    var request = gapi.client.request({
        'path': '/drive/v3/files/' + "abcdefghijklmnopqrstuvwxyz",
        'params':{'alt': 'media'},
        'headers': {'contentType': 'charset=utf-8'}
    });
    request.execute((response, r2) => {
        console.log("request response", JSON.parse(r2));
        appendPre("REQUEST RESPONSE");      
    });
    */
}

// HACK because I did not get decorators to work, but this also works to register the constructor params for dependency injection
IContextKeyService(DriveController, '_contextKeyService', 1);

// TODO how to babel class properties
DriveController.ID = 'commanditor.contrib.DriveController';
/**
 * @returns {DriveController} the controller
 */
DriveController.get = (editor) => {
	return editor.getContribution(
		DriveController.ID
	);
};

registerEditorContribution(DriveController);
registerEditorAction(SaveAction);
registerEditorAction(CreateFileAction);
