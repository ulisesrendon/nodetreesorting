const getNodeData = function () {
    let nodeList = localStorage.getItem('nodeList') || contentNodes;
    if (typeof nodeList === 'string') {
        nodeList = JSON.parse(nodeList);
    }
    return nodeList;
};

const nodeItem = document.createElement('div');
nodeItem.classList.add('list-group-item');
nodeItem.classList.add('nested');
const nodeRender = function (node) {
    const newItem = nodeItem.cloneNode();
    newItem.setAttribute('data-id', node.id)
    newItem.setAttribute('data-title', node.title)
    newItem.innerHTML = `id_${node.id} ${node.title}`;
    new Sortable(newItem, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
    return newItem;
};

const treeBasePrepare = function(treeBase){
    treeBase.setAttribute('data-id', 0);
    new Sortable(treeBase, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
    return treeBase;
};

const treeNodeRender = function (nodeList, treeBase) {
    let nodeMap = [];
    for (let i = 0; i < nodeList.length; i++) {
        nodeMap[nodeList[i].id] = {
            "render": nodeRender(nodeList[i]),
            "data": nodeList[i]
        };
        treeBase.appendChild(nodeMap[nodeList[i].id].render);
    }
    for (id in nodeMap) {
        if (nodeMap[id].data.parent != 0) {
            nodeMap[nodeMap[id].data.parent].render.appendChild(nodeMap[id].render);
        }
    }

    return nodeMap;
};

const shemaSave = function (nodeMap){
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

const prepareOptionList = function(nodeOptionList){
    
    nodeOptionList.unshift({
        "id": "",
        "name": "",
        "title": "Seleccione una opción"
    });

    const optionSelect = document.createElement("select");
    const optionItem = document.createElement("option");

    for(let i = 0; i<nodeOptionList.length; i++){
        const newItem = optionItem.cloneNode();
        newItem.innerHTML = nodeOptionList[i].title;
        newItem.setAttribute('value', nodeOptionList[i].id);
        optionSelect.appendChild(newItem);
    }

    return optionSelect;
};

const presentOptionNodeList = function (nodeOptionList){
    return nodeOptionList;
};

const addTreeNode = function (treeBase, node){

};

document.addEventListener('DOMContentLoaded', function(){
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Rendering the tree nodes and prepare a map that contains references to the nodes 
    let nodeMap = treeNodeRender(getNodeData(), treeBase);

    // Set the save shema button function
    const shemaUpdateSave = document.querySelector("#shemaUpdateSave");
    shemaUpdateSave.addEventListener('click', function () {
        shemaSave(nodeMap);
    });

    // Render the available node option list
    const optionListContainer = document.querySelector(".optionListContainer");
    const optionNodeList = presentOptionNodeList(nodeOptionList);
    const optionListSelector = prepareOptionList(optionNodeList);
    optionListContainer.appendChild(optionListSelector);

    const schemaCreateNode = document.querySelector(".schemaCreateNode");
    schemaCreateNode.addEventListener('click', function(){
        alert(optionListSelector.value);
    });
});