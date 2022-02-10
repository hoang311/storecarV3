"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến lưu giá trị tổng số lượng các sản phẩm
var gTotalQuantityOrder = 0;

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// xử lý sự kiện khi ấn nút Sign Up
$("#btn-sign-up").on({
    click: function() {
        onBtnSignUpClick();
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
    if (gTokenValue) {
        callAjaxApiGetUserFromToken(gTokenValue);
    }
    // B3-4: gọi API & xử lý hiển thị
    getCartTotalQuantityOrder();
}

// hàm xử lý sự kiện khi ấn nút Login
function onBtnSignUpClick() {
    // B0: tạo đối tượng chứa dữ liệu
    let vUserObj = {
        get username() {
            return this.customer.phoneNumber;
        },
        password: "",
        confirmPassword: "",
        customer: {
            lastName: "",
            firstName: "",
            phoneNumber: ""
        }
    };
    // B1: thu thập dữ liệu
    getUserInfo(vUserObj);
    // B2: validate
    let vValidateStatus = validateUserInfo(vUserObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiSignUp(vUserObj);
    }
}

/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
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

// gọi API lấy thông tin user từ token
function callAjaxApiGetUserFromToken(paramTokenValue) {
    $.ajax({
        url: gBASE_URL + "users/getfromtoken",
        type: "GET",
        headers: {
            "Authorization": "Token " + paramTokenValue
        },
        success: function(resUserObj) {
            if (resUserObj.customer) {
                location.href = "index.html";
            }
            if (resUserObj.employee) {
                location.href = "../admin/index.html";
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

// lấy thông tin đăng nhập người dùng
function getUserInfo(paramUserObj) {
    // chuẩn hoá
    $("#inp-firstname").val($("#inp-firstname").val().trim());
    $("#inp-lastname").val($("#inp-lastname").val().trim());
    $("#inp-phone-number").val($("#inp-phone-number").val().trim());
    $("#inp-password").val($("#inp-password").val().trim());
    $("#inp-confirm-password").val($("#inp-confirm-password").val().trim());
    // lấy thông tin đăng nhập
    paramUserObj.customer.firstName = $("#inp-firstname").val();
    paramUserObj.customer.lastName = $("#inp-lastname").val();
    paramUserObj.customer.phoneNumber = $("#inp-phone-number").val();
    paramUserObj.password = $("#inp-password").val();
    paramUserObj.confirmPassword = $("#inp-confirm-password").val();
}

// validate thông tin người dùng
function validateUserInfo(paramUserObj) {
    if (paramUserObj.customer.firstName == "") {
        alert("First name must be filled !!!");
        $("#inp-firstname").focus();
        return false;
    }
    if (paramUserObj.customer.lastName == "") {
        alert("Last name must be filled !!!");
        $("#inp-lastname").focus();
        return false;
    }
    if (paramUserObj.customer.phoneNumber == "") {
        alert("Phone Number must be filled !!!");
        $("#inp-phone-number").focus();
        return false;
    }
    if (!validatePhoneNumber(paramUserObj.customer.phoneNumber)) {
        alert("Phone Number invalid !!!");
        $("#inp-phone-number").focus();
        return false;
    }
    if (paramUserObj.password == "") {
        alert("Password must be filled !!!");
        $("#inp-password").focus();
        return false;
    }
    if (paramUserObj.confirmPassword.length == 0) {
        alert("Confirm Password must be filled");
        $("#inp-confirm-password").focus();
        return false;
    }
    if (paramUserObj.confirmPassword !== paramUserObj.password) {
        alert("Confirm Password does not match");
        $("#inp-confirm-password").focus();
        return false;
    }
    return true;
}

// hàm validate phone number
function validatePhoneNumber(paramPhoneNumber) {
    const re = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/gm;
    return re.test(String(paramPhoneNumber));
}

// gọi API login
function callAjaxApiSignUp(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/customer/signup",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resTokenObj) {
            gTokenValue = resTokenObj.token;
            console.log(gTokenValue);
            setCookie(gTOKEN_NAME, gTokenValue, 1);
            var vDecodedCookie = decodeURIComponent(document.cookie);
            console.log(vDecodedCookie);
            onPageLoading();
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