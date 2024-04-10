const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

const schemaUpdatatingDataPersist = async function (id, body) {
    const response = await fetch(`http://api.localhost/v2/content/type/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "x-session": localStorage.getItem('session') ?? null
        },
        body: JSON.stringify(body)
    });
    const resultStatus = await response.ok;
    if (resultStatus) {
        return await response.json();
    }
    return {
        error: response.status.error
    };
};

document.addEventListener('DOMContentLoaded', async function(){
    const nodeData = await getNodeDataById(contentId);

    const updateForm = document.querySelector('.schemaUpdateForm');

    updateForm.name.value = nodeData.name;
    updateForm.title.value = nodeData.title;
    updateForm.description.value = nodeData.description;
    updateForm.config.value = nodeData.config;

    [...document.querySelectorAll('.render-text-schema-title')].forEach(function(item){
        item.innerHTML = nodeData.title;
    });
    [...document.querySelectorAll('.render-text-schema-id')].forEach(function(item){
        item.innerHTML = nodeData.id;
    });

    const NavLinks = document.querySelector('.nav-links');
    NavLinks.innerHTML += ` <a href="schema-update.html?id=${contentId}">Nodos</a>`;

    updateForm.addEventListener('submit', async function(e){
        e.preventDefault();

        const result = await schemaUpdatatingDataPersist(
            contentId,
            {
                name: this.name.value,
                title: this.title.value,
                description: this.title.value,
                config: JSON.parse(this.config.value),
            }
        );
        const { error } = result ?? { error: null };
        if (!error) {
            alert("Data updated successfully");
        } else {
            alert("Error updating content type data");
        }
    });
});