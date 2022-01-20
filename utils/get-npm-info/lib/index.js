'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')
function getNpmInfo(npmName, registryVersion) {
    // TODO
    if (!npmName) {
        return null
    }
    const registry = registryVersion || getDefaultRegistry()

    const npmInfoUrl = urlJoin(registry, npmName)
    return axios.get(npmInfoUrl).then(res => {
        if (res.status === 200) {
            return res.data
        } else {
            return null
        }
    }).catch((e) => {
        Promise.reject(e)
    })

}
function getDefaultRegistry(isOrigin) {
    return isOrigin ? "https://registry.npmjs.org" : "https://registry.npm.taobao.org"
}

async function getNpmVersions(npmName, registryVersion) {
    const data = await getNpmInfo(npmName, registryVersion)
    if (data) {
        return Object.keys(data.versions)
    } else return []
}


function getSemverVersions(baseVersion, versions) {
    return versions.filter(item =>
        semver.satisfies(item, `${baseVersion}`)).sort((a, b) =>
            semver.gt(b, a))
}
async function getNpmSemverVersions(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)
    if (newVersions && newVersions.length>0) {
        return newVersions[0]
    } else {
        return []
    }
}
module.exports = {
    getNpmInfo,
    getNpmVersions,
    getSemverVersions,
    getNpmSemverVersions
};