const mainItem = document.createElement('div');
mainItem.classList.add('list-group-item');
mainItem.classList.add('nested');

function nestedItem(title) {
    const newItem = mainItem.cloneNode();
    newItem.innerHTML = `${title} <div class="list-group nested-sortable"></div>`;
    return newItem;
}

document.addEventListener('DOMContentLoaded', function(){

    const entityMain = document.querySelector("#entity-main");
    new Sortable(entityMain, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });

    for(let i = 0; i<data.length; i++){
        const entityItem = nestedItem(data[i].title);
        new Sortable(entityItem, {
            group: 'nested',
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65
        });
        entityMain.appendChild(entityItem);
    }

});