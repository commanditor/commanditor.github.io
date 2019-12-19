# Commanditor

Commanditor is a simple text-editor to edit your files stored on Google Drive™.

The app is based on [Monaco Editor](https://github.com/microsoft/monaco-editor), the beautiful and powerful editor that is part of [Visual Studio Code](https://github.com/Microsoft/vscode).

## Development

# NPM scripts for development

- `npm run dev` to run the development server and watch for file-changes
- `npm run build` to run a new build to the `dist`-directory
- `npm run build-prod` to run a new optimized build to the `dist` directory
- `npm version (major|minor|patch) -m "Bump to version %s"` to update the [packages version](https://docs.npmjs.com/cli/version), create a new build, and deploy it to GitHub Pages

(if building for dev fails, its probably because there is not `src/gapi_consts.dev.js` with client-id and scopes for development. File is part of `.gitignore` as everyone should have their own.)
