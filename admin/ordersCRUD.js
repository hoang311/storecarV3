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

// Mảng chứa dữ liệu order
var gOrdersDb = {
    orders: []
};

// Mảng chứa dữ liệu customer
var gCustomersDb = {
    customers: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng order
var gOrderObj = {
    id: -1,
    orderDate: "",
    requiredDate: "",
    shippedDate: "",
    status: "",
    comments: "",
    orderDetails: [],
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
    "orderDate",
    "requiredDate",
    "orderDetails",
    "status",
    "action"
];
const gID_ORDER_COL = 0;
const gCUSTOMER_FULL_NAME_COL = 1;
const gORDER_DATE_COL = 2;
const gREQUIRED_DATE_COL = 3;
const gORDER_DETAILS_COL = 4;
const gSTATUS_COL = 5;
const gACTION_COL = 6;

// khởi tạo DataTable
var gTableOrder = $("#table-order").DataTable({
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
    "order": [
        [1, "asc"]
    ],
    // "ordering": false,
    // "scrollY": "245px",
    // "scrollCollapse": true,
    // "scrollX": true,
    columns: [{
            data: gDATA_COL[gID_ORDER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gCUSTOMER_FULL_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gORDER_DATE_COL],
            className: "text-center",
            orderable: false
        },
        {
            data: gDATA_COL[gREQUIRED_DATE_COL],
            className: "text-center",
            orderable: false
        },
        {
            data: gDATA_COL[gORDER_DETAILS_COL],
            className: "text-center",
            orderable: false,
            render: function() {
                return `<button class="btn btn-info btn-order-orderdetails" type="button">Order details</button>`;
            }
        },
        {
            data: gDATA_COL[gSTATUS_COL],
            className: "text-center",
            orderable: false
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            orderable: false,
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-order" data-toggle="tooltip" title="Edit order"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-order" data-toggle="tooltip" title="Delete order"></i>
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
    $('#reservationdate-order,#reservationdate-required,#reservationdate-shipped').datetimepicker({
        format: 'DD/MM/YYYY'
    });
});

// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// thực thi sự kiện khi ấn nút customer orders trên bảng customer
$("#table-order").on({
    click: function() {
        onBtnOrderOrderdetailsClick(this);
    }
}, ".btn-order-orderdetails");

// 2 - C: Create
// thực thi sự kiện khi ấn nút Create order
$("#btn-create-order").on({
    click: function() {
        onBtnCreateOrderClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create order
$("#modal-order-btn-create").on({
    click: function() {
        onModalOrderBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin order
$("#table-order").on({
    click: function() {
        onIconEditOrderClick(this);
    }
}, ".icon-edit-order");

// thực thi sự kiện khi ấn nút Update thông tin order trên modal
$("#modal-order-btn-update").on({
    click: function() {
        onModalOrderBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin order
$("#table-order").on({
    click: function() {
        onIconDeleteOrderClick(this);
    }
}, ".icon-delete-order");

// thực thi sự kiện khi ấn nút Confirm Delete order trên modal
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

// thực thi sự kiện khi đóng modal order
$("#modal-order").on({
    "hidden.bs.modal": function() {
        onModalOrderClose();
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
    var vUrlParams = new URLSearchParams(location.search);
    var vCustomerId = vUrlParams.get('customerid');
    var vApiUrl = gBASE_URL + "customers/orders";
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    if (vCustomerId !== null && vCustomerId.length !== 0) {
        callAjaxApiGetCustomerByCustomerId(vCustomerId);
        vApiUrl = gBASE_URL + "customers/" + vCustomerId + "/orders";
    }
    callAjaxApiGetAllOrders(vApiUrl);
}

// xử lý sự kiện khi ấn nút Order details
function onBtnOrderOrderdetailsClick(paramBtn) {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderObjByRow(paramBtn, gOrderObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    var vUrlToOpen = "orderdetailsCRUD.html?orderid=" + gOrderObj.id;
    location.href = vUrlToOpen;
}

// xử lý sự kiện khi ấn nút Create order
function onBtnCreateOrderClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: gọi server
    callAjaxApiGetAllCustomers();
    // B4: xử lý hiển thị
    loadModalOrder();
}

// xử lý sự kiện khi ấn nút Create order trên modal
function onModalOrderBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderObj);
    getOrderInfoObj(gOrderObj);
    console.log(gOrderObj);
    // B2: validate
    var vValidateStatus = validateOrderInfo(gOrderObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateOrder(gOrderObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin order
function onIconEditOrderClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderObj);
    getOrderObjByRow(paramIconEdit, gOrderObj);
    console.log(gOrderObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalOrder();
    callAjaxApiGetOrderByOrderId(gOrderObj);
}

// xử lý sự kiện khi ấn nút Update thông tin order trên modal
function onModalOrderBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderInfoObj(gOrderObj);
    console.log(gOrderObj);
    // B2: validate
    var vValidateStatus = validateOrderInfo(gOrderObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateOrder(gOrderObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá order
function onIconDeleteOrderClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderObj);
    getOrderObjByRow(paramIconDelete, gOrderObj);
    console.log(gOrderObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete order with ID: 
        <span class="font-weight-bold">` +
        gOrderObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete order trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteOrder(gOrderObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-order").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal order
function onModalOrderClose() {
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
            $("#h3-title-order-list").html(`
                Order list of customer 
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

// gọi API lấy thông tin tất cả order
function callAjaxApiGetAllOrders(paramApiUrl) {
    $.ajax({
        url: paramApiUrl,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllOrdersObj) {
            gOrdersDb.orders = resAllOrdersObj;
            loadAllOrdersDataTable(gOrdersDb.orders);
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

// load thông tin tất cả order vào DataTable
function loadAllOrdersDataTable(paramAllOrdersObj) {
    gTableOrder.clear();
    gTableOrder.rows.add(paramAllOrdersObj);
    gTableOrder.draw();
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
            loadAllCustomersObjToModalOrder(gCustomersDb.customers);
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

// load thông tin tất cả customer vào modal select order
function loadAllCustomersObjToModalOrder(paramAllCustomersObj) {
    var vModalOrderSelectCustomerId = $("#modal-order-select-customer-id");
    vModalOrderSelectCustomerId
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
        }).appendTo(vModalOrderSelectCustomerId);
    }
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal order
function loadModalOrder() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới order
        $("#modal-h4-title").text("create new order");
        // ấn các trường thông tin không cần thiết khi tạo order
        $(".create-only").show();
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update order
        $("#modal-order-btn-create").show();
        $("#modal-order-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật order
        $("#modal-h4-title").text("update order");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin order 
        $(".update-only").show();
        $(".create-only").hide();
        // hiện nút Update và ẩn nút Create order
        $("#modal-order-btn-update").show();
        $("#modal-order-btn-create").hide();
    }
    $("#modal-order").modal();
}

// lấy dữ liệu thông tin order được tạo
function getOrderInfoObj(paramOrderObj) {
    // chuẩn hoá chuỗi
    $("#modal-order-inp-status").val($("#modal-order-inp-status").val().trim());
    $("#modal-order-textarea-comments").val($("#modal-order-textarea-comments").val().trim());
    // lưu thông tin 
    paramOrderObj.orderDate = $("#modal-order-inp-order-date").val();
    paramOrderObj.requiredDate = $("#modal-order-inp-required-date").val();
    paramOrderObj.shippedDate = $("#modal-order-inp-shipped-date").val();
    paramOrderObj.status = $("#modal-order-inp-status").val();
    paramOrderObj.comments = $("#modal-order-textarea-comments").val();
    paramOrderObj.customerId = $("#modal-order-select-customer-id").val();
    if ($("#modal-order-select-customer-id").val() == gNONE_SELECTED) {
        paramOrderObj.customerId = gNONE_SELECTED;
    }
}

// validate thông tin order được tạo
function validateOrderInfo(paramOrderObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (gFormMode == gFORM_MODE_INSERT && paramOrderObj.customerId == gNONE_SELECTED) {
        vModalPWarningSelector.text("Customer must be selected !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-select-customer-id");
        return false;
    }
    if (paramOrderObj.orderDate.length == 0) {
        vModalPWarningSelector.text("Order Date must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-inp-order-date");
        return false;
    }
    if (!validateDateFormat(paramOrderObj.orderDate)) {
        vModalPWarningSelector.text("Order Date must be format dd/MM/yyyy !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-inp-order-date");
        return false;
    }
    if (paramOrderObj.requiredDate.length == 0) {
        vModalPWarningSelector.text("Required Date must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-inp-required-date");
        return false;
    }
    if (!validateDateFormat(paramOrderObj.requiredDate)) {
        vModalPWarningSelector.text("Required Date must be format dd/MM/yyyy !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-inp-required-date");
        return false;
    }
    if (paramOrderObj.shippedDate.length != 0 && !validateDateFormat(paramOrderObj.shippedDate)) {
        vModalPWarningSelector.text("Shipped Date must be format dd/MM/yyyy !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-order-inp-shipped-date");
        return false;
    }
    return true;
}

// validate date format dd/MM/yyyy
function validateDateFormat(paramDate) {
    const vDateRE = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/;
    return vDateRE.test(String(paramDate));
}

// gọi API create order
function callAjaxApiCreateOrder(paramOrderObj) {
    $.ajax({
        url: gBASE_URL + "customers/" + paramOrderObj.customerId + "/orders",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderObj),
        success: function(resOrderObj) {
            console.log(paramOrderObj);
            console.log(resOrderObj);
            $("#modal-p-success").html("Create order successfully !!!");
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

// trả về id của đối tượng order muốn edit
function getOrderObjByRow(paramElement, paramOrderObj) {
    var vOrderRow = $(paramElement).parents("tr");
    var vDataOrderRow = gTableOrder.row(vOrderRow);
    var vOrderObjByDataOrderRow = vDataOrderRow.data();
    console.log(vOrderObjByDataOrderRow);
    paramOrderObj.id = vOrderObjByDataOrderRow.id;
    paramOrderObj.orderDate = vOrderObjByDataOrderRow.orderDate;
    paramOrderObj.requiredDate = vOrderObjByDataOrderRow.requiredDate;
    paramOrderObj.shippedDate = vOrderObjByDataOrderRow.shippedDate;
    paramOrderObj.status = vOrderObjByDataOrderRow.status;
    paramOrderObj.comments = vOrderObjByDataOrderRow.comments;
    paramOrderObj.orderDetails = vOrderObjByDataOrderRow.orderDetails;
}

// gọi API lấy thông tin order theo order id
function callAjaxApiGetOrderByOrderId(paramOrderObj) {
    $.ajax({
        url: gBASE_URL + "customers/orders/" + paramOrderObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderObj) {
            gOrderObj = resOrderObj;
            console.log(gOrderObj);
            loadOrderObjToModalOrder(gOrderObj);
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

// load thông tin đối tượng order vào modal order
function loadOrderObjToModalOrder(paramOrderObj) {
    $("#modal-order-inp-id").val(paramOrderObj.id);
    $("#modal-order-inp-order-date").val(paramOrderObj.orderDate);
    $("#modal-order-inp-required-date").val(paramOrderObj.requiredDate);
    $("#modal-order-inp-shipped-date").val(paramOrderObj.shippedDate);
    $("#modal-order-inp-status").val(paramOrderObj.status);
    $("#modal-order-textarea-comments").val(paramOrderObj.comments);
}

// gọi API cập nhât thông tin order
function callAjaxApiUpdateOrder(paramOrderObj) {
    $.ajax({
        url: gBASE_URL + "customers/orders/" + paramOrderObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderObj),
        success: function(resOrderObj) {
            console.log(gOrderObj);
            console.log(resOrderObj);
            $("#modal-p-success").html("Update order successfully !!!");
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

// gọi API xoá thông tin order
function callAjaxApiDeleteOrder(paramOrderObj) {
    $.ajax({
        url: gBASE_URL + "customers/orders/" + paramOrderObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderObj) {
            console.log(gOrderObj);
            console.log(resOrderObj);
            $("#modal-p-success").html("Delete order successfully !!!");
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
    gOrderObj = {
        id: -1,
        orderDate: "",
        requiredDate: "",
        shippedDate: "",
        status: "",
        comments: "",
        orderDetails: [],
        customerId: -1
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-order input,textarea,select").val("");
    console.log(gOrderObj);
}