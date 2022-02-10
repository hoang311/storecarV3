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

// Mảng chứa dữ liệu báo cáo về customer
var gReportCustomersDb = {
    reportCustomers: []
};

// Biến chứa thông tin bộ lọc phân loại khách hàng
var gCustomerType = gNONE_SELECTED;

// Biến chứa thông tin bộ lọc theo tổng số order của khách hàng
var gTotalOrder = 0;

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
$(document).ready(function() {
    //Initialize Select2 Elements
    // $('.select2bs4').select2({
    //     theme: 'bootstrap4'
    // })
});
// 1 - R: Read 
// thực thi sự kiện tải trang
onPageLoading();

// xử lý sự kiện khi ấn nút xác nhận ngày xem báo cáo
$('#btn-filter').on({
    click: function() {
        onBtnFilterClick();
    }
});

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
    callAjaxApiGetReportCustomers();
}

// hàm xử lý sự kiện khi xác nhận ngày xem báo cáo doanh thu
function onBtnFilterClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gCustomerType = $("#select-customer-type").val();
    gTotalOrder = parseInt($("#inp-total-order").val());
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    loadBarChart(gReportCustomersDb.reportCustomers);
}

// hàm xử lý sự kiện khi ấn nút tải file excel
function onBtnDownloadClick() {
    // B0: tạo đối tượng chứa dữ liệu
    // B1: thu thập dữ liệu
    gCustomerType = $("#select-customer-type").val();
    gTotalOrder = parseInt($("#inp-total-order").val());
    // B2: validate
    // B3-4: gọi API & xử lý hiển thị
    if (gTotalOrder) {
        location.href = gBASE_URL + "customers/report/exportexcel?totalorder=" + gTotalOrder + "&customertype=" + gCustomerType;
    } else {
        location.href = gBASE_URL + "customers/report/exportexcel?customertype=" + gCustomerType;
    }
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
function callAjaxApiGetReportCustomers() {
    $.ajax({
        url: gBASE_URL + "customers/report",
        type: "GET",
        headers: {
            "Authorization": "Token " + gTokenValue
        },
        success: function(resReportCustomers) {
            gReportCustomersDb.reportCustomers = resReportCustomers;
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

// load báo cáo order lên BAR CHART 
function loadBarChart(paramReportCustomers) {
    var vCustomerReport = [];
    var vTotalOrderReport = [];
    var vRevenueReport = [];
    if (!gCustomerType) {
        for (let bIndex = 0; bIndex < paramReportCustomers.length; bIndex++) {
            const bCUSTOMER_ELEMENT = paramReportCustomers[bIndex];
            if (bCUSTOMER_ELEMENT.totalOrder > gTotalOrder) {
                vCustomerReport.push("(" + bCUSTOMER_ELEMENT.customerId + ") " + bCUSTOMER_ELEMENT.customerFullName);
                vTotalOrderReport.push(bCUSTOMER_ELEMENT.totalOrder);
                vRevenueReport.push(bCUSTOMER_ELEMENT.totalRevenue);
            }
        }
    }
    if (gCustomerType == "platinum") {
        for (let bIndex = 0; bIndex < paramReportCustomers.length; bIndex++) {
            const bCUSTOMER_ELEMENT = paramReportCustomers[bIndex];
            if (bCUSTOMER_ELEMENT.totalRevenue > 500000 && bCUSTOMER_ELEMENT.totalOrder > gTotalOrder) {
                vCustomerReport.push("(" + bCUSTOMER_ELEMENT.customerId + ") " + bCUSTOMER_ELEMENT.customerFullName);
                vTotalOrderReport.push(bCUSTOMER_ELEMENT.totalOrder);
                vRevenueReport.push(bCUSTOMER_ELEMENT.totalRevenue);
            }
        }
    }
    if (gCustomerType == "gold") {
        for (let bIndex = 0; bIndex < paramReportCustomers.length; bIndex++) {
            const bCUSTOMER_ELEMENT = paramReportCustomers[bIndex];
            if (bCUSTOMER_ELEMENT.totalRevenue > 200000 && bCUSTOMER_ELEMENT.totalRevenue <= 500000 && bCUSTOMER_ELEMENT.totalOrder > gTotalOrder) {
                vCustomerReport.push("(" + bCUSTOMER_ELEMENT.customerId + ") " + bCUSTOMER_ELEMENT.customerFullName);
                vTotalOrderReport.push(bCUSTOMER_ELEMENT.totalOrder);
                vRevenueReport.push(bCUSTOMER_ELEMENT.totalRevenue);
            }
        }
    }
    if (gCustomerType == "silver") {
        for (let bIndex = 0; bIndex < paramReportCustomers.length; bIndex++) {
            const bCUSTOMER_ELEMENT = paramReportCustomers[bIndex];
            if (bCUSTOMER_ELEMENT.totalRevenue > 100000 && bCUSTOMER_ELEMENT.totalRevenue <= 200000 && bCUSTOMER_ELEMENT.totalOrder > gTotalOrder) {
                vCustomerReport.push("(" + bCUSTOMER_ELEMENT.customerId + ") " + bCUSTOMER_ELEMENT.customerFullName);
                vTotalOrderReport.push(bCUSTOMER_ELEMENT.totalOrder);
                vRevenueReport.push(bCUSTOMER_ELEMENT.totalRevenue);
            }
        }
    }
    if (gCustomerType == "vip") {
        for (let bIndex = 0; bIndex < paramReportCustomers.length; bIndex++) {
            const bCUSTOMER_ELEMENT = paramReportCustomers[bIndex];
            if (bCUSTOMER_ELEMENT.totalRevenue > 50000 && bCUSTOMER_ELEMENT.totalRevenue <= 100000 && bCUSTOMER_ELEMENT.totalOrder > gTotalOrder) {
                vCustomerReport.push("(" + bCUSTOMER_ELEMENT.customerId + ") " + bCUSTOMER_ELEMENT.customerFullName);
                vTotalOrderReport.push(bCUSTOMER_ELEMENT.totalOrder);
                vRevenueReport.push(bCUSTOMER_ELEMENT.totalRevenue);
            }
        }
    }

    var areaChartData = {
        labels: vCustomerReport,
        datasets: [{
                label: 'Total Order',
                backgroundColor: 'rgba(210, 214, 222, 1)',
                borderColor: 'rgba(210, 214, 222, 1)',
                pointRadius: false,
                pointColor: 'rgba(210, 214, 222, 1)',
                pointStrokeColor: '#c1c7d1',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: vTotalOrderReport
            },
            {
                label: 'Revenue ($)',
                backgroundColor: 'rgba(60,141,188,0.9)',
                borderColor: 'rgba(60,141,188,0.8)',
                pointRadius: false,
                pointColor: '#3b8bba',
                pointStrokeColor: 'rgba(60,141,188,1)',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(60,141,188,1)',
                data: vRevenueReport
            }
        ]
    };

    $("#chart-axes").html(`
        yAxes: Number - xAxes: (id) Customer Name
    `);

    $('#bar-chart-parent').html(`
        <canvas id="barChart" style="height: 450px; max-width: 100%;"></canvas>
    `)

    var barChartCanvas = $('#barChart').get(0).getContext('2d');
    var barChartData = $.extend(true, {}, areaChartData)
    var temp0 = areaChartData.datasets[0]
    var temp1 = areaChartData.datasets[1]
    barChartData.datasets[0] = temp0
    barChartData.datasets[1] = temp1

    var barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        datasetFill: false
    }

    new Chart(barChartCanvas, {
        type: 'bar',
        data: barChartData,
        options: barChartOptions
    })
}