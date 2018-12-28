/**
 * Utilities
 */
class Utils {
    /**
     * Retrieves the Parameters from the Open URL
     * @returns - the parameters
     */
    static GetOpenParams() {
        // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        // https://developers.google.com/drive/api/v3/enable-sdk#drive_integration
        const urlParams = new URLSearchParams(window.location.search);
        const state = JSON.parse(urlParams.get('state')); // when no template-variables are used in Openurl
        const ids = urlParams.get('ids') | state.ids; // comma seperated list of ids to open
        const userId = urlParams.get('userId') | state.userId;
        const action = urlParams.get('action') | state.action; // create|open
        const folderId = urlParams.get('folderId') | state.folderId; // parent folder, for create only)
        return {
            /** @type {string} */
            ids,
            /** @type {string} */
            userId,
            /** @type {("open"|"create")} */
            action,
            /** @type {string} */
            folderId
        };
    }
}

class AppConfig {
    constructor() {
        this.theme = 'vs-dark'
    }

    getEditorConstructionOptions() {
        return {
            theme: this.theme
        };
    }
}

/**
 * Interface-Class to represent the fileinfo results from gapi
 */
class DriveFileInfo {
    constructor() {
        /** @type {string} */
        this.id = undefined;
        /** @type {string} */
        this.name = undefined;

        // TODO ...
    }
}
// oder nur als typedef
/**
 * @typedef DriveInfoSubInfo
 * @property {string} id
 * @property {string} name
 * @property {Array<string>} parents
 * @property {string} mimeType
 * @property {string} description
 * @property {string} fileExtension
 * @property {string} iconLink
 * @property {string} folderColorRgb
 * @property {number} size
 * @property {object} properties
 */

class FileModel {
    constructor(driveFileInfo, driveFileContent) {
        this.id = driveFileInfo.id;
        this.name = driveFileInfo.name;
        this.mimeType = driveFileInfo.mimeType;
        this.extension = driveFileInfo.fileExtension;
        this.content = driveFileContent;
    }

    // file model überhaupt benutzt, oder direkt mit gapi-fileinfo objekten arbeiten? mappen?
    // TODO ??? methoden hier?
}

