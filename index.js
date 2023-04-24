
"use strict"

var dns = require('native-dns');
var ipaddr = require('ipaddr.js');
var path = require('path');
var fs = require('fs');

require('./customcolors');


var listenPort = 53;

var tcpServer = dns.createTCPServer();
var server = dns.createServer();
var remoteDns = '8.8.8.8';

var hosts = require('./hosts');

var onMessage = function(request,response){

    var name = request.question[0].name;
    var type = request.question[0].type;

    var localMatch = hosts.query(name);
    if(type ===1 && localMatch){ // type === 1 表明是 A 记录
        console.log('>>'.info + 'local matched, resolve '+ name + ' to '+ localMatch);
        response.answer.push(dns.A({
            name: name,
            address: localMatch,
            ttl: 600
        }))
        response.send();
    }else{
        var question = dns.Question({
            name: name,
            type: type
        });

        var handleAnswer = function(answers){
            answers.forEach(function(item){
                response.answer = response.answer.concat(item.answer);
                response.additional = response.additional.concat(item.additional);
            })
            response.send();
        }

        queryByProtocol(question,'udp',function(err,answers){
            if(err){
                queryByProtocol(question,'tcp',function(err,answers){
                    if(err){
                        console.log('>>'.warn + ' can\'t resolve '+name);
                    }else{
                        handleAnswer(answers);
                    }
                })
            }else{
                handleAnswer(answers);
            }
        });
    }

}

function queryByProtocol(question,protocol,callback){
    var req = dns.Request({
        question: question,
        server:{address: remoteDns, port: 53, type: protocol},
        timeout: 3000
    });


    req.on('timeout', function () {
    });

    var answers = [];
    req.on('message', function (err, answer) {
        if(err){
            return;
        }
        answers.push(answer);
    });

    req.on('end', function () {
        if(answers.length > 0){
            callback(null,answers);
        }else{
            callback(new Error('no result'),null);
        }
    });

    req.send();
}

var onError = function(err,buff,req,res){
    console.log(err.stack);
}

var onUDPListening = function(){
    console.log('UDP server listening on'.info, this.address());
}

var onTCPListening = function(){
    console.log('TCP server listening on'.info, this.address());
}


var onSocketError = function(err,socket){
    console.log(err);
}

var onClose = function(){
    console.log('server closed', this.address());
}

server.on('request',onMessage);
server.on('error',onError);
server.on('listening',onUDPListening);
server.on('socketError',onSocketError);
server.on('close',onClose);

tcpServer.on('request',onMessage);
tcpServer.on('error',onError);
tcpServer.on('listening',onTCPListening);
tcpServer.on('socketError',onSocketError);
tcpServer.on('close',onClose);

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

exports.init = function(config){

    var hostsArr = config.hostsArr || [];
    if(config.dns){
        if(!ipaddr.isValid(config.dns)){
            var log = config.dns + ' is not a valid ip address'
            console.error(log.error);
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
            console.log('Get current network\'s DNS failure'.warn);
        }
    }
    var log = 'The remote dns is : ' + remoteDns
    console.log(log.info);

    const hostsFile = config.file ? path.resolve(config.file) : path.resolve(getUserHome(), '.xdns');

    console.log(`use config file: ${hostsFile}`.info)

    hosts.initWithFile(hostsFile);
    hostsArr && hosts.initWithArr(hostsArr);

    var allHosts = hosts.getAllHosts();
    console.log('-------------------');
    if(allHosts.length>0){
        console.log('The hosts list you config is: '.info);
        allHosts.forEach(function(item){
            console.log(item);
        })
        console.log('-------------------');
    }else{
        console.log('You havn\'t bind any hosts yet!'.warn)
    }



    server.serve(listenPort);
    tcpServer.serve(listenPort);
}

