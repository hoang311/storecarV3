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

// Mảng chứa dữ liệu office
var gOfficesDb = {
    offices: [],
    findOfficeObjByEmail: function(paramEmail) {
        var vFoundOfficeObj = {};
        var vFoundOfficeStatus = false;
        for (let bIndex = 0; !vFoundOfficeStatus && bIndex < this.offices.length; bIndex++) {
            const element = this.offices[bIndex];
            if (paramEmail == element.email) {
                vFoundOfficeObj = JSON.parse(JSON.stringify(element));
                vFoundOfficeStatus = true;
            }
        }
        return vFoundOfficeObj;
    }
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng office
var gOfficeObj = {
    id: -1,
    city: "",
    phone: "",
    addressLine: "",
    state: "",
    country: "",
    territory: ""
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
    "city",
    "phone",
    "addressLine",
    "action"
];
const gID_OFFICE_COL = 0;
const gCITY_COL = 1;
const gPHONE_COL = 2;
const gADDRESS_LINE_COL = 3;
const gACTION_COL = 4;

// khởi tạo DataTable
var gTableOffice = $("#table-office").DataTable({
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
            data: gDATA_COL[gID_OFFICE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gCITY_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPHONE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gADDRESS_LINE_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-office" data-toggle="tooltip" title="Edit office"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-office" data-toggle="tooltip" title="Delete office"></i>
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
// thực thi sự kiện khi ấn nút Create office
$("#btn-create-office").on({
    click: function() {
        onBtnCreateOfficeClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create office
$("#modal-office-btn-create").on({
    click: function() {
        onModalOfficeBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin office
$("#table-office").on({
    click: function() {
        onIconEditOfficeClick(this);
    }
}, ".icon-edit-office");

// thực thi sự kiện khi ấn nút Update thông tin office trên modal
$("#modal-office-btn-update").on({
    click: function() {
        onModalOfficeBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin office
$("#table-office").on({
    click: function() {
        onIconDeleteOfficeClick(this);
    }
}, ".icon-delete-office");

// thực thi sự kiện khi ấn nút Confirm Delete office trên modal
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

// thực thi sự kiện khi đóng modal office
$("#modal-office").on({
    "hidden.bs.modal": function() {
        onModalOfficeClose();
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
    callAjaxApiGetAllOffices();
}

// xử lý sự kiện khi ấn nút Create office
function onBtnCreateOfficeClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    loadModalOffice();
}

// xử lý sự kiện khi ấn nút Create office trên modal
function onModalOfficeBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOfficeObj);
    getOfficeInfoObj(gOfficeObj);
    console.log(gOfficeObj);
    // B2: validate
    var vValidateStatus = validateOfficeInfo(gOfficeObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateOffice(gOfficeObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin office
function onIconEditOfficeClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOfficeObj);
    getOfficeObjByRow(paramIconEdit, gOfficeObj);
    console.log(gOfficeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalOffice();
    callAjaxApiGetOfficeByOfficeId(gOfficeObj);
}

// xử lý sự kiện khi ấn nút Update thông tin office trên modal
function onModalOfficeBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getOfficeInfoObj(gOfficeObj);
    console.log(gOfficeObj);
    // B2: validate
    var vValidateStatus = validateOfficeInfo(gOfficeObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateOffice(gOfficeObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá office
function onIconDeleteOfficeClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOfficeObj);
    getOfficeObjByRow(paramIconDelete, gOfficeObj);
    console.log(gOfficeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete office at
        <span class="font-weight-bold">` +
        gOfficeObj.addressLine + ` (` + gOfficeObj.phone + `)
        </span>
        in 
        <span class="font-weight-bold">` +
        gOfficeObj.city +
        `</span>
        with ID: 
        <span class="font-weight-bold">` +
        gOfficeObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete office trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gOfficeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteOffice(gOfficeObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-office").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal office
function onModalOfficeClose() {
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

// gọi API lấy thông tin tất cả office
function callAjaxApiGetAllOffices() {
    $.ajax({
        url: gBASE_URL + "offices",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllOfficesObj) {
            gOfficesDb.offices = resAllOfficesObj;
            loadAllOfficesDataTable(gOfficesDb.offices);
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

// load thông tin tất cả office vào DataTable
function loadAllOfficesDataTable(paramAllOfficesObj) {
    gTableOffice.clear();
    gTableOffice.rows.add(paramAllOfficesObj);
    gTableOffice.draw();
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal office
function loadModalOffice() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới office
        $("#modal-h4-title").text("create new office");
        // ấn các trường thông tin không cần thiết khi tạo office
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update office
        $("#modal-office-btn-create").show();
        $("#modal-office-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật office
        $("#modal-h4-title").text("update office");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin office 
        $(".update-only").show();
        // hiện nút Update và ẩn nút Create office
        $("#modal-office-btn-update").show();
        $("#modal-office-btn-create").hide();
    }
    $("#modal-office").modal();
}

// lấy dữ liệu thông tin office được tạo
function getOfficeInfoObj(paramOfficeObj) {
    // chuẩn hoá
    $("#modal-office-inp-city").val($("#modal-office-inp-city").val().trim());
    $("#modal-office-inp-phone").val($("#modal-office-inp-phone").val().trim());
    $("#modal-office-inp-address-line").val($("#modal-office-inp-address-line").val().trim());
    $("#modal-office-inp-state").val($("#modal-office-inp-state").val().trim());
    $("#modal-office-inp-country").val($("#modal-office-inp-country").val().trim());
    $("#modal-office-inp-territory").val($("#modal-office-inp-territory").val().trim());
    // lưu thông tin 
    paramOfficeObj.city = $("#modal-office-inp-city").val();
    paramOfficeObj.phone = $("#modal-office-inp-phone").val();
    paramOfficeObj.addressLine = $("#modal-office-inp-address-line").val();
    paramOfficeObj.state = $("#modal-office-inp-state").val();
    paramOfficeObj.country = $("#modal-office-inp-country").val();
    paramOfficeObj.territory = $("#modal-office-inp-territory").val();
}

// validate thông tin office được tạo
function validateOfficeInfo(paramOfficeObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramOfficeObj.city.length == 0) {
        vModalPWarningSelector.text("City must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-office-inp-city");
        return false;
    }
    if (paramOfficeObj.phone.length == 0) {
        vModalPWarningSelector.text("Phone must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-office-inp-phone");
        return false;
    }
    if (paramOfficeObj.addressLine.length == 0) {
        vModalPWarningSelector.text("Address Line must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-office-inp-address-line");
        return false;
    }
    if (paramOfficeObj.country.length == 0) {
        vModalPWarningSelector.text("Country must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-office-inp-country");
        return false;
    }
    return true;
}

// gọi API create office
function callAjaxApiCreateOffice(paramOfficeObj) {
    $.ajax({
        url: gBASE_URL + "offices",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOfficeObj),
        success: function(resOfficeObj) {
            console.log(paramOfficeObj);
            console.log(resOfficeObj);
            $("#modal-p-success").html("Create office successfully !!!");
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

// trả về id của đối tượng office muốn edit
function getOfficeObjByRow(paramElement, paramOfficeObj) {
    var vOfficeRow = $(paramElement).parents("tr");
    var vDataOfficeRow = gTableOffice.row(vOfficeRow);
    var vOfficeObjByDataOfficeRow = vDataOfficeRow.data();
    console.log(vOfficeObjByDataOfficeRow);
    paramOfficeObj.id = vOfficeObjByDataOfficeRow.id;
    paramOfficeObj.city = vOfficeObjByDataOfficeRow.city;
    paramOfficeObj.phone = vOfficeObjByDataOfficeRow.phone;
    paramOfficeObj.addressLine = vOfficeObjByDataOfficeRow.addressLine;
    paramOfficeObj.state = vOfficeObjByDataOfficeRow.state;
    paramOfficeObj.country = vOfficeObjByDataOfficeRow.country;
    paramOfficeObj.territory = vOfficeObjByDataOfficeRow.territory;
}

// gọi API lấy thông tin office theo office id
function callAjaxApiGetOfficeByOfficeId(paramOfficeObj) {
    $.ajax({
        url: gBASE_URL + "offices/" + paramOfficeObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOfficeObj) {
            gOfficeObj = resOfficeObj;
            console.log(gOfficeObj);
            loadOfficeObjToModalOffice(gOfficeObj);
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

// load thông tin đối tượng office vào modal office
function loadOfficeObjToModalOffice(paramOfficeObj) {
    $("#modal-office-inp-id").val(paramOfficeObj.id);
    $("#modal-office-inp-city").val(paramOfficeObj.city);
    $("#modal-office-inp-phone").val(paramOfficeObj.phone);
    $("#modal-office-inp-address-line").val(paramOfficeObj.addressLine);
    $("#modal-office-inp-state").val(paramOfficeObj.state);
    $("#modal-office-inp-country").val(paramOfficeObj.country);
    $("#modal-office-inp-territory").val(paramOfficeObj.territory);
}

// gọi API cập nhât thông tin office
function callAjaxApiUpdateOffice(paramOfficeObj) {
    $.ajax({
        url: gBASE_URL + "offices/" + paramOfficeObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramOfficeObj),
        success: function(resOfficeObj) {
            console.log(gOfficeObj);
            console.log(resOfficeObj);
            $("#modal-p-success").html("Update office successfully !!!");
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

// gọi API xoá thông tin office
function callAjaxApiDeleteOffice(paramOfficeObj) {
    $.ajax({
        url: gBASE_URL + "offices/" + paramOfficeObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resOfficeObj) {
            console.log(gOfficeObj);
            console.log(resOfficeObj);
            $("#modal-p-success").html("Delete office successfully !!!");
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
    gOfficeObj = {
        id: -1,
        city: "",
        phone: "",
        addressLine: "",
        state: "",
        country: "",
        territory: ""
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-office input,textarea").val("");
    console.log(gOfficeObj);
}