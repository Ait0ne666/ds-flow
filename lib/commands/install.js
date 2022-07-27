"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const fs_1 = __importDefault(require("fs"));
function runCmd(cmd, args) {
    return new Promise((resolve, reject) => {
        try {
            let finished = false;
            let child = (0, cross_spawn_1.default)(cmd, args, {
                stdio: 'inherit',
                shell: false,
            });
            child.on('exit', (code) => {
                if (!finished) {
                    finished = true;
                    if (code != 0)
                        reject(new Error(`${cmd} exit code [${code}]`));
                    else
                        resolve();
                }
            });
            child.on('error', (error) => {
                if (!finished) {
                    finished = true;
                    reject(error);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function stepInstallHusky() {
    return new Promise((resolve, reject) => {
        console.log('...install Husky');
        (async () => {
            try {
                await runCmd('npm', ['install', 'husky', '--save-dev']);
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Installing Husky error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepInitializeHusky() {
    return new Promise((resolve, reject) => {
        console.log('...initialize Husky');
        (async () => {
            try {
                await runCmd('npx', ['husky', 'install']);
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Initializing Husky error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepAddPostMergeHook() {
    return new Promise((resolve, reject) => {
        console.log('...adding post-merge hook');
        (async () => {
            try {
                await runCmd('npx', ['husky', 'add', '.husky/post-merge', '"npm run post-merge^"']);
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Adding post-merge hook error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
function stepAddScripts() {
    return new Promise((resolve, reject) => {
        console.log('...adding scripts');
        (async () => {
            try {
                const packageJsonFilePath = `${process.cwd()}/package.json`;
                let packageJson = require(packageJsonFilePath);
                packageJson.scripts['prepare'] = 'husky install';
                fs_1.default.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));
                resolve();
            }
            catch (error) {
                const lerror = new Error(`Adding scripts error [${error}]`);
                reject(lerror);
            }
        })();
    });
}
async function install() {
    await stepInstallHusky();
    await stepInitializeHusky();
    await stepAddPostMergeHook();
    await stepAddScripts();
    console.log('...Done');
}
exports.default = install;
