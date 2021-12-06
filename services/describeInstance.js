const core = require('@huaweicloud/huaweicloud-sdk-core');
const ecs = require("@huaweicloud/huaweicloud-sdk-ecs");

const fileService = require('./fileServices');
const fs = require('fs');

var ak = "";
var sk = "";
var endpoint = "https://";
var project_id = "";

const describeInstances = async () => {
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

    return new Promise((resolve, reject) => {
        const request = new ecs.ListServersDetailsRequest();
        const result = client.listServersDetails(request);
        result.then(result => {
            let instancesIp = [];
            for (const instance of result.servers) {
                if (instance.status === 'ACTIVE') {
                    for(const info in instance.addresses){
                        instancesIp.push({
                            id: instance.id,
                            publicIp: instance.addresses[info][1].addr
                        });
                    }
                } else {
                    reject(
                        new Error(
                            'Instance ' +
                                instance.id +
                                ' initializing, wait until it is full initialized'
                        )
                    );
                }
            }
            console.log("JSON.stringify(result)::" + JSON.stringify(result));
            console.log("JSON.stringify(instancesIp)::" + JSON.stringify(instancesIp));
            fileService.writeInstanceIdAndPublicIP(instancesIp);
            resolve();
        }).catch(ex => {
            console.log("exception:" + JSON.stringify(ex));
            reject(ex);
        });
    });
};

module.exports = {
    describeInstances
};
