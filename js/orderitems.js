const urlParams = new URLSearchParams(window.location.search);
const pageNumber = urlParams.get('page') ?? 1;
const perPage = urlParams.get('perpage') ?? 20;
let orderDirection = urlParams.get('direction') ?? 'desc';
let orderby = urlParams.get('orderby') ?? 'stock_price';
let search = urlParams.get('search') ?? null;
const directions = {
    true: "asc",
    false: "desc",
};

const getItemSoldData = async function ({ pageNumber, perPage, direction, orderby, csvFormat }) {
    csvFormat = csvFormat ?? false;

    let endpoint = `http://api.localhost/v2/report/itemsold?direction=${direction}&orderby=${orderby}&perpage=${perPage}&page=${pageNumber}`;

    if (search) {
        endpoint += `&search=${search}`;
    }

    if(csvFormat){
        endpoint += '&csv'
    }
 
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-session": localStorage.getItem('session') ?? null
        }
    });
    const resultStatus = await response.ok;
    if (resultStatus && !csvFormat ) {
        return await response.json();
    } else if (resultStatus && csvFormat){
        return await response.text();
    }
    return {
        error: response.status
    };
};

const reportDownloadAction = async function (e) {
    const ItemSoldData = await getItemSoldData({
        pageNumber: pageNumber,
        perPage: perPage,
        direction: orderDirection,
        orderby: orderby,
        csvFormat: true
    });

    const blob = new Blob([ItemSoldData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url);
    a.setAttribute('download', `report-${pageNumber}-${perPage}-${orderDirection}-${orderby}.csv`);
    a.click();
};

const reportOrderAction = item => {
    item.addEventListener('click', function () {
        orderDirection = orderDirection == 'asc' ? 'desc' : 'asc';
        orderby = item.getAttribute("data-order");
        window.location.href = `itemsold.html?direction=${orderDirection}&orderby=${orderby}&perpage=${perPage}&page=1`
    });
};

const generatePaginator = function ({ selector, totalpages, orderDirection, orderby, perPage }){
    const paginator = document.querySelector(selector);
    for (let i = 1; i <= totalpages; i++) {
        const link = document.createElement('a');
        link.href = `itemsold.html?direction=${orderDirection}&orderby=${orderby}&perpage=${perPage}&page=${i}`;
        link.innerHTML = i;
        paginator.appendChild(link);
    }
};

const baseAppTemplate = function (pageNumber, totalpages, perPage) {
    return `
        <h1 style="text-align:center">Reporte de productos vendidos</h1>
        <div class="centering-cell">
            <div>
                <div>Pagina: ${pageNumber}/${totalpages}</div>
                <div>Productos por pagina: ${perPage}</div>
            </div>
            <form method="get" action="" class="centering-cell report-search">
            <div><input type="text" name="search" placeholder="Buscar"></div>
            <div><input type="submit" name="" value="Buscar"></div>
            </form>
            <div><a href="itemsold.html"><button type="button">Borrar</button></a></div>
            <div><button type="button" class="downloadReport">Descargar reporte</button></div>
        </div>
        
        <table>
            <tr>
                <th data-order="barcode">Barcode ▲</th>
                <th data-order="product">Descripción ▲</th>
                <th data-order="stock_price">Valor ▲</th>
                <th data-order="price">Precio ▲</th>
                <th data-order="stock">Stock ▲</th>
                <th>Opciones</th>
            </tr>
        </table>
        <div class="paginator"></div>
    `;
};

document.addEventListener("DOMContentLoaded", async function(){
    const ItemSoldData = await getItemSoldData({
        pageNumber: pageNumber,
        perPage:perPage,
        direction: orderDirection,
        orderby: orderby
    });
    const appBase = document.querySelector("#itemsold-app");
    appBase.innerHTML = baseAppTemplate(pageNumber, ItemSoldData.totalpages, perPage);

    const appTable = document.querySelector("#itemsold-app table");

    for (code in ItemSoldData.list){
        for(let i = 0; i<ItemSoldData.list[code].length; i++){
            const newRow = document.createElement('tr');

            let extraCols = '';
            for (quarter in ItemSoldData.list[code][i].lotsbyquarter ){
                extraCols += `
                    <td>
                        ${ItemSoldData.list[code][i].lotsbyquarter[quarter]}
                    </td>
                `;
            }

            newRow.innerHTML = `
                <tr>
                    <td><div class="centering-cell">${code}</div></td>
                    <td style="max-width: 500px">
                        <div class="centering-cell">
                            ${ItemSoldData.list[code][i].description}
                        </div>
                    </td>
                    <td>
                        <div>
                            $${ItemSoldData.list[code][i].stock_price}
                        </div>
                    </td>
                    <td>
                        ${ItemSoldData.list[code][i].sell_price}
                    </td>
                    <td>
                        ${ItemSoldData.list[code][i].stock}
                    </td>
                    <td class="centering-cell">
                        <a href="itemsoldbyclient.html?search=${ItemSoldData.list[code][i].barcode}">Ver ventas</a
                    </td>
                    ${extraCols}
                </tr>
            `;

            appTable.appendChild(newRow);
        }

    }

    generatePaginator({
        selector: ".paginator",
        totalpages: ItemSoldData.totalpages,
        orderDirection: orderDirection, 
        orderby: orderby, 
        perPage: perPage
    });

    [...document.querySelectorAll("[data-order")].forEach(reportOrderAction);

    const reportDownloadButton = document.querySelector(".downloadReport");
    reportDownloadButton.addEventListener('click', reportDownloadAction);

    document.querySelector('.report-search').addEventListener('submit', function(e){
        e.preventDefault();
        window.location.href = `itemsold.html?direction=${orderDirection}&orderby=${orderby}&perpage=${perPage}&page=1&search=${this.search.value}`;
    });

});
