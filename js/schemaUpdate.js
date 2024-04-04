const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

const getNodeData = async function (contentId) {
    const response = await fetch(`http://api.localhost/v2/content/type/${contentId}`);
    const {data} = await response.json();
    const {fields} = data;
    return fields ?? [];
};

const schemaSave = function (nodeMap){
    for (id in nodeMap) {
        nodeMap[id].weight = Array.from(nodeMap[id].render.parentNode.children).indexOf(nodeMap[id].render);
    }

    nodeMap.sort(function (a, b) {
        return a.weight - b.weight;
    });

    let updatedNodeList = [];
    for (id in nodeMap) {
        updatedNodeList.push({
            "id": nodeMap[id].data.id,
            "title": nodeMap[id].data.title,
            "type": nodeMap[id].data.type,
            "parent": nodeMap[id].render.parentNode.getAttribute('data-id')
        });
    }
    localStorage.setItem('nodeList', JSON.stringify(updatedNodeList));
};

document.addEventListener('DOMContentLoaded', async function(){
    // Rendering the tree nodes and prepare a map that contains references to the nodes 
    let Map = treeNodeRender(await getNodeData(contentId), treeBase);
    for (i in Map) {
        nodeMap[i] = Map[i];
    }
    
    // Set the save schema button function
    document.querySelector("#schemaUpdateSave").addEventListener('click', function () {
        schemaSave(nodeMap);
    });
});