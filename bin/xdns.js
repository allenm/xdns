#!/usr/bin/env node

var program = require('commander');
var cdns = require('../index');

program
    .version(require('../package.json').version)
    .option('-f, --file <path>','set cdns config file path. default to ~/.xdns')
    .option('-d, --dns <ip>','remote dns server , default is your network\'s dns')
    .parse(process.argv);


cdns.init(program);
