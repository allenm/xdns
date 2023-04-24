#!/usr/bin/env node

var program = require('commander');
var xnds = require('../index');

program
    .version(require('../package.json').version)
    .option('-f, --file <path>','set cdns config file path. default to ~/.xdns')
    .option('-d, --dns <ip>','remote dns server , default is your network\'s dns')
    .parse(process.argv);

xnds.init(program.opts());
