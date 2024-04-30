const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

const schemaSave = async function (nodeMap){
    for (id in nodeMap) {
        nodeMap[id].weight = Array.from(nodeMap[id].render.parentNode.children).indexOf(nodeMap[id].render);
    }

    nodeMap.sort(function (a, b) {
        return a.weight - b.weight;
    });

    const urlList = [];
    for (id in nodeMap) {
        urlList.push({
            url: `http://api.localhost/v2/content/type/field/${nodeMap[id].data.id}`,
            body: JSON.stringify({
                weight: nodeMap[id].weight,
                parent: nodeMap[id].render.parentNode.getAttribute('data-id')
            })
        });
    }

    try{
        const fetchPromises = urlList.map(async (item) => {
            const response = await fetch(item.url,{
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-session": localStorage.getItem('session') ?? null
                },
                body: item.body
            });
            return response.json();
        });
    
        // Use Promise.all to wait for all the fetch requests to resolve
        const results = await Promise.all(fetchPromises);

        return results;
    } catch (error) {
        alert("Error: Scheme data could not be processed");
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

const addNodeActionProcess = async function ({
    treeBase, 
    nodeMap, 
    contentId, 
    optionNodeMap, 
    newNodeId,
    updateSelectedNodeState
}) {
    if (newNodeId != 0) {
        const optionSelected = optionNodeMap[newNodeId];
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
};


document.addEventListener('DOMContentLoaded', async function(){

    [...document.querySelectorAll('.onchange_implement')].map(function (item) {
        eventChangeImplementation(item);
    });

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
    console.log(optionListSelector);
    console.log(activeNodeSelector);
    schemaNodeTypeSelector.appendChild(activeNodeSelector);
    optionListContainer.appendChild(optionListSelector);

    // Set the schema adding node function
    document.querySelector(".schemaCreateNode").addEventListener('click', function () {
        addNodeActionProcess({
            treeBase: treeBase,
            nodeMap: nodeMap,
            contentId: contentId,
            optionNodeMap: optionNodeMap,
            newNodeId: optionListSelector.value,
            updateSelectedNodeState: updateSelectedNodeState
        })
    });

    // Set the schema deleting function
    document.querySelector(".schemaDeleteNode").addEventListener('click', function () {
        if (confirm("Are you sure?")){
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
    document.querySelector("#schemaUpdateSave").addEventListener('click', async function () {
        const result = await schemaSave(nodeMap);
    });

    // Link go to scheme data update
    document.querySelector('.nav-links').innerHTML += ` <a href="schema-update-data.html?id=${contentId}">Schema data</a>`;

    [...document.querySelectorAll('.render-text-schema-title')].forEach(function (item) {
        item.innerHTML = nodeData.title;
    });
    [...document.querySelectorAll('.render-text-schema-id')].forEach(function (item) {
        item.innerHTML = nodeData.id;
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
        const {id, title, description, field_id} = getSelectedNodeState();
        activeNodeSelector.value = field_id;
        if (nodeUpdateForm.style.display == 'none'){
            nodeUpdateForm.style.display = 'block';
        }
        if (id == 0){
            nodeUpdateForm.style.display = 'none';
        }

        [...document.querySelectorAll('.render-text-node-id')].map(function (item) {
            item.innerHTML = id;
        });
        [...document.querySelectorAll('.render-text-node-title')].map(function (item) {
            item.innerHTML = title;
        });
        [...document.querySelectorAll('.render-text-node-description')].map(function (item) {
            item.innerHTML = description;
        });
    });
    document.querySelector("body").addEventListener("click", function(){
        nodeUpdateForm.style.display = "none";
    });
});