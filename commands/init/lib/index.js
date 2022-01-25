'use strict';


// function init(projectName,options,cmdObj) {
//     // TODO
//     console.log('init', projectName, process.env.CLI_TARGET_PATH, options.force, cmdObj.parent._optionValues.debug)
//     // console.log('init', projectName)
//     // console.log('init', projectName,options,cmdObj)
// }

const log = require("@alu-cli/log"); // npmlog包
const Command = require('@alu-cli/command')



function init(argv) {
    return new InitCommand(argv)
}
class InitCommand extends Command {
    init() {
        // 第一项为name 第二项为option 第三项为cmd
        this.projectName = this._argv[0] || null
        this.force = !!this._argv[1].force,
        log.verbose('this.projectName:',this.projectName)
        log.verbose('this.force:',this.force)
    }
    exec() {
        // console.log(3333)
    }
}

module.exports = init
module.exports.InitCommand = InitCommand