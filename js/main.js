const schemaListEndpoint = 'http://api.localhost/v2/content/type';
let getSchemaList = async function(){
    const response = await fetch(schemaListEndpoint);
    if (response.ok ){
        const list = await response.json();
        return list.data;
    }
    return [];
};
const schemaListContainer = document.querySelector(".schemaList");

document.addEventListener('DOMContentLoaded', function(){
    getSchemaList().then(response => {
        for( let i = 0; i<response.length; i++ ){
            const item = document.createElement("li");
            item.innerHTML = `
                <div>${response[i].title}</div>
                <div><a href="schema-update.html?id=${response[i].id}">Editar</a></div>
            `;
            schemaListContainer.appendChild(item);
        }
    })
});