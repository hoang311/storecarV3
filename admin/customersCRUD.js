"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến hằng lưu giá trị các trường chưa được chọn
const gNONE_SELECTED = "";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Mảng chứa dữ liệu customer
var gCustomersDb = {
    customers: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng customer
var gCustomerObj = {
    id: -1,
    lastName: "",
    firstName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    salesRepEmployeeNumber: -1,
    creditLimit: -1,
    payments: [],
    orders: [],
};

// Khai báo biến hằng lưu trữ trạng thái form
const gFORM_MODE_NORMAL = 'Normal';
const gFORM_MODE_INSERT = 'Insert';
const gFORM_MODE_UPDATE = 'Update';
const gFORM_MODE_DELETE = 'Delete';

// Biến toàn cục lưu trạng thái form, mặc định NORMAL
var gFormMode = gFORM_MODE_NORMAL;

const gDATA_COL = [
    "id",
    "lastName",
    "firstName",
    "phoneNumber",
    "payments",
    "orders",
    "action"
];
const gID_CUSTOMER_COL = 0;
const gLAST_NAME_COL = 1;
const gFIRST_NAME_COL = 2;
const gPHONE_NUMBER_COL = 3;
const gCUSTOMER_PAYMENTS_COL = 4;
const gCUSTOMER_ORDERS_COL = 5;
const gACTION_COL = 6;

// khởi tạo DataTable
var gTableCustomer = $("#table-customer").DataTable({
    "language": {
        "emptyTable": "Không có dữ liệu trong bảng",
        "info": "Hiển thị bản ghi _START_ tới _END_ trong tổng cộng _TOTAL_ bản ghi",
        "infoEmpty": "Hiển thị bản ghi 0 tới 0 trong tổng cộng 0 bản ghi",
        "infoFiltered": "(lọc từ tổng cộng _MAX_ bản ghi)",
        "infoPostFix": "",
        "thousands": ".",
        "lengthMenu": "Hiện _MENU_ bản ghi trên mỗi trang",
        "loadingRecords": "Loading...",
        "processing": "Processing...",
        "search": "Tìm kiếm:",
        "zeroRecords": "Không có bản ghi nào được tìm thấy",
        "paginate": {
            "first": "First",
            "last": "Last",
            "next": "Tiếp",
            "previous": "Trước"
        }
    },
    "lengthMenu": [
        [5, 10, 25, 50, -1],
        [5, 10, 25, 50, "All"]
    ],
    "ordering": false,
    // "scrollY": "245px",
    // "scrollCollapse": true,
    // "scrollX": true,
    columns: [{
            data: gDATA_COL[gID_CUSTOMER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gLAST_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gFIRST_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPHONE_NUMBER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gCUSTOMER_PAYMENTS_COL],
            className: "text-center",
            render: function() {
                return `<button class="btn btn-info btn-customer-payments" type="button">Customer payments</button>`;
            }
        },
        {
            data: gDATA_COL[gCUSTOMER_ORDERS_COL],
            className: "text-center",
            render: function() {
                return `<button class="btn btn-info btn-customer-orders" type="button">Customer orders</button>`;
            }
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-customer" data-toggle="tooltip" title="Edit customer"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-customer" data-toggle="tooltip" title="Delete customer"></i>
            `
        }
    ]
});

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
// thực hiện hiển thị AdminLTE cho Select2 và Date
$(document).ready(function() {
    //Initialize Select2 Elements
    $('.select2').select2()

    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    //Money Euro (active Datemask dd/mm/yyyy)
    $('[data-mask]').inputmask()

    //Date picker
    $('#reservationdate').datetimepicker({
        format: 'DD/MM/YYYY'
    });
});

// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// thực thi sự kiện khi ấn nút customer orders trên bảng customer
$("#table-customer").on({
    click: function() {
        onBtnCustomerOrdersClick(this);
    }
}, ".btn-customer-orders");

// thực thi sự kiện khi ấn nút customer payments trên bảng customer
$("#table-customer").on({
    click: function() {
        onBtnCustomerPaymentsClick(this);
    }
}, ".btn-customer-payments");

// 2 - C: Create
// thực thi sự kiện khi ấn nút Create customer
$("#btn-create-customer").on({
    click: function() {
        onBtnCreateCustomerClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create customer
$("#modal-customer-btn-create").on({
    click: function() {
        onModalCustomerBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin customer
$("#table-customer").on({
    click: function() {
        onIconEditCustomerClick(this);
    }
}, ".icon-edit-customer");

// thực thi sự kiện khi ấn nút Update thông tin customer trên modal
$("#modal-customer-btn-update").on({
    click: function() {
        onModalCustomerBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin customer
$("#table-customer").on({
    click: function() {
        onIconDeleteCustomerClick(this);
    }
}, ".icon-delete-customer");

// thực thi sự kiện khi ấn nút Confirm Delete customer trên modal
$("#modal-btn-confirm-delete").on({
    click: function() {
        onModalBtnConfirmDeleteClick();
    }
});

// thực thi sự kiện khi đóng modal warning
$("#modal-warning").on({
    "hidden.bs.modal": function() {
        onModalWarningClose();
    }
});

// thực thi sự kiện khi đóng modal success
$("#modal-success").on({
    "hidden.bs.modal": function() {
        onModalSuccessClose();
    }
});

// thực thi sự kiện khi đóng modal customer
$("#modal-customer").on({
    "hidden.bs.modal": function() {
        onModalCustomerClose();
    }
});

// thực thi sự kiện khi đóng modal danger
$("#modal-danger").on({
    "hidden.bs.modal": function() {
        onModalDangerClose();
    }
});

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// xử lý sự kiện khi tải trang
function onPageLoading() {
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiGetAllCustomers();
}

// xử lý sự kiện khi ấn nút Customer orders
function onBtnCustomerOrdersClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getCustomerObjByRow(paramBtn, gCustomerObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    var vUrlToOpen = "ordersCRUD.html?customerid=" + gCustomerObj.id;
    location.href = vUrlToOpen;
}

// xử lý sự kiện khi ấn nút Customer payments
function onBtnCustomerPaymentsClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getCustomerObjByRow(paramBtn, gCustomerObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    var vUrlToOpen = "paymentsCRUD.html?customerid=" + gCustomerObj.id;
    location.href = vUrlToOpen;
}

// xử lý sự kiện khi ấn nút Create customer
function onBtnCreateCustomerClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    loadModalCustomer();
}

// xử lý sự kiện khi ấn nút Create customer trên modal
function onModalCustomerBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gCustomerObj);
    getCustomerInfoObj(gCustomerObj);
    console.log(gCustomerObj);
    // B2: validate
    var vValidateStatus = validateCustomerInfo(gCustomerObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateCustomer(gCustomerObj);
    }
}

// xử lý sự kiện khi đóng modal warning
function onModalWarningClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    if (gFocusField.length !== 0) {
        getFocusField();
    }
}

// xử lý sự kiện khi ấn icon Sửa thông tin customer
function onIconEditCustomerClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gCustomerObj);
    getCustomerObjByRow(paramIconEdit, gCustomerObj);
    console.log(gCustomerObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalCustomer();
    callAjaxApiGetCustomerByCustomerId(gCustomerObj);
}

// xử lý sự kiện khi ấn nút Update thông tin customer trên modal
function onModalCustomerBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getCustomerInfoObj(gCustomerObj);
    console.log(gCustomerObj);
    // B2: validate
    var vValidateStatus = validateCustomerInfo(gCustomerObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateCustomer(gCustomerObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá customer
function onIconDeleteCustomerClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gCustomerObj);
    getCustomerObjByRow(paramIconDelete, gCustomerObj);
    console.log(gCustomerObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete customer
        <span class="font-weight-bold">` +
        gCustomerObj.firstName + ` ` + gCustomerObj.lastName +
        `</span>
        with ID: <span class="font-weight-bold">` +
        gCustomerObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete customer trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gCustomerObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteCustomer(gCustomerObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-customer").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal customer
function onModalCustomerClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    resetToStart();
}

// xử lý sự kiện khi đóng modal danger
function onModalDangerClose() {
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

// gọi API lấy thông tin tất cả customer
function callAjaxApiGetAllCustomers() {
    $.ajax({
        url: gBASE_URL + "customers",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllCustomersObj) {
            gCustomersDb.customers = resAllCustomersObj;
            loadAllCustomersDataTable(gCustomersDb.customers);
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

// load thông tin tất cả customer vào DataTable
function loadAllCustomersDataTable(paramAllCustomersObj) {
    gTableCustomer.clear();
    gTableCustomer.rows.add(paramAllCustomersObj);
    gTableCustomer.draw();
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal customer
function loadModalCustomer() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới customer
        $("#modal-h4-title").text("create new customer");
        // ấn các trường thông tin không cần thiết khi tạo customer
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update customer
        $("#modal-customer-btn-create").show();
        $("#modal-customer-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật customer
        $("#modal-h4-title").text("update customer");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin customer 
        $(".update-only").show();
        // hiện nút Update và ẩn nút Create customer
        $("#modal-customer-btn-update").show();
        $("#modal-customer-btn-create").hide();
    }
    $("#modal-customer").modal();
}

// lấy dữ liệu thông tin customer được tạo
function getCustomerInfoObj(paramCustomerObj) {
    // chuẩn hoá
    $("#modal-customer-inp-last-name").val($("#modal-customer-inp-last-name").val().trim());
    $("#modal-customer-inp-first-name").val($("#modal-customer-inp-first-name").val().trim());
    $("#modal-customer-inp-phone-number").val($("#modal-customer-inp-phone-number").val().trim());
    $("#modal-customer-textarea-address").val($("#modal-customer-textarea-address").val().trim());
    $("#modal-customer-inp-city").val($("#modal-customer-inp-city").val().trim());
    $("#modal-customer-inp-state").val($("#modal-customer-inp-state").val().trim());
    $("#modal-customer-inp-postal-code").val($("#modal-customer-inp-postal-code").val().trim());
    $("#modal-customer-inp-country").val($("#modal-customer-inp-country").val().trim());
    $("#modal-customer-inp-sales-rep-employee-number").val($("#modal-customer-inp-sales-rep-employee-number").val().trim());
    $("#modal-customer-inp-credit-limit").val($("#modal-customer-inp-credit-limit").val().trim());
    // lưu thông tin 
    paramCustomerObj.lastName = $("#modal-customer-inp-last-name").val();
    paramCustomerObj.firstName = $("#modal-customer-inp-first-name").val();
    paramCustomerObj.phoneNumber = $("#modal-customer-inp-phone-number").val();
    paramCustomerObj.address = $("#modal-customer-textarea-address").val();
    paramCustomerObj.city = $("#modal-customer-inp-city").val();
    paramCustomerObj.state = $("#modal-customer-inp-state").val();
    paramCustomerObj.postalCode = $("#modal-customer-inp-postal-code").val();
    paramCustomerObj.country = $("#modal-customer-inp-country").val();
    paramCustomerObj.salesRepEmployeeNumber = $("#modal-customer-inp-sales-rep-employee-number").val();
    paramCustomerObj.creditLimit = $("#modal-customer-inp-credit-limit").val();
}

// validate thông tin customer được tạo
function validateCustomerInfo(paramCustomerObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramCustomerObj.lastName.length == 0) {
        vModalPWarningSelector.text("Last Name must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-customer-inp-last-name");
        return false;
    }
    if (paramCustomerObj.firstName.length == 0) {
        vModalPWarningSelector.text("First Name must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-customer-inp-first-name");
        return false;
    }
    if (paramCustomerObj.phoneNumber.length == 0) {
        vModalPWarningSelector.text("Phone Number must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-customer-inp-phone-number");
        return false;
    }
    return true;
}

// gọi API create customer
function callAjaxApiCreateCustomer(paramCustomerObj) {
    $.ajax({
        url: gBASE_URL + "customers",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramCustomerObj),
        success: function(resCustomerObj) {
            console.log(paramCustomerObj);
            console.log(resCustomerObj);
            $("#modal-p-success").html("Create customer successfully !!!");
            $("#modal-success").modal();
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

// trả về id của đối tượng customer muốn edit
function getCustomerObjByRow(paramElement, paramCustomerObj) {
    var vCustomerRow = $(paramElement).parents("tr");
    var vDataCustomerRow = gTableCustomer.row(vCustomerRow);
    var vCustomerObjByDataCustomerRow = vDataCustomerRow.data();
    console.log(vCustomerObjByDataCustomerRow);
    paramCustomerObj.id = vCustomerObjByDataCustomerRow.id;
    paramCustomerObj.lastName = vCustomerObjByDataCustomerRow.lastName;
    paramCustomerObj.firstName = vCustomerObjByDataCustomerRow.firstName;
    paramCustomerObj.phoneNumber = vCustomerObjByDataCustomerRow.phoneNumber;
    paramCustomerObj.address = vCustomerObjByDataCustomerRow.address;
    paramCustomerObj.city = vCustomerObjByDataCustomerRow.city;
    paramCustomerObj.state = vCustomerObjByDataCustomerRow.state;
    paramCustomerObj.postalCode = vCustomerObjByDataCustomerRow.postalCode;
    paramCustomerObj.country = vCustomerObjByDataCustomerRow.country;
    paramCustomerObj.salesRepEmployeeNumber = vCustomerObjByDataCustomerRow.salesRepEmployeeNumber;
    paramCustomerObj.creditLimit = vCustomerObjByDataCustomerRow.creditLimit;
}

// gọi API lấy thông tin customer theo customer id
function callAjaxApiGetCustomerByCustomerId(paramCustomerObj) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramCustomerObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resCustomerObj) {
            gCustomerObj = resCustomerObj;
            console.log(gCustomerObj);
            loadCustomerObjToModalCustomer(gCustomerObj);
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

// load thông tin đối tượng customer vào modal customer
function loadCustomerObjToModalCustomer(paramCustomerObj) {
    $("#modal-customer-inp-id").val(paramCustomerObj.id);
    $("#modal-customer-inp-last-name").val(paramCustomerObj.lastName);
    $("#modal-customer-inp-first-name").val(paramCustomerObj.firstName);
    $("#modal-customer-inp-phone-number").val(paramCustomerObj.phoneNumber);
    $("#modal-customer-textarea-address").val(paramCustomerObj.address);
    $("#modal-customer-inp-city").val(paramCustomerObj.city);
    $("#modal-customer-inp-state").val(paramCustomerObj.state);
    $("#modal-customer-inp-postal-code").val(paramCustomerObj.postalCode);
    $("#modal-customer-inp-country").val(paramCustomerObj.country);
    $("#modal-customer-inp-sales-rep-employee-number").val(paramCustomerObj.salesRepEmployeeNumber);
    $("#modal-customer-inp-credit-limit").val(paramCustomerObj.creditLimit);
}

// gọi API cập nhât thông tin customer
function callAjaxApiUpdateCustomer(paramCustomerObj) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramCustomerObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramCustomerObj),
        success: function(resCustomerObj) {
            console.log(gCustomerObj);
            console.log(resCustomerObj);
            $("#modal-p-success").html("Update customer successfully !!!");
            $("#modal-success").modal();
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

// gọi API xoá thông tin customer
function callAjaxApiDeleteCustomer(paramCustomerObj) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramCustomerObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resCustomerObj) {
            console.log(gCustomerObj);
            console.log(resCustomerObj);
            $("#modal-p-success").html("Delete customer successfully !!!");
            $("#modal-success").modal();
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

// focus vào trường thông tin trên modal chưa thoả mãn validate
function getFocusField() {
    gFocusField.focus();
}

// reset dữ liệu các dữ liệu biến global và thông tin trên modal user detail
function resetToStart() {
    gFocusField = "";
    gCustomerObj = {
        id: -1,
        lastName: "",
        firstName: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        salesRepEmployeeNumber: -1,
        creditLimit: -1,
        payments: [],
        orders: [],
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-customer input,textarea").val("");
    console.log(gCustomerObj);
}