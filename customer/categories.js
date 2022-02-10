"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến hằng lưu giá trị tổng số lượng các sản phẩm
var gTotalQuantityOrder = 0;

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Biến toàn cục lưu thông tin bộ lọc sản phẩm
var gProductLineIdArray = [];

// Biến lưu thông tin đối tượng Order Detail
var gOrderDetailObj = {
    productId: -1,
    quantityOrder: -1,
    priceEach: -1
};

// Hằng số lưu thông tin ID productline 
const gCLASSIC_CARS_ID = "1";
const gMOTORCYCLES_ID = "2";
const gPLANES_ID = "3";
const gSHIPS_ID = "4";
const gTRAINS_ID = "5";
const gTRUCKS_AND_BUSES_ID = "6";
const gVINTAGE_CARS_ID = "7";

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// xử lý sự kiện khi ấn log out
$("#a-log-out").on({
    click: function() {
        onALogOutClick();
    }
});

// xử lý sự kiện khi ấn nút search
$("#btn-search").on({
    click: function() {
        onBtnSearchClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Classic Cars
$("#inp-classic-cars").on({
    click: function() {
        onInpClassicCarsClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Motorcycles
$("#inp-motorcycles").on({
    click: function() {
        onInpMotorcyclesClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Planes
$("#inp-planes").on({
    click: function() {
        onInpPlanesClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Ships
$("#inp-ships").on({
    click: function() {
        onInpShipsClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Trains
$("#inp-trains").on({
    click: function() {
        onInpTrainsClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Trucks and Buses
$("#inp-trucks-and-buses").on({
    click: function() {
        onInpTrucksAndBusesClick();
    }
});

// xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Vintage Cars
$("#inp-vintage-cars").on({
    click: function() {
        onInpVintageCarsClick();
    }
});

// thực thi sự kiện khi khách hàng ấn nút Buy now
$("#categories-info").on({
    click: function() {
        onBtnBuyNowClick(this);
    }
}, ".btn-buy-now");

// thực thi sự kiện khi khách hàng ấn nút Add to cart
$("#categories-info").on({
    click: function() {
        onBtnAddToCartClick(this);
    }
}, ".btn-add-to-cart");

// 2 - C: Create

// 3 - U: Update

// 4 - D: Delete

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện khi tải trang
function onPageLoading() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    let vUrl = new URL(location.href);
    let vParam = vUrl.searchParams.toString();
    let vProductPageNumber = vUrl.searchParams.get("page");
    let vProductNameSearch = vUrl.searchParams.get("productnamesearch");
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    if (!vProductPageNumber) {
        vProductPageNumber = 1;
        location.href = "categories.html?page=" + vProductPageNumber + "&" + vParam;
    }
    if (vProductNameSearch) {
        $("#inp-search").val(vProductNameSearch);
        callAjaxApiGetProductSearch(vProductPageNumber, vProductNameSearch);
    } else {
        gProductLineIdArray = vUrl.searchParams.getAll("productlineid");
        if (gProductLineIdArray.includes(gCLASSIC_CARS_ID)) {
            $('#inp-classic-cars').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gMOTORCYCLES_ID)) {
            $('#inp-motorcycles').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gPLANES_ID)) {
            $('#inp-planes').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gSHIPS_ID)) {
            $('#inp-ships').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gTRAINS_ID)) {
            $('#inp-trains').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gTRUCKS_AND_BUSES_ID)) {
            $('#inp-trucks-and-buses').prop('checked', true);
        }
        if (gProductLineIdArray.includes(gVINTAGE_CARS_ID)) {
            $('#inp-vintage-cars').prop('checked', true);
        }
        loadNavUser();
        callApiNLoadProduct(vProductPageNumber, vProductNameSearch);
    }
    getCartTotalQuantityOrder();
}

// hàm xử lý sự kiện ấn log out
function onALogOutClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    setCookie(gTOKEN_NAME, "", 1);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    onPageLoading();
}

// hàm xử lý sự kiện khi search
function onBtnSearchClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    let vInpSearch = $("#inp-search").val().trim();
    let vProductPageNumber = 1;
    let vUrlToOpen = "categories.html?page=" + vProductPageNumber + "&productnamesearch=" + vInpSearch;
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Classic Cars
function onInpClassicCarsClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-classic-cars").is(":checked")) {
        gProductLineIdArray.push(gCLASSIC_CARS_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gCLASSIC_CARS_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Motorcycles
function onInpMotorcyclesClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-motorcycles").is(":checked")) {
        gProductLineIdArray.push(gMOTORCYCLES_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gMOTORCYCLES_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Planes
function onInpPlanesClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-planes").is(":checked")) {
        gProductLineIdArray.push(gPLANES_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gPLANES_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Ships
function onInpShipsClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-ships").is(":checked")) {
        gProductLineIdArray.push(gSHIPS_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gSHIPS_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Trains
function onInpTrainsClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-trains").is(":checked")) {
        gProductLineIdArray.push(gTRAINS_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gTRAINS_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Trucks and Buses
function onInpTrucksAndBusesClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-trucks-and-buses").is(":checked")) {
        gProductLineIdArray.push(gTRUCKS_AND_BUSES_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gTRUCKS_AND_BUSES_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// hàm xử lý sự kiện khi chọn bộ lọc dòng sản phẩm Vintage Cars
function onInpVintageCarsClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    var vProductPageNumber = 1;
    var vUrlToOpen = "categories.html?page=" + vProductPageNumber;
    if ($("#inp-vintage-cars").is(":checked")) {
        gProductLineIdArray.push(gVINTAGE_CARS_ID);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    } else {
        var vIndex = gProductLineIdArray.indexOf(gVINTAGE_CARS_ID);
        gProductLineIdArray.splice(vIndex, 1);
        for (let bIndex = 0; bIndex < gProductLineIdArray.length; bIndex++) {
            const bProductLineIdElement = gProductLineIdArray[bIndex];
            vUrlToOpen += ("&productlineid=" + bProductLineIdElement);
        }
    }
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = vUrlToOpen;
}

// xử lý sự kiện khi ấn nút Buy Now
function onBtnBuyNowClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gOrderDetailObj.productId = $(paramBtn).attr("data-product-id");
    gOrderDetailObj.quantityOrder = 1;
    gOrderDetailObj.priceEach = $(paramBtn).attr("data-price-each");;
    if (!localStorage.orderDetailsArray) {
        localStorage.orderDetailsArray = JSON.stringify([]);
    }
    const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
    if (vORDER_DETAILS_ARRAY.length !== 0) {
        var vFoundProductId = false;
        for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
            const bOrderDetailElement = vORDER_DETAILS_ARRAY[bIndex];
            if (gOrderDetailObj.productId == bOrderDetailElement.productId) {
                bOrderDetailElement.quantityOrder += gOrderDetailObj.quantityOrder;
                vFoundProductId = true;
            }
        }
        if (!vFoundProductId) {
            vORDER_DETAILS_ARRAY.push(gOrderDetailObj);
        }
    } else {
        vORDER_DETAILS_ARRAY.push(gOrderDetailObj);
    }
    localStorage.orderDetailsArray = JSON.stringify(vORDER_DETAILS_ARRAY);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = "cart.html";
}

// xử lý sự kiện khi ấn nút Add to cart
function onBtnAddToCartClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gOrderDetailObj.productId = $(paramBtn).attr("data-product-id");
    gOrderDetailObj.quantityOrder = 1;
    gOrderDetailObj.priceEach = $(paramBtn).attr("data-price-each");;
    if (typeof localStorage.orderDetailsArray == "undefined" || typeof localStorage.orderDetailsArray == null) {
        localStorage.orderDetailsArray = JSON.stringify([]);
    }
    const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
    if (vORDER_DETAILS_ARRAY.length !== 0) {
        var vFoundProductId = false;
        for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
            const element = vORDER_DETAILS_ARRAY[bIndex];
            if (gOrderDetailObj.productId == element.productId) {
                element.quantityOrder += gOrderDetailObj.quantityOrder;
                vFoundProductId = true;
            }
        }
        if (!vFoundProductId) {
            vORDER_DETAILS_ARRAY.push(gOrderDetailObj);
        }
    } else {
        vORDER_DETAILS_ARRAY.push(gOrderDetailObj);
    }
    localStorage.orderDetailsArray = JSON.stringify(vORDER_DETAILS_ARRAY);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    addAddToCartEffect(paramBtn);
}

/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
// hàm lấy giá trị của 1 cookie xác định 
function getCookieValue(paramCookieName) {
    let vTokenValue = "";
    let vCookieNameStringForCheck = paramCookieName + "=";
    let vDecodedCookie = decodeURIComponent(document.cookie);
    let vCookieArray = vDecodedCookie.split(';');
    for (let i = 0; i < vCookieArray.length; i++) {
        let bCookieElement = vCookieArray[i];
        while (bCookieElement.charAt(0) == ' ') {
            bCookieElement = bCookieElement.substring(1);
        }
        if (bCookieElement.indexOf(vCookieNameStringForCheck) == 0) {
            vTokenValue = bCookieElement.substring(vCookieNameStringForCheck.length, bCookieElement.length);
        }
    }
    return vTokenValue;
}

// hàm set cookie lưu vào trình duyệt
function setCookie(paramCookieName, paramCookieValue, paramExpireDays) {
    const vEXPIRES_TIME = new Date();
    vEXPIRES_TIME.setTime(vEXPIRES_TIME.getTime() + (paramExpireDays * 24 * 60 * 60 * 1000));
    let vExpiresString = "expires=" + vEXPIRES_TIME.toUTCString();
    document.cookie = paramCookieName + "=" + paramCookieValue + ";" + vExpiresString + ";path=/";
}

// hàm xử lý hiển thị nav user
function loadNavUser() {
    if (!gTokenValue) {
        $("#nav-user").html(`
            <span class="nav-link text-secondary">
                <a class="text-secondary" href="signin.html">
                    sign in
                </a>
                /
                <a class="text-secondary" href="signup.html">
                    sign up
                </a>
            </span>
        `);
    }
    if (gTokenValue) {
        $("#nav-user")
            .addClass("dropdown btn-group")
            .html(`
            <a class="nav-link dropdown-toggle text-secondary" id="navbarDropdown3" role="button"
                data-toggle="dropdown" dropdown-toggle-split="" aria-haspopup="true"
                aria-expanded="false">
                <i class="fas fa-user fa-lg"></i>
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown3">
                <a class="dropdown-item" href="order.html">My order</a>
                <a class="dropdown-item" href="account.html">My account</a>
                <a id="a-log-out" class="dropdown-item">Log out</a>
            </div>
        `);
    }
}

// lấy thông tin và hiển thị số sản phẩm trong giỏ hàng 
function getCartTotalQuantityOrder() {
    gTotalQuantityOrder = 0;
    if (localStorage.orderDetailsArray) {
        const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
        if (vORDER_DETAILS_ARRAY.length !== 0) {
            for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
                const element = vORDER_DETAILS_ARRAY[bIndex];
                gTotalQuantityOrder += element.quantityOrder;
            }
        }
    }
    $("#badge-total-quantity-order").text(gTotalQuantityOrder);
}

// gọi API và load thông tin sản phẩm
function callApiNLoadProduct(paramProductPageNumber) {
    if (gProductLineIdArray.length == 0) {
        callAjaxApiGetProductList(paramProductPageNumber);
    } else if (gProductLineIdArray.length == 1) {
        callAjaxApiGetProductsOfProductline(paramProductPageNumber, gProductLineIdArray);
    } else if (gProductLineIdArray.length >= 1) {
        callAjaxApiGetProductsOfManyProductlines(paramProductPageNumber, gProductLineIdArray);
    }
}

// gọi API lấy thông tin danh sách Products
function callAjaxApiGetProductSearch(paramProductPageNumber, paramProductNameSearch) {
    var vProductPageNumberParseInt = parseInt(paramProductPageNumber);
    $.ajax({
        url: gBASE_URL + "products/productsearch?page=" + (vProductPageNumberParseInt - 1) + "&productnamesearch=" + paramProductNameSearch,
        type: "GET",
        success: function(resProductList) {
            loadProductList(resProductList, vProductPageNumberParseInt);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON && err.responseJSON.errors) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else if (err.responseJSON && err.responseJSON.error) {
                alert(err.responseJSON.error + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API lấy thông tin danh sách Products
function callAjaxApiGetProductList(paramProductPageNumber) {
    var vProductPageNumberParseInt = parseInt(paramProductPageNumber);
    $.ajax({
        url: gBASE_URL + "productlines/products?page=" + (vProductPageNumberParseInt - 1),
        type: "GET",
        success: function(resProductList) {
            loadProductList(resProductList, vProductPageNumberParseInt);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON && err.responseJSON.errors) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else if (err.responseJSON && err.responseJSON.error) {
                alert(err.responseJSON.error + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API lấy thông tin danh sách Products theo Productline id
function callAjaxApiGetProductsOfProductline(paramProductPageNumber, paramProductLineIdArray) {
    var vProductPageNumberParseInt = parseInt(paramProductPageNumber);
    $.ajax({
        url: gBASE_URL + "productlines/" + paramProductLineIdArray + "/products?page=" + (vProductPageNumberParseInt - 1),
        type: "GET",
        success: function(resProductList) {
            loadProductList(resProductList, vProductPageNumberParseInt);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON && err.responseJSON.errors) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else if (err.responseJSON && err.responseJSON.error) {
                alert(err.responseJSON.error + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API lấy thông tin danh sách Products theo nhiều Productline id
function callAjaxApiGetProductsOfManyProductlines(paramProductPageNumber, paramProductLineIdArray) {
    var vProductPageNumberParseInt = parseInt(paramProductPageNumber);
    $.ajax({
        url: gBASE_URL + "products/productlines?productlineids=" + paramProductLineIdArray + "&page=" + (vProductPageNumberParseInt - 1),
        type: "GET",
        success: function(resProductList) {
            loadProductList(resProductList, vProductPageNumberParseInt);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON && err.responseJSON.errors) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else if (err.responseJSON && err.responseJSON.error) {
                alert(err.responseJSON.error + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// hiển thị danh sách Products 
function loadProductList(paramProductList, paramProductPageNumberParseInt) {
    var vCategoriesInfoSelector = $("#categories-info");
    vCategoriesInfoSelector.empty();
    for (let bIndex = 0; bIndex < paramProductList.content.length; bIndex++) {
        const bPRODUCT_ELEMENT = paramProductList.content[bIndex];
        if (bIndex % 3 == 0) {
            var vCardDeckSelector = $("<div/>", {
                "class": "card-deck mt-4"
            }).appendTo(vCategoriesInfoSelector);
        }

        var vImageIndexString = getImageIndexString(bPRODUCT_ELEMENT);

        vCardDeckSelector.append(`
            <div class="card">
                <a href="single.html?productid=` + bPRODUCT_ELEMENT.id + `" class="text-dark text-decoration-none">
                    <img class="card-img-top" src="image/` + vImageIndexString + `.jpg" alt="Card image">
                </a>
                <div class="card-header bg-white border-0">
                    <a href="single.html?productid=` + bPRODUCT_ELEMENT.id + `" class="text-dark text-decoration-none">
                        <h6 class="card-title text-uppercase">` + bPRODUCT_ELEMENT.productName + `</h6>
                        <h6 class="card-subtitle text-muted">Read more</h6>
                    </a>
                </div>
                <div class="card-footer bg-white border-0 mt-auto">
                    <h5 class="card-title">$` + bPRODUCT_ELEMENT.highestPriceEach + `</h5>
                    <button data-product-id="` + bPRODUCT_ELEMENT.id + `" data-price-each="` + bPRODUCT_ELEMENT.highestPriceEach + `" class="btn btn-outline-warning text-uppercase btn-buy-now">
                        BUY NOW
                    </button>
                    <button data-product-id="` + bPRODUCT_ELEMENT.id + `" data-price-each="` + bPRODUCT_ELEMENT.highestPriceEach + `" class="btn btn-outline-info btn-add-to-cart">
                        Add to cart
                    </button>
                </div>
            </div>
        `);
    }
    var vQueryString = location.search;
    if (paramProductPageNumberParseInt == 1) {
        vCategoriesInfoSelector.append(`
            <ul class="pagination justify-content-end mt-3">
                <li class="page-item active"><a class="page-link" href="categories.html` + vQueryString + `">` + paramProductPageNumberParseInt + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt + 1)) + `">` + (paramProductPageNumberParseInt + 1) + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt + 2)) + `">` + (paramProductPageNumberParseInt + 2) + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt + 1)) + `">Next</a></li>
            </ul>
        `);
    } else if (paramProductPageNumberParseInt == Math.ceil(paramProductList.totalElements / 9)) {
        vCategoriesInfoSelector.append(`
            <ul class="pagination justify-content-end mt-3">
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt - 1)) + `">Previous</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt - 2)) + `">` + (paramProductPageNumberParseInt - 2) + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt - 1)) + `">` + (paramProductPageNumberParseInt - 1) + `</a></li>
                <li class="page-item active"><a class="page-link" href="categories.html` + vQueryString + `">` + paramProductPageNumberParseInt + `</a></li>
            </ul>
        `);
    } else if (paramProductPageNumberParseInt > 1 && paramProductPageNumberParseInt <= Math.ceil(paramProductList.totalElements / 9)) {
        vCategoriesInfoSelector.append(`
            <ul class="pagination justify-content-end mt-3">
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt - 1)) + `">Previous</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt - 1)) + `">` + (paramProductPageNumberParseInt - 1) + `</a></li>
                <li class="page-item active"><a class="page-link" href="categories.html` + vQueryString + `">` + paramProductPageNumberParseInt + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt + 1)) + `">` + (paramProductPageNumberParseInt + 1) + `</a></li>
                <li class="page-item"><a class="page-link" href="categories.html` + vQueryString.replace("page=" + paramProductPageNumberParseInt, "page=" + (paramProductPageNumberParseInt + 1)) + `">Next</a></li>
            </ul>
        `);
    }
}

// lấy ảnh sản phẩm
function getImageIndexString(paramProductObj) {
    var vImageIndex = 0;
    var vImageIndexString = "car";
    var vFoundImage = false;
    var vProductNameArray = ["Prowler", "Renault", "Ford Mustang", "Convertible", "1956 Porsche 356A Coupe", "Porsche", "Chevrolet", "Mercedes"];
    for (let bIndex = 0; !vFoundImage && bIndex < vProductNameArray.length; bIndex++) {
        const element = vProductNameArray[bIndex];
        var vPattern = new RegExp(element, "i");
        var vProductName = paramProductObj.productName;
        if (vPattern.test(vProductName)) {
            vImageIndex = bIndex + 1;
            vImageIndexString = vImageIndexString + vImageIndex;
            vFoundImage = true;
        }
    }
    if (vImageIndexString == "car") {
        vImageIndexString = "transportation";
    }
    return vImageIndexString;
}

// hiệu ứng khi thêm sản phẩm Add to cart
function addAddToCartEffect(paramBtn) {
    var vCart = $('.fa-shopping-cart');
    var vImgToDrag = $(paramBtn).parents('div:eq(1)').find("img");
    if (vImgToDrag) {
        var vImgClone = vImgToDrag
            .clone()
            .offset({
                top: vImgToDrag.offset().top,
                left: vImgToDrag.offset().left
            })
            .css({
                'opacity': '0.7',
                'position': 'absolute',
                width: vImgToDrag.width(),
                height: "auto",
                'z-index': '100'
            })
            .appendTo($('body'))
            .animate({
                top: vCart.offset().top,
                left: vCart.offset().left + 25,
                width: 3,
                height: "auto"
            }, 1000);

        setTimeout(function() {
            vCart.effect("shake", {
                distance: 5,
                times: 2
            }, 5);
        }, 1000);

        vImgClone.animate({
            'width': 0,
            'height': 0
        }, function() {
            $(this).remove();
        });
    }
    getCartTotalQuantityOrder();
}