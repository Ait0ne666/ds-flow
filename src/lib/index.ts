import "@darksun/logger"
import bump from './commands/bump'
import release from './commands/release'
import install from './commands/install'

import {LoggerConsoleOutput} from '@darksun/logger-console-output'
log.registerOutput(new LoggerConsoleOutput());

export {bump, release, install}