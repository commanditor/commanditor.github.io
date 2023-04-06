// App client id and api key
export const CLIENT_ID = import.meta.env.VITE_GAPI_CLIENT_ID;
//export const API_KEY = '---';

// Array of API discovery doc URLs for APIs
export const DISCOVERY_DOCS = [ 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest' ];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
export const SCOPES = [
    // 'https://www.googleapis.com/auth/drive',
    // 'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.install'
].join(' ');
