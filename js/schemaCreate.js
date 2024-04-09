const schemaCreatePersist = async function (body) {
    const response = await fetch(`http://api.localhost/v2/content/type`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-session": localStorage.getItem('session') ?? null
        },
        body: JSON.stringify(body)
    });
    const resultStatus = await response.ok;
    if (resultStatus){
        return await response.json();
    }
    return {
        error: response.status.error
    };
};

document.addEventListener('DOMContentLoaded', async function(){
    // Set the save schema button function
    document.querySelector(".shcemaCreateForm").addEventListener('submit', async function (e) {
        e.preventDefault();
        const result = await schemaCreatePersist({
            name: this.name.value,
            title: this.title.value,
            description: this.title.value,
            config: this.config.value,
        });
        const {id} = result.data ?? {id: null};
        if ( id ){
            window.location.href = `schema-update.html?id=${id}`;
        }else{
            alert("Error creating a new content type");
        }
    });
});