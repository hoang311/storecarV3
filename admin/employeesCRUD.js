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

// Mảng chứa dữ liệu employee
var gEmployeesDb = {
    employees: [],
    findEmployeeObjByEmail: function(paramEmail) {
        var vFoundEmployeeObj = {};
        var vFoundEmployeeStatus = false;
        for (let bIndex = 0; !vFoundEmployeeStatus && bIndex < this.employees.length; bIndex++) {
            const element = this.employees[bIndex];
            if (paramEmail == element.email) {
                vFoundEmployeeObj = JSON.parse(JSON.stringify(element));
                vFoundEmployeeStatus = true;
            }
        }
        return vFoundEmployeeObj;
    }
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng employee
var gEmployeeObj = {
    id: -1,
    lastName: "",
    firstName: "",
    extension: "",
    email: "",
    officeCode: -1,
    reportTo: -1,
    jobTitle: ""
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
    "email",
    "action"
];
const gID_EMPLOYEE_COL = 0;
const gLAST_NAME_COL = 1;
const gFIRST_NAME_COL = 2;
const gEMAIL_COL = 3;
const gACTION_COL = 4;

// khởi tạo DataTable
var gTableEmployee = $("#table-employee").DataTable({
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
            data: gDATA_COL[gID_EMPLOYEE_COL],
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
            data: gDATA_COL[gEMAIL_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-employee" data-toggle="tooltip" title="Edit employee"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-employee" data-toggle="tooltip" title="Delete employee"></i>
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
// thực thi sự kiện khi ấn nút Create employee
$("#btn-create-employee").on({
    click: function() {
        onBtnCreateEmployeeClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create employee
$("#modal-employee-btn-create").on({
    click: function() {
        onModalEmployeeBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin employee
$("#table-employee").on({
    click: function() {
        onIconEditEmployeeClick(this);
    }
}, ".icon-edit-employee");

// thực thi sự kiện khi ấn nút Update thông tin employee trên modal
$("#modal-employee-btn-update").on({
    click: function() {
        onModalEmployeeBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin employee
$("#table-employee").on({
    click: function() {
        onIconDeleteEmployeeClick(this);
    }
}, ".icon-delete-employee");

// thực thi sự kiện khi ấn nút Confirm Delete employee trên modal
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

// thực thi sự kiện khi đóng modal employee
$("#modal-employee").on({
    "hidden.bs.modal": function() {
        onModalEmployeeClose();
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
    callAjaxApiGetAllEmployees();
}

// xử lý sự kiện khi ấn nút Create employee
function onBtnCreateEmployeeClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    loadModalEmployee();
}

// xử lý sự kiện khi ấn nút Create employee trên modal
function onModalEmployeeBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gEmployeeObj);
    getEmployeeInfoObj(gEmployeeObj);
    console.log(gEmployeeObj);
    // B2: validate
    var vValidateStatus = validateEmployeeInfo(gEmployeeObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateEmployee(gEmployeeObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin employee
function onIconEditEmployeeClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gEmployeeObj);
    getEmployeeObjByRow(paramIconEdit, gEmployeeObj);
    console.log(gEmployeeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    loadModalEmployee();
    callAjaxApiGetEmployeeByEmployeeId(gEmployeeObj);
}

// xử lý sự kiện khi ấn nút Update thông tin employee trên modal
function onModalEmployeeBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getEmployeeInfoObj(gEmployeeObj);
    console.log(gEmployeeObj);
    // B2: validate
    var vValidateStatus = validateEmployeeInfo(gEmployeeObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateEmployee(gEmployeeObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá employee
function onIconDeleteEmployeeClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gEmployeeObj);
    getEmployeeObjByRow(paramIconDelete, gEmployeeObj);
    console.log(gEmployeeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete employee
        <span class="font-weight-bold">` +
        gEmployeeObj.firstName + ` ` + gEmployeeObj.lastName +
        `</span>
        with ID: 
        <span class="font-weight-bold">` +
        gEmployeeObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete employee trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gEmployeeObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteEmployee(gEmployeeObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-employee").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal employee
function onModalEmployeeClose() {
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

// gọi API lấy thông tin tất cả employee
function callAjaxApiGetAllEmployees() {
    $.ajax({
        url: gBASE_URL + "employees",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllEmployeesObj) {
            gEmployeesDb.employees = resAllEmployeesObj;
            loadAllEmployeesDataTable(gEmployeesDb.employees);
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

// load thông tin tất cả employee vào DataTable
function loadAllEmployeesDataTable(paramAllEmployeesObj) {
    gTableEmployee.clear();
    gTableEmployee.rows.add(paramAllEmployeesObj);
    gTableEmployee.draw();
}

// load dữ liệu lựa chọn sẵn vào các trường trên modal employee
function loadModalEmployee() {
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới employee
        $("#modal-h4-title").text("create new employee");
        // ấn các trường thông tin không cần thiết khi tạo employee
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update employee
        $("#modal-employee-btn-create").show();
        $("#modal-employee-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật employee
        $("#modal-h4-title").text("update employee");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin employee 
        $(".update-only").show();
        // hiện nút Update và ẩn nút Create employee
        $("#modal-employee-btn-update").show();
        $("#modal-employee-btn-create").hide();
    }
    $("#modal-employee").modal();
}

// lấy dữ liệu thông tin employee được tạo
function getEmployeeInfoObj(paramEmployeeObj) {
    // chuẩn hoá
    $("#modal-employee-inp-last-name").val($("#modal-employee-inp-last-name").val().trim());
    $("#modal-employee-inp-first-name").val($("#modal-employee-inp-first-name").val().trim());
    $("#modal-employee-inp-extension").val($("#modal-employee-inp-extension").val().trim());
    $("#modal-employee-inp-email").val($("#modal-employee-inp-email").val().trim());
    $("#modal-employee-inp-office-code").val($("#modal-employee-inp-office-code").val().trim());
    $("#modal-employee-inp-report-to").val($("#modal-employee-inp-report-to").val().trim());
    $("#modal-employee-inp-job-title").val($("#modal-employee-inp-job-title").val().trim());
    // lưu thông tin 
    paramEmployeeObj.lastName = $("#modal-employee-inp-last-name").val();
    paramEmployeeObj.firstName = $("#modal-employee-inp-first-name").val();
    paramEmployeeObj.extension = $("#modal-employee-inp-extension").val();
    paramEmployeeObj.email = $("#modal-employee-inp-email").val();
    paramEmployeeObj.officeCode = $("#modal-employee-inp-office-code").val();
    paramEmployeeObj.reportTo = $("#modal-employee-inp-report-to").val();
    paramEmployeeObj.jobTitle = $("#modal-employee-inp-job-title").val();
}

// validate thông tin employee được tạo
function validateEmployeeInfo(paramEmployeeObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramEmployeeObj.lastName.length == 0) {
        vModalPWarningSelector.text("Last Name must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-last-name");
        return false;
    }
    if (paramEmployeeObj.firstName.length == 0) {
        vModalPWarningSelector.text("First Name must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-first-name");
        return false;
    }
    if (paramEmployeeObj.extension.length == 0) {
        vModalPWarningSelector.text("Extension must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-extension");
        return false;
    }
    if (paramEmployeeObj.email.length == 0) {
        vModalPWarningSelector.text("Email must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-email");
        return false;
    }
    if (!validateEmail(paramEmployeeObj.email)) {
        vModalPWarningSelector.text("Email invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-email");
        return false;
    }
    if (validateExistedEmail(paramEmployeeObj)) {
        vModalPWarningSelector.text("Email existed !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-email");
        return false;
    }
    if (paramEmployeeObj.officeCode.length == 0) {
        vModalPWarningSelector.text("Office Code must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-office-code");
        return false;
    }
    if (paramEmployeeObj.officeCode < 0) {
        vModalPWarningSelector.text("Office Code invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-office-code");
        return false;
    }
    if (paramEmployeeObj.reportTo.length == 0 && paramEmployeeObj.reportTo < 0) {
        vModalPWarningSelector.text("Report To invalid !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-report-to");
        return false;
    }
    if (paramEmployeeObj.jobTitle.length == 0) {
        vModalPWarningSelector.text("Job Title must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-employee-inp-job-title");
        return false;
    }
    return true;
}

// validate định dạng email
function validateEmail(paramEmail) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(paramEmail).toLowerCase());
}

// validate email đã tồn tại
function validateExistedEmail(paramEmployeeObj) {
    if (jQuery.isEmptyObject(gEmployeesDb.findEmployeeObjByEmail(paramEmployeeObj.email))) {
        return false;
    }
    if (gFormMode == gFORM_MODE_UPDATE && paramEmployeeObj.id == gEmployeesDb.findEmployeeObjByEmail(paramEmployeeObj.email).id) {
        return false;
    }
    return true;
}

// gọi API create employee
function callAjaxApiCreateEmployee(paramEmployeeObj) {
    $.ajax({
        url: gBASE_URL + "employees",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramEmployeeObj),
        success: function(resEmployeeObj) {
            console.log(paramEmployeeObj);
            console.log(resEmployeeObj);
            $("#modal-p-success").html("Create employee successfully !!!");
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

// trả về id của đối tượng employee muốn edit
function getEmployeeObjByRow(paramElement, paramEmployeeObj) {
    var vEmployeeRow = $(paramElement).parents("tr");
    var vDataEmployeeRow = gTableEmployee.row(vEmployeeRow);
    var vEmployeeObjByDataEmployeeRow = vDataEmployeeRow.data();
    console.log(vEmployeeObjByDataEmployeeRow);
    paramEmployeeObj.id = vEmployeeObjByDataEmployeeRow.id;
    paramEmployeeObj.lastName = vEmployeeObjByDataEmployeeRow.lastName;
    paramEmployeeObj.firstName = vEmployeeObjByDataEmployeeRow.firstName;
    paramEmployeeObj.extension = vEmployeeObjByDataEmployeeRow.extension;
    paramEmployeeObj.email = vEmployeeObjByDataEmployeeRow.email;
    paramEmployeeObj.officeCode = vEmployeeObjByDataEmployeeRow.officeCode;
    paramEmployeeObj.reportTo = vEmployeeObjByDataEmployeeRow.reportTo;
    paramEmployeeObj.jobTitle = vEmployeeObjByDataEmployeeRow.jobTitle;
}

// gọi API lấy thông tin employee theo employee id
function callAjaxApiGetEmployeeByEmployeeId(paramEmployeeObj) {
    $.ajax({
        url: gBASE_URL + "employees/" + paramEmployeeObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resEmployeeObj) {
            gEmployeeObj = resEmployeeObj;
            console.log(gEmployeeObj);
            loadEmployeeObjToModalEmployee(gEmployeeObj);
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

// load thông tin đối tượng employee vào modal employee
function loadEmployeeObjToModalEmployee(paramEmployeeObj) {
    $("#modal-employee-inp-id").val(paramEmployeeObj.id);
    $("#modal-employee-inp-last-name").val(paramEmployeeObj.lastName);
    $("#modal-employee-inp-first-name").val(paramEmployeeObj.firstName);
    $("#modal-employee-inp-extension").val(paramEmployeeObj.extension);
    $("#modal-employee-inp-email").val(paramEmployeeObj.email);
    $("#modal-employee-inp-office-code").val(paramEmployeeObj.officeCode);
    $("#modal-employee-inp-report-to").val(paramEmployeeObj.reportTo);
    $("#modal-employee-inp-job-title").val(paramEmployeeObj.jobTitle);
}

// gọi API cập nhât thông tin employee
function callAjaxApiUpdateEmployee(paramEmployeeObj) {
    $.ajax({
        url: gBASE_URL + "employees/" + paramEmployeeObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramEmployeeObj),
        success: function(resEmployeeObj) {
            console.log(gEmployeeObj);
            console.log(resEmployeeObj);
            $("#modal-p-success").html("Update employee successfully !!!");
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

// gọi API xoá thông tin employee
function callAjaxApiDeleteEmployee(paramEmployeeObj) {
    $.ajax({
        url: gBASE_URL + "employees/" + paramEmployeeObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resEmployeeObj) {
            console.log(gEmployeeObj);
            console.log(resEmployeeObj);
            $("#modal-p-success").html("Delete employee successfully !!!");
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
    gEmployeeObj = {
        id: -1,
        lastName: "",
        firstName: "",
        extension: "",
        email: "",
        officeCode: -1,
        reportTo: -1,
        jobTitle: ""
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-employee input,textarea").val("");
    console.log(gEmployeeObj);
}