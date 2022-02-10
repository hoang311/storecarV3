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

// Mảng chứa dữ liệu Order detail
var gOrderdetailsDb = {
    orderdetails: []
};

// Mảng chứa dữ liệu order
var gOrdersDb = {
    orders: []
};

// Mảng chứa dữ liệu product
var gProductsDb = {
    products: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng Order detail
var gOrderdetailObj = {
    id: -1,
    quantityOrder: -1,
    priceEach: -1,
    orderId: -1,
    productId: -1,
    ratingAndReview: null
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
    "productName",
    "quantityOrder",
    "priceEach",
    "ratingAndReview",
    "ratingAndReview",
    "action"
];
const gID_ORDER_DETAIL_COL = 0;
const gPRODUCT_NAME_COL = 1;
const gQUANTITY_ORDER_COL = 2;
const gPRICE_EACH_COL = 3;
const gRATING_COL = 4;
const gREVIEW_COL = 5;
const gACTION_COL = 6;

// khởi tạo DataTable
var gTableOrderdetail = $("#table-orderdetail").DataTable({
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
            data: gDATA_COL[gID_ORDER_DETAIL_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPRODUCT_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gQUANTITY_ORDER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPRICE_EACH_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gRATING_COL],
            className: "text-center",
            render: function(paramRatingAndReview) {
                let vRating = paramRatingAndReview;
                if (paramRatingAndReview) {
                    vRating = paramRatingAndReview.rating + `&nbsp;<i class="fas fa-star text-warning"></i>`;
                }
                return vRating;
            }
        },
        {
            data: gDATA_COL[gREVIEW_COL],
            className: "text-center",
            render: function(paramRatingAndReview) {
                let vReview = paramRatingAndReview;
                if (paramRatingAndReview) {
                    vReview = paramRatingAndReview.review;
                }
                return vReview;
            }
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
                <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-orderdetail" data-toggle="tooltip" title="Edit order detail"></i>
                <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-orderdetail" data-toggle="tooltip" title="Delete order detail"></i>
                <i class="fas fa-comment-slash fa-lg text-danger cursor-pointer icon-delete-ratingnreview" data-toggle="tooltip" title="Delete rating & review"></i>
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
// thực thi sự kiện khi ấn nút Create orderdetail
$("#btn-create-orderdetail").on({
    click: function() {
        onBtnCreateOrderdetailClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create orderdetail
$("#modal-orderdetail-btn-create").on({
    click: function() {
        onModalOrderdetailBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin orderdetail
$("#table-orderdetail").on({
    click: function() {
        onIconEditOrderdetailClick(this);
    }
}, ".icon-edit-orderdetail");

// thực thi sự kiện khi ấn nút Update thông tin orderdetail trên modal
$("#modal-orderdetail-btn-update").on({
    click: function() {
        onModalOrderdetailBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Xoá orderdetail
$("#table-orderdetail").on({
    click: function() {
        onIconDeleteOrderdetailClick(this);
    }
}, ".icon-delete-orderdetail");

// thực thi sự kiện khi ấn nút Confirm Delete orderdetail trên modal
$("#modal-btn-confirm-delete").on({
    click: function() {
        onModalBtnConfirmDeleteClick();
    }
});

// thực thi sự kiện khi ấn icon Xoá Rating & Review
$("#table-orderdetail").on({
    click: function() {
        onIconDeleteRatingNReviewClick(this);
    }
}, ".icon-delete-ratingnreview");

// thực thi sự kiện khi ấn nút Confirm Delete Rating & Review
$("#modal-btn-confirm-delete-ratingnreview").on({
    click: function() {
        onModalBtnConfirmDeleteRatingNReviewClick();
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

// thực thi sự kiện khi đóng modal orderdetail
$("#modal-orderdetail").on({
    "hidden.bs.modal": function() {
        onModalOrderdetailClose();
    }
});

// thực thi sự kiện khi đóng modal danger
$("#modal-danger").on({
    "hidden.bs.modal": function() {
        onModalDangerClose();
    }
});

// thực thi sự kiện khi đóng modal danger Rating & Review
$("#modal-danger-ratingnreview").on({
    "hidden.bs.modal": function() {
        onModalDangerRatingNReviewClose();
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
    var vOrderId = vUrl.searchParams.get("orderid");
    var vProductId = vUrl.searchParams.get("productid");
    var vApiUrl = gBASE_URL + "orderdetails";
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    if (vOrderId && vOrderId.length !== 0) {
        // lấy thông tin để hiển thị tên bảng theo orderid
        callAjaxApiGetOrderByOrderId(vOrderId);
        vApiUrl = gBASE_URL + "orders/" + vOrderId + "/orderdetails";
    }
    if (vProductId && vProductId.length !== 0) {
        // lấy thông tin để hiển thị tên bảng theo productid 
        callAjaxApiGetProductByProductId(vProductId);
        vApiUrl = gBASE_URL + "products/" + vProductId + "/orderdetails";
    }
    callAjaxApiGetAllOrderdetails(vApiUrl);
}

// xử lý sự kiện khi ấn nút Create orderdetail
function onBtnCreateOrderdetailClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: gọi server
    callAjaxApiGetAllOrders();
    callAjaxApiGetAllProducts();
    // B4: xử lý hiển thị
    loadModalOrderdetail();
}

// xử lý sự kiện khi ấn nút Create orderdetail trên modal
function onModalOrderdetailBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    getOrderdetailInfoObj(gOrderdetailObj);
    console.log(gOrderdetailObj);
    // B2: validate
    var vValidateStatus = validateOrderdetailInfo(gOrderdetailObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateOrderdetail(gOrderdetailObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin orderdetail
function onIconEditOrderdetailClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    getOrderdetailObjByRow(paramIconEdit, gOrderdetailObj);
    console.log(gOrderdetailObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalOrderdetail();
    callAjaxApiGetOrderdetailByOrderdetailId(gOrderdetailObj);
}

// xử lý sự kiện khi ấn nút Update thông tin orderdetail trên modal
function onModalOrderdetailBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOrderdetailInfoObj(gOrderdetailObj);
    console.log(gOrderdetailObj);
    // B2: validate
    var vValidateStatus = validateOrderdetailInfo(gOrderdetailObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateOrderdetail(gOrderdetailObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá orderdetail
function onIconDeleteOrderdetailClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    getOrderdetailObjByRow(paramIconDelete, gOrderdetailObj);
    console.log(gOrderdetailObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete order detail with ID: 
        <span class="font-weight-bold">` +
        gOrderdetailObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete orderdetail trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteOrderdetail(gOrderdetailObj);
}

// xử lý sự kiện khi ấn icon Xoá Rating & Review
function onIconDeleteRatingNReviewClick(paramIconDeleteRatingNReview) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    getOrderdetailObjByRow(paramIconDeleteRatingNReview, gOrderdetailObj);
    console.log(gOrderdetailObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete-ratingnreview").html(`
        Confirm delete <span class="font-weight-bold">Rating & Review</span> of order detail with ID: 
        <span class="font-weight-bold">` +
        gOrderdetailObj.id +
        `</span> !!!`);
    $("#modal-danger-ratingnreview").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete Rating & Review trên modal
function onModalBtnConfirmDeleteRatingNReviewClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOrderdetailObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteRatingNReviewById(gOrderdetailObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-orderdetail").modal("hide");
    $("#modal-danger").modal("hide");
    $("#modal-danger-ratingnreview").modal("hide");
}

// xử lý sự kiện khi đóng modal orderdetail
function onModalOrderdetailClose() {
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

// xử lý sự kiện khi đóng modal danger
function onModalDangerRatingNReviewClose() {
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

// gọi API lấy thông tin order theo order id
function callAjaxApiGetOrderByOrderId(paramOrderId) {
    $.ajax({
        url: gBASE_URL + "customers/orders/" + paramOrderId,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderObj) {
            console.log(resOrderObj);
            $("#h3-title-order-detail-list").html(`
            Order details list of  
            <span class="text-danger">
                Order ID: ` + resOrderObj.id +
                `</span> 
            (` + resOrderObj.customerFullName + `)`);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON !== undefined) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API lấy thông tin product theo product id
function callAjaxApiGetProductByProductId(paramProductId) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramProductId,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resProductObj) {
            console.log(resProductObj);
            $("#h3-title-order-detail-list").html(`
            Order details list of  
            <span class="text-danger">
                Product ID: ` + resProductObj.id +
                `</span> 
            (` + resProductObj.productName + `)`);
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON !== undefined) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API lấy thông tin tất cả orderdetail
function callAjaxApiGetAllOrderdetails(paramApiUrl) {
    $.ajax({
        url: paramApiUrl,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllOrderdetailsObj) {
            gOrderdetailsDb.orderdetails = resAllOrderdetailsObj;
            loadAllOrderdetailsDataTable(gOrderdetailsDb.orderdetails);
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

// load thông tin tất cả orderdetail vào DataTable
function loadAllOrderdetailsDataTable(paramAllOrderdetailsObj) {
    gTableOrderdetail.clear();
    gTableOrderdetail.rows.add(paramAllOrderdetailsObj);
    gTableOrderdetail.draw();
}

// gọi API lấy thông tin tất cả order
function callAjaxApiGetAllOrders() {
    $.ajax({
        url: gBASE_URL + "customers/orders",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllCustomersObj) {
            gOrdersDb.orders = resAllCustomersObj;
            loadAllOrdersObjToModalOrderdetail(gOrdersDb.orders);
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

// load thông tin tất cả order vào modal select orderdetail
function loadAllOrdersObjToModalOrderdetail(paramAllOrdersObj) {
    var vModalOrderdetailSelectOrderId = $("#modal-orderdetail-select-order-id");
    vModalOrderdetailSelectOrderId
        .empty()
        .append($("<option/>", {
            value: gNONE_SELECTED,
            text: "--- Select order ---"
        }));
    for (let bIndex = 0; bIndex < paramAllOrdersObj.length; bIndex++) {
        const element = paramAllOrdersObj[bIndex];
        $("<option/>", {
            value: element.id,
            text: `ID: ` + element.id
        }).appendTo(vModalOrderdetailSelectOrderId);
    }
}

// gọi API lấy thông tin tất cả product
function callAjaxApiGetAllProducts() {
    $.ajax({
        url: gBASE_URL + "productlines/products",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllProductsObj) {
            gProductsDb.products = resAllProductsObj;
            loadAllProductsObjToModalOrderdetail(gProductsDb.products);
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

// load thông tin tất cả product vào modal select orderdetail
function loadAllProductsObjToModalOrderdetail(paramAllProductsObj) {
    var vModalOrderdetailSelectProductId = $("#modal-orderdetail-select-product-id");
    vModalOrderdetailSelectProductId
        .empty()
        .append($("<option/>", {
            value: gNONE_SELECTED,
            text: "--- Select product ---"
        }));
    for (let bIndex = 0; bIndex < paramAllProductsObj.length; bIndex++) {
        const element = paramAllProductsObj[bIndex];
        $("<option/>", {
            value: element.id,
            text: element.productName + ` - ` + element.productCode + ` (ID: ` + element.id + `)`
        }).appendTo(vModalOrderdetailSelectProductId);
    }
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal orderdetail
function loadModalOrderdetail() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới orderdetail
        $("#modal-h4-title").text("create new order detail");
        // ấn các trường thông tin không cần thiết khi tạo orderdetail
        $(".create-only").show();
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update orderdetail
        $("#modal-orderdetail-btn-create").show();
        $("#modal-orderdetail-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật orderdetail
        $("#modal-h4-title").text("update order detail");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin orderdetail 
        $(".update-only").show();
        $(".create-only").hide();
        // hiện nút Update và ẩn nút Create orderdetail
        $("#modal-orderdetail-btn-update").show();
        $("#modal-orderdetail-btn-create").hide();
    }
    $("#modal-orderdetail").modal();
}

// lấy dữ liệu thông tin orderdetail được tạo
function getOrderdetailInfoObj(paramOrderdetailObj) {
    // chuẩn hoá chuỗi
    $("#modal-orderdetail-inp-quantity-order").val($("#modal-orderdetail-inp-quantity-order").val().trim());
    $("#modal-orderdetail-inp-price-each").val($("#modal-orderdetail-inp-price-each").val().trim());
    // lưu thông tin 
    paramOrderdetailObj.quantityOrder = $("#modal-orderdetail-inp-quantity-order").val();
    paramOrderdetailObj.priceEach = $("#modal-orderdetail-inp-price-each").val();
    paramOrderdetailObj.orderId = $("#modal-orderdetail-select-order-id").val();
    if ($("#modal-orderdetail-select-order-id").val() == gNONE_SELECTED) {
        paramOrderdetailObj.orderId = gNONE_SELECTED;
    }
    paramOrderdetailObj.productId = $("#modal-orderdetail-select-product-id").val();
    if ($("#modal-orderdetail-select-product-id").val() == gNONE_SELECTED) {
        paramOrderdetailObj.productId = gNONE_SELECTED;
    }
}

// validate thông tin orderdetail được tạo
function validateOrderdetailInfo(paramOrderdetailObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (gFormMode == gFORM_MODE_INSERT && paramOrderdetailObj.orderId == gNONE_SELECTED) {
        vModalPWarningSelector.text("Order must be selected !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-select-order-id");
        return false;
    }
    if (gFormMode == gFORM_MODE_INSERT && paramOrderdetailObj.productId == gNONE_SELECTED) {
        vModalPWarningSelector.text("Product must be selected !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-select-product-id");
        return false;
    }
    if (paramOrderdetailObj.quantityOrder.length == 0) {
        vModalPWarningSelector.text("Quantity Order must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-inp-quantity-order");
        return false;
    }
    if (paramOrderdetailObj.quantityOrder < 0) {
        vModalPWarningSelector.text("Quantity Order invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-inp-quantity-order");
        return false;
    }
    if (paramOrderdetailObj.priceEach.length == 0) {
        vModalPWarningSelector.text("Price Each must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-inp-price-each");
        return false;
    }
    if (paramOrderdetailObj.priceEach < 0) {
        vModalPWarningSelector.text("Price Each invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-orderdetail-inp-price-each");
        return false;
    }
    return true;
}

// gọi API create orderdetail
function callAjaxApiCreateOrderdetail(paramOrderdetailObj) {
    $.ajax({
        url: gBASE_URL + "orderdetails?orderid=" + paramOrderdetailObj.orderId + "&productid=" + paramOrderdetailObj.productId,
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderdetailObj),
        success: function(resOrderdetailObj) {
            console.log(paramOrderdetailObj);
            console.log(resOrderdetailObj);
            $("#modal-p-success").html("Create order detail successfully !!!");
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

// trả về id của đối tượng orderdetail muốn edit
function getOrderdetailObjByRow(paramElement, paramOrderdetailObj) {
    var vOrderdetailRow = $(paramElement).parents("tr");
    var vDataOrderdetailRow = gTableOrderdetail.row(vOrderdetailRow);
    var vOrderdetailObjByDataOrderdetailRow = vDataOrderdetailRow.data();
    console.log(vOrderdetailObjByDataOrderdetailRow);
    paramOrderdetailObj.id = vOrderdetailObjByDataOrderdetailRow.id;
    paramOrderdetailObj.quantityOrder = vOrderdetailObjByDataOrderdetailRow.quantityOrder;
    paramOrderdetailObj.priceEach = vOrderdetailObjByDataOrderdetailRow.priceEach;
    paramOrderdetailObj.ratingAndReview = vOrderdetailObjByDataOrderdetailRow.ratingAndReview;
}

// gọi API lấy thông tin orderdetail theo orderdetail id
function callAjaxApiGetOrderdetailByOrderdetailId(paramOrderdetailObj) {
    $.ajax({
        url: gBASE_URL + "orderdetails/" + paramOrderdetailObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderdetailObj) {
            gOrderdetailObj = resOrderdetailObj;
            console.log(gOrderdetailObj);
            loadOrderdetailObjToModalOrderdetail(gOrderdetailObj);
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

// load thông tin đối tượng orderdetail vào modal orderdetail
function loadOrderdetailObjToModalOrderdetail(paramOrderdetailObj) {
    $("#modal-orderdetail-inp-id").val(paramOrderdetailObj.id);
    $("#modal-orderdetail-inp-quantity-order").val(paramOrderdetailObj.quantityOrder);
    $("#modal-orderdetail-inp-price-each").val(paramOrderdetailObj.priceEach);
    if (paramOrderdetailObj.ratingAndReview) {
        $("#modal-orderdetail-inp-rating").val(paramOrderdetailObj.ratingAndReview.rating);
        $("#modal-orderdetail-textarea-review").val(paramOrderdetailObj.ratingAndReview.review);
    }
}

// gọi API cập nhât thông tin orderdetail
function callAjaxApiUpdateOrderdetail(paramOrderdetailObj) {
    $.ajax({
        url: gBASE_URL + "orderdetails/" + paramOrderdetailObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOrderdetailObj),
        success: function(resOrderdetailObj) {
            console.log(gOrderdetailObj);
            console.log(resOrderdetailObj);
            $("#modal-p-success").html("Update order detail successfully !!!");
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

// gọi API xoá thông tin orderdetail
function callAjaxApiDeleteOrderdetail(paramOrderdetailObj) {
    $.ajax({
        url: gBASE_URL + "orderdetails/" + paramOrderdetailObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderdetailObj) {
            console.log(gOrderdetailObj);
            console.log(resOrderdetailObj);
            $("#modal-p-success").html("Delete order detail successfully !!!");
            $("#modal-success").modal();
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON !== undefined) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
            } else {
                alert(err.responseText + " (" + err.status + ")");
            }
        }
    });
}

// gọi API xoá thông tin Rating & Review
function callAjaxApiDeleteRatingNReviewById(paramOrderdetailObj) {
    $.ajax({
        url: gBASE_URL + "ratingreview/" + paramOrderdetailObj.ratingAndReview.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOrderdetailObj) {
            console.log(gOrderdetailObj);
            console.log(resOrderdetailObj);
            $("#modal-p-success").html(`Delete
                <span class="font-weight-bold">Rating & Review</span> of order detail with ID: 
                <span class="font-weight-bold">` +
                gOrderdetailObj.id +
                `</span>` + ` successfully !!!`);
            $("#modal-success").modal();
        },
        error: function(err) {
            console.log(err);
            if (err.responseJSON !== undefined) {
                alert(err.responseJSON.errors + " (" + err.status + ")");
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
    gOrderdetailObj = {
        id: -1,
        quantityOrder: -1,
        priceEach: -1,
        orderId: -1,
        productId: -1,
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-orderdetail input,textarea,select").val("");
    console.log(gOrderdetailObj);
}