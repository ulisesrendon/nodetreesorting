const getSchemaList = async function(){
    const response = await fetch('http://api.localhost/v2/content/type');
    const {data} = await response.json();
    return data ?? [];
};
const schemaListContainer = document.querySelector(".schemaList");

document.addEventListener('DOMContentLoaded', async function(){
    const response = await getSchemaList();
    for (let i = 0; i < response.length; i++) {
        const item = document.createElement("li");
        item.innerHTML = `
            <div>${response[i].title}</div>
            <div><a href="schema-update.html?id=${response[i].id}">Editar</a></div>
        `;
        schemaListContainer.appendChild(item);
    }
});