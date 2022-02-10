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

// Biến hằng lưu giá trị tổng tiền
var gTotalToFixedString = 0;

// Biến lưu thông tin đối tượng Order
var gOrderObj = {
    requiredDate: "",
    orderDetails: []
};

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

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
// thực hiện hiển thị AdminLTE cho Select2 và Date
$(document).ready(function() {
    //Money Euro (active Datemask dd/mm/yyyy)
    $('[data-mask]').inputmask()

    //Date picker
    $('#reservationdate-required').datetimepicker({
        format: 'DD/MM/YYYY'
    });
});

// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// xử lý sự kiện khi ấn log out
$("#a-log-out").on({
    click: function() {
        onALogOutClick();
    }
});

// xử lý sự kiện khi thay đổi số lượng sản phẩm
$("#cart-product").on({
    change: function() {
        onInpQuantityChange(this);
    }
}, ".inp-quantity");

// xử lý sự kiện khi ấn nút xoá sản phẩm
$("#cart-product").on({
    click: function() {
        onBtnCloseClick(this);
    }
}, ".close");

// 2 - C: Create
// xử lý sự kiện khi ấn nút Place Order
$("#cart-total").on({
    click: function() {
        onBtnPlaceOrderClick();
    }
}, ".btn-place-order");

// xử lý sự kiện khi ấn nút confirm đơn hàng và thanh toán
$("#modal-ordernpayment-btn-confirm").on({
    click: function() {
        onModalOrdernpaymentBtnConfirmClick();
    }
});

// 3 - U: Update

// 4 - D: Delete

// thực thi sự kiện khi đóng modal Order and Payment
$("#modal-ordernpayment").on({
    "hidden.bs.modal": function() {
        onModalOrdernpaymentClose();
    }
});

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện khi tải trang
function onPageLoading() {
    // B0: tạo đối tượng chứa dữ liệu
    var vTotalToFixed = 0;
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    if (localStorage.orderDetailsArray) {
        const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
        gOrderObj.orderDetails = vORDER_DETAILS_ARRAY;
        // B2: validate
        // B3-4: gọi API & xử lý hiển thị
        if (vORDER_DETAILS_ARRAY.length !== 0) {
            for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
                const bORDER_DETAIL_OBJ = vORDER_DETAILS_ARRAY[bIndex];
                gTotalQuantityOrder += bORDER_DETAIL_OBJ.quantityOrder;
                vTotalToFixed += bORDER_DETAIL_OBJ.priceEach * bORDER_DETAIL_OBJ.quantityOrder;
                gTotalToFixedString = vTotalToFixed.toFixed(2);
                callAjaxApiGetProductById(bORDER_DETAIL_OBJ);
            }
        }
    }
    loadNavUser();
    loadTotalIntoToCart();
    $("#h2-my-cart").text("My Cart (" + gTotalQuantityOrder + ")");
    $("#badge-total-quantity-order").text(gTotalQuantityOrder);
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

// hàm xử lý sự kiện khi ấn nút xoá sản phẩm
function onBtnCloseClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    var vTotalToFixed = gTotalToFixedString;
    // B1: thu thập dữ liệu
    var vDivId = $(paramBtn).parents("div:eq(2)");
    var vProductId = vDivId.attr('id');
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
    for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
        const element = vORDER_DETAILS_ARRAY[bIndex];
        if (vProductId == element.productId) {
            gTotalQuantityOrder -= element.quantityOrder;
            vTotalToFixed -= element.priceEach * element.quantityOrder;
            gTotalToFixedString = vTotalToFixed.toFixed(2);
            vORDER_DETAILS_ARRAY.splice(bIndex, 1);
        }
    }
    localStorage.orderDetailsArray = JSON.stringify(vORDER_DETAILS_ARRAY);
    loadTotalIntoToCart();
    $("#h2-my-cart").text("My Cart (" + gTotalQuantityOrder + ")");
    $("#badge-total-quantity-order").text(gTotalQuantityOrder);
    vDivId.fadeOut();
}

// hàm xử lý sự kiện khi thay đổi số lượng sản phẩm
function onInpQuantityChange(paramInp) {
    // B0: tạo đối tượng chứa dữ liệu
    var vTotalToFixed = parseFloat(gTotalToFixedString);
    // B1: thu thập dữ liệu
    var vInpQuantity = $(paramInp);
    var vNewQuantityOrder = parseInt(vInpQuantity.val());
    var vDivId = vInpQuantity.parents("div:eq(4)");
    var vProductId = vDivId.attr('id');
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    // lấy thông tin mảng danh sách các order detail của mỗi sản phẩm
    const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
    for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
        const bORDER_DETAIL_OBJ = vORDER_DETAILS_ARRAY[bIndex];
        // trường hợp số lượng sản phẩm của order detail bằng 0
        if (vProductId == bORDER_DETAIL_OBJ.productId && vNewQuantityOrder == 0) {
            // tính lại tổng số lượng sản phẩm trong giỏ hàng
            gTotalQuantityOrder -= bORDER_DETAIL_OBJ.quantityOrder;
            // tính lại tổng tiền
            vTotalToFixed -= bORDER_DETAIL_OBJ.priceEach * bORDER_DETAIL_OBJ.quantityOrder;
            // convert tổng tiền ra chuỗi có 2 chữ số sau dấu phẩy
            gTotalToFixedString = vTotalToFixed.toFixed(2);
            // xoá sản phẩm khỏi danh sách order detail
            vORDER_DETAILS_ARRAY.splice(bIndex, 1);
            vDivId.fadeOut();
        }
        // trường hợp số lượng sản phẩm của order detail khác 0
        if (vProductId == bORDER_DETAIL_OBJ.productId && vNewQuantityOrder !== 0) {
            // tính lại tổng số lượng sản phẩm trong giỏ hàng
            gTotalQuantityOrder += (vNewQuantityOrder - bORDER_DETAIL_OBJ.quantityOrder);
            // tính lại tổng tiền
            vTotalToFixed += bORDER_DETAIL_OBJ.priceEach * (vNewQuantityOrder - bORDER_DETAIL_OBJ.quantityOrder);
            // convert tổng tiền ra chuỗi có 2 chữ số sau dấu phẩy
            gTotalToFixedString = vTotalToFixed.toFixed(2);
            // thay đổi thông tin số lượng sản phẩm của order detail
            bORDER_DETAIL_OBJ.quantityOrder = vNewQuantityOrder;
        }
    }
    gOrderObj.orderDetails = vORDER_DETAILS_ARRAY;
    // lưu lại thông tin mới của mảng danh sách các order detail của mỗi sản phẩm
    localStorage.orderDetailsArray = JSON.stringify(vORDER_DETAILS_ARRAY);
    // cập nhật lại thông tin tổng tiền 
    loadTotalIntoToCart();
    // cập nhật tổng số lượng sản phẩm trong giỏ hàng
    $("#h2-my-cart").text("My Cart (" + gTotalQuantityOrder + ")");
    $("#badge-total-quantity-order").text(gTotalQuantityOrder);
}

// hàm xử lý sự kiện khi ấn nút Place Order
function onBtnPlaceOrderClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    if (gTokenValue) {
        $("#modal-ordernpayment").modal();
    } else {
        alert("Sign-in for place order !!!");
        location.href = "signin.html";
    }
}

// hàm xử lý sự kiện khi ấn nút Confirm
function onModalOrdernpaymentBtnConfirmClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderObj();
    // getCustomerObj();
    // B2: validate
    var vValidateStatus = validateOrderNPayment();
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateOrderDetailsByCustomer();
    }
}

// hàm thực thi sự kiện khi đóng modal Order and Payment
function onModalOrdernpaymentClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    resetToStart();
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

// gọi API lấy thông tin Product
function callAjaxApiGetProductById(paramOrderDetailObj) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramOrderDetailObj.productId,
        type: "GET",
        success: function(resProductObj) {
            loadProductInfoToCart(resProductObj, paramOrderDetailObj);
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
        }
    });
}

// load thông tin Product Info
function loadProductInfoToCart(paramProductObj, paramOrderDetailObj) {
    var vImageIndexString = getImageIndexString(paramProductObj);
    $("#cart-product").append(`
        <div id="` + paramProductObj.id + `" class="row py-2 px-0">
            <div class="col-4">
                <img src="image/` + vImageIndexString + `.jpg" alt="" class="w-100 rounded">
            </div>
            <div class="col-8">
                <div class="d-flex justify-content-between">
                    <h3 class="mb-0">
                        <a href="single.html?productid=` + paramProductObj.id + `" class="text-decoration-none text-dark">` + paramProductObj.productName + `</a>
                    </h3>
                    <button type="button" class="close">
                        &times;
                    </button>
                </div>
                <span class="text-capitalize small">
                    <a href="single.html?productid=` + paramProductObj.id + `" class="text-decoration-none text-dark">product code: ` + paramProductObj.productCode + `</a> 
                </span>
                <div class="row align-items-center pt-4">
                    <div class="col-4">
                        Price:
                        <span class="text-danger h4">$` + paramProductObj.highestPriceEach + `</span>
                    </div>
                    <div class="col d-flex">
                        <label for="" class="col-3 col-form-label">Quantity:</label>
                        <div class="col-4">
                            <input type="number" class="form-control inp-quantity" min="0" value="` + paramOrderDetailObj.quantityOrder + `">
                        </div>
                    </div>
                </div>
                <hr>
                <div class="d-flex align-self-end justify-content-between text-secondary">
                    <span>
                        Service Charges : $0
                    </span>
                    <span>
                        Delivered in 2-3 business days
                    </span>
                </div>
            </div>
        </div>
    `);
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

// load thông tin Total Info
function loadTotalIntoToCart() {
    $("#cart-total").empty();
    $("#cart-total").append(`
        <a href="categories.html">
            <button class="btn btn-warning col">Continue to basket</button>
        </a>
        <h6 class="pt-4">Price Details</h6>
        <div class="row">
            <div class="col-5">
                <p class="my-0">Total</p>
                <p class="my-0">Discount</p>
                <p class="my-0">Charges</p>
            </div>
            <div class="col-7 text-right">
                <p class="my-0">$` + gTotalToFixedString + `</p>
                <p class="my-0">0</p>
                <p class="my-0">0</p>
            </div>
        </div>
        <hr class="bg-dark">
        <div class="row text-uppercase pb-4">
            <div class="col-5">
                <h5 class="font-weight-bold">Total</h5>
            </div>
            <div class="col-7 text-right">
                <h5 class="font-weight-bold">$` + gTotalToFixedString + `</h5>
            </div>
        </div>
        <button type="button" class="btn btn-dark col btn-place-order">Place Order</button>
    `);
}

// lấy thông tin đối tượng Order
function getOrderObj() {
    $("#modal-ordernpayment-inp-required-date").val($("#modal-ordernpayment-inp-required-date").val().trim());
    gOrderObj.requiredDate = $("#modal-ordernpayment-inp-required-date").val();
}

// lấy thông tin đối tượng Customer
function getCustomerObj() {
    $("#modal-ordernpayment-inp-last-name").val($("#modal-ordernpayment-inp-last-name").val().trim());
    $("#modal-ordernpayment-inp-first-name").val($("#modal-ordernpayment-inp-first-name").val().trim());
    $("#modal-ordernpayment-inp-phone-numer").val($("#modal-ordernpayment-inp-phone-numer").val().trim());
    $("#modal-ordernpayment-inp-address").val($("#modal-ordernpayment-inp-address").val().trim());
    $("#modal-ordernpayment-inp-city").val($("#modal-ordernpayment-inp-city").val().trim());
    $("#modal-ordernpayment-inp-state").val($("#modal-ordernpayment-inp-state").val().trim());
    $("#modal-ordernpayment-inp-postal-code").val($("#modal-ordernpayment-inp-postal-code").val().trim());
    $("#modal-ordernpayment-inp-country").val($("#modal-ordernpayment-inp-country").val().trim());
    $("#modal-ordernpayment-inp-sales-rep-employee-number").val($("#modal-ordernpayment-inp-sales-rep-employee-number").val().trim());
    $("#modal-ordernpayment-inp-credit-limit").val($("#modal-ordernpayment-inp-credit-limit").val().trim());
    gCustomerObj.lastName = $("#modal-ordernpayment-inp-last-name").val();
    gCustomerObj.firstName = $("#modal-ordernpayment-inp-first-name").val();
    gCustomerObj.phoneNumber = $("#modal-ordernpayment-inp-phone-numer").val();
    gCustomerObj.address = $("#modal-ordernpayment-inp-address").val();
    gCustomerObj.city = $("#modal-ordernpayment-inp-city").val();
    gCustomerObj.state = $("#modal-ordernpayment-inp-state").val();
    gCustomerObj.postalCode = $("#modal-ordernpayment-inp-postal-code").val();
    gCustomerObj.country = $("#modal-ordernpayment-inp-country").val();
    gCustomerObj.salesRepEmployeeNumber = $("#modal-ordernpayment-inp-sales-rep-employee-number").val();
    gCustomerObj.creditLimit = $("#modal-ordernpayment-inp-credit-limit").val();
}

// validate thông tin order và payment
function validateOrderNPayment() {
    if (gOrderObj.requiredDate == "") {
        alert("Required Date must be filled !!!");
        $("#modal-ordernpayment-inp-required-date").focus();
        return false;
    }
    // if (gCustomerObj.lastName == "") {
    //     alert("Last Name must be filled !!!");
    //     $("#modal-ordernpayment-inp-last-name").focus();
    //     return false;
    // }
    // if (gCustomerObj.firstName == "") {
    //     alert("First Name must be filled !!!");
    //     $("#modal-ordernpayment-inp-first-name").focus();
    //     return false;
    // }
    // if (gCustomerObj.phoneNumber == "") {
    //     alert("Phone Number must be filled !!!");
    //     $("#modal-ordernpayment-inp-phone-numer").focus();
    //     return false;
    // }
    return true;
}

// gọi API tạo order detail mới
function callAjaxApiCreateOrderDetailsByCustomer() {
    $.ajax({
        url: gBASE_URL + "customers/orders/orderdetails",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(gOrderObj),
        success: function(resOrderObj) {
            console.log("resOrderDetailObj: ");
            console.log(resOrderObj);
            alert("Successfull create order !!!");
            localStorage.orderDetailsArray = JSON.stringify([]);
            $("#modal-ordernpayment").modal("hide");
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

// reset dữ liệu về ban đầu
function resetToStart() {
    gTotalQuantityOrder = 0;
    gTotalToFixedString = 0;
    gOrderObj = {
        requiredDate: "",
        orderDetails: []
    };
    gCustomerObj = {
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
    $("#cart-product").empty();
    loadTotalIntoToCart();
    $("#h2-my-cart").text("My Cart (" + gTotalQuantityOrder + ")");
    $("#badge-total-quantity-order").text(gTotalQuantityOrder);
}

// CÁC HÀM GỌI API KHÔNG DÙNG NỮA
// gọi API lấy thông tin khách hàng theo số điện thoại
function callAjaxApiGetCustomerObjByPhoneNumber() {
    $.ajax({
        url: gBASE_URL + "customers/phonenumber/" + gCustomerObj.phoneNumber,
        type: "GET",
        success: function(resCustomerObjArray) {
            if (resCustomerObjArray.length == 0) {
                callAjaxApiCreateCustomer();
            }
            if (resCustomerObjArray.length !== 0) {
                callAjaxApiUpdateCustomer(resCustomerObjArray[0].id);
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
        }
    });
}

// gọi API cập nhật thông tin khách hàng
function callAjaxApiUpdateCustomer(paramCustomerId) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramCustomerId,
        type: "PUT",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(gCustomerObj),
        success: function(resCustomerObj) {
            console.log("resCustomerObj: ");
            console.log(resCustomerObj);
            gCustomerObj.id = resCustomerObj.id;
            callAjaxApiCreateOrder();
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
        }
    });
}

// gọi API tạo khách hàng mới
function callAjaxApiCreateCustomer() {
    $.ajax({
        url: gBASE_URL + "customers",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(gCustomerObj),
        success: function(resCustomerObj) {
            console.log("resCustomerObj: ");
            console.log(resCustomerObj);
            gCustomerObj.id = resCustomerObj.id;
            callAjaxApiCreateOrder();
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
        }
    });
}

// gọi API tạo order mới
function callAjaxApiCreateOrder() {
    $.ajax({
        url: gBASE_URL + "customers/" + gCustomerObj.id + "/orders",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(gOrderObj),
        success: function(resOrderObj) {
            console.log("resOrderObj: ");
            console.log(resOrderObj);
            gOrderObj.id = resOrderObj.id;
            const vORDER_DETAILS_ARRAY = JSON.parse(localStorage.orderDetailsArray);
            for (let bIndex = 0; bIndex < vORDER_DETAILS_ARRAY.length; bIndex++) {
                const element = vORDER_DETAILS_ARRAY[bIndex];
                callAjaxApiCreateOrderDetails(element);
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
        }
    });
}

// gọi API tạo order detail mới
function callAjaxApiCreateOrderDetails(paramOrderDetailObj) {
    $.ajax({
        url: gBASE_URL + "orderdetails?orderid=" + gOrderObj.id + "&productid=" + paramOrderDetailObj.productId,
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderDetailObj),
        success: function(resOrderDetailObj) {
            console.log("resOrderDetailObj: ");
            console.log(resOrderDetailObj);
            alert("Successfull create order !!!");
            resetToStart();
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
        }
    });
}