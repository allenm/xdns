
"use strict"

var dns = require('native-dns');
var ipaddr = require('ipaddr.js');
var path = require('path');
var fs = require('fs');

var listenPort = 53;

var tcpServer = dns.createTCPServer();
var server = dns.createServer();
var remoteDns = '8.8.8.8';

var chosts = require('./chosts');

var onMessage = function(request,response){


    var name = request.question[0].name;

    var localMatch = chosts.query(name);
    if(localMatch){
        console.log('local matched, resolve '+ name + ' to '+ localMatch);
        response.answer.push(dns.A({
            name: name,
            address: localMatch,
            ttl: 600
        }))
        response.send();
    }else{
        var question = dns.Question({
            name: name,
            type: 'A'
        });
        var req = dns.Request({
            question: question,
            server:{address: remoteDns, port: 53, type: 'udp'},
            timeout: 1000
        });

        req.on('timeout', function () {
            console.log('Timeout in making request for: ', name);
        });

        req.on('message', function (err, answer) {
            answer.answer.forEach(function (a) {
                if(a.address){
                    response.answer.push(dns.A({
                        name: name,
                        address: a.address,
                        ttl: 600
                    }));
                    return true;
                }
            });
        });

        req.on('end', function () {
            response.send();
        });

        req.send();
    }

}

var onError = function(err,buff,req,res){
    console.log(err.stack);
}

var onListening = function(){
    console.log('server listening on', this.address());
}

var onSocketError = function(err,socket){
    console.log(err);
}

var onClose = function(){
    console.log('server closed', this.address());
}

server.on('request',onMessage);
server.on('error',onError);
server.on('listening',onListening);
server.on('socketError',onSocketError);
server.on('close',onClose);

tcpServer.on('request',onMessage);
tcpServer.on('error',onError);
tcpServer.on('listening',onListening);
tcpServer.on('socketError',onSocketError);
tcpServer.on('close',onClose);

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

exports.init = function(config){

    var hostsFile = '';
    if(config.dns){
        if(!ipaddr.isVaid(config.dns)){
            console.error( config.dns + ' is not a valid ip address');
            return;
        }
        remoteDns = config.dns;
    }else{
        try{
            var data = fs.readFileSync('/etc/resolv.conf',{
                encoding:'utf-8'
            })
            data = data.split('\n');
            data.some(function(item,i){
                var line = item.trim();
                if(line.length===0 || line.charAt(0) === '#'){
                    return false;
                }
                var tmp = line.split(' ');
                if(tmp[0] === 'nameserver'){
                    remoteDns = tmp[1];
                    return true;
                }
            })
        }catch(e){
            console.warn('Get current network\'s DNS failure');
        }
    }
    console.log('The remote dns is : ' + remoteDns);

    if(config.file){
        hostsFile = config.file.replace(/^~\//,getUserHome());
        hostsFile = path.resolve(hostsFile);
    }

    chosts.init(hostsFile);
    server.serve(listenPort);
    tcpServer.serve(listenPort);
}

