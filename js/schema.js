const getNodeOptionList = async function () {
    const response = await fetch('http://api.localhost/v2/content/field', {
        headers: {
            'X-Apikey': 'd0f41572a37701fb4a3fc7774d01d63c78b729d4852863dd48bad69868ef462d7b1c39fa16ee7dd86e53829e48bc60d24f773b7ee68c9e9ce7e789a68c2adc22',
        }
    });
    const list = await response.json();
    const {data} = list;
    return data ?? [];
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
        if (nodeMap[id].data.parent != 0 && nodeMap[nodeMap[id].data.parent]) {
            nodeMap[nodeMap[id].data.parent].render.appendChild(nodeMap[id].render);
        }
    }

    return nodeMap;
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

const schemaDeleteNode = function(nodeId){
    const nodeToRemove = nodeMap[nodeId] || null;
    if (nodeToRemove) {
        nodeToRemove.render.remove();
        delete nodeMap[nodeId];
    }
};

// map that contains references to the nodes 
const nodeMap = []

document.addEventListener('DOMContentLoaded', async function(){
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Set the schema deleting function
    document.querySelector(".schemaDeleteNode").addEventListener('click', function () {
        cschemaDeleteNode(selectedNodeId.value);        
    });

    // Render the available node option list
    const optionListContainer = document.querySelector(".optionListContainer");
    const optionNodeMap = presentOptionNodeList(getNodeOptionList());
    const optionListSelector = prepareOptionList(optionNodeMap);
    optionListContainer.appendChild(optionListSelector);

    // Set the schema adding node function
    const schemaCreateNode = document.querySelector(".schemaCreateNode");
    schemaCreateNode.addEventListener('click', function () {
        if (optionListSelector.value != 0) {
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