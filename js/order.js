const mainItem = document.createElement('div');
mainItem.classList.add('list-group-item');
mainItem.classList.add('nested');

function fieldRender(field) {
    const newItem = mainItem.cloneNode();
    newItem.setAttribute('data-id', field.id)
    newItem.setAttribute('data-title', field.title)
    newItem.innerHTML = `id_${field.id} ${field.title}`;
    new Sortable(newItem, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
    return newItem;
}

document.addEventListener('DOMContentLoaded', function(){

    const entityOrderSave = document.querySelector("#entityOrderSave");

    let fieldList = localStorage.getItem('fieldList') || contentFields;

    if (typeof fieldList === 'string' ){
        fieldList = JSON.parse(fieldList);
    }

    const entityMain = document.querySelector("#entityMain");
    entityMain.setAttribute('data-id', 0);
    new Sortable(entityMain, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });

    let entityMap = [];
    for(let i = 0; i<fieldList.length; i++){
        entityMap[fieldList[i].id] = {
            "render": fieldRender(fieldList[i]),
            "data": fieldList[i]
        };
        entityMain.appendChild(entityMap[fieldList[i].id].render);
    }

    for (id in entityMap) {
        if( entityMap[id].data.parent != 0 ){
            entityMap[entityMap[id].data.parent].render.appendChild(entityMap[id].render);
        }
    }

    entityOrderSave.addEventListener('click', function(){
        for (id in entityMap) {
            entityMap[id].weight = Array.from(entityMap[id].render.parentNode.children).indexOf(entityMap[id].render);
        }

        entityMap.sort(function(a,b){
            return a.weight - b.weight;
        });

        let updatedFieldList = [];
        for (id in entityMap) {
            updatedFieldList.push({
                "id": entityMap[id].data.id,
                "title": entityMap[id].data.title,
                "type": entityMap[id].data.type,
                "parent": entityMap[id].render.parentNode.getAttribute('data-id')
            });
        }
        localStorage.setItem('fieldList', JSON.stringify(updatedFieldList));
    });


});