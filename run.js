const core = require('@huaweicloud/huaweicloud-sdk-core');
const ecs = require("@huaweicloud/huaweicloud-sdk-ecs");

const fileService = require('./services/fileServices');
const { parseShellScript } = require('./services/parseShellScript');
const exec = require('child_process').exec;
const fs = require('fs');

var ak = "";
var sk = "";
var endpoint = "https://";
var project_id = "";

const run = async () => {
    const USER_HOME = process.env.HOME || process.env.USERPROFILE
    const path = USER_HOME + '/credentials.txt'
    const data = fs.readFileSync(path, 'UTF-8');
    const lines = data.split(/\r?\n/);
    for(const line of lines){
        const parts = line.split(':');
        if(parts[0] == 'ak')
            ak = parts[1];
        else if(parts[0] == 'sk')
            sk = parts[1];
        else if(parts[0] == 'endpoint')
            endpoint = endpoint + parts[1];
        else if(parts[0] == 'project_id')
            project_id = parts[1];
    }
    const credentials = new core.BasicCredentials()
                     .withAk(ak)
                     .withSk(sk)
                     .withProjectId(project_id)
    const client = ecs.EcsClient.newBuilder()
                            .withCredential(credentials)
                            .withEndpoint(endpoint)
                            .build();

    const commands = await parseShellScript('./config/run.sh');
    const ips = await fileService.getInstanceIps();
    console.log('Commands Excuting...');
    exec('python3 ./services/sendCommand.py \'' + commands + '\' ' + ips, function (error, stdout, stderr) {
        if(error) {
            console.error(error);
            return;
        }
        console.log('Commands Excuted');
    });
};

run();
