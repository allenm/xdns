
## XDNS

A DNS server for web / app developers . Easy to config.

### 安装

```
npm install xdns -g
```

### 使用

在当前用户根目录创建文件 `~/.xdns` 作为 xdns 配置文件。 此配置文件完全兼容 hosts 文件的写法，另外还支持通配符以及网卡接口名自动替换，例如：

```
127.0.0.1 www.baidu.com
127.0.0.1 a.xxcdn.cn b.xxcdn.cn
127.0.0.1 *.yycdn.cn
$en0$ www.qq.com
```

以上的写法都是支持的，www.baidu.com a.xxcdn.cn b.xxcdn.cn 以及根域名为 yycdn.cn 的域名都会被解析到 127.0.0.1

`$en0$` 会被替换成当前机器上名为 `en0` 的网卡接口上的 IPv4 地址。

写好配置文件后，使用 `sudo xdns` 启动 xdns（因为 DNS Server 运行在 53 端口，所以需要 root 权限），设置你的手机或者其他设备 DNS 为运行 xdns 的电脑 IP 即可。

使用这种方式可以解决移动设备上不好绑定 hosts 的麻烦。

### 可用选项

* -h --help 查看帮助
* -V --versioin 查看版本号
* -f --file 设置 xdns 配置文件的地址，默认为 ~/.xdns
* -d --dns 设置远程的 dns server , 当域名不在配置文件里时，使用此 DNS 解析。默认是当前电脑的 DNS

### API

##### xdns.init(config) 启动一个 xdns

config 支持的配置项有：

* file xdns 配置文件的地址
* dns 远程的 DNS server
* hostsArr 包含 hosts 配置的数组，例如 `['127.0.0.1 www.baidu.com']` ，可以参考 sample/hostsarr.js