"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = exports.release = exports.bump = void 0;
const bump_1 = __importDefault(require("./commands/bump"));
exports.bump = bump_1.default;
const release_1 = __importDefault(require("./commands/release"));
exports.release = release_1.default;
const install_1 = __importDefault(require("./commands/install"));
exports.install = install_1.default;
