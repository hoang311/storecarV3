"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Biến lưu thông tin đối tượng Customer
var gCustomerObj = {
    lastName: "",
    firstName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    salesRepEmployeeNumber: -1,
    creditLimit: -1
};

// Biến lưu giá trị tổng số lượng các sản phẩm
var gTotalQuantityOrder = 0;

// Biến lưu thông tin đối tượng Order
var gOrderObj = {
    requiredDate: ""
};

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

// 2 - C: Create

// 3 - U: Update

// 4 - D: Delete

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện khi tải trang
function onPageLoading() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    loadNavUser();
    callAjaxApiGetUserFromToken(gTokenValue);
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

// gọi API lấy thông tin user từ token
function callAjaxApiGetUserFromToken(paramTokenValue) {
    $.ajax({
        url: gBASE_URL + "users/getfromtoken",
        type: "GET",
        headers: {
            "Authorization": "Token " + paramTokenValue
        },
        success: function(resUserObj) {
            gCustomerObj = resUserObj.customer;
            if (gCustomerObj) {
                loadOrderToDivMyOrder(gCustomerObj);
                $("#h2-my-orders").text("My Orders (" + gCustomerObj.orders.length + ")");
            }
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON !== undefined && err.responseJSON.errors !== undefined) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else if (err.responseJSON !== undefined && err.responseJSON.error !== undefined) {
                alert(err.responseJSON.error + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
            location.href = "signin.html";
        }
    });
}

// load thông tin các order của khách hàng
function loadOrderToDivMyOrder(paramCustomerObj) {
    for (let bIndex = 0; bIndex < paramCustomerObj.orders.length; bIndex++) {
        const bORDER_ELEMENT = paramCustomerObj.orders[bIndex];
        var vTotalToFixedString = 0;
        var vTotalToFixed = 0;
        bORDER_ELEMENT.orderDetails.forEach(bORDER_DETAIL_ELEMENT => {
            vTotalToFixed += bORDER_DETAIL_ELEMENT.priceEach * bORDER_DETAIL_ELEMENT.quantityOrder;
        });
        vTotalToFixedString = vTotalToFixed.toFixed(2);
        var vImageIndexString = getImageIndexString(bORDER_ELEMENT.orderDetails[0].productName);
        let vRatingStarHTML = getRatingStarHTML(bORDER_ELEMENT.orderDetails[0].rating);
        $("#div-my-order").append(`
            <div id="` + bORDER_ELEMENT.id + `" class="row py-2 px-0 mb-3 border">
                <div class="col-12">
                    <a href="orderdetail.html?orderid=` + bORDER_ELEMENT.id + `" class="row text-decoration-none text-dark">
                        <div class="col-2">
                            <img src="image/` + vImageIndexString + `.jpg" alt="" class="w-100 rounded">
                        </div>
                        <div class="col-10">
                            <h3 class="mb-0">` + bORDER_ELEMENT.orderDetails[0].productName + `</h3>
                            <span class="text-capitalize small">product code: ` + bORDER_ELEMENT.orderDetails[0].productCode + `</span>
                            <div class="row align-items-end">
                                <div class="col-8">
                                    Quantity:
                                    <span class="font-weight-bold">` + bORDER_ELEMENT.orderDetails[0].quantityOrder + `</span>
                                </div>
                                <div class="col-4 text-right">
                                    Price:
                                    <span class="text-danger h4">$` + bORDER_ELEMENT.orderDetails[0].priceEach + `</span>
                                </div>
                            </div>
                            <span class="text-capitalize">
                                Your Rating & Review:
                                ` + vRatingStarHTML + `
                            </span>
                        </div>
                        <div class="col-12">
                            <hr class="mb-0">
                            <div class="text-capitalize small text-center">See order details</div>
                            <hr class="mt-1">
                        </div>
                    </a>
                </div>   
                <div class="col-12">
                    <h4 class="font-weight-bold text-uppercase text-danger text-right">total: $` + vTotalToFixedString + `</h4>
                </div>
            </div>
        `);
    }
}

// lấy ảnh sản phẩm
function getImageIndexString(paramProductName) {
    var vImageIndex = 0;
    var vImageIndexString = "car";
    var vFoundImage = false;
    var vProductNameArray = ["Prowler", "Renault", "Ford Mustang", "Convertible", "1956 Porsche 356A Coupe", "Porsche", "Chevrolet", "Mercedes"];
    for (let bIndex = 0; !vFoundImage && bIndex < vProductNameArray.length; bIndex++) {
        const element = vProductNameArray[bIndex];
        var vPattern = new RegExp(element, "i");
        if (vPattern.test(paramProductName)) {
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

// lấy HTML số sao rating 
function getRatingStarHTML(paramRating) {
    let vRatingStarHTML = "";
    switch (paramRating) {
        case 1:
            vRatingStarHTML = `
                <i class="fas fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
            `
            break;
        case 2:
            vRatingStarHTML = `
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
            `
            break;
        case 3:
            vRatingStarHTML = `
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
            `
            break;
        case 4:
            vRatingStarHTML = `
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
            `
            break;
        case 5:
            vRatingStarHTML = `
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
                <i class="fas fa-star text-warning"></i>
            `
            break;
        default:
            vRatingStarHTML = `
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
                <i class="far fa-star text-warning"></i>
            `
    }
    return vRatingStarHTML;
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