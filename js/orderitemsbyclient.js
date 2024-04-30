const urlParams = new URLSearchParams(window.location.search);
const pageNumber = urlParams.get('page') ?? 1;
const perPage = urlParams.get('perpage') ?? 10;
let orderDirection = urlParams.get('direction') ?? 'desc';
let orderby = urlParams.get('orderby') ?? 'stock_price';
let search = urlParams.get('search') ?? null;
const directions = {
    true: "asc",
    false: "desc",
};

const getItemSoldData = async function ({ csvFormat }) {
    csvFormat = csvFormat ?? false;

    let endpoint = `http://api.localhost/v2/report/itemsoldbyclient?&search=${search}`;

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
        csvFormat: true
    });

    const blob = new Blob([ItemSoldData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url);
    a.setAttribute('download', `report-${search}.csv`);
    a.click();
};

const baseAppTemplate = function () {
    return `
        <h1 style="text-align:center">Reporte de productos vendidos por cliente</h1>
        <div class="centering-cell">
            <div><a href="itemsold.html">Vista principal</a></div>
            <form method="get" action="" class="centering-cell report-search">
                <div><input type="text" name="search" placeholder="Buscar"></div>
                <div><input type="submit" name="" value="Buscar"></div>
            </form>
            <div><button type="button" class="downloadReport">Descargar reporte</button></div>
        </div>
        
        <table>
            <tr>
                <th>Barcode</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Client</th>
                <th>Order</th>
            </tr>
        </table>
    `;
};

document.addEventListener("DOMContentLoaded", async function(){
    const ItemSoldData = await getItemSoldData({
        search: search,
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
                    <td style="max-width: 500px">
                        <div class="centering-cell">
                            ${ItemSoldData.list[code][i].description}
                        </div>
                    </td>
                    <td>
                        ${ItemSoldData.list[code][i].pieces}
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

    const reportDownloadButton = document.querySelector(".downloadReport");
    reportDownloadButton.addEventListener('click', reportDownloadAction);

    document.querySelector('.report-search').addEventListener('submit', function(e){
        e.preventDefault();
        window.location.href = `itemsoldbyclient.html?search=${this.search.value}`;
    });

});
