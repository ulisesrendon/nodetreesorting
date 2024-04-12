const getNodeOptionList = async function () {
    const response = await fetch('http://api.localhost/v2/content/field', {
        headers: {
            "x-session": localStorage.getItem('session') ?? null,
        }
    });
    const {data} = await response.json();
    return data ?? [];
};

const getNodeDataById = async function (contentId) {
    const response = await fetch(`http://api.localhost/v2/content/type/${contentId}?unordered`, {
        headers: {
            "x-session": localStorage.getItem('session') ?? null
        }
    });
    const { data } = await response.json();
    return data ?? {};
};

const nodeItemBase = document.createElement('div');
nodeItemBase.classList.add('list-group-item');
nodeItemBase.classList.add('nested-sortable');
nodeItemBase.classList.add('nested');
const nodeRender = function (node, updateSeletedNodeState) {
    const newItem = nodeItemBase.cloneNode();
    newItem.setAttribute('data-id', node.id);
    newItem.setAttribute('data-title', node.title);
    newItem.classList.add('nodeitem');
    newItem.innerHTML = `${node.title} (id_${node.id})`;
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
        updateSeletedNodeState(node);
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

const treeNodeRender = function (nodeList, treeBase, updateSeletedNodeState) {
    let nodeMap = [];
    for (let i = 0; i < nodeList.length; i++) {
        addTreeNode(treeBase, nodeMap, nodeList[i], updateSeletedNodeState);
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
        "title": "Pick an option"
    };

    const optionSelect = document.createElement("select");
    optionSelect.classList.add('form-field-block');
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

const addTreeNode = function (treeBase, nodeMap, nodeItem, updateSeletedNodeState){
    nodeMap[nodeItem.id] = {
        "render": nodeRender(nodeItem, updateSeletedNodeState),
        "data": nodeItem
    };
    treeBase.appendChild(nodeMap[nodeItem.id].render);
};

const schemaDeleteNode = function (nodeId, nodeMap){
    const nodeToRemove = nodeMap[nodeId] || null;
    if (nodeToRemove) {
        nodeToRemove.render.remove();
        delete nodeMap[nodeId];
    }
};

function eventChangeImplementation( element ){
	const evt = new Event('change');
    const observer = new window.MutationObserver(function (mutations, observer) {
        if (mutations[0].attributeName == "value") element.dispatchEvent(evt);
    });
    observer.observe(element, { attributes: true });
}