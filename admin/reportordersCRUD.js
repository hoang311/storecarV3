"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// URL get API
const gBASE_URL = "https://back-end-one.herokuapp.com/";

// Biến hằng lưu tên token
const gTOKEN_NAME = "token";

// Biến lưu giá trị token
var gTokenValue = "";

const gDURATION_ARRAY = [
    "day",
    "week",
    "month"
];
const gDAY = 0;
const gWEEK = 1;
const gMONTH = 2;

// Mảng chứa dữ liệu customer
var gReportOrdersDb = {
    reportOrders: []
};

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
$(document).ready(function() {
    //Date range picker
    $('#inp-date-range').daterangepicker({
        locale: {
            format: 'DD/MM/YYYY'
        }
    });
});
// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// xử lý sự kiện khi ấn nút xác nhận ngày xem báo cáo
$('body').on({
    click: function() {
        onBtnApplyDateRangeClick();
    }
}, ".daterangepicker .applyBtn");

// xử lý sự kiện khi ấn nút xác nhận ngày xem báo cáo
$('#btn-download').on({
    click: function() {
        onBtnDownloadClick();
    }
});

// 2 - C: Create

// 3 - U: Update

// 4 - D: Delete

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện khi tải trang
function onPageLoading() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gTokenValue = getCookieValue(gTOKEN_NAME);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    callAjaxApiGetUserFromToken();
}

// hàm xử lý sự kiện khi xác nhận ngày xem báo cáo doanh thu
function onBtnApplyDateRangeClick() {
    // B0: tạo đối tượng chứa dữ liệu
    let vTimeDurationObj = {
        duration: "",
        startdate: "",
        enddate: ""
    };
    // B1: thu thập dữ liệu
    getTimeDurationObj(vTimeDurationObj);
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    callAjaxApiGetReportOrders(vTimeDurationObj);
}

// hàm xử lý sự kiện khi ấn nút tải file excel
function onBtnDownloadClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    location.href = gBASE_URL + "orders/report/exportexcel";
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

// gọi API lấy báo cáo order
function callAjaxApiGetUserFromToken() {
    $.ajax({
        url: gBASE_URL + "users/getfromtoken",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(res) {
            console.log(res);
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

// lấy thông tin thời gian report
function getTimeDurationObj(paramTimeDurationObj) {
    let vSelectDateRange = $("#inp-date-range").val();
    let vStartDateString = vSelectDateRange.split("-")[0].trim();
    let vEndDateString = vSelectDateRange.split("-")[1].trim();
    paramTimeDurationObj.startdate = formatDate(vStartDateString);
    paramTimeDurationObj.enddate = formatDate(vEndDateString);
    paramTimeDurationObj.duration = $("#form-report input[type='radio']:checked").val();;
}

// định dạng lại ngày để gửi lên lên server
function formatDate(paramDate) {
    let vDateStringArray = paramDate.split("/");
    let vDateTimestamp = new Date(vDateStringArray[2], vDateStringArray[1] - 1, vDateStringArray[0]);
    console.log(vDateTimestamp.getTime());

    let vYear = vDateTimestamp.getFullYear();
    let vMonth = "0" + (vDateTimestamp.getMonth() + 1);
    let vDate = "0" + vDateTimestamp.getDate();
    let vFormattedDate = vYear + '/' + vMonth.substr(-2) + '/' + vDate.substr(-2);
    console.log(vFormattedDate);

    return vFormattedDate;
}

// gọi API lấy báo cáo order
function callAjaxApiGetReportOrders(paramTimeDurationObj) {
    $.ajax({
        url: gBASE_URL + "orders/report",
        type: "POST",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(paramTimeDurationObj),
        success: function(resReportOrders) {
            gReportOrdersDb.reportOrders = resReportOrders;
            var vDateRangeString = gReportOrdersDb.reportOrders[0].orderDate + " - " + gReportOrdersDb.reportOrders[resReportOrders.length - 1].orderDate;
            $("#inp-date-range").val(vDateRangeString);
            loadLineChart(gReportOrdersDb.reportOrders);
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

// load báo cáo order lên LINE CHART 
function loadLineChart(paramReportOrders) {
    var vDateReport = [];
    var vRevenueReport = [];
    for (let bIndex = 0; bIndex < paramReportOrders.length; bIndex++) {
        const bREPORT_ORDER_BY_DATE = paramReportOrders[bIndex];
        vDateReport.push(bREPORT_ORDER_BY_DATE.orderDate);
        vRevenueReport.push(bREPORT_ORDER_BY_DATE.totalRevenue);
    }

    var areaChartData = {
        labels: vDateReport,
        datasets: [{
            label: 'Revenue ($)',
            backgroundColor: 'rgba(60,141,188,0.9)',
            borderColor: 'rgba(60,141,188,0.8)',
            pointRadius: false,
            pointColor: '#3b8bba',
            pointStrokeColor: 'rgba(60,141,188,1)',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(60,141,188,1)',
            data: vRevenueReport
        }]
    };

    var areaChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
            display: true
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: true,
                }
            }],
            yAxes: [{
                gridLines: {
                    display: true,
                }
            }]
        }
    };

    $("#chart-axes").html(`
        yAxes: $ - xAxes: Date (dd/MM/yyyy)
    `);

    $('#line-chart-parent').html(`
        <canvas id="lineChart" style="height: 450px; max-width: 100%;"></canvas>
    `)
    var lineChartCanvas = $('#lineChart').get(0).getContext('2d');
    var lineChartOptions = $.extend(true, {}, areaChartOptions);
    var lineChartData = $.extend(true, {}, areaChartData);
    lineChartData.datasets[0].fill = false;
    lineChartOptions.datasetFill = false;

    new Chart(lineChartCanvas, {
        type: 'line',
        data: lineChartData,
        options: lineChartOptions
    });
}