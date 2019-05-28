# Commanditor

Commanditor is a simple text-editor to edit your files stored on Google Drive™.

The app is based on [Monaco Editor](https://github.com/microsoft/monaco-editor), the beautiful and powerful editor that is part of [Visual Studio Code](https://github.com/Microsoft/vscode).

## Development

```
npm install
npm run dev
```

(if building for dev fails, its probably because there is not `src/gapi_consts.dev.js` with client-id and scopes for development. File is part of `.gitignore` as everyone should have their own.)
