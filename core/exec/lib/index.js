'use strict';



const Package = require("@alu-cli/package")//我在桌面下
const log = require('@alu-cli/log'); // npmlog包
const path = require('path')
const cp = require('child_process')// 引用node子进程库

const SETTINGS = {
    init: '@imooc-cli/init'
}
const CACHE_DIR = 'dependence';

async function exec() {

    let storeDir, pkg; // 初始化一个缓存目录和pkg文件
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH

    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    if (!targetPath) {
        // 没有传targetPath 会进入这里
        targetPath = path.resolve(homePath, CACHE_DIR)
        storeDir = path.resolve(targetPath, 'node_modules')
        log.verbose(targetPath, '传过去的targetoath')
        log.verbose(storeDir, '传过去的storeDir')
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if (await pkg.exists()) {
            // 更新package
            console.log('更新一下')
            await pkg.update()
        } else {
            // 下载package
            await pkg.install()
        }
    } else { // 传了targetPath 会进入这里
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    const rootFile = pkg.getRootFilePath()
    // console.log(rootFile, 'rootFile')
    if (rootFile) {
        try {
            // // 在当前进程中调用
            // require(rootFile).call(null, Array.from(arguments))

            //在子进程中调用
            const args = Array.from(arguments)
            const cmd = args[args.length - 1]
            const o = Object.create(null)
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                    o[key] = cmd[key]
                }
            })
            args[args.length - 1] = o
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
            const child = customSpawn('node', ['-e', code], { // 兼容win  自定义spawn方法
                cwd: process.cwd(),
                stdio: 'inherit'
            })
            child.on('error', e => {
                log.verbose('eeee:', e.message)
                process.exit(1)
            })
            child.on('exit', e => {
                log.verbose('命令执行成功exit:', e)
                process.exit(e)
            })
        } catch (e) {
            log.error(e.message)
        }
        // 在node 子进程中调用

    }
    function customSpawn(command, args, options) {
        const win32 = process.platform === 'win32'
        const cmd = win32 ? 'cmd' : command;
        const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
        console.log(process.platform,'process.platformprocess.platform')
        return cp.spawn(cmd,cmdArgs,options || {})
    }
}




module.exports = exec;