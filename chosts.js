
"use strict"

var fs = require('fs');
var ipaddr = require('ipaddr.js');

var defaultHosts = getUserHome() + '/.cdns';

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

function init(fpath){

    var fpath = fpath || defaultHosts;

    fs.readFile(fpath,{
        encoding:'utf-8'
    },function(err,data){
        if(err){
            console.error('read cdns hosts file error: ',err);
            return;
        }
        var tmp = data.split('\n');
        tmp.forEach(function(item,i){
            var line = item.trim();
            if(line.length === 0){
                return;
            }
            if(line.charAt(0)==='#'){
                return;
            }
            var params = line.split(' ');
            var ip = params.shift().trim();
            if(!ipaddr.isValid(ip)){
                console.log('parse hosts file error: ', ip + ' is not a valid ip address.')
                return;
            }
            params.forEach(function(item,i){
                var host = item.trim();
                if(/\*/.test(host)){ // wildcard mode
                    var reg = new RegExp('^'+ host.replace(/\./g,'\\.').replace('*','.*') +'$');
                    smartHosts.push([reg,ip]);
                }else{ // explicit host mode
                    staticHosts[host] = ip;
                }
            });

        })
    })

}

exports.init = init;
exports.query = query;