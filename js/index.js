const getSchemaList = async function(){
    const response = await fetch('http://api.localhost/v2/content/type');
    const {data} = await response.json();
    return data ?? [];
};

document.addEventListener('DOMContentLoaded', async function(){
    const schemaListContainer = document.querySelector(".schemaList");
    const SchemaList = await getSchemaList();
    SchemaList.forEach(function(schema){
        const item = document.createElement("li");
        item.innerHTML = `
                <div><a href="schema-update.html?id=${schema.id}" class="block-anchor">${schema.id} - ${schema.title}</a></div>
                <div><a href="schema-update-data.html?id=${schema.id}">Update</a></div>
        `;
        schemaListContainer.appendChild(item);
    });
});