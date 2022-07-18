import fs from 'fs'
import simpleGit from 'simple-git'
import semverParse from 'semver/functions/parse'
import { SemVer } from 'semver';


const LOG_TAG = "release"


const git = simpleGit()


const g_packageJsonFilePath = `${process.cwd()}/package.json`;
let g_releaseVersion: string | null = null;

function bumpReleaseVersion(version: SemVer) {
    return `${version.major}.${version.minor}.${version.patch}`;
}

function bumpMasterVersion(version: SemVer) {
    return `${version.major}.${version.minor}.${version.patch + 1}-dev.0`;
}

function stepBumpReleaseVersion(): Promise<void> {
    return new Promise((resolve, reject) => {
        log.info(LOG_TAG, '...bumping release version');
        (async () => {
            try {
                await git.init();
                const status = await git.status();
                if (status.current == 'master') {
                    let packageJson = require(g_packageJsonFilePath);
                    log.info(LOG_TAG, `Current version: [${packageJson.version}]`);
                    const version = semverParse(packageJson.version);
                    if (version && version.major == 0) {
                        g_releaseVersion = bumpReleaseVersion(version);
                        log.info(LOG_TAG, `Release version: [${g_releaseVersion}]`);
                        packageJson.version = g_releaseVersion;
                        fs.writeFileSync(g_packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    } else {
                        throw new Error(`Current version [${packageJson.version}] major more then zero - unsupported`)
                    }
                } else {
                    throw new Error(`Current branch [${status.current}] not 'master'`)
                }
                resolve();
            } catch (error) {
                const lerror = new Error(`Bumping release version error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepCreateReleaseBranch(): Promise<void> {
    return new Promise((resolve, reject) => {
        log.info(LOG_TAG, '...creating release branch');
        (async () => {
            try {
                const releaseBranchName = `release/${g_releaseVersion}`;
                await git.checkout(['-b', releaseBranchName]);
                await git.add([g_packageJsonFilePath]);
                await git.commit(`Release ${g_releaseVersion}`);
                await git.push(['origin', releaseBranchName]);
                await git.checkout('master');
                resolve();
            } catch (error) {
                const lerror = new Error(`Creating release branch error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepBumpMasterVersion(): Promise<void> {
    return new Promise((resolve, reject) => {
        log.info(LOG_TAG, '...bumping master version');
        (async () => {
            try {
                await git.init();
                const status = await git.status();
                if (status.current == 'master') {
                    let packageJson = require(g_packageJsonFilePath);
                    log.info(LOG_TAG, `Current version: [${packageJson.version}]`);
                    const version = semverParse(packageJson.version);
                    if (version && version.major == 0) {
                        const g_masterVersion = bumpMasterVersion(version);
                        log.info(LOG_TAG, `Master version: [${g_masterVersion}]`);
                        packageJson.version = g_masterVersion;
                        fs.writeFileSync(g_packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    } else {
                        throw new Error(`Current version [${packageJson.version}] major more then zero - unsupported`)
                    }
                } else {
                    throw new Error(`Current branch [${status.current}] not 'master'`)
                }
                resolve();
            } catch (error) {
                const lerror = new Error(`Bumping master version error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepCommitPushMaster(): Promise<void> {
    return new Promise((resolve, reject) => {
        log.info(LOG_TAG, '...commiting and pushing master');
        (async () => {
            try {
                await git.add([g_packageJsonFilePath]);
                await git.commit(`Bump version`);
                await git.push(['origin', 'master']);
                resolve();
            } catch (error) {
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



export default release