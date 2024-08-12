import fs from 'fs-extra';
import * as YAML from "js-yaml"
import _ from 'lodash';
import { bashRunAndShowLogsPromise } from './bashUtils';


const drcbConfigFile = `${process.env.DRCB_DATA_DIR}/.drcbConfig.yml`
export const drcb = async () => {
    // fs.writeFileSync(drcbConfigFile, YAML.dump({components: {}}, {}), "utf8")
    if (!fs.existsSync(drcbConfigFile)) {
        fs.writeFileSync(drcbConfigFile, YAML.dump({ components: {} }, {}), "utf8")
        console.log(drcbConfigFile)
    }


    const drcbConfigText = fs.readFileSync(drcbConfigFile, 'utf8');
    const drcbConfig = YAML.load(drcbConfigText)

    const componentsObj = drcbConfig.components

    for (const componentKey of Object.keys(componentsObj)) {
        try {
            const componentObj = {
                ...componentsObj[componentKey],
                componentKey,
                project: componentKey.split('##')[0],
                compKeyFolder: componentKey.split('##')[1]
            }
            let repoDirectoryParent = `${process.env.DRCB_DATA_DIR}/components/${componentObj.project}/${componentObj.compKeyFolder}`
            if (componentObj?.repoDirectoryParentDevOnly) {
                repoDirectoryParent = `${process.env.HOME}/${componentObj?.repoDirectoryParentDevOnly}`
            }
            if (!fs.existsSync(repoDirectoryParent)) {
                console.log(`${repoDirectoryParent} is not exist, creating`)
                await bashRunAndShowLogsPromise({
                    command: `mkdir -p ${repoDirectoryParent}`,
                })
            }
            let commit = componentObj.commit
            if (componentObj.commitAliasDevOnly) {
                commit = componentObj.commitAliasDevOnly
            }
            const commitFolder = `${repoDirectoryParent}/${commit}`
            if (!fs.existsSync(commitFolder)) {
                console.log(`${commitFolder} is not exist, cloning`)
                await bashRunAndShowLogsPromise({
                    command: `(cd ${repoDirectoryParent}; git -c advice.detachedHead=false  clone ${componentObj.repository} ${commit} ; cd ${commitFolder}; git checkout ${componentObj.commit})`,
                    noError: true
                })
            }
            const tmpCommitFolder = `${commitFolder}/~~tmp`
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
            const isReady = `${tmpCommitFolder}/isReady`
            if (!fs.existsSync(isReady)) {
                console.log(`${isReady} is not exist, adding`)
                await bashRunAndShowLogsPromise({
                    command: `(cd ${commitFolder}/~~tmp;  touch isReady)`,
                    noError: true
                })
            }
        }
        catch (e) {
            console.log(e.message)
        }
    }

}

export const drcbAddComponents = async (additionalComponentsObj) => {

    if (!fs.existsSync(drcbConfigFile)) {
        fs.writeFileSync(drcbConfigFile, YAML.dump({ components: {} }, {}), "utf8")
        console.log(drcbConfigFile)
    }

    const drcbConfigText = fs.readFileSync(drcbConfigFile, 'utf8');
    const drcbConfig = YAML.load(drcbConfigText)
    const componentsObj = drcbConfig.components
    Object.keys(additionalComponentsObj).forEach((compKey)=> {
        componentsObj[compKey] = additionalComponentsObj[compKey]
    })

    fs.writeFileSync(drcbConfigFile, YAML.dump({ components: componentsObj }, {}), "utf8")

}

export default drcb;
