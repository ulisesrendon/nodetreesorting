const getNodeData = function () {
    let nodeList = localStorage.getItem('nodeList') || contentNodes;
    if (typeof nodeList === 'string') {
        nodeList = JSON.parse(nodeList);
    }
    return nodeList;
};

const nodeItemBase = document.createElement('div');
nodeItemBase.classList.add('list-group-item');
nodeItemBase.classList.add('nested-sortable');
nodeItemBase.classList.add('nested');
const selectedNodeId = document.querySelector('#node_id');
const selectedNodeTitle = document.querySelector('#node_title');
const nodeRender = function (node) {
    const newItem = nodeItemBase.cloneNode();
    newItem.setAttribute('data-id', node.id);
    newItem.setAttribute('data-title', node.title);
    newItem.classList.add('nodeitem');
    newItem.innerHTML = `${node.title} (field_${node.id})`;
    new Sortable(newItem, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        fallbackTolerance: '20px',
        emptyInsertThreshold: 10,
        sort: true,
        swapThreshold: 1,
        direction: 'vertical'
    });
    newItem.addEventListener('click', function(e){
        e.stopPropagation()
        selectedNodeId.value = node.id;
        selectedNodeTitle.value = node.title;
    });
    return newItem;
};

const treeBasePrepare = function(treeBase){
    treeBase.setAttribute('data-id', 0);
    new Sortable(treeBase, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        fallbackTolerance: '20px',
        emptyInsertThreshold: 10,
        sort: true,
        swapThreshold: 1,
        direction: 'vertical'
    });
    return treeBase;
};

const treeNodeRender = function (nodeList, treeBase) {
    let nodeMap = [];
    for (let i = 0; i < nodeList.length; i++) {
        addTreeNode(treeBase, nodeMap, nodeList[i]);
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
    nodeOptionList[0] = {
        "id": "",
        "name": "",
        "title": "Seleccione una opción"
    };

    const optionSelect = document.createElement("select");
    const optionItem = document.createElement("option");
    for (i in nodeOptionList){
        const newItem = optionItem.cloneNode();
        newItem.innerHTML = nodeOptionList[i].title;
        newItem.setAttribute('value', nodeOptionList[i].id);
        optionSelect.appendChild(newItem);
    }

    return optionSelect;
};

const presentOptionNodeList = function (nodeOptionList){
    let nodeOptionMap = [];
    for(let i = 0; i<nodeOptionList.length; i++){
        nodeOptionMap[nodeOptionList[i].id] = nodeOptionList[i];
    }

    return nodeOptionMap;
};

const addTreeNode = function (treeBase, nodeMap, nodeItem){
    nodeMap[nodeItem.id] = {
        "render": nodeRender(nodeItem),
        "data": nodeItem
    };
    treeBase.appendChild(nodeMap[nodeItem.id].render);
};

const schemaUpdateAddNode = function(nodeData){
    return Math.floor(Math.random() * 1000);
};

document.addEventListener('DOMContentLoaded', function(){
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Rendering the tree nodes and prepare a map that contains references to the nodes 
    let nodeMap = treeNodeRender(getNodeData(), treeBase);

    // Set the save shema button function
    const schemaUpdateSave = document.querySelector("#schemaUpdateSave");
    schemaUpdateSave.addEventListener('click', function () {
        shemaSave(nodeMap);
    });

    // Render the available node option list
    const optionListContainer = document.querySelector(".optionListContainer");
    const optionNodeMap = presentOptionNodeList(nodeOptionList);
    const optionListSelector = prepareOptionList(optionNodeMap);
    optionListContainer.appendChild(optionListSelector);

    const schemaCreateNode = document.querySelector(".schemaCreateNode");
    schemaCreateNode.addEventListener('click', function(){
        if (optionListSelector.value != 0 ){
            const optionSelected = optionNodeMap[optionListSelector.value];

            const newNodeId = schemaUpdateAddNode(optionSelected);

            addTreeNode(treeBase, nodeMap, {
                "id": newNodeId,
                "title": optionSelected.title,
                "type": optionSelected.name,
                "parent": "0"
            });
        }
    });
});