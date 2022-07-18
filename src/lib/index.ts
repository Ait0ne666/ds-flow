import "@darksun/logger"
import bump from './commands/bump'
import release from './commands/release'

import {LoggerConsoleOutput} from '@darksun/logger-console-output'
log.registerOutput(new LoggerConsoleOutput());

export {bump, release}