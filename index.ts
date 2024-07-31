import fs from 'fs-extra';
import * as YAML from "js-yaml"
import _ from 'lodash';
import { bashRunAndShowLogsPromise } from './functions/bashUtils';

const drcbConfigFile = `${process.env.DRCB_DATA_DIR}/.drcbConfig.yml`
// fs.writeFileSync(drcbConfigFile, YAML.dump({components: {}}, {}), "utf8")
if (!fs.existsSync(drcbConfigFile)) {
    fs.writeFileSync(drcbConfigFile, YAML.dump({ components: {} }, {}), "utf8")
    console.log(drcbConfigFile)
}


const drcbConfigText = fs.readFileSync(drcbConfigFile, 'utf8');
const drcbConfig: any = YAML.load(drcbConfigText)

const componentsObj = drcbConfig.components

for (const componentKey of Object.keys(componentsObj)) {
    const componentObj = {
        ...componentsObj[componentKey],
        componentKey,
        project: componentKey.split('##')[0],
        compKeyFolder: componentKey.split('##')[1]
    }
    const repoDirectory = `${process.env.DRCB_DATA_DIR}/components/${componentObj.project}/${componentObj.compKeyFolder}`
    if (!fs.existsSync(repoDirectory)) {
        console.log(`${repoDirectory} is not exist, creating`)
        await bashRunAndShowLogsPromise({
            command: `mkdir -p ${repoDirectory}`,
        })
    }
    const commitFolder = `${repoDirectory}/${componentObj.commit}`
    if (!fs.existsSync(commitFolder)) {
        console.log(`${commitFolder} is not exist, cloning`)
        await bashRunAndShowLogsPromise({
            command: `(cd ${repoDirectory}; git -c advice.detachedHead=false  clone ${componentObj.repository} ${componentObj.commit} ; cd ${componentObj.commit}; git checkout ${componentObj.commit})`,
            noError: true
        })
    }
    const tmpCommitFolder = `${repoDirectory}/${componentObj.commit}/~~tmp`
    if (!fs.existsSync(tmpCommitFolder)) {
        console.log(`${tmpCommitFolder} is not exist, creating`)
        await bashRunAndShowLogsPromise({
            command: `mkdir -p ${tmpCommitFolder}`,
        })
    }
    const isInstalledFile = `${tmpCommitFolder}/isInstalledFile`
    if (!fs.existsSync(isInstalledFile)) {
        console.log(`${isInstalledFile} is not exist, installing packages`)
        await bashRunAndShowLogsPromise({
            command: `(cd ${commitFolder}; ls -la;  ${componentObj.pkgManager} install; touch ~~tmp/isInstalledFile)`,
            noError: true
        })
    }
}

// console.log(componentsObj)