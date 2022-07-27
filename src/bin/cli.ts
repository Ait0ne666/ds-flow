#!/usr/bin/env node
import * as commands from '../lib/index';

const LOG_TAG = 'DS-FLOW';

// Show usage and exit with code
function help(code: number) {
    console.log(
        LOG_TAG,
        `Usage:
    ds-flow install
    ds-flow release
    ds-flow bump`
    );
    process.exit(code);
}

// Get CLI arguments
const [, , cmd, ...args] = process.argv;

// CLI commands
const cmds: { [key: string]: () => Promise<void> } = {
    install: commands.install,
    release: commands.release,
    bump: commands.bump,
};

(async () => {
    try {
        cmds[cmd] ? await cmds[cmd]() : help(0);
    } catch (error) {
        console.log(LOG_TAG, `CLI error [${error}]`);
        process.exit(1);
    }
})();
