import spawn from 'cross-spawn'
import fs from 'fs'

function runCmd(cmd: string, args: readonly string[] | undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            let finished = false;
            let child = spawn(cmd, args, {
                stdio: 'inherit',
                shell: false,
            });

            child.on('exit', (code) => {
                if (!finished) {
                    finished = true;
                    if (code != 0) reject(new Error(`${cmd} exit code [${code}]`));
                    else resolve();
                }
            });
            child.on('error', (error) => {
                if (!finished) {
                    finished = true;
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function stepInstallHusky(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('...install Husky');
        (async () => {
            try {
                await runCmd('npm', ['install', 'husky', '--save-dev']);
                resolve();
            } catch (error) {
                const lerror = new Error(`Installing Husky error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepInitializeHusky(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('...initialize Husky');
        (async () => {
            try {
                await runCmd('npx', ['husky', 'install']);
                resolve();
            } catch (error) {
                const lerror = new Error(`Initializing Husky error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepAddPostMergeHook(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('...adding post-merge hook');
        (async () => {
            try {
                await runCmd('npx', ['husky', 'add', '.husky/post-merge', '^"npm run post-merge^"']);
                resolve();
            } catch (error) {
                const lerror = new Error(`Adding post-merge hook error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

function stepAddScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('...adding scripts');
        (async () => {
            try {
                const packageJsonFilePath = `${process.cwd()}/package.json`;
                let packageJson = require(packageJsonFilePath);
                packageJson.scripts['pre-commit'] = 'tp-flow bump';
                packageJson.scripts['release'] = 'tp-flow release';
                packageJson.scripts['prepare'] = 'husky install';
                fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                resolve();
            } catch (error) {
                const lerror = new Error(`Adding scripts error [${error}]`);
                reject(lerror);
            }
        })();
    });
}

 async function  install() {
    await stepInstallHusky();
    await stepInitializeHusky();
    await stepAddPostMergeHook();
    await stepAddScripts();
    console.log('...Done');
}


export default install