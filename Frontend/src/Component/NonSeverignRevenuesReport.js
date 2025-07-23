import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export default function NonSeverignRevenuesReport() {
 const [department, setDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
    const [revenues, setRevenues] = useState([]);
    const [Privouserevenues, setPrivouseRevenues] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
      const [allRevenueInfo, setAllRevenueInfo] = useState([]);
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const [departmentError, setDepartmentError] = useState('');

    useEffect(() => {
        const today = new Date();
        setSelectedMonth(today.getMonth() + 1);
        setSelectedYear(today.getFullYear());
    
        const storedDept = localStorage.getItem("UserDepartment");
        if (storedDept) {
        setDepartment(storedDept);
        }
    
        fetchAllDepartments();
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
          <h2 style="text-align: center; margin-bottom: 30px;">وزارة الموارد المائية / الايرادات لشهر ${getMonthName(selectedMonth)}</h2>

          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };
  const fetchAllDepartments = async () => {
    try {
      setDepartmentError('');
      const res = await api.get('/Department/GetAllDep');
      
      console.log('Full API Response:', res.data);
      
      let departments = [];
      
      if (Array.isArray(res.data)) {
        departments = res.data
          .map(dept => dept.DepartmentName || dept.departmentName || dept.name || dept)
          .filter(name => name && typeof name === 'string' && name.trim() !== '');
      } else if (res.data && res.data.Departments) {
        departments = res.data.Departments
          .map(dept => dept.DepartmentName || dept.departmentName || dept.name || dept)
          .filter(name => name && typeof name === 'string' && name.trim() !== '');
      } else if (res.data && res.data.Loans) {
        departments = res.data.Loans
          .map(dept => dept.DepartmentName || dept.departmentName || dept.name || dept)
          .filter(name => name && typeof name === 'string' && name.trim() !== '');
      } else if (res.data && typeof res.data === 'object') {
        const keys = Object.keys(res.data);
        if (keys.length > 0) {
          const dataKey = keys.find(key => Array.isArray(res.data[key]));
          if (dataKey) {
            departments = res.data[dataKey]
              .map(dept => dept.DepartmentName || dept.departmentName || dept.name || dept)
              .filter(name => name && typeof name === 'string' && name.trim() !== '');
          }
        }
      }
      
      departments = [...new Set(departments)]; // Remove duplicates
      
      console.log('Processed departments:', departments);
      setAllDepartments(departments);
      
      if (departments.length === 0) {
        setDepartmentError('لم يتم العثور على أي أقسام في النظام');
      }
      
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartmentError(`خطأ في جلب الأقسام: ${err.response?.data?.message || err.message}`);
      setAllDepartments([]);
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
      const url = `/BudgetRevenue/GetNonSovereignRevenueByDepAndDate?year=${selectedYear}&month=${selectedMonth}&department=${encodeURIComponent(department)}`;
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
  const prevMonth = selectedMonth === 1 ? 1 : selectedMonth; // Because your API fetches from Jan to (month - 1)
  setLoading(true);
  setError('');

  try {
    const url = `/BudgetRevenue/GetReportForward?year=${selectedYear}&month=${prevMonth}&department=${encodeURIComponent(department || '')}`;
    console.log('Fetching carried forward from:', url);

    const res = await api.get(url);
    console.log('Carried forward API response:', res.data);

    let data = [];

    if (Array.isArray(res.data)) {
      data = res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      data = res.data.data;
    } else if (typeof res.data === 'object') {
      // Handle single department response
      if (res.data.Department && typeof res.data.CarriedForwardTotal !== 'undefined') {
        data = [res.data]; // Wrap in array
      }
    }

    console.log('Processed forward totals:', data);
    setPrivouseRevenues(data);

  } catch (err) {
    console.error("Error fetching carried forward totals:", err);
    if (err.response?.status === 404) {
      setPrivouseRevenues([]);
      setError("لا توجد بيانات للفترة المحددة.");
    } else {
      setError(`فشل في جلب البيانات: ${err.response?.data?.message || err.message}`);
    }
  } finally {
    setLoading(false);
  }
};
}
const removeDuplicatesAndGroup = (revenues, filterSectionNonEmpty = true) => {
  const uniqueRevenues = revenues.reduce((acc, rev, index) => {
    const uniqueKey = `${rev.id || index}-${rev.revenueInfo?.id || rev.revenueId || ''}-${rev.department || rev.departmentName || ''}-${rev.revenueCost || 0}-${rev.recordedDate || ''}`;
    if (!acc.some(item => {
      const existingKey = `${item.id || item.index}-${item.revenueInfo?.id || item.revenueId || ''}-${item.department || item.departmentName || ''}-${item.revenueCost || 0}-${item.recordedDate || ''}`;
      return existingKey === uniqueKey;
    })) {
      acc.push({ ...rev, index });
    }
    return acc;
  }, []);
const filteredRevenues = uniqueRevenues.filter(rev => {
    let sectionValue = rev.section || rev.Section || '';
    if (typeof sectionValue === 'string') {
      sectionValue = sectionValue.trim();
    } else {
      sectionValue = '';
    }
    return filterSectionNonEmpty ? sectionValue !== '' : sectionValue === '';
  });
eturn filteredRevenues.reduce((acc, rev, index) => {
    let deptName = 'غير محدد';

    try {
      if (typeof rev.department === 'string' && rev.department.trim()) {
        deptName = rev.department.trim();
      } else if (rev.department && typeof rev.department === 'object') {
        deptName = rev.department.DepartmentName || rev.department.departmentName || rev.department.name || 'غير محدد';
      } else if (rev.departmentName && rev.departmentName.trim()) {
        deptName = rev.departmentName.trim();
      } else if (rev.Department && rev.Department.trim()) {
        deptName = rev.Department.trim();
      }
    } catch (error) {
      console.error(`Error processing revenue ${index + 1}:`, error, rev);
    }

    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(rev);
    return acc;
  }, {});
};
const getMonthName = (month) => {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  return months[month - 1] || '';
};
  return (
    <>
      <NavMenu />
      <div className="container my-5" style={{ direction: 'rtl' }}>
        <h2 className="text-primary mb-4">تقرير الإيرادات حسب الأقسام</h2>

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
            <label className="form-label">القسم (اختياري):</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
            >
              <option value="">جميع الأقسام</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="col-auto">
            <button 
              className="btn btn-primary" 
              onClick={()=>{fetchRevenues();
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
              disabled={loading || departmentStructureWithSection.length === 0}
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
        ) : allDepartments.length === 0 && !departmentError ? (
          <div className="alert alert-warning text-center">
            لا توجد أقسام مسجلة في النظام
            <br/>
            <button className="btn btn-sm btn-outline-primary mt-2" onClick={fetchAllDepartments}>
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="departments-report">
            <div className="card mt-4">
  <div className="card-header bg-primary text-white">
    <h5 className="mb-0">تفاصيل الإيرادات حسب الأقسام</h5>
  </div>
  
  <div className="card-body p-0"  >
    <div className="table-responsive" id="print-area">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr style={{ minWidth: '100px' , fontSize: '12px',margin:'0',padding:'0' }}>
            <th className="text-center">القسم</th>
            <th className="text-center">الفصل</th>
            <th className="text-center">المادة</th>
            <th className="text-center">النوع</th>
            <th className="text-center">تفاصيل النوع</th>
            <th className="text-center">التفاصيل</th>
            {departmentStructureWithSection.map(dept => (
              <th  key={dept.name} className="text-center">{dept.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...new Map(allRevenueInfo.map(info => [info.id, info])).values()]
                    .filter(info => info.section && info.section.trim() !== '')
                    .map(info => (
                      <tr key={info.id} style={{ minWidth: '100px', fontSize: '12px', margin: '0', padding: '0' }}>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.section}</td>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.chapter || ''}</td>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.material || ''}</td>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.type || ''}</td>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.typeDetails || ''}</td>
                        <td style={{ fontWeight: 'bold' }} className="text-center">{info.revenueName || ''}</td>
                        {departmentStructureWithSection.map(dept => {
                          const match = dept.revenues.find(
                            rev => rev.revenueInfo?.id === info.id || rev.revenueId === info.id
                          );
                          return (
                            <td key={dept.name} className="text-center">
                              <span className={`badge ${match?.revenueCost < 0 ? 'bg-danger' : 'bg-success'} fs-6`}>
                                {formatCurrency(match?.revenueCost ?? 0)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                  ))}

        </tbody>
        <tfoot>
  <tr className="table-info">
    <td colSpan="6" className="text-end fw-bold">المجموع الكلي لكل الأقسام:</td>
    <td className="text-center fw-bold">
      <span className="badge bg-info fs-6">
        {formatCurrency(
          departmentStructureWithSection.reduce((sum, dept) => sum + (parseFloat(dept.total) || 0), 0) +
          PrivdepartmentStructure.reduce((sum, dept) => sum + (parseFloat(dept.total) || 0), 0)
        )}
      </span>
    </td>
  </tr>
</tfoot>
<tfoot>
  <tr className="table-warning">
    <td colSpan="6" className="text-end fw-bold">المجموع :</td>
    {departmentStructureWithSection.map(dept => (
      <td key={dept.name} className="text-center">
        <span className="badge bg-warning text-dark fs-6">
          {formatCurrency(dept.total)}
        </span>
      </td>
    ))}
  </tr>
</tfoot>

<tfoot>
  <tr className="table-warning">
    <td colSpan="6" className="text-end fw-bold">المدور :</td>
    {allDepartments.map(deptName => {
      const deptData = PrivdepartmentStructure.find(d => d.department === deptName || d.name === deptName);
      const value = deptData?.carriedForwardTotal ?? deptData?.total ?? 0;

      return (
        <td key={deptName} className="text-center">
          <span className="badge bg-warning text-dark fs-6">
            {formatCurrency(value)}
          </span>
        </td>
      );
    })}
  </tr>
</tfoot>


        <tfoot>
  <tr className="table-success">
    <td colSpan="6" className="text-end fw-bold">المجموع الكلي :</td>
    {allDepartments.map(deptName => {
      const current = departmentStructureWithSection.find(d => d.name === deptName)?.total || 0;
      const previous = PrivdepartmentStructure.find(d => d.name === deptName)?.total || 0;
      const total = current + previous;
      return (
        <td key={deptName} className="text-center">
          <span className="badge bg-success fs-6">
            {formatCurrency(total)}
          </span>
        </td>
      );
    })}
  </tr>
  
  {[...new Map(allRevenueInfo.map(info => [info.id, info])).values()]
  .filter(info => info.section && info.section.trim() === '') // <-- Filter out rows with empty section
  .map(info => (
    <tr key={info.id} style={{ minWidth: '100px', fontSize: '12px', margin: '0', padding: '0' }}>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.section}</td>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.chapter || ''}</td>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.material || ''}</td>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.type || ''}</td>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.typeDetails || ''}</td>
      <td style={{ fontWeight: 'bold' }} className="text-center">{info.revenueName || ''}</td>
      {departmentStructureWithSection.map(dept => {
        const match = dept.revenues.find(
          rev => rev.revenueInfo?.id === info.id || rev.revenueId === info.id
        );
        return (
          <td key={dept.name} className="text-center">
            <span className={`badge ${match ? 'bg-success' : 'bg-secondary'} fs-6`}>
              {formatCurrency(match?.revenueCost || 0)}
            </span>
          </td>
        );
      })}
    </tr>
))}
</tfoot>
      </table>      
    </div>
  </div>

  <div className="card-body p-0">
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        
        <tbody>
          {[...new Map(allRevenueInfo.map(info => [info.id, info])).values()]
    .filter(info => !info.section || info.section.trim() === '')
    .map(info => (
      <tr key={info.id} style={{ minWidth: '100px', fontSize: '12px', margin: '0', padding: '0' }}>
        <td className="text-center fw-bold">{info.section}</td>
        <td className="text-center fw-bold">{info.chapter || ''}</td>
        <td className="text-center fw-bold">{info.material || ''}</td>
        <td className="text-center fw-bold">{info.type || ''}</td>
        <td className="text-center fw-bold">{info.typeDetails || ''}</td>
        <td className="text-center fw-bold">{info.revenueName || ''}</td>
        {departmentStructureWithSection.map(dept => {
          const match = dept.revenues.find(
            rev => rev.revenueInfo?.id === info.id || rev.revenueId === info.id
          );
          return (
            <td key={dept.name} className="text-center">
              <span className={`badge ${match ? 'bg-success' : 'bg-secondary'} fs-6`}>
                {formatCurrency(match?.revenueCost || 0)}
              </span>
            </td>
          );
        })}
      </tr>
    ))}

        </tbody>
        <tfoot>
  <tr className="table-info">
    <td colSpan="6" className="text-end fw-bold">المجموع الكلي لكل الأقسام:</td>
    <td className="text-center fw-bold">
      <span className="badge bg-info fs-6">
        {formatCurrency(
          departmentStructureWithoutSection.reduce((sum, dept) => sum + (parseFloat(dept.total) || 0), 0) +
          PrivdepartmentStructure.reduce((sum, dept) => sum + (parseFloat(dept.total) || 0), 0)
        )}
      </span>
    </td>
  </tr>
</tfoot>
<tfoot>
  <tr className="table-warning">
    <td colSpan="6" className="text-end fw-bold">المجموع :</td>
    {departmentStructureWithoutSection.map(dept => (
      <td key={dept.name} className="text-center">
        <span className="badge bg-warning text-dark fs-6">
          {formatCurrency(dept.total)}
        </span>
      </td>
    ))}
  </tr>
</tfoot>

<tfoot>
  <tr className="table-warning">
    <td colSpan="6" className="text-end fw-bold">المدور :</td>
    {allDepartments.map(deptName => {
      const deptData = PrivdepartmentStructure.find(d => d.department === deptName || d.name === deptName);
      const value = deptData?.carriedForwardTotal ?? deptData?.total ?? 0;

      return (
        <td key={deptName} className="text-center">
          <span className="badge bg-warning text-dark fs-6">
            {formatCurrency(value)}
          </span>
        </td>
      );
    })}
  </tr>
</tfoot>
        <tfoot>
  <tr className="table-success">
    <td colSpan="6" className="text-end fw-bold">المجموع الكلي :</td>
    {allDepartments.map(deptName => {
      const current = departmentStructureWithoutSection.find(d => d.name === deptName)?.total || 0;
      const previous = PrivdepartmentStructure.find(d => d.name === deptName)?.total || 0;
      const total = current + previous;
      return (
        <td key={deptName} className="text-center">
          <span className="badge bg-success fs-6">
            {formatCurrency(total)}
          </span>
        </td>
      );
    })}
  </tr>
</tfoot>
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
};