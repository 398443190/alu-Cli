'use strict';


// function init(projectName,options,cmdObj) {
//     // TODO
//     console.log('init', projectName, process.env.CLI_TARGET_PATH, options.force, cmdObj.parent._optionValues.debug)
//     // console.log('init', projectName)
//     // console.log('init', projectName,options,cmdObj)
// }

const log = require("@alu-cli/log"); // npmlog包
const Command = require('@alu-cli/command')
const fs = require('fs');
const fse = require('fs-extra')
const inquirer = require('inquirer');
const semver = require('semver');

const getProjectTemplate = require('./getProjectTemplate')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENTS = 'components'


function init(argv) {
    return new InitCommand(argv)
}
class InitCommand extends Command {
    init() {
        // 第一项为name 第二项为option 第三项为cmd
        this.projectName = this._argv[0] || null
        this.force = !!this._argv[1].force,
            log.verbose('this.projectName:', this.projectName)
        log.verbose('this.force:', this.force)
    }
    async exec() {
        // console.log(3333)
        try {
            // 1.准备阶段
            const projectInfo = await this.prepare()
            // 2.下载模版
            if (projectInfo) {
                log.verbose('projectInfo:', projectInfo)
                this.projectInfo = projectInfo;
                this.downLoadTemplate()
            }
            // 3.安装模版
        } catch (e) {
            log.error(e.message, 'e')
        }
    }
    async prepare() {
        // 0.判断一下项目模板存在与否
        const template = await getProjectTemplate();
        if (!template || template.length === 0) {
            throw new Error('项目模板不能为空！')
        }
        this.template = template;
        // 1.判断当前目录是否为空
        const localPath = process.cwd() // 拿到当前文件夹的路径
        if (!this.isDirEmpty(localPath)) { // 如果当前目录不为空
            let ifContinue = false;

            // 2.是否启动强制更新
            if (!this.force) { // 如果force位fasle
                ifContinue = (await inquirer
                    .prompt([
                        /* Pass your questions in here */
                        {
                            type: 'confirm',
                            name: 'ifContinue',
                            message: '当前文件夹不为空，还需要继续创建项目么？',
                            default: false
                        }
                        /* Pass your questions in here */
                    ])).ifContinue

                if (!ifContinue) { // 用户选择不创建  直接终止流程
                    console.log(localPath, 'localPath')
                    return;
                }
            }
            if (ifContinue || this.force) {
                // 清空操作很危险，做二次确认提醒
                const { confirmDelete } = await inquirer.prompt(
                    {
                        type: 'confirm',
                        name: 'confirmDelete',
                        message: '是否确认清空当前目录下的文件？',
                        default: false
                    })
                if (confirmDelete) {
                    console.log(localPath, 'localPath')
                    fse.emptyDirSync(localPath) // 执行清空操作
                } else {
                    console.log('先不强制更新')
                }
                // 启动强制更新，清空该目录
            }
        }
        return this.getProjectInfo()
    }

    // 获取项目基本信息
    async getProjectInfo() {
        // 3.选择创建项目或组建
        let projectInfo = {}
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [{
                name: '项目',
                value: TYPE_PROJECT
            }, {
                name: '组件',
                value: TYPE_COMPONENTS
            }]
        })
        log.verbose('type', type)
        if (type === TYPE_PROJECT) {
            // 获取项目基本信息
            const project = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    validate: function (value) {
                        // 要求输入的首字符必须为英文字符
                        // 尾字符必须为英文或数字，不能为字符
                        // 字符仅允许 "-_", 
                        // return typeof value === 'string'
                        return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z]*|[a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(value)
                    },
                    filter: function (value) {
                        return value
                    }
                },
                {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '1.0.0',
                    validate: function (value) {
                        return !!semver.valid(value)
                    },
                    filter: function (value) {
                        if (!!semver.valid(value)) {
                            return semver.valid(value)
                        } else {
                            return value
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'projectTemplate',
                    message: '请选择项目模版',
                    choices: this.createTemplateChoices()
                }
            ])
            projectInfo = {
                type,
                ...project
            }
        } else if (type === TYPE_COMPONENTS) {

        }
        return projectInfo
        // 4.获取项目的基本架构
    }


    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath) // 拿到当前文件夹下面的文件
        fileList = fileList.filter(file => ( // 文件过滤
            !file.startsWith('.') && ['node_modules'].indexOf(file) < 0)
        )
        return !fileList || fileList.length <= 0
    }
    createTemplateChoices() {
        return this.template.map(item => ({
            value: item.npmName,
            name: item.name
        }))
    }
    downLoadTemplate() {
        console.log(this.projectInfo, 'projectInfo')
        console.log(this.template, 'template')
        // 1通过项目模版api 获取项目模版信息
        // 1.1通过egg.js搭建一套后端系统
        // 1.2通过npm存储项目模版
        // 1.3将项目模板信息存储到mongodb数据库中
        // 1.4通过egg.js获取mongodb中的数据并且通过api返回
    }
}

module.exports = init
module.exports.InitCommand = InitCommand