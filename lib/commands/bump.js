"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const simple_git_1 = __importDefault(require("simple-git"));
const parse_1 = __importDefault(require("semver/functions/parse"));
const LOG_TAG = "bump";
const git = (0, simple_git_1.default)();
function bumpVersion(version) {
    const prereleaseName = (version.prerelease && version.prerelease.length > 0) ? version.prerelease[0] : 'dev';
    const prereleaseNumber = (version.prerelease && version.prerelease.length > 1) ? Number.parseInt(version.prerelease[1].toString()) + 1 : 0;
    return `${version.major}.${version.minor}.${version.patch}-${prereleaseName}.${prereleaseNumber}`;
}
function stepBumpVersion() {
    return new Promise((resolve, reject) => {
        console.log(LOG_TAG, '...bumping version');
        (async () => {
            try {
                await git.init();
                const status = await git.status();
                if (status.current == 'master') {
                    const packageJsonFilePath = `${process.cwd()}/package.json`;
                    let packageJson = require(packageJsonFilePath);
                    console.log(LOG_TAG, `Current version: [${packageJson.version}]`);
                    const version = (0, parse_1.default)(packageJson.version);
                    if (version === null) {
                        const error = "No version specified in package.json";
                        console.log(LOG_TAG + '|stempBumpVersion', error);
                        throw new Error(error);
                    }
                    const nextVersion = bumpVersion(version);
                    console.log(LOG_TAG, `Next version: [${nextVersion}]`);
                    packageJson.version = nextVersion;
                    fs_1.default.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    await git.add([`${process.cwd()}/package.json`]);
                }
                else {
                    console.log(LOG_TAG, `Current branch [${status.current}] not 'master' - skipped`);
                }
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Bumping version error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
async function bump() {
    await stepBumpVersion();
    console.log('...Done');
}
exports.default = bump;
