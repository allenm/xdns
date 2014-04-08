
'use strict'

var edns = require('../index');

var hostsArr = [
    '127.0.0.1 www.baidu.com',
    '127.0.0.1 xx.cdn.cn yy.cdn.cn',
    '127.0.0.1 *.cdn.com'
]

edns.init({
    hostsArr:hostsArr
})