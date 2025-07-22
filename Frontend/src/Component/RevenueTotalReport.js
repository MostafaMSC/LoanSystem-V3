import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function RevenueTotalReport() {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [revenues, setRevenues] = useState([]);
    const [Privouserevenues, setPrivouseRevenues] = useState([]);
    
    const [allRevenueInfo, setAllRevenueInfo] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [departmentError, setDepartmentError] = useState('');

    useEffect(() => {
        const today = new Date();
        setSelectedMonth(today.getMonth() + 1);
        setSelectedYear(today.getFullYear());
    
        fetchAllRevenueInfo();
    }, []);

    const printReport = () => {
        const printArea = document.getElementById('print-area');
        if (!printArea) return;

        const printWindow = window.open('', '_blank');
        const printContent = printArea.innerHTML;
        
        printWindow.document.write(`
          <html>
            <head>
              <title>تقرير الإيرادات</title>
              <style>
                body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .table-dark th { background-color: #343a40; color: white; }
                .table-warning { background-color: #fff3cd; }
                .table-success { background-color: #d1edff; }
                .table-info { background-color: #d1ecf1; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; }
                .bg-success { background-color: #28a745; color: white; }
                .bg-warning { background-color: #ffc107; color: black; }
                .bg-info { background-color: #17a2b8; color: white; }
                .bg-secondary { background-color: #6c757d; color: white; }
                .text-dark { color: black; }
                @media print {
                body { margin: 0; }
                table { page-break-inside: avoid; }
                }
            </style>
            </head>
            <body>
            <div style="display:flex; justify-content:space-between; align-items:center">
                        <h3 style="text-align: center; margin-bottom: 30px;">وزارة الموارد المائية <br> مركز الوزارة <br> دائرة الشؤؤن المالية - الميزانية </h3>

            <h2 style="text-align: center; margin-bottom: 30px;">جدول الايرادات لشهر ${getMonthName(selectedMonth)}  ${selectedYear}</h2>
            <h2 style="text-align: center; margin-bottom: 30px;"></h2>

              </div>
              ${printContent}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    };

    const fetchAllRevenueInfo = async () => {
        try {
            setDepartmentError('');

            const res = await api.get('/RevenuInfo/GetAllRevenues');

            let revenueData = [];

            if (res.data && Array.isArray(res.data.loans)) {
                revenueData = res.data.loans;
            } else if (res.data && Array.isArray(res.data.Loans)) {
                revenueData = res.data.Loans;
            } else if (Array.isArray(res.data)) {
                revenueData = res.data;
            }

            console.log('Processed revenue info:', revenueData);
            setAllRevenueInfo(revenueData);

            if (revenueData.length === 0) {
                setDepartmentError('لم يتم العثور على أي إيرادات في النظام');
            }

        } catch (err) {
            console.error("Error fetching revenue info:", err);
            setDepartmentError(`خطأ في جلب معلومات الإيرادات: ${err.response?.data?.message || err.message}`);
            setAllRevenueInfo([]);
        }
    };

    const fetchRevenues = async () => {
        if (!selectedYear || !selectedMonth) {
            setError("يرجى تحديد الشهر والسنة.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = `/BudgetRevenue/GetReportByDateAndDep?year=${selectedYear}&month=${selectedMonth}`;
            console.log('Fetching revenues from:', url);
            
            const res = await api.get(url);
            console.log('Revenues API Response:', res.data);
            
            let data = [];
            if (Array.isArray(res.data)) {
                data = res.data;
            } else if (res.data && Array.isArray(res.data.revenues)) {
                data = res.data.revenues;
            } else if (res.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (res.data && typeof res.data === 'object') {
                const keys = Object.keys(res.data);
                const dataKey = keys.find(key => Array.isArray(res.data[key]));
                if (dataKey) {
                    data = res.data[dataKey];
                }
            }
            
            console.log('Processed revenues data:', data);
            setRevenues(data);
            
        } catch (err) {
            console.error("Error fetching revenues:", err);
            if (err.response?.status === 404) {
                setRevenues([]);
                setError("لا توجد بيانات للفترة المحددة.");
            } else {
                setError(`فشل في جلب البيانات: ${err.response?.data?.message || err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPreviousRevenues = async () => {
    if (!selectedYear || !selectedMonth) {
        setError("يرجى تحديد الشهر والسنة.");
        return;
    }

    // Calculate the actual previous month
    let prevMonth, prevYear;
    if (selectedMonth === 1) {
        prevMonth = 12;
        prevYear = selectedYear - 1;
    } else {
        prevMonth = selectedMonth - 1;
        prevYear = selectedYear;
    }

    setLoading(true);
    setError('');

    try {
        // Use the same API endpoint as current month but with previous month values
        const url = `/BudgetRevenue/GetReportByDateAndDep?year=${prevYear}&month=${prevMonth}`;
        console.log('Fetching previous month revenues from:', url);
        
        const res = await api.get(url);
        console.log('Previous month API Response:', res.data);
        
        let data = [];
        if (Array.isArray(res.data)) {
            data = res.data;
        } else if (res.data && Array.isArray(res.data.revenues)) {
            data = res.data.revenues;
        } else if (res.data && Array.isArray(res.data.data)) {
            data = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
            const keys = Object.keys(res.data);
            const dataKey = keys.find(key => Array.isArray(res.data[key]));
            if (dataKey) {
                data = res.data[dataKey];
            }
        }
        
        console.log('Processed previous month data:', data);
        setPrivouseRevenues(data);
        
    } catch (err) {
        console.error("Error fetching previous month revenues:", err);
        if (err.response?.status === 404) {
            setPrivouseRevenues([]);
            // Don't set error for 404 as it's normal for first month of year
        } else {
            setError(`فشل في جلب بيانات الشهر السابق: ${err.response?.data?.message || err.message}`);
        }
    } finally {
        setLoading(false);
    }
};


    // Helper function to calculate total for a revenue item across all departments
    const calculateRevenueTotal = (revenueId, revenueData) => {
        return revenueData.reduce((total, rev) => {
            const matches = rev.revenueInfo?.id === revenueId || rev.revenueId === revenueId;
            if (matches) {
                const cost = parseFloat(rev.revenueCost || 0);
                return total + (isNaN(cost) ? 0 : cost);
            }
            return total;
        }, 0);
    };

    const getPreviousMonthTotal = (revenueId) => {
    if (!Privouserevenues || Privouserevenues.length === 0) {
        return 0;
    }

    // Use the same logic as calculateRevenueTotal since we're now using the same API
    return Privouserevenues.reduce((total, rev) => {
        const matches = rev.revenueInfo?.id === revenueId || rev.revenueId === revenueId;
        if (matches) {
            const cost = parseFloat(rev.revenueCost || 0);
            return total + (isNaN(cost) ? 0 : cost);
        }
        return total;
    }, 0);
};

    const exportToExcel = () => {
        const revenueItems = [...new Map(allRevenueInfo.map(info => [info.id, info])).values()];
        
        if (revenueItems.length === 0) {
            alert("لا توجد إيرادات للتصدير");
            return;
        }

        try {
            const excelData = [];
            
            revenueItems.forEach((info) => {
                const currentMonthTotal = calculateRevenueTotal(info.id, revenues);
                const previousMonthTotal = getPreviousMonthTotal(info.id);
                const grandTotal = currentMonthTotal + previousMonthTotal;
                
                excelData.push({
                    'الفصل': info.section || '',
                    'المادة': info.chapter || '',
                    'النوع': info.type || '',
                    'التفاصيل': info.typeDetails || '',
                    'اسم الإيراد': info.revenueName || '',
                    'الشهر السابق': previousMonthTotal,
                    'الشهر الحالي': currentMonthTotal,
                    'المجموع': grandTotal
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenues');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            saveAs(blob, `revenue-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.xlsx`);
            
        } catch (err) {
            console.error("Error exporting to Excel:", err);
            alert(`حدث خطأ أثناء التصدير: ${err.message}`);
        }
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[parseInt(monthNumber) - 1] || monthNumber;
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return isNaN(num) ? '0' : num.toLocaleString();
    };

    return (
        <>
            <NavMenu />
            <div className="container my-5" style={{ direction: 'rtl' }}>
                <h2 className="text-primary mb-4">تقرير الإيرادات</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {departmentError && <div className="alert alert-warning">{departmentError}</div>}

                <div className="row g-3 align-items-center mb-4">
                    <div className="col-auto">
                        <label className="form-label">الشهر:</label>
                        <select 
                            className="form-select" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">اختر الشهر</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} - {getMonthName(i + 1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-auto">
                        <label className="form-label">السنة:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            placeholder="2025"
                            min="2020"
                            max="2030"
                            disabled={loading}
                        />
                    </div>

                    <div className="col-auto">
                        <button 
                            className="btn btn-primary" 
                            onClick={()=>{
                                fetchRevenues();
                                fetchPreviousRevenues();
                            }}
                            disabled={loading || !selectedYear || !selectedMonth}
                        >
                            {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                        </button>
                    </div>
                    
                    <div className="col-auto">
                        <button 
                            className="btn btn-success" 
                            onClick={exportToExcel}
                            disabled={loading || allRevenueInfo.length === 0}
                        >
                            تصدير Excel
                        </button>
                        <button onClick={printReport} className="btn btn-secondary mb-3 mx-3">
                            طباعة التقرير
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">جاري التحميل...</span>
                        </div>
                    </div>
                ) : !selectedYear || !selectedMonth ? (
                    <div className="alert alert-info text-center">
                        يرجى تحديد الشهر والسنة لعرض التقرير
                    </div>
                ) : allRevenueInfo.length === 0 && !departmentError ? (
                    <div className="alert alert-warning text-center">
                        لا توجد إيرادات مسجلة في النظام
                        <br/>
                        <button className="btn btn-sm btn-outline-primary mt-2" onClick={fetchAllRevenueInfo}>
                            إعادة المحاولة
                        </button>
                    </div>
                ) : (
                    <div className="revenue-report">
                        <div className="card mt-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">تقرير الإيرادات - {getMonthName(selectedMonth)} {selectedYear}</h5>
                            </div>
                
                            <div className="card-body p-0">
                                <div className="table-responsive" id="print-area">
                                    <table className="table table-striped table-hover mb-0">
                                        <thead className="table-dark">
                                            <tr style={{ fontSize: '12px' }}>
                                                <th className="text-center">الفصل</th>
                                                <th className="text-center">المادة</th>
                                                <th className="text-center">النوع</th>
                                                <th className="text-center">تفاصيل النوع</th>
                                                <th className="text-center">اسم الإيراد</th>
                                                <th className="text-center">الشهر السابق</th>
                                                <th className="text-center">الشهر الحالي</th>
                                                <th className="text-center">المجموع</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...new Map(allRevenueInfo.map(info => [info.id, info])).values()]
                                                .map(info => {
                                                    const currentMonthTotal = calculateRevenueTotal(info.id, revenues);
                                                    const previousMonthTotal = getPreviousMonthTotal(info.id);
                                                    const grandTotal = currentMonthTotal + previousMonthTotal;
                                                    
                                                    return (
                                                        <tr key={info.id} style={{ fontSize: '12px' }}>
                                                            <td className="text-center fw-bold">{info.section || ''}</td>
                                                            <td className="text-center fw-bold">{info.chapter || ''}</td>
                                                            <td className="text-center fw-bold">{info.type || ''}</td>
                                                            <td className="text-center fw-bold">{info.typeDetails || ''}</td>
                                                            <td className="text-center fw-bold">{info.revenueName || ''}</td>
                                                            <td className="text-center">
                                                                <span className="badge bg-warning text-dark fs-6">
                                                                    {formatCurrency(previousMonthTotal)}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge bg-info fs-6">
                                                                    {formatCurrency(currentMonthTotal)}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge bg-success fs-6">
                                                                    {formatCurrency(grandTotal)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                        
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}