
## EDNS

A DNS server for web / app developers . Easy to config.

#### 安装

```
npm install edns -g

```

#### 使用

在当前用户根目录创建文件 `~/.edns` 作为 edns 配置文件。 此配置文件完全兼容 hosts 文件的写法，另外还支持通配符，例如：

```
127.0.0.1 www.baidu.com
127.0.0.1 a.xxcdn.cn b.xxcdn.cn
127.0.0.1 *.yycdn.cn

```

以上的写法都是支持的，www.baidu.com a.xxcdn.cn b.xxcdn.cn 以及根域名为 yycdn.cn 的域名都会被解析到 127.0.0.1

写好配置文件后，使用 `sudo edns` 启动 edns（因为 DNS Server 运行在 53 端口，所以需要 root 权限），设置你的手机或者其他设备 DNS 为运行 edns 的电脑 IP 即可。

使用这种方式可以解决移动设备上不好绑定 hosts 的麻烦。

#### 可用选项

* -h --help 查看帮助
* -V --versioin 查看版本号
* -f --file 设置 edns 配置文件的地址，默认为 ~/.edns
* -d --dns 设置远程的 dns server , 当域名不在配置文件里时，使用此 DNS 解析。默认是当前电脑的 DNS