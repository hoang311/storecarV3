"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.co/";

// Biến hằng lưu giá trị các trường chưa được chọn
const gNONE_SELECTED = "";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Mảng chứa dữ liệu productline
var gProductlinesDb = {
    productlines: [],
    findProductlineObjByProductline: function(paramProductLine) {
        var vFoundProductlineObj = {};
        var vFoundProductlineStatus = false;
        for (let bIndex = 0; !vFoundProductlineStatus && bIndex < this.productlines.length; bIndex++) {
            const element = this.productlines[bIndex];
            if (paramProductLine == element.productLine) {
                vFoundProductlineObj = JSON.parse(JSON.stringify(element));
                vFoundProductlineStatus = true;
            }
        }
        return vFoundProductlineObj;
    }
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng productline
var gProductlineObj = {
    id: -1,
    productLine: "",
    description: "",
    products: []
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
    "productLine",
    "action"
];
const gID_PRODUCT_LINE_COL = 0;
const gPRODUCT_LINE_COL = 1;
const gACTION_COL = 2;

// khởi tạo DataTable
var gTableProductline = $("#table-productline").DataTable({
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
            data: gDATA_COL[gID_PRODUCT_LINE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPRODUCT_LINE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-productline" data-toggle="tooltip" title="Edit product line"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-productline" data-toggle="tooltip" title="Delete product line"></i>
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
// thực thi sự kiện khi ấn nút Create productline
$("#btn-create-productline").on({
    click: function() {
        onBtnCreateProductlineClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create productline
$("#modal-productline-btn-create").on({
    click: function() {
        onModalProductlineBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin productline
$("#table-productline").on({
    click: function() {
        onIconEditProductlineClick(this);
    }
}, ".icon-edit-productline");

// thực thi sự kiện khi ấn nút Update thông tin productline trên modal
$("#modal-productline-btn-update").on({
    click: function() {
        onModalProductlineBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin productline
$("#table-productline").on({
    click: function() {
        onIconDeleteProductlineClick(this);
    }
}, ".icon-delete-productline");

// thực thi sự kiện khi ấn nút Confirm Delete productline trên modal
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

// thực thi sự kiện khi đóng modal productline
$("#modal-productline").on({
    "hidden.bs.modal": function() {
        onModalProductlineClose();
    }
});

// thực thi sự kiện khi đóng modal danger
$("#modal-danger").on({
    "hidden.bs.modal": function() {
        onModalDangerClose();
    }
});

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
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

// xử lý sự kiện khi tải trang
function onPageLoading() {
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiGetAllProductlines();
}

// xử lý sự kiện khi ấn nút Create productline
function onBtnCreateProductlineClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    loadModalProductline();
}

// xử lý sự kiện khi ấn nút Create productline trên modal
function onModalProductlineBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductlineObj);
    getProductlineInfoObj(gProductlineObj);
    console.log(gProductlineObj);
    // B2: validate
    var vValidateStatus = validateProductlineInfo(gProductlineObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateProductline(gProductlineObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin productline
function onIconEditProductlineClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductlineObj);
    getProductlineObjByRow(paramIconEdit, gProductlineObj);
    console.log(gProductlineObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalProductline();
    callAjaxApiGetProductlineByProductlineId(gProductlineObj);
}

// xử lý sự kiện khi ấn nút Update thông tin productline trên modal
function onModalProductlineBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getProductlineInfoObj(gProductlineObj);
    console.log(gProductlineObj);
    // B2: validate
    var vValidateStatus = validateProductlineInfo(gProductlineObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateProductline(gProductlineObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá productline
function onIconDeleteProductlineClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductlineObj);
    getProductlineObjByRow(paramIconDelete, gProductlineObj);
    console.log(gProductlineObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete product line
        <span class="font-weight-bold">` +
        gProductlineObj.productLine +
        `</span>
        with ID: <span class="font-weight-bold">` +
        gProductlineObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete productline trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductlineObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteProductline(gProductlineObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-productline").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal productline
function onModalProductlineClose() {
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
// gọi API lấy thông tin tất cả productline
function callAjaxApiGetAllProductlines() {
    $.ajax({
        url: gBASE_URL + "productlines",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllProductlinesObj) {
            gProductlinesDb.productlines = resAllProductlinesObj;
            loadAllProductlinesDataTable(gProductlinesDb.productlines);
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

// load thông tin tất cả productline vào DataTable
function loadAllProductlinesDataTable(paramAllProductlinesObj) {
    gTableProductline.clear();
    gTableProductline.rows.add(paramAllProductlinesObj);
    gTableProductline.draw();
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal productline
function loadModalProductline() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới productline
        $("#modal-h4-title").text("create new product line");
        // ấn các trường thông tin không cần thiết khi tạo productline
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update productline
        $("#modal-productline-btn-create").show();
        $("#modal-productline-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật productline
        $("#modal-h4-title").text("update product line");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin productline 
        $(".update-only").show();
        // hiện nút Update và ẩn nút Create productline
        $("#modal-productline-btn-update").show();
        $("#modal-productline-btn-create").hide();
    }
    $("#modal-productline").modal();
}

// lấy dữ liệu thông tin productline được tạo
function getProductlineInfoObj(paramProductlineObj) {
    // chuẩn hoá
    $("#modal-productline-inp-productline").val($("#modal-productline-inp-productline").val().trim());
    $("#modal-productline-textarea-description").val($("#modal-productline-textarea-description").val().trim());
    // lưu thông tin 
    paramProductlineObj.productLine = $("#modal-productline-inp-productline").val();
    paramProductlineObj.description = $("#modal-productline-textarea-description").val();
}

// validate thông tin productline được tạo
function validateProductlineInfo(paramProductlineObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramProductlineObj.productLine.length == 0) {
        vModalPWarningSelector.text("Product Line must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-productline-inp-productline");
        return false;
    }
    if (validateExistedProductline(paramProductlineObj)) {
        vModalPWarningSelector.text("Product Line existed !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-productline-inp-productline");
        return false;
    }
    if (paramProductlineObj.description.length == 0) {
        vModalPWarningSelector.text("Description must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-productline-textarea-description");
        return false;
    }
    return true;
}

// validate productline đã tồn tại
function validateExistedProductline(paramProductlineObj) {
    if (jQuery.isEmptyObject(gProductlinesDb.findProductlineObjByProductline(paramProductlineObj.productLine))) {
        return false;
    }
    if (gFormMode == gFORM_MODE_UPDATE && paramProductlineObj.id == gProductlinesDb.findProductlineObjByProductline(paramProductlineObj.productLine).id) {
        return false;
    }
    return true;
}

// gọi API create productline
function callAjaxApiCreateProductline(paramProductlineObj) {
    $.ajax({
        url: gBASE_URL + "productlines",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramProductlineObj),
        success: function(resProductlineObj) {
            console.log(paramProductlineObj);
            console.log(resProductlineObj);
            $("#modal-p-success").html("Create product line successfully !!!");
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

// trả về id của đối tượng productline muốn edit
function getProductlineObjByRow(paramElement, paramProductlineObj) {
    var vProductlineRow = $(paramElement).parents("tr");
    var vDataProductlineRow = gTableProductline.row(vProductlineRow);
    var vProductlineObjByDataProductlineRow = vDataProductlineRow.data();
    console.log(vProductlineObjByDataProductlineRow);
    paramProductlineObj.id = vProductlineObjByDataProductlineRow.id;
    paramProductlineObj.productLine = vProductlineObjByDataProductlineRow.productLine;
    paramProductlineObj.description = vProductlineObjByDataProductlineRow.description;
    paramProductlineObj.products = vProductlineObjByDataProductlineRow.products;
}

// gọi API lấy thông tin productline theo productline id
function callAjaxApiGetProductlineByProductlineId(paramProductlineObj) {
    $.ajax({
        url: gBASE_URL + "productlines/" + paramProductlineObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resProductlineObj) {
            gProductlineObj = resProductlineObj;
            console.log(gProductlineObj);
            loadProductlineObjToModalProductline(gProductlineObj);
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

// load thông tin đối tượng productline vào modal productline
function loadProductlineObjToModalProductline(paramProductlineObj) {
    $("#modal-productline-inp-id").val(paramProductlineObj.id);
    $("#modal-productline-inp-productline").val(paramProductlineObj.productLine);
    $("#modal-productline-textarea-description").val(paramProductlineObj.description);
}

// gọi API cập nhât thông tin productline
function callAjaxApiUpdateProductline(paramProductlineObj) {
    $.ajax({
        url: gBASE_URL + "productlines/" + paramProductlineObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramProductlineObj),
        success: function(resProductlineObj) {
            console.log(gProductlineObj);
            console.log(resProductlineObj);
            $("#modal-p-success").html("Update product line successfully !!!");
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

// gọi API xoá thông tin productline
function callAjaxApiDeleteProductline(paramProductlineObj) {
    $.ajax({
        url: gBASE_URL + "productlines/" + paramProductlineObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resProductlineObj) {
            console.log(gProductlineObj);
            console.log(resProductlineObj);
            $("#modal-p-success").html("Delete product line successfully !!!");
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
    gProductlineObj = {
        id: -1,
        productLine: "",
        description: "",
        products: []
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-productline input,textarea").val("");
    console.log(gProductlineObj);
}