const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const contentId = urlParams.get('id');

console.log(contentId);

const getNodeData = function () {
    let nodeList = localStorage.getItem('nodeList') || contentNodes;
    if (typeof nodeList === 'string') {
        nodeList = JSON.parse(nodeList);
    }
    return nodeList;
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

document.addEventListener('DOMContentLoaded', function(){

    // Rendering the tree nodes and prepare a map that contains references to the nodes 
    let Map = treeNodeRender(getNodeData(), treeBase);
    for(i in Map){
        nodeMap[i] = Map[i];
    }

    // Set the save schema button function
    const schemaUpdateSave = document.querySelector("#schemaUpdateSave");
    schemaUpdateSave.addEventListener('click', function () {
        schemaSave(nodeMap);
    });

});