"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-two.herokuapp.com/";

// Biến hằng lưu giá trị các trường chưa được chọn
const gNONE_SELECTED = "";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

// Mảng chứa dữ liệu user
var gUsersDb = {
    users: []
};

// Biến lưu trường thông tin cần focus nếu validate chưa chính xác
var gFocusField = "";

// Biến lưu thông tin đối tượng user
var gUserObj = {
    id: -1,
    username: "",
    password: "",
    roles: []
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
    "username",
    "password",
    "action"
];
const gID_USER_COL = 0;
const gUSERNAME_COL = 1;
const gPASSWORD_COL = 2;
const gACTION_COL = 3;

// khởi tạo DataTable
var gTableUser = $("#table-user").DataTable({
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
            data: gDATA_COL[gID_USER_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gUSERNAME_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gPASSWORD_COL],
            className: "text-center"
        },
        {
            data: gDATA_COL[gACTION_COL],
            className: "text-center",
            defaultContent: `
            <i class="far fa-edit fa-lg text-primary cursor-pointer icon-edit-user" data-toggle="tooltip" title="Edit user"></i>
            <i class="far fa-trash-alt fa-lg text-danger cursor-pointer icon-delete-user" data-toggle="tooltip" title="Delete user"></i>
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
// thực thi sự kiện khi ấn nút Create user
$("#btn-create-user").on({
    click: function() {
        onBtnCreateUserClick();
    }
});

// thực thi sự kiện khi ấn nút Create trên modal Create user
$("#modal-user-btn-create").on({
    click: function() {
        onModalUserBtnCreateClick();
    }
});

// 3 - U: Update
// thực thi sự kiện khi ấn icon Sửa thông tin user
$("#table-user").on({
    click: function() {
        onIconEditUserClick(this);
    }
}, ".icon-edit-user");

// thực thi sự kiện khi ấn nút Update thông tin user trên modal
$("#modal-user-btn-update").on({
    click: function() {
        onModalUserBtnUpdateClick();
    }
});

// 4 - D: Delete
// thực thi sự kiện khi ấn icon Sửa thông tin user
$("#table-user").on({
    click: function() {
        onIconDeleteUserClick(this);
    }
}, ".icon-delete-user");

// thực thi sự kiện khi ấn nút Confirm Delete user trên modal
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

// thực thi sự kiện khi đóng modal user
$("#modal-user").on({
    "hidden.bs.modal": function() {
        onModalUserClose();
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
    callAjaxApiGetAllUsers();
}

// xử lý sự kiện khi ấn nút Create user
function onBtnCreateUserClick() {
    gFormMode = gFORM_MODE_INSERT;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    callAjaxApiGetAllRoles();
}

// xử lý sự kiện khi ấn nút Create user trên modal
function onModalUserBtnCreateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gUserObj);
    getUserInfoObj(gUserObj);
    console.log(gUserObj);
    // B2: validate
    var vValidateStatus = validateUserInfo(gUserObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiCreateUser(gUserObj);
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

// xử lý sự kiện khi ấn icon Sửa thông tin user
function onIconEditUserClick(paramIconEdit) {
    gFormMode = gFORM_MODE_UPDATE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gUserObj);
    getUserObjByRow(paramIconEdit, gUserObj);
    console.log(gUserObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiGetAllRoles();
}

// xử lý sự kiện khi ấn nút Update thông tin user trên modal
function onModalUserBtnUpdateClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    getUserInfoObj(gUserObj);
    console.log(gUserObj);
    // B2: validate
    var vValidateStatus = validateUserInfo(gUserObj);
    // B3: gọi server và xử lý hiển thị
    if (vValidateStatus) {
        callAjaxApiUpdateUser(gUserObj);
    }
}

// xử lý sự kiện khi ấn icon Xoá user
function onIconDeleteUserClick(paramIconDelete) {
    gFormMode = gFORM_MODE_DELETE;
    $("#form-mode").text(gFormMode);
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gUserObj);
    getUserObjByRow(paramIconDelete, gUserObj);
    console.log(gUserObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    $("#modal-p-delete").html(`
        Confirm delete username
        <span class="font-weight-bold">` +
        gUserObj.username +
        `</span>
        with ID: <span class="font-weight-bold">` +
        gUserObj.id +
        `</span> !!!`);
    $("#modal-danger").modal();
}

// xử lý sự kiện khi ấn nút Confirm Delete user trên modal
function onModalBtnConfirmDeleteClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    console.log(gUserObj);
    // B2: validate
    // B3: gọi server và xử lý hiển thị
    callAjaxApiDeleteUser(gUserObj);
}

// xử lý sự kiện khi đóng modal success
function onModalSuccessClose() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3: xử lý hiển thị
    onPageLoading();
    $("#modal-user").modal("hide");
    $("#modal-danger").modal("hide");
}

// xử lý sự kiện khi đóng modal user
function onModalUserClose() {
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

// gọi API lấy thông tin tất cả user
function callAjaxApiGetAllUsers() {
    $.ajax({
        url: gBASE_URL + "users",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resAllUsersObj) {
            gUsersDb.users = resAllUsersObj;
            loadAllUsersDataTable(gUsersDb.users);
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

// load thông tin tất cả user vào DataTable
function loadAllUsersDataTable(paramAllUsersObj) {
    gTableUser.clear();
    gTableUser.rows.add(paramAllUsersObj);
    gTableUser.draw();
}

function callAjaxApiGetAllRoles() {
    $.ajax({
        url: gBASE_URL + "roles",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resRoleArray) {
            console.log(resRoleArray);
            loadModalUser(resRoleArray);
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

// load dữ liệu lựa chọn sẵn vào các trường trên modal user
function loadModalUser(paramRoleArray) {
    let vModalUserRole = $("#modal-user-role").empty();
    for (let bIndex = 0; bIndex < paramRoleArray.length; bIndex++) {
        const bRoleElement = paramRoleArray[bIndex];
        vModalUserRole.append(`
            <div class="custom-control custom-switch">
                <input type="checkbox" name="role" class="custom-control-input" id="role-` + bRoleElement.id + `" data-role-id="` + bRoleElement.id + `" value="` + bRoleElement.roleKey + `">
                <label for="role-` + bRoleElement.id + `" class="font-weight-normal custom-control-label">` + bRoleElement.roleName + `
                </label>
            </div>
        `);
    }
    if (gFormMode == gFORM_MODE_INSERT) {
        // tên title modal khi thêm mới user
        $("#modal-h4-title").text("create new user");
        // ấn các trường thông tin không cần thiết khi tạo user
        $(".update-only").hide();
        // hiện nút Create và ẩn nút Update user
        $("#modal-user-btn-create").show();
        $("#modal-user-btn-update").hide();
    }
    if (gFormMode == gFORM_MODE_UPDATE) {
        // tên title modal khi cập nhật user
        $("#modal-h4-title").text("update user");
        // hiện đầy đủ các trường thông tin khi cập nhật thông tin user 
        $(".update-only").show();
        callAjaxApiGetUserByUserId(gUserObj);
        // hiện nút Update và ẩn nút Create user
        $("#modal-user-btn-update").show();
        $("#modal-user-btn-create").hide();
    }
    $("#modal-user").modal();
}

// lấy dữ liệu thông tin user được tạo
function getUserInfoObj(paramUserObj) {
    // chuẩn hoá
    $("#modal-user-inp-username").val($("#modal-user-inp-username").val().trim());
    $("#modal-user-inp-password").val($("#modal-user-inp-password").val().trim());
    // lưu thông tin 
    paramUserObj.username = $("#modal-user-inp-username").val();
    paramUserObj.password = $("#modal-user-inp-password").val();
    paramUserObj.roles = [];
    $("input:checkbox[name=role]:checked").each(function() {
        paramUserObj.roles.push({
            id: $(this).attr("data-role-id")
        });
    });
}

// validate thông tin user được tạo
function validateUserInfo(paramUserObj) {
    var vModalPWarningSelector = $("#modal-p-warning");
    var vModalWarningSelector = $("#modal-warning");
    if (paramUserObj.username.length == 0) {
        vModalPWarningSelector.text("Username must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-user-inp-last-name");
        return false;
    }
    if (paramUserObj.password.length == 0) {
        vModalPWarningSelector.text("Password must be filled !!!");
        vModalWarningSelector.modal();
        gFocusField = $("#modal-user-inp-first-name");
        return false;
    }
    return true;
}

// gọi API create user
function callAjaxApiCreateUser(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resUserObj) {
            console.log(resUserObj);
            $("#modal-p-success").html("Create user successfully !!!");
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

// trả về id của đối tượng user muốn edit
function getUserObjByRow(paramElement, paramUserObj) {
    var vUserRow = $(paramElement).parents("tr");
    var vDataUserRow = gTableUser.row(vUserRow);
    var vUserObjByDataUserRow = vDataUserRow.data();
    console.log(vUserObjByDataUserRow);
    paramUserObj.id = vUserObjByDataUserRow.id;
    paramUserObj.username = vUserObjByDataUserRow.username;
    paramUserObj.password = vUserObjByDataUserRow.password;
    paramUserObj.createdBy = vUserObjByDataUserRow.createdBy;
    paramUserObj.updatedBy = vUserObjByDataUserRow.updatedBy;
    paramUserObj.createdAt = vUserObjByDataUserRow.createdAt;
    paramUserObj.updatedAt = vUserObjByDataUserRow.updatedAt;
    paramUserObj.roles = vUserObjByDataUserRow.roles;
}

// gọi API lấy thông tin user theo user id
function callAjaxApiGetUserByUserId(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/" + paramUserObj.id,
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resUserObj) {
            gUserObj = resUserObj;
            console.log(gUserObj);
            loadUserObjToModalUser(gUserObj);
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

// load thông tin đối tượng user vào modal user
function loadUserObjToModalUser(paramUserObj) {
    $("#modal-user-inp-id").val(paramUserObj.id);
    $("#modal-user-inp-username").val(paramUserObj.username);
    $("#modal-user-inp-password").val(paramUserObj.password);
    for (let bIndex = 0; bIndex < paramUserObj.roles.length; bIndex++) {
        const bRoleElement = paramUserObj.roles[bIndex];
        $("input:checkbox[value=" + bRoleElement.roleKey + "]").prop('checked', true);
    }
    $("#modal-user-inp-created-by").val(paramUserObj.createdBy);
    $("#modal-user-inp-updated-by").val(paramUserObj.updatedBy);
    $("#modal-user-inp-created-at").val(paramUserObj.createdAt);
    $("#modal-user-inp-updated-at").val(paramUserObj.updatedAt);
    $("#modal-user-inp-deleted").val(paramUserObj.deleted);
}

// gọi API cập nhât thông tin user
function callAjaxApiUpdateUser(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/" + paramUserObj.id,
        type: "PUT",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramUserObj),
        success: function(resUserObj) {
            console.log(gUserObj);
            console.log(resUserObj);
            $("#modal-p-success").html("Update user successfully !!!");
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

// gọi API xoá thông tin user
function callAjaxApiDeleteUser(paramUserObj) {
    $.ajax({
        url: gBASE_URL + "users/" + paramUserObj.id,
        type: "DELETE",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resUserObj) {
            console.log(gUserObj);
            console.log(resUserObj);
            $("#modal-p-success").html("Delete user successfully !!!");
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
    gUserObj = {
        id: -1,
        username: "",
        password: "",
        createdBy: "",
        updatedBy: "",
        createdAt: "",
        updatedAt: "",
        deleted: "",
        roles: "",
        customer: -1,
        employee: -1,
        payments: [],
        orders: [],
    };
    gFormMode = gFORM_MODE_NORMAL;
    $("#form-mode").text(gFormMode);
    $("#modal-user input,textarea").val("");
    console.log(gUserObj);
}