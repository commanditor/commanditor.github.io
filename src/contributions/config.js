import * as monaco from "../monaco";
import {
    EditorAction,
    EditorCommand,
    registerEditorAction,
    registerEditorCommand,
    registerEditorContribution,
} from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import { Disposable } from "monaco-editor/esm/vs/base/common/lifecycle";
import { Emitter } from "monaco-editor/esm/vs/base/common/event";
import { GapiAuthController } from "./gapiAuth";
import { DriveController } from "./drive";

export class ConfigController extends Disposable {
    constructor(
        editor,
        // TODO how to use decorators for original monaco-editor dependency injection?
        instantiationService
    ) {
        super();

        // default config
        // TODO more config variables? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
        // wrap, font-size, minimap, ...?
        this.config = {
            theme: "vs",
        };

        // on init try to load config from local storage, its faster than fetching from drive
        const localStorageConfig = this.local_getAppConfig();
        if (localStorageConfig) this.updateConfig(localStorageConfig, false);

        this.configFileInfo = undefined;

        this._editor = editor;
        this._drive = DriveController.get(this._editor);

        GapiAuthController.get(this._editor).onLoggedInChanged((b) =>
            this.handleLoggedInChange(b)
        );
    }

    handleLoggedInChange(b) {
        if (!b) return;

        // on login get values from drive
        this.drive_getOrCreateAppConfig().then((config) => {
            console.log("loaded config", config);
            this.updateConfig(config, false);
            // update locally saved config
            this.local_saveAppConfig();
        });
    }

    updateConfig(config, saveChanges = true) {
        const unhandled = [];
        for (var key of Object.keys(config)) {
            if (!this._internal_updateConfigValueInternal(key, config[key]))
                unhandled.push({ key, value: config[key] });
        }

        if (saveChanges) {
            this.drive_saveAppConfig();
            this.local_saveAppConfig();
        }

        if (unhandled.length > 0) {
            console.warn(
                "config contained invalid values. they have been ignored",
                unhandled
            );
        }
    }

    updateConfigValue(key, value, saveChanges = true) {
        const updateSuccess = this._internal_updateConfigValueInternal(
            key,
            value
        );
        if (updateSuccess && saveChanges) {
            this.drive_saveAppConfig();
            this.local_saveAppConfig();
        }
        return updateSuccess;
    }

    _internal_updateConfigValueInternal(key, value) {
        if (this.validateConfigPart(key, value)) {
            switch (key) {
                case "theme":
                    this.config.theme = value;
                    monaco.editor.setTheme(value);
                    return true;
                default:
                    console.error(
                        "tried to update config value without handling updating it"
                    );
                    return false;
            }
        } else {
            console.error(
                "config update ignored. supplied key and value would result in invalid config.",
                key,
                value
            );
            return false;
        }
    }

    validateConfigPart(key, value) {
        switch (key) {
            case "theme":
                return (
                    value === "vs" ||
                    value === "vs-dark" ||
                    value === "hc-light" ||
                    value === "hc-black"
                );
            default:
                return false;
        }
    }

    drive_getOrCreateAppConfig() {
        return this._drive.getAppConfigFileInfo().then((configFileInfo) => {
            if (configFileInfo) {
                // config file found, get content and return
                this.configFileInfo = configFileInfo;
                console.log("config available in drive");
                return this._drive
                    .getFileContent(configFileInfo.id)
                    .then((content) => JSON.parse(content));
            } else {
                // no file found, create and save default config to drive and return defaults
                console.log("config in drive unavailable, will create one");
                return this._drive
                    .createEmptyAppConfigFile()
                    .then((newConfigFileInfo) => {
                        this.configFileInfo = newConfigFileInfo;
                        return this.drive_saveAppConfig();
                    })
                    .then((response) => this.config);
            }
        });
    }

    drive_saveAppConfig() {
        if (!this.configFileInfo) return;

        console.log("will now upload config to drive", this.config);
        return this._drive
            .uploadSimple(this.configFileInfo.id, JSON.stringify(this.config))
            .then((response) => console.log("config saved to drive."));
    }

    local_getAppConfig() {
        return JSON.parse(localStorage.getItem("commanditor.config"));
    }

    local_saveAppConfig() {
        localStorage.setItem("commanditor.config", JSON.stringify(this.config));
    }

    getId() {
        return ConfigController.ID;
    }
}

// TODO how to babel class properties
ConfigController.ID = "commanditor.contrib.ConfigController";
/**
 * @returns {ConfigController} the controller
 */
ConfigController.get = (editor) => {
    return editor.getContribution(ConfigController.ID);
};

registerEditorContribution(
    ConfigController.ID,
    ConfigController,
    0 /* EditorContributionInstantiation.Eager */
);
