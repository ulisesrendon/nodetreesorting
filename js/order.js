const mainItem = document.createElement('div');
mainItem.classList.add('list-group-item');
mainItem.classList.add('nested');

function fieldRender(title) {
    const newItem = mainItem.cloneNode();
    newItem.innerHTML = `${title} <div class="list-group nested-sortable"></div>`;
    new Sortable(newItem, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
    return newItem;
}

document.addEventListener('DOMContentLoaded', function(){

    const entityMain = document.querySelector("#entityMain");
    new Sortable(entityMain, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });

    let entityMap = [];
    for(let i = 0; i<contentFields.length; i++){
        contentFields[i].ref = fieldRender(contentFields[i].title);
        entityMain.appendChild(contentFields[i].ref);
        entityMap[contentFields[i].id] = contentFields[i];
    }

    for (id in entityMap) {
        if( entityMap[id].parent != 0 ){
            entityMap[entityMap[id].parent].ref.appendChild(entityMap[id].ref);
        }
    }

});