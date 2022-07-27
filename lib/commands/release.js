"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const simple_git_1 = __importDefault(require("simple-git"));
const parse_1 = __importDefault(require("semver/functions/parse"));
const LOG_TAG = "release";
const git = (0, simple_git_1.default)();
const g_packageJsonFilePath = `${process.cwd()}/package.json`;
let g_releaseVersion = null;
function bumpReleaseVersion(version) {
    return `${version.major}.${version.minor}.${version.patch}`;
}
function bumpMasterVersion(version) {
    return `${version.major}.${version.minor}.${version.patch + 1}-dev.0`;
}
function stepBumpReleaseVersion() {
    return new Promise((resolve, reject) => {
        console.log(LOG_TAG, '...bumping release version');
        (async () => {
            try {
                await git.init();
                const status = await git.status();
                if (status.current == 'master') {
                    let packageJson = require(g_packageJsonFilePath);
                    console.log(LOG_TAG, `Current version: [${packageJson.version}]`);
                    const version = (0, parse_1.default)(packageJson.version);
                    if (version && version.major == 0) {
                        g_releaseVersion = bumpReleaseVersion(version);
                        console.log(LOG_TAG, `Release version: [${g_releaseVersion}]`);
                        packageJson.version = g_releaseVersion;
                        fs_1.default.writeFileSync(g_packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    }
                    else {
                        throw new Error(`Current version [${packageJson.version}] major more then zero - unsupported`);
                    }
                }
                else {
                    throw new Error(`Current branch [${status.current}] not 'master'`);
                }
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Bumping release version error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepCreateReleaseBranch() {
    return new Promise((resolve, reject) => {
        console.log(LOG_TAG, '...creating release branch');
        (async () => {
            try {
                const releaseBranchName = `release/${g_releaseVersion}`;
                await git.checkout(['-b', releaseBranchName]);
                await git.add([g_packageJsonFilePath]);
                await git.commit(`Release ${g_releaseVersion}`);
                await git.push(['origin', releaseBranchName]);
                await git.checkout('master');
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Creating release branch error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepBumpMasterVersion() {
    return new Promise((resolve, reject) => {
        console.log(LOG_TAG, '...bumping master version');
        (async () => {
            try {
                await git.init();
                const status = await git.status();
                if (status.current == 'master') {
                    let packageJson = require(g_packageJsonFilePath);
                    console.log(LOG_TAG, `Current version: [${packageJson.version}]`);
                    const version = (0, parse_1.default)(packageJson.version);
                    if (version && version.major == 0) {
                        const g_masterVersion = bumpMasterVersion(version);
                        console.log(LOG_TAG, `Master version: [${g_masterVersion}]`);
                        packageJson.version = g_masterVersion;
                        fs_1.default.writeFileSync(g_packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    }
                    else {
                        throw new Error(`Current version [${packageJson.version}] major more then zero - unsupported`);
                    }
                }
                else {
                    throw new Error(`Current branch [${status.current}] not 'master'`);
                }
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Bumping master version error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepCommitPushMaster() {
    return new Promise((resolve, reject) => {
        console.log(LOG_TAG, '...commiting and pushing master');
        (async () => {
            try {
                await git.add([g_packageJsonFilePath]);
                await git.commit(`Bump version`);
                await git.push(['origin', 'master']);
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Commiting and pushing master error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
async function release() {
    await stepBumpReleaseVersion();
    await stepCreateReleaseBranch();
    await stepBumpMasterVersion();
    await stepCommitPushMaster();
    console.log('...Done');
}
exports.default = release;
