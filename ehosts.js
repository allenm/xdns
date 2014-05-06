
"use strict"

var fs = require('fs');
var os = require('os');
var ipaddr = require('ipaddr.js');

var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var defaultHosts = getUserHome() + '/.edns';

var staticHosts = {};
var smartHosts = [];

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function query(host){
    if(staticHosts[host]){
        return staticHosts[host];
    }

    var result = false;
    smartHosts.some(function(item,i){
        if(item[0].test(host)){
            result = item[1];
            return true;
        }else{
            return false;
        }
    })

    return result;
}

function getAllHosts(){
    var all = [];
    Object.keys(staticHosts).forEach(function(item,i){
        all.push(staticHosts[item] + ' '+ item);
    })
    smartHosts.forEach(function(item,i){
        all.push(item[1] + ' ' +item[2]);
    })

    return all;
}

function initWithFile(fpath){

    var fpath = fpath || defaultHosts;

    try{
        var data = fs.readFileSync(fpath,{
            encoding:'utf-8'
        });
        var hostsArr = data.split('\n');
        initWithArr(hostsArr);
    }catch(e){

    }


}

function initWithArr(arr){
    arr.forEach(function(item,i){
        var line = item.trim();
        if(line.length === 0){
            return;
        }
        if(line.charAt(0)==='#'){
            return;
        }
        var params = line.split(' ');
        var ip = params.shift().trim();
        if(/^\$.*\$$/.test(ip)){ // use local ip
            var iname = ip.replace(/\$/g,'');
            var interfaces = os.networkInterfaces();
            var haveFinded = Object.keys(interfaces).some(function(key,i){
                if(key === iname){
                    var network = interfaces[key];
                    return network.some(function(item,i){
                        if(item.family === 'IPv4'){
                            ip = item.address;
                            console.log('replace $'+iname+'$ to '+ ip + ' successful!'.info);
                            return true;
                        }
                    })
                }
            })
            if(!haveFinded){
                console.log('can\'t find out '+iname+'\'s IPv4 address, please check!'.warn);
                return;
            }
        }
        if(!ipaddr.isValid(ip)){
            console.log('parse hosts file error: ', ip + ' is not a valid ip address.'.warn)
            return;
        }
        params.forEach(function(item,i){
            var host = item.trim();
            if(/\*/.test(host)){ // wildcard mode
                var reg = new RegExp('^'+ host.replace(/\./g,'\\.').replace('*','.*') +'$');
                smartHosts.push([reg,ip,host]);
            }else{ // explicit host mode
                staticHosts[host] = ip;
            }
        });
    })
}

exports.initWithFile = initWithFile;
exports.initWithArr = initWithArr;
exports.getAllHosts = getAllHosts;
exports.query = query;