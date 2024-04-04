const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

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
    // Schema container must be sortable and must have data-id="0" as attribute
    const treeBase = treeBasePrepare(document.querySelector("#treeBase"));

    // Inputs that contains the selected node state
    const selectedNodeId = document.querySelector('#node_id');
    const selectedNodeTitle = document.querySelector('#node_title');
    const updateSelectedNodeState = function ({ id, title }) {
        selectedNodeId.value = id;
        selectedNodeTitle.value = title;
        return {
            id: selectedNodeId.value,
            title: selectedNodeTitle.value
        };
    }
    const getSelectedNodeSate = function(){
        return { 
            id: selectedNodeId.value, 
            title: selectedNodeTitle.value
        };
    };

    // Rendering the tree nodes and prepare a map that contains references to the nodes
    const nodeMap = treeNodeRender(await getNodeDataById(contentId), treeBase, updateSelectedNodeState);

    // Render the available node option list selector
    const optionListContainer = document.querySelector(".optionListContainer");
    const optionNodeMap = presentOptionNodeList(await getNodeOptionList());
    const optionListSelector = prepareOptionList(optionNodeMap);
    optionListContainer.appendChild(optionListSelector);

    // Set the schema adding node function
    document.querySelector(".schemaCreateNode").addEventListener('click', function () {
        if (optionListSelector.value != 0) {
            const optionSelected = optionNodeMap[optionListSelector.value];
            const newNodeData = {
                "id": schemaUpdateAddNode(optionSelected),
                "title": optionSelected.title,
                "type": optionSelected.name,
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
        schemaDeleteNode(getSelectedNodeSate().id, nodeMap);
        updateSelectedNodeState({
            id: 0,
            title: ""
        });
    });

    // Set the save schema button function
    // document.querySelector("#schemaUpdateSave").addEventListener('click', function () {
    //     schemaSave(nodeMap);
    // });
});