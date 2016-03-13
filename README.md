# linux运行状态监控系统
the monitoring system for linux created by nodejs 
##简介
这是我的毕业设计项目，并且在工作之后进行了一些修改。
1.其中client文件夹下是运行在被监控主机上的的程序，直接运行“sudo node logmanager/logManager.js”。
此程序需要root权限是因为部分内核数据（如进程信息）需要root权限才能访问。此程序会通过TCP连接到目标服务器，并把数据上传到服务器上。
2.server文件夹是作为HTTP服务器部署，向上层提供web化的界面以展示运行状态数据，同时对于收集到的数据有自己的缓存机制，由于大部分时间都是在单个主机中测试，被监控主机的程序在简历TCP链接时暂时将目标主机写死为本机。运行“node ./index.js”可开启此服务。
3.在server运行后，可以直接访问通过浏览器访问并查看到被监控主机的运行状态数据。
