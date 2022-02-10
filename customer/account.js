"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Biến lưu thông tin đối tượng user
var gUserObj = {
    username: "",
    password: "",
    customer: {
        lastName: "",
        firstName: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
    }
};

// Biến lưu giá trị tổng số lượng các sản phẩm
var gTotalQuantityOrder = 0;

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

// 2 - C: Create

// 3 - U: Update
// xử lý sự kiện khi ấn Update
$("#btn-update").on({
    click: function() {
        onBtnUpdateClick();
    }
});

// xử lý sự kiện khi ấn nút Confirm Update Username
$("#modal-new-username-btn-confirm-update-username").on({
    click: function() {
        onModalNewUsernameBtnConfirmUpdateUsernameClick();
    }
});

// xử lý sự kiện khi ấn nút Confirm Update Password
$("#modal-new-password-btn-confirm-update-password").on({
    click: function() {
        onModalNewPasswordBtnConfirmUpdatePasswordClick();
    }
});

// 4 - D: Delete

// thực thi sự kiện khi đóng modal change username
$("#modal-new-username").on({
    "hidden.bs.modal": function() {
        onModalNewUsernameClose();
    }
});

// thực thi sự kiện khi đóng modal change password
$("#modal-new-password").on({
    "hidden.bs.modal": function() {
        onModalNewPasswordClose();
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

// hàm xử lý sự kiện khi ấn Update
function onBtnUpdateClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getUserInfoObj(gUserObj);
    // B2: validate
    let vValidateStatus = validateUser(gUserObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateUserFromToken(gUserObj);
    }
}

// hàm xử lý sự kiện khi ấn nút Confirm Update Username
function onModalNewUsernameBtnConfirmUpdateUsernameClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getNewUsernameObj(gUserObj);
    // B2: validate
    let vValidateStatus = validateNewUsernameObj(gUserObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateUsernameFromToken(gUserObj);
    }
}

// hàm xử lý sự kiện khi ấn nút Confirm Update Password
function onModalNewPasswordBtnConfirmUpdatePasswordClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    let vUserNewPasswordObj = {
        username: gUserObj.username,
        password: "",
        newPassword: "",
        confirmNewPassword: ""
    };
    // B1: thu thập dữ liệu
    getUserNewPasswordObj(vUserNewPasswordObj);
    // B2: validate
    let vValidateStatus = validateUserNewPasswordObj(vUserNewPasswordObj);
    // B3-4: gọi API & xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdatePasswordFromToken(vUserNewPasswordObj);
    }
}

// hàm thực thi sự kiện khi đóng modal change username
function onModalNewUsernameClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = "account.html";
}

// hàm thực thi sự kiện khi đóng modal change password
function onModalNewPasswordClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = "account.html";
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
            gUserObj = resUserObj;
            loadUserInfoToDivMyAccount(gUserObj);
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
            location.href = "signin.html";
        }
    });
}

// load thông tin các order của khách hàng
function loadUserInfoToDivMyAccount(paramUserObj) {
    $("#inp-username").val(paramUserObj.username);
    $("#inp-last-name").val(paramUserObj.customer.lastName);
    $("#inp-first-name").val(paramUserObj.customer.firstName);
    $("#inp-phone-numer").val(paramUserObj.customer.phoneNumber);
    $("#inp-address").val(paramUserObj.customer.address);
    $("#inp-city").val(paramUserObj.customer.city);
    $("#inp-state").val(paramUserObj.customer.state);
    $("#inp-postal-code").val(paramUserObj.customer.postalCode);
    $("#inp-country").val(paramUserObj.customer.country);
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

// lấy thông tin user cập nhật
function getUserInfoObj(paramUserObj) {
    // chuẩn hoá
    $("#inp-last-name").val($("#inp-last-name").val().trim());
    $("#inp-first-name").val($("#inp-first-name").val().trim());
    $("#inp-phone-numer").val($("#inp-phone-numer").val().trim());
    $("#inp-address").val($("#inp-address").val().trim());
    $("#inp-city").val($("#inp-city").val().trim());
    $("#inp-state").val($("#inp-state").val().trim());
    $("#inp-postal-code").val($("#inp-postal-code").val().trim());
    $("#inp-country").val($("#inp-country").val().trim());
    // lấy thông tin
    paramUserObj.customer.lastName = $("#inp-last-name").val();
    paramUserObj.customer.firstName = $("#inp-first-name").val();
    paramUserObj.customer.phoneNumber = $("#inp-phone-numer").val();
    paramUserObj.customer.address = $("#inp-address").val();
    paramUserObj.customer.city = $("#inp-city").val();
    paramUserObj.customer.state = $("#inp-state").val();
    paramUserObj.customer.postalCode = $("#inp-postal-code").val();
    paramUserObj.customer.country = $("#inp-country").val();
}

// validate thông tin user cập nhật
function validateUser(paramUserObj) {
    if (!paramUserObj.customer.lastName) {
        alert("Last Name must be filled !!!");
        $("#inp-last-name").focus();
        return false;
    }
    if (!paramUserObj.customer.firstName) {
        alert("First Name must be filled !!!");
        $("#inp-first-name").focus();
        return false;
    }
    if (!paramUserObj.customer.phoneNumber) {
        alert("Phone Number must be filled !!!");
        $("#inp-phone-numer").focus();
        return false;
    }
    return true;
}

// gọi API cập nhật thông tin user từ token
function callAjaxApiUpdateUserFromToken(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/customer/edit",
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resUserObj) {
            location.href = "account.html";
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

// lấy thông tin username cập nhật
function getNewUsernameObj(paramUserObj) {
    // chuẩn hoá
    $("#modal-new-username-inp-new-username").val($("#modal-new-username-inp-new-username").val().trim());
    $("#modal-new-username-inp-confirm-password").val($("#modal-new-username-inp-confirm-password").val().trim());
    // lấy thông tin
    paramUserObj.username = $("#modal-new-username-inp-new-username").val();
    paramUserObj.password = $("#modal-new-username-inp-confirm-password").val();
}

// validate thông tin username cập nhật
function validateNewUsernameObj(paramUserObj) {
    if (!paramUserObj.username) {
        alert("New Username must be filled !!!");
        $("#modal-new-username-inp-new-username").focus();
        return false;
    }
    if (!paramUserObj.password) {
        alert("Password must be filled !!!");
        $("#modal-new-username-inp-confirm-password").focus();
        return false;
    }
    return true;
}

// lấy thông tin password cập nhật
function getUserNewPasswordObj(paramUserNewPasswordObj) {
    // chuẩn hoá
    $("#modal-new-password-inp-current-password").val($("#modal-new-password-inp-current-password").val().trim());
    $("#modal-new-password-inp-new-password").val($("#modal-new-password-inp-new-password").val().trim());
    $("#modal-new-password-inp-confirm-new-password").val($("#modal-new-password-inp-confirm-new-password").val().trim());
    // lấy thông tin
    paramUserNewPasswordObj.password = $("#modal-new-password-inp-current-password").val();
    paramUserNewPasswordObj.newPassword = $("#modal-new-password-inp-new-password").val();
    paramUserNewPasswordObj.confirmNewPassword = $("#modal-new-password-inp-confirm-new-password").val();
}

// validate thông tin password cập nhật
function validateUserNewPasswordObj(paramUserNewPasswordObj) {
    if (!paramUserNewPasswordObj.password) {
        alert("Current password must be filled !!!");
        $("#modal-new-password-inp-current-password").focus();
        return false;
    }
    if (!paramUserNewPasswordObj.newPassword) {
        alert("New password must be filled !!!");
        $("#modal-new-password-inp-new-password").focus();
        return false;
    }
    if (!paramUserNewPasswordObj.confirmNewPassword) {
        alert("Confirm new password must be filled !!!");
        $("#modal-new-password-inp-confirm-new-password").focus();
        return false;
    }
    if (paramUserNewPasswordObj.confirmNewPassword !== paramUserNewPasswordObj.newPassword) {
        alert("Confirm new password & New password not match !!!");
        $("#modal-new-password-inp-confirm-new-password").focus();
        return false;
    }
    return true;
}

// gọi API cập nhật thông tin username từ token
function callAjaxApiUpdateUsernameFromToken(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/customer/changeusername",
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resUserObj) {
            alert("Update username successfully !!!");
            location.href = "account.html";
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

// gọi API cập nhật thông tin password từ token
function callAjaxApiUpdatePasswordFromToken(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/customer/changepassword",
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resUserObj) {
            alert("Update password successfully !!!");
            location.href = "account.html";
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