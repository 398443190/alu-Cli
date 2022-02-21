const request = require('@alu-cli/request')

module.exports = function () {
    return request({
        url: '/project/template',
        // url: ''
    })
}