/**
 * Utilities
 */
export function getUrlState() {
    // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    // https://developers.google.com/drive/api/v3/enable-sdk#drive_integration
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams) return null;

    const state = JSON.parse(urlParams.get("state"));
    if (!state) return null;

    return {
        /** @type {string[]} */
        ids: state.ids,
        /** @type {string} */
        userId: state.userId,
        /** @type {("open"|"create")} */
        action: state.action,
        /** @type {string} */
        folderId: state.folderId,
    };
}

/**
 * tries to get the monaco-language for a filename
 * @param {string} fileName the file name
 * @returns {string} the monaco language id, or NULL if not supported (set plaintext as fallback if needed)
 */
export function getMonacoLanguageForFilename(fileName) {
    const monacoLanguages = self.monaco.languages.getLanguages();
    const matches = monacoLanguages.filter((lang) =>
        lang.extensions.some((ext) => fileName.endsWith(ext))
    );
    if (matches.length > 0)
        // every extension only appears for one language
        return matches[0];
    return null;
}

/**
 * tries to determine from the filename, if a filetype is supported.
 * @param {string} fileName the file name
 * @returns {boolean} filetype supported
 */
export function monacoLanguageSupportedForFilename(fileName) {
    return !!getMonacoLanguageForFilename(fileName);
}

class AppConfig {
    constructor() {
        this.theme = "vs-dark";
    }

    getEditorConstructionOptions() {
        return {
            theme: this.theme,
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
