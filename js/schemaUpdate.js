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

const nodeUpdatePersist = async function (data) {
    const request = await fetch(`http://api.localhost/v2/content/type/field/${data.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "x-session": localStorage.getItem('session') ?? null
        },
        body: JSON.stringify({
            field_id: data.field_id,
            config: data.config
        })
    });

    const resultStatus = await request.ok;
    if (resultStatus) {
        location.reload();
    }else{
        alert("Error: the information could not be processed");
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

const SelectedNodeState = {
    id: 0,
    title: "",
    config: "",
    field_id: 0,
    description: ""
};
const getSelectedNodeState = function () {
    return SelectedNodeState;
};


document.addEventListener('DOMContentLoaded', async function(){
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Inputs that contains the selected node state
    const selectedNodeId = document.querySelector('#node_id');
    const selectedNodeConfig = document.querySelector('#node_config');
    const selectedNodeFieldId = document.querySelector('#node_field_id');

    const updateSelectedNodeState = function (nodeState) {
        const { id, title, config, field_id, description } = nodeState;

        SelectedNodeState.id = id;
        SelectedNodeState.title = title;
        SelectedNodeState.config = config;
        SelectedNodeState.field_id = field_id;
        SelectedNodeState.description = description;

        selectedNodeId.value = id;
        selectedNodeConfig.value = JSON.stringify(config);
        selectedNodeFieldId.value = field_id;
        
        return SelectedNodeState;
    }

    // Rendering the tree nodes and prepare a map that contains references to the nodes
    const nodeData = await getNodeDataById(contentId);
    const nodeMap = treeNodeRender(nodeData.fields, treeBase, updateSelectedNodeState);

    // Render the available node option list selector
    const optionListContainer = document.querySelector(".optionListContainer");

    const schemaNodeTypeSelector = document.querySelector(".schema-node-type-selector");
    const optionNodeMap = presentOptionNodeList(await getNodeOptionList());
    const optionListSelector = prepareOptionList(optionNodeMap);
    const activeNodeSelector = optionListSelector.cloneNode(true);
    optionListContainer.appendChild(optionListSelector);
    schemaNodeTypeSelector.appendChild(activeNodeSelector);

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
            const nodeId = getSelectedNodeState().id;
            schemaNodeDeletePersist(nodeId);
            schemaDeleteNode(nodeId, nodeMap);
            updateSelectedNodeState({
                id: 0,
                title: "",
                config: "{}",
                field_id: 0
            });
        }
    });

    // Set the save schema button function
    document.querySelector("#schemaUpdateSave").addEventListener('click', function () {
        schemaSave(nodeMap);
    });

    // Link go to scheme data update
    const NavLinks = document.querySelector('.nav-links');
    NavLinks.innerHTML += ` <a href="schema-update-data.html?id=${contentId}">Schema data</a>`;

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
    nodeUpdateForm.addEventListener("submit", function(e){
        e.preventDefault();

        nodeUpdatePersist({
            id: getSelectedNodeState().id,
            field_id: activeNodeSelector.value,
            config: JSON.parse(selectedNodeConfig.value)
        });
    });
    selectedNodeId.addEventListener('change', function(){
        if (nodeUpdateForm.style.display == 'none'){
            nodeUpdateForm.style.display = 'block';
        }
        if (getSelectedNodeState().id == 0){
            nodeUpdateForm.style.display = 'none';
        }

        activeNodeSelector.value = getSelectedNodeState().field_id;

        [...document.querySelectorAll('.render-text-node-id')].map(function (item) {
            item.innerHTML = getSelectedNodeState().id;
        });
        [...document.querySelectorAll('.render-text-node-title')].map(function (item) {
            item.innerHTML = getSelectedNodeState().title;
        });
        [...document.querySelectorAll('.render-text-node-description')].map(function (item) {
            item.innerHTML = getSelectedNodeState().description;
        });
  
    });
    document.querySelector("body").addEventListener("click", function(){
        nodeUpdateForm.style.display = "none";
    });
});