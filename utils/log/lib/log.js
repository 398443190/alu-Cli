'use strict';


const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'success'
log.heading = 'alu:'
log.addLevel('success', 2000, {fg: 'red',bold: true})


module.exports = log;