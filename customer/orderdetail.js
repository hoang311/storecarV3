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

// Biến lưu thông tin đối tượng Order Detail
var gOrderDetailSelectedObj = {
    id: 0,
    ratingAndReview: {
        rating: 0,
        review: ""
    }
};

// Mảng chứa dữ liệu Order Detail
var gOrderDetailsDb = {
    orderDetails: []
};

// Khai báo biến hằng lưu trữ trạng thái form
const gFORM_MODE_NORMAL = 'Normal';
const gFORM_MODE_INSERT = 'Insert';
const gFORM_MODE_UPDATE = 'Update';
const gFORM_MODE_DELETE = 'Delete';

// Biến toàn cục lưu trạng thái form, mặc định NORMAL
var gFormMode = gFORM_MODE_NORMAL;

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

// xử lý sự kiện khi ấn vào rating & review
$("#div-my-order-details").on({
    click: function() {
        onSpanRatingNReviewClick(this);
    }
}, ".span-rating-n-review");

// xử lý sự kiện khi chọn số sao rating
$("input[name='rating']").on({
    change: function() {
        onInpRadioRatingChange(this);
    }
});

// 2 - C: Create
// xử lý sự kiện khi ấn nút rating & review
$("#modal-rating-n-review-btn-rating-n-review").on({
    click: function() {
        onModalRatingNReviewBtnRatingNReviewClick();
    }
});

// 3 - U: Update
// xử lý sự kiện khi ấn nút rating & review
$("#modal-rating-n-review-btn-update-rating-n-review").on({
    click: function() {
        onModalRatingNReviewBtnUpdateRatingNReviewClick();
    }
});

// 4 - D: Delete

// thực thi sự kiện khi đóng modal rating & review
$("#modal-rating-n-review").on({
    "hidden.bs.modal": function() {
        onModalRatingNReviewClose();
    }
});

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện khi tải trang
function onPageLoading() {
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    let vUrl = new URL(location.href);
    let vOrderId = vUrl.searchParams.get("orderid");
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    loadNavUser();
    callAjaxApiGetUserFromToken(gTokenValue, vOrderId);
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

// hàm xử lý sự kiện khi ấn vào rating & review
function onSpanRatingNReviewClick(paramElement) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gOrderDetailSelectedObj.id = $(paramElement).parents(":eq(1)").attr("id");
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    loadModalRatingNReview(gOrderDetailSelectedObj.id);
    if (gOrderDetailSelectedObj.ratingAndReview) {
        gFormMode = gFORM_MODE_UPDATE;
        $("#form-mode").text(gFormMode);
    } else {
        gFormMode = gFORM_MODE_INSERT;
        $("#form-mode").text(gFormMode);
    }
    $("#modal-rating-n-review").modal();
}

// hàm xử lý sự kiện khi chọn số sao rating
function onInpRadioRatingChange(paramElement) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    if ($(paramElement).is(':checked')) {
        loadModalRatingNReviewDivRatingStar();
    }
}

// hàm xử lý sự kiện khi ấn nút rating & review
function onModalRatingNReviewBtnRatingNReviewClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderDetailRatingNReviewObj(gOrderDetailSelectedObj);
    // B2: validate
    let vValidateStatus = validateRatingNReview(gOrderDetailSelectedObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateRatingNReview(gTokenValue, gOrderDetailSelectedObj);
    }
}

// hàm xử lý sự kiện khi ấn nút Update rating & review
function onModalRatingNReviewBtnUpdateRatingNReviewClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderDetailRatingNReviewObj(gOrderDetailSelectedObj);
    // B2: validate
    let vValidateStatus = validateRatingNReview(gOrderDetailSelectedObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateRatingNReview(gTokenValue, gOrderDetailSelectedObj);
    }
}

// hàm thực thi sự kiện khi đóng modal rating & review
function onModalRatingNReviewClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
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

// gọi API lấy thông tin user từ token
function callAjaxApiGetUserFromToken(paramTokenValue, paramOrderId) {
    $.ajax({
        url: gBASE_URL + "users/getfromtoken",
        type: "GET",
        headers: {
            "Authorization": "Token " + paramTokenValue
        },
        success: function(resUserObj) {
            gCustomerObj = resUserObj.customer;
            if (gCustomerObj) {
                let vFoundOrderObj = getOrderObjFromOrderArray(paramOrderId);
                loadOrderDetailToDivMyOrderDetail(vFoundOrderObj);
                $("#h2-my-order-details").text("My Order Details (" + vFoundOrderObj.orderDetails.length + ")");
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

// lấy thông tin Order Detail
function getOrderObjFromOrderArray(paramOrderId) {
    let vFoundOrderStatus = false;
    let vFoundOrderObj = {};
    for (let bIndex = 0; !vFoundOrderStatus && bIndex < gCustomerObj.orders.length; bIndex++) {
        const bORDER_ELEMENT = gCustomerObj.orders[bIndex];
        if (bORDER_ELEMENT.id == paramOrderId) {
            vFoundOrderObj = bORDER_ELEMENT;
            vFoundOrderStatus = true;
        }
    }
    return vFoundOrderObj;
}

// load thông tin các order của khách hàng
function loadOrderDetailToDivMyOrderDetail(paramOrderObj) {
    let vDivMyOrderDetails = $("#div-my-order-details").empty();
    var vTotalToFixedString = 0;
    var vTotalToFixed = 0;
    gOrderDetailsDb.orderDetails = paramOrderObj.orderDetails;
    for (let bIndex = 0; bIndex < gOrderDetailsDb.orderDetails.length; bIndex++) {
        const bORDER_DETAIL_ELEMENT = gOrderDetailsDb.orderDetails[bIndex];
        vTotalToFixed += bORDER_DETAIL_ELEMENT.priceEach * bORDER_DETAIL_ELEMENT.quantityOrder;
        let vImageIndexString = getImageIndexString(bORDER_DETAIL_ELEMENT.productName);
        let vRatingStarHTML = `
            <i class="far fa-star text-warning"></i>
            <i class="far fa-star text-warning"></i>
            <i class="far fa-star text-warning"></i>
            <i class="far fa-star text-warning"></i>
            <i class="far fa-star text-warning"></i>
        `;
        if (bORDER_DETAIL_ELEMENT.ratingAndReview) {
            vRatingStarHTML = getRatingStarHTML(bORDER_DETAIL_ELEMENT.ratingAndReview.rating);
        }
        vDivMyOrderDetails.append(`
            <div id="` + bORDER_DETAIL_ELEMENT.id + `" class="row py-2">
                <div class="col-2">
                    <img src="image/` + vImageIndexString + `.jpg" alt="" class="w-100 rounded">
                </div>
                <div class="col-10">
                    <h3 class="mb-0">
                        <a href="single.html?productid=` + bORDER_DETAIL_ELEMENT.productId + `" class="text-decoration-none text-dark">` + bORDER_DETAIL_ELEMENT.productName + `</a>
                    </h3>
                    <span class="text-capitalize small">
                        <a href="single.html?productid=` + bORDER_DETAIL_ELEMENT.productId + `" class="text-decoration-none text-dark">product code: ` + bORDER_DETAIL_ELEMENT.productCode + `</a> 
                    </span>
                    <div class="row align-items-end">
                        <div class="col-8">
                            Quantity:
                            <span class="font-weight-bold">` + bORDER_DETAIL_ELEMENT.quantityOrder + `</span>
                        </div>
                        <div class="col-4 text-right">
                            Price:
                            <span class="text-danger h4">$` + bORDER_DETAIL_ELEMENT.priceEach + `</span>
                        </div>
                    </div>
                    <span class="text-capitalize pointer span-rating-n-review">
                        Your Rating & Review:
                        ` + vRatingStarHTML + `
                    </span>
                </div>
                <div class="col-12">
                    <hr class="mb-0">
                </div>
            </div>
        `);
    }
    vTotalToFixedString = vTotalToFixed.toFixed(2);
    vDivMyOrderDetails.append(`
        <div class="row">
            <div class="col">
                <h4 class="font-weight-bold text-uppercase text-danger text-right">total: $` + vTotalToFixedString + `</h4>
            </div>
        </div>
    `);
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

// load thông tin rating và review vào modal
function loadModalRatingNReview(paramOrderDetailId) {
    let vFoundOrderDetailStatus = false;
    for (let bIndex = 0; !vFoundOrderDetailStatus && bIndex < gOrderDetailsDb.orderDetails.length; bIndex++) {
        const bORDER_DETAIL_ELEMENT = gOrderDetailsDb.orderDetails[bIndex];
        if (bORDER_DETAIL_ELEMENT.id == paramOrderDetailId) {
            gOrderDetailSelectedObj = bORDER_DETAIL_ELEMENT;
            vFoundOrderDetailStatus = true;
        }
    }

    let vImageIndexString = getImageIndexString(gOrderDetailSelectedObj.productName);
    let vImageSrc = "image/" + vImageIndexString + ".jpg";
    $("#modal-rating-n-review-img").attr("src", vImageSrc);
    $("#modal-rating-n-review-h5-product-name").text(gOrderDetailSelectedObj.productName);
    $("#modal-rating-n-review-span-product-code").text("product code: " + gOrderDetailSelectedObj.productCode);
    $("#modal-rating-n-review-span-quantity-order").text(gOrderDetailSelectedObj.quantityOrder);
    $("#modal-rating-n-review-price-each").text("$" + gOrderDetailSelectedObj.priceEach);

    if (gOrderDetailSelectedObj.ratingAndReview) {
        $("#modal-rating-n-review-btn-update-rating-n-review").show();
        $("#modal-rating-n-review-btn-rating-n-review").hide();
        $("#modal-rating-n-review-textarea-review").val(gOrderDetailSelectedObj.ratingAndReview.review);
        switch (gOrderDetailSelectedObj.ratingAndReview.rating) {
            case 1:
                $("#modal-rating-n-review-inp-star1").prop("checked", true);
                break;
            case 2:
                $("#modal-rating-n-review-inp-star2").prop("checked", true);
                break;
            case 3:
                $("#modal-rating-n-review-inp-star3").prop("checked", true);
                break;
            case 4:
                $("#modal-rating-n-review-inp-star4").prop("checked", true);
                break;
            case 5:
                $("#modal-rating-n-review-inp-star5").prop("checked", true);
                break;
            default:
                $("#modal-rating-n-review-inp-star5").prop("checked", true);
        }
    } else {
        $("#modal-rating-n-review-btn-rating-n-review").show();
        $("#modal-rating-n-review-btn-update-rating-n-review").hide();
        $("#modal-rating-n-review-inp-star5").prop("checked", true);
        $("#modal-rating-n-review-textarea-review").val("");
    }

    loadModalRatingNReviewDivRatingStar();
}

// hiển thị số sao rating
function loadModalRatingNReviewDivRatingStar() {
    let vRatingValue = parseInt($("input[name='rating']:checked").val());
    let vModalRatingNReviewInpStar1Label = $("label[for='modal-rating-n-review-inp-star1']");
    let vModalRatingNReviewInpStar2Label = $("label[for='modal-rating-n-review-inp-star2']");
    let vModalRatingNReviewInpStar3Label = $("label[for='modal-rating-n-review-inp-star3']");
    let vModalRatingNReviewInpStar4Label = $("label[for='modal-rating-n-review-inp-star4']");
    let vModalRatingNReviewInpStar5Label = $("label[for='modal-rating-n-review-inp-star5']");
    switch (vRatingValue) {
        case 1:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            break;
        case 2:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            break;
        case 3:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            break;
        case 4:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            break;
        case 5:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="fas fa-star fa-2x"></i>
            `);
            break;
        default:
            vModalRatingNReviewInpStar1Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar2Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar3Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar4Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
            vModalRatingNReviewInpStar5Label.html(`
                <i class="far fa-star fa-2x"></i>
            `);
    }
}

// thu thập thông tin rating và review
function getOrderDetailRatingNReviewObj(paramOrderDetailSelectedObj) {
    // chuẩn hoá
    $("#modal-rating-n-review-textarea-review").val($("#modal-rating-n-review-textarea-review").val().trim());
    // thu thập dữ liệu vào đối tượng
    if (gFormMode == gFORM_MODE_INSERT) {
        paramOrderDetailSelectedObj.ratingAndReview = {};
    }
    paramOrderDetailSelectedObj.ratingAndReview.rating = parseInt($("input[name='rating']:checked").val());
    paramOrderDetailSelectedObj.ratingAndReview.review = $("#modal-rating-n-review-textarea-review").val();
}

// validate thông tin rating và review
function validateRatingNReview(paramOrderDetailSelectedObj) {
    if (!paramOrderDetailSelectedObj.ratingAndReview.rating) {
        alert("Rating must be selected !!!");
        return false;
    }
    return true;
}

// gọi API cập nhật thông tin rating và review
function callAjaxApiCreateRatingNReview(paramTokenValue, paramOrderDetailSelectedObj) {
    $.ajax({
        url: gBASE_URL + "customer/orderdetails/" + paramOrderDetailSelectedObj.id + "/ratingreview",
        type: "POST",
        headers: {
            "Authorization": "Token " + paramTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderDetailSelectedObj.ratingAndReview),
        success: function(resOrderDetailObj) {
            console.log(resOrderDetailObj);
            alert("Rating & Review successfully !!!");
            $("#modal-rating-n-review").modal("hide");
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

// gọi API cập nhật thông tin rating và review
function callAjaxApiUpdateRatingNReview(paramTokenValue, paramOrderDetailSelectedObj) {
    $.ajax({
        url: gBASE_URL + "customer/orderdetails/ratingreview/" + paramOrderDetailSelectedObj.ratingAndReview.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + paramTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderDetailSelectedObj.ratingAndReview),
        success: function(resOrderDetailObj) {
            console.log(resOrderDetailObj);
            alert("Update Rating & Review successfully !!!");
            $("#modal-rating-n-review").modal("hide");
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

// reset dữ liệu các dữ liệu biến global và thông tin trên modal user detail
function resetToStart() {
    gTokenValue = "";
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
    gTotalQuantityOrder = 0;
    gOrderDetailSelectedObj = {
        id: 0,
        rating: 0,
        review: ""
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#modal-rating-n-review textarea").val("");
    onPageLoading();
}