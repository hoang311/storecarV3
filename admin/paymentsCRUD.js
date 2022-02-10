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

// Mảng chứa dữ liệu payment
var gPaymentsDb = {
    payments: []
};

// Mảng chứa dữ liệu customer
var gCustomersDb = {
    customers: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng payment
var gPaymentObj = {
    id: -1,
    checkNumber: "",
    paymentDate: "",
    ammount: -1,
    customerId: -1
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
    "customerFullName",
    "checkNumber",
    "paymentDate",
    "ammount",
    "action"
];
const gID_PAYMENT_COL = 0;
const gCUSTOMER_FULL_NAME_COL = 1;
const gCHECK_NUMBER_COL = 2;
const gPAYMENT_DATE_COL = 3;
const gAMOUNT_COL = 4;
const gACTION_COL = 5;

// khởi tạo DataTable
var gTablePayment = $("#table-payment").DataTable({
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
            data: gDATA_COL[gID_PAYMENT_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gCUSTOMER_FULL_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gCHECK_NUMBER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPAYMENT_DATE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gAMOUNT_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-payment" data-toggle="tooltip" title="Edit payment"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-payment" data-toggle="tooltip" title="Delete payment"></i>
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

// 2 - C: Create
// thực thi sự kiện khi ấn nút Create payment
$("#btn-create-payment").on({
    click: function() {
        onBtnCreatePaymentClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create payment
$("#modal-payment-btn-create").on({
    click: function() {
        onModalPaymentBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin payment
$("#table-payment").on({
    click: function() {
        onIconEditPaymentClick(this);
    }
}, ".icon-edit-payment");

// thực thi sự kiện khi ấn nút Update thông tin payment trên modal
$("#modal-payment-btn-update").on({
    click: function() {
        onModalPaymentBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin payment
$("#table-payment").on({
    click: function() {
        onIconDeletePaymentClick(this);
    }
}, ".icon-delete-payment");

// thực thi sự kiện khi ấn nút Confirm Delete payment trên modal
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

// thực thi sự kiện khi đóng modal payment
$("#modal-payment").on({
    "hidden.bs.modal": function() {
        onModalPaymentClose();
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
    var vUrl = new URL(location);
    var vCustomerId = vUrl.searchParams.get('customerid');
    var vApiUrl = gBASE_URL + "customers/payments";
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    if (vCustomerId !== null && vCustomerId.length !== 0) {
        callAjaxApiGetCustomerByCustomerId(vCustomerId);
        vApiUrl = gBASE_URL + "customers/" + vCustomerId + "/payments";
    }
    callAjaxApiGetAllPayments(vApiUrl);
}

// xử lý sự kiện khi ấn nút Create payment
function onBtnCreatePaymentClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: gọi server
    callAjaxApiGetAllCustomers();
    // B4: xử lý hiển thị
    loadModalPayment();
}

// xử lý sự kiện khi ấn nút Create payment trên modal
function onModalPaymentBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gPaymentObj);
    getPaymentInfoObj(gPaymentObj);
    console.log(gPaymentObj);
    // B2: validate
    var vValidateStatus = validatePaymentInfo(gPaymentObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreatePayment(gPaymentObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin payment
function onIconEditPaymentClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gPaymentObj);
    getPaymentObjByRow(paramIconEdit, gPaymentObj);
    console.log(gPaymentObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalPayment();
    callAjaxApiGetPaymentByPaymentId(gPaymentObj);
}

// xử lý sự kiện khi ấn nút Update thông tin payment trên modal
function onModalPaymentBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getPaymentInfoObj(gPaymentObj);
    console.log(gPaymentObj);
    // B2: validate
    var vValidateStatus = validatePaymentInfo(gPaymentObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdatePayment(gPaymentObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá payment
function onIconDeletePaymentClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gPaymentObj);
    getPaymentObjByRow(paramIconDelete, gPaymentObj);
    console.log(gPaymentObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete payment Check Number
        <span class="font-weight-bold">` +
        gPaymentObj.checkNumber +
        `</span>
        with ID: <span class="font-weight-bold">` +
        gPaymentObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete payment trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gPaymentObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeletePayment(gPaymentObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-payment").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal payment
function onModalPaymentClose() {
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

// gọi API lấy thông tin customer theo customer id
function callAjaxApiGetCustomerByCustomerId(paramCustomerId) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramCustomerId,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resCustomerObj) {
            console.log(resCustomerObj);
            $("#h3-title-payment-list").html(`
            payment list of customer 
            <span class="text-danger">
            ` + resCustomerObj.firstName + ` ` + resCustomerObj.lastName + ` (ID: ` + resCustomerObj.id + `)
            </span>`);
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

// gọi API lấy thông tin tất cả payment
function callAjaxApiGetAllPayments(paramApiUrl) {
    $.ajax({
        url: paramApiUrl,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllPaymentsObj) {
            gPaymentsDb.payments = resAllPaymentsObj;
            loadAllPaymentsDataTable(gPaymentsDb.payments);
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
            location.href = "index.html";
        }
    });
}

// load thông tin tất cả payment vào DataTable
function loadAllPaymentsDataTable(paramAllPaymentsObj) {
    gTablePayment.clear();
    gTablePayment.rows.add(paramAllPaymentsObj);
    gTablePayment.draw();
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
            loadAllCustomersObjToModalPayment(gCustomersDb.customers);
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

// load thông tin tất cả customer vào modal select payment
function loadAllCustomersObjToModalPayment(paramAllCustomersObj) {
    var vModalPaymentSelectCustomerId = $("#modal-payment-select-customer-id");
    vModalPaymentSelectCustomerId
        .empty()
        .append($("<option/>", {
            value: gNONE_SELECTED,
            text: "--- Select customer ---"
        }));
    for (let bIndex = 0; bIndex < paramAllCustomersObj.length; bIndex++) {
        const element = paramAllCustomersObj[bIndex];
        $("<option/>", {
            value: element.id,
            text: element.firstName + ` ` + element.lastName + ` (ID: ` + element.id + `)`
        }).appendTo(vModalPaymentSelectCustomerId);
    }
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal payment
function loadModalPayment() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới payment
        $("#modal-h4-title").text("create new payment");
        // ấn các trường thông tin không cần thiết khi tạo payment
        $(".create-only").show();
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update payment
        $("#modal-payment-btn-create").show();
        $("#modal-payment-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật payment
        $("#modal-h4-title").text("update payment");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin payment 
        $(".update-only").show();
        $(".create-only").hide();
        // hiện nút Update và ẩn nút Create payment
        $("#modal-payment-btn-update").show();
        $("#modal-payment-btn-create").hide();
    }
    $("#modal-payment").modal();
}

// lấy dữ liệu thông tin payment được tạo
function getPaymentInfoObj(paramPaymentObj) {
    // chuẩn hoá chuỗi
    $("#modal-payment-inp-check-number").val($("#modal-payment-inp-check-number").val().trim());
    // lưu thông tin 
    paramPaymentObj.checkNumber = $("#modal-payment-inp-check-number").val();
    paramPaymentObj.paymentDate = $("#modal-payment-inp-payment-date").val();
    paramPaymentObj.ammount = $("#modal-payment-inp-ammount").val();
    paramPaymentObj.customerId = $("#modal-payment-select-customer-id").val();
    if ($("#modal-payment-select-customer-id").val() == gNONE_SELECTED) {
        paramPaymentObj.customerId = gNONE_SELECTED;
    }
}

// validate thông tin payment được tạo
function validatePaymentInfo(paramPaymentObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (gFormMode == gFORM_MODE_INSERT && paramPaymentObj.customerId == gNONE_SELECTED) {
        vModalPWarningSelector.text("Customer must be selected !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-payment-select-customer-id");
        return false;
    }
    if (paramPaymentObj.checkNumber.length == 0) {
        vModalPWarningSelector.text("Check Number must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-payment-inp-check-number");
        return false;
    }
    if (!validateDateFormat(paramPaymentObj.paymentDate)) {
        vModalPWarningSelector.text("Payment Date must be format dd/MM/yyyy !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-payment-inp-payment-date");
        return false;
    }
    if (paramPaymentObj.ammount.length == 0) {
        vModalPWarningSelector.text("Ammount must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-payment-inp-ammount");
        return false;
    }
    if (paramPaymentObj.ammount < 0) {
        vModalPWarningSelector.text("Ammount invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-payment-inp-ammount");
        return false;
    }
    return true;
}

// validate date format dd/MM/yyyy
function validateDateFormat(paramDate) {
    const vDateRE = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/;
    return vDateRE.test(String(paramDate));
}

// gọi API create payment
function callAjaxApiCreatePayment(paramPaymentObj) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramPaymentObj.customerId + "/payments",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramPaymentObj),
        success: function(resPaymentObj) {
            console.log(paramPaymentObj);
            console.log(resPaymentObj);
            $("#modal-p-success").html("Create payment successfully !!!");
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

// trả về id của đối tượng payment muốn edit
function getPaymentObjByRow(paramElement, paramPaymentObj) {
    var vPaymentRow = $(paramElement).parents("tr");
    var vDataPaymentRow = gTablePayment.row(vPaymentRow);
    var vPaymentObjByDataPaymentRow = vDataPaymentRow.data();
    console.log(vPaymentObjByDataPaymentRow);
    paramPaymentObj.id = vPaymentObjByDataPaymentRow.id;
    paramPaymentObj.checkNumber = vPaymentObjByDataPaymentRow.checkNumber;
    paramPaymentObj.paymentDate = vPaymentObjByDataPaymentRow.paymentDate;
    paramPaymentObj.ammount = vPaymentObjByDataPaymentRow.ammount;
}

// gọi API lấy thông tin payment theo payment id
function callAjaxApiGetPaymentByPaymentId(paramPaymentObj) {
    $.ajax({
        url: gBASE_URL + "customers/payments/" + paramPaymentObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resPaymentObj) {
            gPaymentObj = resPaymentObj;
            console.log(gPaymentObj);
            loadPaymentObjToModalPayment(gPaymentObj);
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

// load thông tin đối tượng payment vào modal payment
function loadPaymentObjToModalPayment(paramPaymentObj) {
    $("#modal-payment-inp-id").val(paramPaymentObj.id);
    $("#modal-payment-inp-check-number").val(paramPaymentObj.checkNumber);
    $("#modal-payment-inp-payment-date").val(paramPaymentObj.paymentDate);
    $("#modal-payment-inp-ammount").val(paramPaymentObj.ammount);
}

// gọi API cập nhât thông tin payment
function callAjaxApiUpdatePayment(paramPaymentObj) {
    $.ajax({
        url: gBASE_URL + "customers/payments/" + paramPaymentObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramPaymentObj),
        success: function(resPaymentObj) {
            console.log(gPaymentObj);
            console.log(resPaymentObj);
            $("#modal-p-success").html("Update payment successfully !!!");
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

// gọi API xoá thông tin payment
function callAjaxApiDeletePayment(paramPaymentObj) {
    $.ajax({
        url: gBASE_URL + "customers/payments/" + paramPaymentObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resPaymentObj) {
            console.log(gPaymentObj);
            console.log(resPaymentObj);
            $("#modal-p-success").html("Delete payment successfully !!!");
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
    gPaymentObj = {
        id: -1,
        checkNumber: "",
        paymentDate: "",
        ammount: ""
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-payment input,textarea,select").val("");
    console.log(gPaymentObj);
}