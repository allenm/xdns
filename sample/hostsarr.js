
'use strict'

var edns = require('../index');

var hostsArr = [
    '127.0.0.1 xx.cdn.cn yy.cdn.cn',
    '127.0.0.1 *.cdn.com',
    '$en0$ www.baidu.com'
]

edns.init({
    hostsArr:hostsArr,
    dns:'8.8.8.8'
})