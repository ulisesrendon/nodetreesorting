const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

const schemaSave = function (nodeMap){
    for (id in nodeMap) {
        nodeMap[id].weight = Array.from(nodeMap[id].render.parentNode.children).indexOf(nodeMap[id].render);
    }

    nodeMap.sort(function (a, b) {
        return a.weight - b.weight;
    });

    for (id in nodeMap) {
        fetch(`http://api.localhost/v2/content/type/field/${nodeMap[id].data.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "x-session": localStorage.getItem('session') ?? null
            },
            body: JSON.stringify({
                weight: nodeMap[id].weight,
                parent: nodeMap[id].render.parentNode.getAttribute('data-id')
            })
        });
    }
};

const schemaNodeDeletePersist = function (nodeId) {
    fetch(`http://api.localhost/v2/content/type/field/${nodeId}`, {
        method: "DELETE",
        headers: {
            "x-session": localStorage.getItem('session') ?? null
        }
    });
};

const schemaNodeAddPersist = async function (nodeId, contentId) {
    const response = await fetch(`http://api.localhost/v2/content/type/${contentId}/field_assign/${nodeId}`, {
        method: "POST",
        headers: {
            "x-session": localStorage.getItem('session') ?? null
        }
    });
    const { data } = await response.json();
    return data.relationshipID;
};

document.addEventListener('DOMContentLoaded', async function(){
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Inputs that contains the selected node state
    const selectedNodeId = document.querySelector('#node_id');
    const selectedNodeTitle = document.querySelector('#node_title');
    const selectedNodeConfig = document.querySelector('#node_config');

    const updateSelectedNodeState = function ({ id, title, config }) {
        selectedNodeId.value = id;
        selectedNodeTitle.value = title;
        selectedNodeConfig.value = JSON.stringify(config);
        return {
            id: selectedNodeId.value,
            title: selectedNodeTitle.value,
            config: selectedNodeConfig.value
        };
    }
    const getSelectedNodeSate = function(){
        return { 
            id: selectedNodeId.value, 
            title: selectedNodeTitle.value,
            config: selectedNodeConfig.value,
        };
    };

    // Rendering the tree nodes and prepare a map that contains references to the nodes
    const nodeData = await getNodeDataById(contentId);
    const nodeMap = treeNodeRender(nodeData.fields, treeBase, updateSelectedNodeState);

    // Render the available node option list selector
    const optionListContainer = document.querySelector(".optionListContainer");
    const optionNodeMap = presentOptionNodeList(await getNodeOptionList());
    const optionListSelector = prepareOptionList(optionNodeMap);
    optionListContainer.appendChild(optionListSelector);

    // Set the schema adding node function
    document.querySelector(".schemaCreateNode").addEventListener('click', async function () {
        if (optionListSelector.value != 0) {
            const optionSelected = optionNodeMap[optionListSelector.value];
            const newNodeData = {
                "id": await schemaNodeAddPersist(optionSelected.id, contentId),
                "title": optionSelected.title,
                "type": optionSelected.name,
                "config": optionSelected.config,
                "parent": 0
            };
            addTreeNode(
                treeBase,
                nodeMap,
                newNodeData,
                updateSelectedNodeState
            );
        }
    });

    // Set the schema deleting function
    document.querySelector(".schemaDeleteNode").addEventListener('click', function () {
        let procedDeletion = confirm("Are you sure?");
        if(procedDeletion){
            const nodeId = getSelectedNodeSate().id;
            schemaNodeDeletePersist(nodeId);
            schemaDeleteNode(nodeId, nodeMap);
            updateSelectedNodeState({
                id: 0,
                title: "",
                config: "{}"
            });
        }
    });

    // Set the save schema button function
    document.querySelector("#schemaUpdateSave").addEventListener('click', function () {
        schemaSave(nodeMap);
    });

    // 
    const NavLinks = document.querySelector('.nav-links');
    NavLinks.innerHTML += ` <a href="schema-update-data.html?id=${contentId}">Data</a>`;

    [...document.querySelectorAll('.render-text-schema-title')].forEach(function (item) {
        item.innerHTML = nodeData.title;
    });
    [...document.querySelectorAll('.render-text-schema-id')].forEach(function (item) {
        item.innerHTML = nodeData.id;
    });

    [...document.querySelectorAll('.onchange_implement')].map(function(item){
        eventChangeImplementation(item);
    });
    const nodeUpdateForm = document.querySelector('.node-update-form');
    nodeUpdateForm.style.display = "none";
    nodeUpdateForm.addEventListener("click", function(e){
        e.stopPropagation();
    });
    selectedNodeId.addEventListener('change', function(){
        if (nodeUpdateForm.style.display == 'none'){
            nodeUpdateForm.style.display = 'block';
        }
        if (selectedNodeId.value == 0){
            nodeUpdateForm.style.display = 'none';
        }

        [...document.querySelectorAll('.render-text-node-id')].map(function (item) {
            item.innerHTML = selectedNodeId.value;
        });
        [...document.querySelectorAll('.render-text-node-title')].map(function (item) {
            item.innerHTML = selectedNodeTitle.value;
        });
    });
    document.querySelector("body").addEventListener("click", function(){
        nodeUpdateForm.style.display = "none";
    });
});