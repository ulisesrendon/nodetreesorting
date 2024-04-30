const urlParams = new URLSearchParams(window.location.search);
const pageNumber = urlParams.get('page') ?? 1;
const perPage = urlParams.get('perpage') ?? 20;
let orderDirection = urlParams.get('direction') ?? 'asc';
let orderby = urlParams.get('orderby') ?? 'stock_price';
const directions = {
    true: "asc",
    false: "desc",
};

const getItemSoldData = async function ({ pageNumber, perPage, direction, orderby, csvFormat }) {
    csvFormat = csvFormat ?? false;

    let endpoint = `http://api.localhost/v2/report/itemsold?direction=${direction}&orderby=${orderby}&perpage=${perPage}&page=${pageNumber}`;

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

const baseAppTemplate = function (pageNumber, totalpages, perPage){
    return `
        <h1 style="text-align:center">Reporte de productos vendidos</h1>
        <div>
            <div>Pagina: ${pageNumber}/${totalpages}</div>
            <div>Productos por pagina: ${perPage}</div>
            <div><button type="button" class="downloadReport">Descargar</button></div>
        </div>
        <table>
            <tr>
                <th data-order="barcode">Barcode ▲</th>
                <th data-order="product">Product ▲</th>
                <th data-order="stock_price">Costo del inventario ▲</th>
                <th data-order="stock">Stock ▲</th>
                <th>Precio</th>
                <th>Client</th>
                <th>Order</th>
            </tr>
        </table>
        <div class="paginator"></div>

        <style>
        #itemsold-app table{
            margin: 0 auto;
            width: 100%;
        }
        #itemsold-app tr:nth-child(even) {
            background-color: #f0f0f0;
        }
        #itemsold-app td {
            padding: 1rem;
        }
        .centering-cell{
            display: flex;
            align-items: center;
            justify-content: center
        }
        #itemsold-app .paginator{
            padding: 1rem;
            text-align:center;
        }
        #itemsold-app .paginator a {
            display: inline-block;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin: 0.2rem;
        }
        </style>
    `;
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
            newRow.innerHTML = `
                <tr>
                    <td><div class="centering-cell">${code}</div></td>
                    <td>
                        <div class="centering-cell">
                            ${ItemSoldData.list[code][i].name} ${ItemSoldData.list[code][i].molecule} ${ItemSoldData.list[code][i].dose} ${ItemSoldData.list[code][i].pharmaceutical_form}
                        </div>
                    </td>
                    <td>
                        <div>
                            $${ItemSoldData.list[code][i].stock_price}
                        </div>
                    </td>
                    <td>
                        ${ItemSoldData.list[code][i].stock}
                    </td>
                    <td>
                        <div>
                            <p>Precio de venta: $${ItemSoldData.list[code][i].unit_price} ${ItemSoldData.list[code][i].percent_discount}</p>
                            <p>Precio actual: $${ItemSoldData.list[code][i].sell_price}</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>Id</strong>: ${ItemSoldData.list[code][i].client_id}
                        </div>
                        <div>
                            <strong>Nombre</strong>: ${ItemSoldData.list[code][i].client_name}
                        </div>
                        <div>
                            <strong>Mail</strong>: ${ItemSoldData.list[code][i].client_email}
                        </div>
                        <div>
                            <strong>Telefono</strong>: ${ItemSoldData.list[code][i].client_phone}
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>Order Id</strong>: ${ItemSoldData.list[code][i].order_id}
                        </div>
                        <div>
                            <strong>Fecha de la orden</strong>: ${ItemSoldData.list[code][i].created_date}
                        </div>
                        <div>
                            <strong>Fecha de pago</strong>: ${ItemSoldData.list[code][i].payment_method}
                        </div>
                    </td>
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

    const orderButtons = [...document.querySelectorAll("[data-order")];
    orderButtons.forEach(reportOrderAction);

    const reportDownloadButton = document.querySelector(".downloadReport");
    reportDownloadButton.addEventListener('click', reportDownloadAction);

});
