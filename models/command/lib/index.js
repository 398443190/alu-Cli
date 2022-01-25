"use strict";
const semver = require("semver");
const LOWEST_NODE_VERSION = "12.0.0";
const colors = require("colors/safe"); //配合npmlog使用  颜色提示信息
const log = require("@alu-cli/log"); // npmlog包

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("argv 参数不能为空");
    }
    if (!Array.isArray(argv)) {
      throw new Error("argv 参数类型必须为数组");
    }
    if (argv.length < 1) {
      throw new Error("参数列表为空");
    }
    // console.log('argv',argv,'argv')
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((e) => {
        log.error(e.message, "eeeee");
      });
    });
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(
          `alu-cli 需要安装等于或者比${lowestVersion}更高的node.js版本...`
        )
      );
    }
  }
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._args = this._argv.slice(0, this._argv.length - 1);
  }
  init() {
    throw new Error("init 必须实现");
  }
  exec() {
    throw new Error("exec 必须实现");
  }
}

module.exports = Command;
