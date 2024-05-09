const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

const contentTypeData = function() {
    return {
        ContentTypes: [],
        init() {
            this.getContentTypes();
        },
        async getContentTypes() {
            const response = await fetch(`http://api.localhost/v2/content/type`, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            });
            if (await response.ok) {
                this.ContentTypes = (await response.json()).data;

                this.ContentTypes.forEach(element => {
                    element.title = `(${element.id}) ${element.title}`;
                });
            }
        }
    };
};

const contentTypeSchema = async function(id) {
    const response = await fetch(`http://api.localhost/v2/content/type/${id}/schema`, {
        method: "GET",
        headers: { "Content-Type": "application/json", }
    });
    if (await response.ok) {
        return (await response.json());
    }
    return '{}';
}


const ContentCreatePersist = async function (body) {
    const response = await fetch(`http://api.localhost/v2/content`, {
        method: "POST",
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

const ContentUpdatePersist = async function (id, body) {
    const response = await fetch(`http://api.localhost/v2/content/${id}`, {
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

const GetContent = async function (id) {
    const response = await fetch(`http://api.localhost/v2/content/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-session": localStorage.getItem('session') ?? null
        }
    });
    const resultStatus = await response.ok;
    if (resultStatus) {
        const resultJson = await response.json();
        return resultJson.data;
    }
    return {
        error: response.status.error
    };
};


document.addEventListener('DOMContentLoaded', async function()
{

    const content = contentId ? await GetContent(contentId) : null;

    const contentEditor = document.querySelector('#content-editor');

    const body_editor = ace.edit("body_editor", {
        mode: "ace/mode/javascript",
        minLines: 10,
        // maxLines: 10000,
        tabSize: 4,
        showPrintMargin: false
    });
    const config_editor = ace.edit("config_editor", {
        mode: "ace/mode/javascript",
        minLines: 10,
        // maxLines: 10000,
        tabSize: 4,
        showPrintMargin: false
    });

    if (!content){
        contentEditor.content_type.addEventListener('change', async function(){
            const schema = await contentTypeSchema(this.value);
            body_editor.setValue(js_beautify(JSON.stringify(schema), {indent_size: 4}));
        });
    }

    if (content) {
        body_editor.setValue(js_beautify(JSON.stringify(content.body), {
            indent_size: 4
        }));
        config_editor.setValue(js_beautify(JSON.stringify(content.config), {
            indent_size: 4
        }));

        contentEditor.content_type.value = content.content_type_id;
        contentEditor.title.value = content.title;
        contentEditor.name.value = content.name;
        contentEditor.path.value = content.path;
        contentEditor.description.value = content.description;
    }
    
    contentEditor.addEventListener('submit', async function(e){
        e.preventDefault();

        const contentValues = {
            body: JSON.parse(body_editor.getValue()),
            config: JSON.parse(config_editor.getValue()),
            Content_type_id: contentEditor.content_type.value,
            title: contentEditor.title.value,
            name: contentEditor.name.value,
            path: contentEditor.path.value,
            description: contentEditor.description.value
        };
        if(content){
            const updateContent = await ContentUpdatePersist(content.id, contentValues);
            if(updateContent.data){
                alert("Content updated successfully");
            }
        }else{
            const newContent = await ContentCreatePersist(contentValues);
            window.location.href = `content-editor.html?id=${newContent.data.id}`;
        }
    });
});