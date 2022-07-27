

import fs from 'fs'
import simpleGit from 'simple-git'
import semverParse from 'semver/functions/parse'
import { SemVer } from 'semver';

const LOG_TAG = "bump"


const git = simpleGit()


function bumpVersion(version: SemVer) {
    const prereleaseName = (version.prerelease && version.prerelease.length > 0) ? version.prerelease[0] : 'dev';
    const prereleaseNumber = (version.prerelease && version.prerelease.length > 1) ? Number.parseInt(version.prerelease[1].toString()) + 1 : 0;
    return `${version.major}.${version.minor}.${version.patch}-${prereleaseName}.${prereleaseNumber}`;
}

function stepBumpVersion(): Promise<void> {
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
                    const version = semverParse(packageJson.version);

                    if (version === null) {
                        const error = "No version specified in package.json"
                        console.log(LOG_TAG + '|stempBumpVersion', error)
                        throw new Error(error)
                    }

                    const nextVersion = bumpVersion(version);
                    console.log(LOG_TAG, `Next version: [${nextVersion}]`);
                    packageJson.version = nextVersion;
                    fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                    await git.add([`${process.cwd()}/package.json`]);
                } else {
                    console.log(LOG_TAG, `Current branch [${status.current}] not 'master' - skipped`);
                }
                resolve();
            } catch (error) {
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




export default bump