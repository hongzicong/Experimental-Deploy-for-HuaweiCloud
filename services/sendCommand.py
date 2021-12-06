#!/usr/bin/python
# -*- coding: utf-8 -*-

import paramiko
import sys
import os


def main(commands, ips):
    private_key = paramiko.RSAKey.from_private_key_file(os.path.expanduser('~/KeyPair.pem'))
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    iplist = ips.split(',')
    commandlist = commands.split(',')
    
    for ip in iplist:
        print(ip)
        ssh.connect(hostname = ip, port = 22, username = "root", pkey = private_key)
        for command in commandlist:
            print(command)
            stdin, stdout, stderr = ssh.exec_command(command)
            result = stdout.read()
            print(result.decode())
        ssh.close()



main(sys.argv[1], sys.argv[2])
