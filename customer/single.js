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

// Biến lưu thông tin đối tượng Order Detail
var gOrderDetailObj = {
    productId: -1,
    quantityOrder: -1,
    priceEach: -1
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

// thực thi sự kiện khi khách hàng ấn nút Buy now
$("#product-info").on({
    click: function() {
        onBtnBuyNowClick();
    }
}, "#btn-buy-now");

// thực thi sự kiện khi khách hàng ấn nút Add to cart
$("#product-info").on({
    click: function() {
        onBtnAddToCartClick(this);
    }
}, "#btn-add-to-cart");

// thực thi sự kiện khi khách hàng ấn nút Add to cart
$("#related-products").on({
    click: function() {
        onBtnAddToCartClick(this);
    }
}, ".btn-add-to-cart");

// 2 - C: Create

// 3 - U: Update

// 4 - D: Delete

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// xử lý sự kiện khi tải trang
function onPageLoading() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    var vUrl = new URL(location.href);
    var vProductId = vUrl.searchParams.get("productid");
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    loadNavUser();
    callAjaxApiGetProductById(vProductId);
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

// xử lý sự kiện khi ấn nút Buy Now
function onBtnBuyNowClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gOrderDetailObj.quantityOrder = 1;
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

// gọi API lấy thông tin Product
function callAjaxApiGetProductById(paramProductId) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramProductId,
        type: "GET",
        success: function(resProductObj) {
            gOrderDetailObj.productId = resProductObj.id;
            gOrderDetailObj.priceEach = resProductObj.highestPriceEach;
            loadProductInfo(resProductObj);
            loadRatingNReviewInfo(resProductObj);
            callAjaxApiGetRelatedProductSameProductLine(resProductObj);
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

// load thông tin Product 
function loadProductInfo(paramProductObj) {
    let vImageIndexString = getImageIndexString(paramProductObj);
    let vProductInfoSelector = $("#product-info").empty();
    vProductInfoSelector.html(`
        <div class="col-4">
            <img src="image/` + vImageIndexString + `.jpg" alt="">
        </div>
        <div id="product-info" class="col-8">
            <h3 class="mb-0">` + paramProductObj.productName + `</h3>
            <span class="text-capitalize small">product code: ` + paramProductObj.productCode + `</span>
            <h4 class="text-danger py-3">$` + paramProductObj.highestPriceEach + `</h4>
            <button id="btn-buy-now" class="btn btn-outline-warning text-uppercase">
                BUY NOW
            </button>
            <button id="btn-add-to-cart" data-product-id="` + paramProductObj.id + `" data-price-each="` + paramProductObj.highestPriceEach + `" class="btn btn-outline-info text-uppercase">
                Add to cart
            </button>
            <hr>
            <p class="text-uppercase">line: <span class="text-danger">` + paramProductObj.productLineName + `</span></p>
            <p class="text-uppercase">vendor: <span class="text-danger">` + paramProductObj.productVendor + `</span></p>
            <hr>
            <h6 class="text-capitalize">description</h6>
            <p>` + paramProductObj.productDescription + `</p>
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

// gọi API lấy thông tin Related Product
function callAjaxApiGetRelatedProductSameProductLine(paramProductObj) {
    $.ajax({
        url: gBASE_URL + "products/related?productlineid=" + paramProductObj.prodLineId,
        type: "GET",
        success: function(resProductObjArray) {
            loadRelatedProductInfo(resProductObjArray);
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

// load thông tin Related Product 
function loadRelatedProductInfo(paramProductObjArray) {
    let vRelatedProductSelector = $("#related-products").empty();
    vRelatedProductSelector.append(`
        <div class="row">
            <div class="col">
                <h6 class="jumbotron rounded py-2 pl-2 mb-2">
                    Related Products
                </h6>
            </div>
        </div>
    `);
    for (let bIndex = 0; bIndex < paramProductObjArray.length; bIndex++) {
        const bPRODUCT_OBJ_ELEMENT = paramProductObjArray[bIndex];
        let vImageIndexString = getImageIndexString(bPRODUCT_OBJ_ELEMENT);
        vRelatedProductSelector.append(`
            <div class="row py-2">
                <div class="col-2">
                    <img src="image/` + vImageIndexString + `.jpg" alt="" class="w-100 rounded">
                </div>
                <div class="col-8">
                    <h3 class="mb-0">
                        <a href="single.html?productid=` + bPRODUCT_OBJ_ELEMENT.id + `" class="text-decoration-none text-dark">` + bPRODUCT_OBJ_ELEMENT.productName + `</a>
                    </h3>
                    <span class="text-capitalize small">
                        <a href="single.html?productid=` + bPRODUCT_OBJ_ELEMENT.id + `" class="text-decoration-none text-dark">product code: ` + bPRODUCT_OBJ_ELEMENT.productCode + `</a> 
                    </span>
                    <p>` + bPRODUCT_OBJ_ELEMENT.productDescription + `</p>
                </div>
                <div class="col-2 text-center border-left">
                    <h4 class="text-danger py-3">` + bPRODUCT_OBJ_ELEMENT.highestPriceEach + `</h4>
                    <button data-related-products=true data-product-id="` + bPRODUCT_OBJ_ELEMENT.id + `" data-price-each="` + bPRODUCT_OBJ_ELEMENT.highestPriceEach + `" class="btn btn-outline-info btn-add-to-cart">
                        Add to cart
                    </button>
                </div>
            </div>
        `);
    }
}

// load thông tin Rating & Review
function loadRatingNReviewInfo(paramProductObj) {
    let vRatingNReviewSelector = $("#rating-n-review").empty();
    vRatingNReviewSelector.append(`
        <div class="row">
            <div class="col">
                <h6 id="h6-rating-n-review" class="jumbotron rounded py-2 pl-2 mb-2">
                    Rating & Review
                </h6>
            </div>
        </div>
    `);
    let bCountRatingNReview = 0;
    for (let bIndex = 0; bIndex < paramProductObj.orderDetails.length; bIndex++) {
        const bORDER_DETAIL_ELEMENT = paramProductObj.orderDetails[bIndex];
        if (bORDER_DETAIL_ELEMENT.ratingAndReview) {
            bCountRatingNReview++;
            let vRatingNReviewDate = bORDER_DETAIL_ELEMENT.ratingAndReview.createdAt;
            if (bORDER_DETAIL_ELEMENT.ratingAndReview.updatedAt) {
                vRatingNReviewDate = bORDER_DETAIL_ELEMENT.ratingAndReview.updatedAt;
            }
            let vRatingStarHTML = getRatingStarHTML(bORDER_DETAIL_ELEMENT.ratingAndReview.rating);
            vRatingNReviewSelector.append(`
                <div class="row py-2">
                    <div class="col">
                        <div class="media border p-3">
                            <img src="../admin/dist/img/user2-160x160.jpg" alt="customer name" class="mr-3 mt-3 rounded-circle" style="width:60px;">
                            <div class="media-body">
                                <h4>` + bORDER_DETAIL_ELEMENT.customerFullName + ` <small><i>on ` + vRatingNReviewDate + `</i></small></h4>
                                <p>` + vRatingStarHTML + `</p>
                                <p>` + bORDER_DETAIL_ELEMENT.ratingAndReview.review + `</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    }
    $("#h6-rating-n-review").append(" (" + bCountRatingNReview + ")");
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

// hiệu ứng khi thêm sản phẩm Add to cart
function addAddToCartEffect(paramBtn) {
    var vCart = $('.fa-shopping-cart');
    var vImgToDrag = $(paramBtn).parents('div:eq(1)').find("img");
    if (vImgToDrag) {
        var vImgClone = vImgToDrag
            .clone()
            .removeClass("w-100")
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