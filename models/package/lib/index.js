'use strict';

const path = require('path');

const fse = require('fs-extra')
const { isObject } = require('@alu-cli/utils');

const formatPath = require('@alu-cli/format-path');
const pkgDir = require('pkg-dir').sync
const npmInstall = require('npminstall')
const { getDefaultRegistry, getNpmLatestVersion } = require('@alu-cli/get-npm-info')
const pathExists = require('path-exists').sync; //



class Package {
    constructor(options) {
        if (!options) {
            throw new Error('option 参数不能为空')
        }
        if (!isObject(options)) {

            throw new Error('option 参数类型必须为object')
        }
        // package 路径
        this.targetPath = options.targetPath;
        // //  package 的缓存存储路径
        this.storeDir = options.storeDir;
        // package 的名称
        this.packageName = options.packageName;
        //  package版本
        this.packageVersion = options.packageVersion;
        //

        // package缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')
    }

    // 获取缓存的路径
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }


    getSpeciCacheFilePath(packageVersion) { // 获取指定版本的文件路径
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
    }
    async prepare() {
        console.log('不是缓存模式')
        if (this.storeDir && !pathExists(this.storeDir)) {
            await fse.mkdirpSync(this.storeDir)
            console.log(222)
        }

        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }

    // 判断当前包是否存在
    async exists() {
        if (this.storeDir) {
            //说明是没有传targetPath  缓存模式
            await this.prepare()
            console.log(this.cacheFilePath, 'pathExists(this.cacheFilePath)')
            return pathExists(this.cacheFilePath)
        } else {
            // 说明传了
            console.log(pathExists(this.targetPath), 'pathExists(this.targetPath)')
            return pathExists(this.targetPath)
        }
    }

    // 安装package
    async install() {
        return npmInstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                {
                    name: this.packageName,
                    version: this.packageVersion
                },
            ],
        })
    }

    // 更新
    async update() {

        await this.prepare()
        console.log('--进入到更新环节--')
        // 1.获取最新的npm模块版本号
        const latestPkgVersion = await getNpmLatestVersion(this.packageName)
        // 2.查询最新版本号对应的路径是否存在
        const latestFilePath = this.getSpeciCacheFilePath(latestPkgVersion)
        // 3.如果不存在，则直接安装最新版本
        if (!pathExists(latestFilePath)) {
            await npmInstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [
                    {
                        name: this.packageName,
                        version: latestPkgVersion
                    }
                ]
            })
            this.packageVersion = latestPkgVersion;
        }

    }

    // 获取入口文件的路径
    getRootFilePath() {
        function _getRootFile(argTargetPath) {
            // 通过pkg-dir来获取package.json的目录
            const dir = pkgDir(argTargetPath)
            // console.log('dir', dir, 'dir')
            if (dir) {
                const pkgFile = require(path.resolve(dir, 'package.json'))
                // 寻找main.js
                if (pkgFile && pkgFile.main) {
                    //  兼容windosw 和macOs 路径格式
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
            return null
        }

        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath)
        } else {
            return _getRootFile(this.targetPath)
        }
    }
}

module.exports = Package;