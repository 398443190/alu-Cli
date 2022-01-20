'use strict';

module.exports = core;

// require 支持 .js .json .node
// .js module.exports /exports
// .json JSON.prase
// .node  c++ 插件  使用process.dlopen打开
// any =》 .js
const pkg = require('../package.json') // 拿到 package.json 信息
const constant = require('./const') // 存node最低的版本数据
const semver = require('semver')  //版本对比的包 查询node最低的版本支持
const colors = require('colors/safe')//配合npmlog使用  颜色提示信息
const userHome = require('user-home') // 查询用户主目录
const pathExists = require('path-exists') //
const log = require('@alu-cli/log'); // npmlog包
const path = require('path');

let args, config;

async function core() {
    // TODO
    try {
        checkVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputsArgument()
        checkEnv()
        await checkGlobalUpdate()
        registerCommand()
    } catch (e) {
        log.error(e.message)
    }
}


// 完成命令注册
function registerCommand(){ 
    
 }

// 输入当前版本号
function checkVersion() {
    log.info('cli', pkg.version)
}

// 检查node最低版本号
function checkNodeVersion() {
    // 第一步 获取当前node版本
    const currentVersion = process.version
    // 第二步，比对最低版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`alu-cli 需要安装等于或者比${lowestVersion}更高的版本...`))
    }
}

//检查root账户
function checkRoot() {
    // console.log(process.geteuid())
    const rootCheck = require('root-check')
    rootCheck()
    // console.log(process.geteuid())
}

// 查询用户住目录
function checkUserHome() {
    // console.log(userHome, 'userHome')
    // console.log(pathExists(userHome), 'pathExists(userHome)')
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red(`当前登录用户主目录不存在`))
    }
}

// 检查入参
function checkInputsArgument() {
    const minimist = require('minimist')
    args = minimist(process.argv.slice(2))
    checkArgs()
}


// 检查参数 --debug 模式开发
function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

// 检查环境变量  env
function checkEnv() {
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome, '.env')
    if (pathExists(dotenvPath)) {
        config = dotenv.config({
            path: dotenvPath
        })
    }
    createDefaultConfig()
    log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

//设置默认配置

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig['cliHome']
}


//检查全局的依赖更新
async function checkGlobalUpdate() {
    // 第一步 获取当前版本号以及模块名
    const npmName = pkg.name
    const currentVersion = pkg.version
    // 第二步 调用npm api 获取所有版本号
    const { getNpmSemverVersions } = require('@alu-cli/get-npm-info')
    const lastVersion = await getNpmSemverVersions(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn('更新提示：', colors.yellow(`请手动更新${npmName},当前版本: ${currentVersion},最新版本:${lastVersion},更新命令: npm install -g ${npmName}`))

    }
    console.log(npmName, 'npmName')
    console.log(lastVersion, 'lastVersion')
    console.log(currentVersion, 'currentVersion')
    // 第三步 提取所有版本号比对哪些版本号是大于当前版本号
    // 第四步 获取最新的版本号，提示用户更新到该版本号
}