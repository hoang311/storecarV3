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

// Mảng chứa dữ liệu product
var gProductsDb = {
    products: [],
    findProductObjByProductCode: function(paramProductCode) {
        var vFoundProductObj = {};
        var vFoundProductStatus = false;
        for (let bIndex = 0; !vFoundProductStatus && bIndex < this.products.length; bIndex++) {
            const element = this.products[bIndex];
            if (paramProductCode == element.productCode) {
                vFoundProductObj = JSON.parse(JSON.stringify(element));
                vFoundProductStatus = true;
            }
        }
        return vFoundProductObj;
    }
};

// Mảng chứa dữ liệu productline
var gProductlinesDb = {
    productlines: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng product
var gProductObj = {
    id: -1,
    productCode: "",
    productName: "",
    productDescription: "",
    productScale: "",
    productVendor: "",
    quantityInStock: -1,
    buyPrice: -1,
    orderDetails: [],
    productlineId: -1
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
    "productCode",
    "productName",
    "quantityInStock",
    "buyPrice",
    "action"
];
const gID_PRODUCT_COL = 0;
const gPRODUCT_CODE_COL = 1;
const gPRODUCT_NAME_COL = 2;
const gQUANTITY_IN_STOCK_COL = 3;
const gBUY_PRICE_COL = 4;
const gACTION_COL = 5;

// khởi tạo DataTable
var gTableProduct = $("#table-product").DataTable({
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
            data: gDATA_COL[gID_PRODUCT_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPRODUCT_CODE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPRODUCT_NAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gQUANTITY_IN_STOCK_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gBUY_PRICE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-product" data-toggle="tooltip" title="Edit product"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-product" data-toggle="tooltip" title="Delete product"></i>
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
// thực thi sự kiện khi ấn nút Create product
$("#btn-create-product").on({
    click: function() {
        onBtnCreateProductClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create product
$("#modal-product-btn-create").on({
    click: function() {
        onModalProductBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin product
$("#table-product").on({
    click: function() {
        onIconEditProductClick(this);
    }
}, ".icon-edit-product");

// thực thi sự kiện khi ấn nút Update thông tin product trên modal
$("#modal-product-btn-update").on({
    click: function() {
        onModalProductBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin product
$("#table-product").on({
    click: function() {
        onIconDeleteProductClick(this);
    }
}, ".icon-delete-product");

// thực thi sự kiện khi ấn nút Confirm Delete product trên modal
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

// thực thi sự kiện khi đóng modal product
$("#modal-product").on({
    "hidden.bs.modal": function() {
        onModalProductClose();
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
    callAjaxApiGetAllProducts();
}

// xử lý sự kiện khi ấn nút Create product
function onBtnCreateProductClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: gọi server
    callAjaxApiGetAllProductlines();
    // B4: xử lý hiển thị
    loadModalProduct();
}

// xử lý sự kiện khi ấn nút Create product trên modal
function onModalProductBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductObj);
    getProductInfoObj(gProductObj);
    console.log(gProductObj);
    // B2: validate
    var vValidateStatus = validateProductInfo(gProductObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateProduct(gProductObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin product
function onIconEditProductClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductObj);
    getProductObjByRow(paramIconEdit, gProductObj);
    console.log(gProductObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalProduct();
    callAjaxApiGetProductByProductId(gProductObj);
}

// xử lý sự kiện khi ấn nút Update thông tin product trên modal
function onModalProductBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getProductInfoObj(gProductObj);
    console.log(gProductObj);
    // B2: validate
    var vValidateStatus = validateProductInfo(gProductObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateProduct(gProductObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá product
function onIconDeleteProductClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductObj);
    getProductObjByRow(paramIconDelete, gProductObj);
    console.log(gProductObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete product 
        <span class="font-weight-bold">` +
        gProductObj.productName + ` (` + gProductObj.productCode + `)
        </span>
        with ID: 
        <span class="font-weight-bold">` +
        gProductObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete product trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gProductObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteProduct(gProductObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-product").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal product
function onModalProductClose() {
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
            loadAllProductsDataTable(gProductsDb.products);
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

// load thông tin tất cả product vào DataTable
function loadAllProductsDataTable(paramAllProductsObj) {
    gTableProduct.clear();
    gTableProduct.rows.add(paramAllProductsObj);
    gTableProduct.draw();
}

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
            loadAllProductlinesObjToModalProduct(gProductlinesDb.productlines);
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

// load thông tin tất cả productline vào modal select product
function loadAllProductlinesObjToModalProduct(paramAllProductlinesObj) {
    var vModalProductSelectProductlineId = $("#modal-product-select-productline-id");
    vModalProductSelectProductlineId
        .empty()
        .append($("<option/>", {
            value: gNONE_SELECTED,
            text: "--- Select product line ---"
        }));
    for (let bIndex = 0; bIndex < paramAllProductlinesObj.length; bIndex++) {
        const element = paramAllProductlinesObj[bIndex];
        $("<option/>", {
            value: element.id,
            text: element.productLine + ` (ID: ` + element.id + `)`
        }).appendTo(vModalProductSelectProductlineId);
    }
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal product
function loadModalProduct() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới product
        $("#modal-h4-title").text("create new product");
        // ấn các trường thông tin không cần thiết khi tạo product
        $(".create-only").show();
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update product
        $("#modal-product-btn-create").show();
        $("#modal-product-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật product
        $("#modal-h4-title").text("update product");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin product 
        $(".update-only").show();
        $(".create-only").hide();
        // hiện nút Update và ẩn nút Create product
        $("#modal-product-btn-update").show();
        $("#modal-product-btn-create").hide();
    }
    $("#modal-product").modal();
}

// lấy dữ liệu thông tin product được tạo
function getProductInfoObj(paramProductObj) {
    // chuẩn hoá chuỗi
    $("#modal-product-inp-product-code").val($("#modal-product-inp-product-code").val().trim());
    $("#modal-product-inp-product-name").val($("#modal-product-inp-product-name").val().trim());
    $("#modal-product-textarea-product-description").val($("#modal-product-textarea-product-description").val().trim());
    $("#modal-product-inp-product-scale").val($("#modal-product-inp-product-scale").val().trim());
    $("#modal-product-inp-product-vendor").val($("#modal-product-inp-product-vendor").val().trim());
    $("#modal-product-inp-quantity-in-stock").val($("#modal-product-inp-quantity-in-stock").val().trim());
    $("#modal-product-inp-buy-price").val($("#modal-product-inp-buy-price").val().trim());
    // lưu thông tin 
    paramProductObj.productCode = $("#modal-product-inp-product-code").val();
    paramProductObj.productName = $("#modal-product-inp-product-name").val();
    paramProductObj.productDescription = $("#modal-product-textarea-product-description").val();
    paramProductObj.productScale = $("#modal-product-inp-product-scale").val();
    paramProductObj.productVendor = $("#modal-product-inp-product-vendor").val();
    paramProductObj.quantityInStock = $("#modal-product-inp-quantity-in-stock").val();
    paramProductObj.buyPrice = $("#modal-product-inp-buy-price").val();
    paramProductObj.productlineId = $("#modal-product-select-productline-id").val();
    if ($("#modal-product-select-productline-id").val() == gNONE_SELECTED) {
        paramProductObj.productlineId = gNONE_SELECTED;
    }
}

// validate thông tin product được tạo
function validateProductInfo(paramProductObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramProductObj.productCode.length == 0) {
        vModalPWarningSelector.text("Product Code must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-product-code");
        return false;
    }
    if (validateExistedProduct(paramProductObj)) {
        vModalPWarningSelector.text("Product Code existed !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-product-code");
        return false;
    }
    if (paramProductObj.productName.length == 0) {
        vModalPWarningSelector.text("Product Name must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-product-name");
        return false;
    }
    if (paramProductObj.productScale.length == 0) {
        vModalPWarningSelector.text("Product Scale must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-product-scale");
        return false;
    }
    if (paramProductObj.productVendor.length == 0) {
        vModalPWarningSelector.text("Product Vendor must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-product-vendor");
        return false;
    }
    if (paramProductObj.quantityInStock.length == 0) {
        vModalPWarningSelector.text("Quantity In Stock must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-quantity-in-stock");
        return false;
    }
    if (paramProductObj.quantityInStock < 0) {
        vModalPWarningSelector.text("Quantity In Stock invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-quantity-in-stock");
        return false;
    }
    if (paramProductObj.buyPrice.length == 0) {
        vModalPWarningSelector.text("Buy Price must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-buy-price");
        return false;
    }
    if (paramProductObj.buyPrice < 0) {
        vModalPWarningSelector.text("Buy Price invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-product-inp-buy-price");
        return false;
    }
    return true;
}

// validate product đã tồn tại
function validateExistedProduct(paramProductObj) {
    if (jQuery.isEmptyObject(gProductsDb.findProductObjByProductCode(paramProductObj.productCode))) {
        return false;
    }
    if (gFormMode == gFORM_MODE_UPDATE && paramProductObj.id == gProductsDb.findProductObjByProductCode(paramProductObj.productCode).id) {
        return false;
    }
    return true;
}

// gọi API create product
function callAjaxApiCreateProduct(paramProductObj) {
    var vBaseUrl = gBASE_URL + "productlines/" + paramProductObj.productlineId + "/products";
    if (paramProductObj.productlineId == gNONE_SELECTED) {
        vBaseUrl = gBASE_URL + "productlines/products";
    }
    $.ajax({
        url: vBaseUrl,
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramProductObj),
        success: function(resProductObj) {
            console.log(paramProductObj);
            console.log(resProductObj);
            $("#modal-p-success").html("Create product successfully !!!");
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

// trả về id của đối tượng product muốn edit
function getProductObjByRow(paramElement, paramProductObj) {
    var vProductRow = $(paramElement).parents("tr");
    var vDataProductRow = gTableProduct.row(vProductRow);
    var vProductObjByDataProductRow = vDataProductRow.data();
    console.log(vProductObjByDataProductRow);
    paramProductObj.id = vProductObjByDataProductRow.id;
    paramProductObj.productCode = vProductObjByDataProductRow.productCode;
    paramProductObj.productName = vProductObjByDataProductRow.productName;
    paramProductObj.productDescription = vProductObjByDataProductRow.productDescription;
    paramProductObj.productScale = vProductObjByDataProductRow.productScale;
    paramProductObj.productVendor = vProductObjByDataProductRow.productVendor;
    paramProductObj.quantityInStock = vProductObjByDataProductRow.quantityInStock;
    paramProductObj.buyPrice = vProductObjByDataProductRow.buyPrice;
    paramProductObj.orderDetails = vProductObjByDataProductRow.orderDetails;
}

// gọi API lấy thông tin product theo product id
function callAjaxApiGetProductByProductId(paramProductObj) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramProductObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resProductObj) {
            gProductObj = resProductObj;
            console.log(gProductObj);
            loadProductObjToModalProduct(gProductObj);
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

// load thông tin đối tượng product vào modal product
function loadProductObjToModalProduct(paramProductObj) {
    $("#modal-product-inp-id").val(paramProductObj.id);
    $("#modal-product-inp-product-code").val(paramProductObj.productCode);
    $("#modal-product-inp-product-name").val(paramProductObj.productName);
    $("#modal-product-textarea-product-description").val(paramProductObj.productDescription);
    $("#modal-product-inp-product-scale").val(paramProductObj.productScale);
    $("#modal-product-inp-product-vendor").val(paramProductObj.productVendor);
    $("#modal-product-inp-quantity-in-stock").val(paramProductObj.quantityInStock);
    $("#modal-product-inp-buy-price").val(paramProductObj.buyPrice);
}

// gọi API cập nhât thông tin product
function callAjaxApiUpdateProduct(paramProductObj) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramProductObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramProductObj),
        success: function(resProductObj) {
            console.log(gProductObj);
            console.log(resProductObj);
            $("#modal-p-success").html("Update product successfully !!!");
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

// gọi API xoá thông tin product
function callAjaxApiDeleteProduct(paramProductObj) {
    $.ajax({
        url: gBASE_URL + "productlines/products/" + paramProductObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resProductObj) {
            console.log(gProductObj);
            console.log(resProductObj);
            $("#modal-p-success").html("Delete product successfully !!!");
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
    gProductObj = {
        id: -1,
        productCode: "",
        productName: "",
        productDescription: "",
        productScale: "",
        productVendor: "",
        quantityInStock: -1,
        buyPrice: -1,
        orderDetails: [],
        productlineId: -1
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-product input,textarea,select").val("");
    console.log(gProductObj);
}