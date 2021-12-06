const core = require('@huaweicloud/huaweicloud-sdk-core');
const ecs = require("@huaweicloud/huaweicloud-sdk-ecs");

const { getInstanceParams, writeInstanceIds } = require('./services/fileServices');

const fs = require('fs');

var ak = "";
var sk = "";
var endpoint = "https://";
var project_id = "";

const instanceParams = getInstanceParams();

const deploy = async () => {
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

    let Ids = [];
    const request = new ecs.CreatePostPaidServersRequest();

    try {
        for (const param of instanceParams) {
            console.log('Creating instances...');
            request.withBody(param);
            const response = await client.createPostPaidServers(request);
            console.log("JSON.stringify(response)::" + JSON.stringify(response));
            for (const id of response.serverIds) {
                Ids.push(id);
                console.log(param.server.flavorRef + ':' + id + ' created');
            }
        }
    } catch (err) {
        console.log(err);
    }
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }
    writeInstanceIds({ InstanceIds: Ids });

    console.log('Total ' + Ids.length + ' instances launched');
};

deploy();
