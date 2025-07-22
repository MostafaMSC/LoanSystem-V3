import { useState, useEffect } from 'react';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';

export default function AddRevenueCosts() {
  const [revenues, setRevenues] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [debugInfo, setDebugInfo] = useState('');
  
  const toast = ({ title, description, type = 'info' }) => {
    toastify(
      <div>
        <strong>{title}</strong>
        <div>{description}</div>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        type: type
      }
    );
  };

  useEffect(() => {
    const storedDept = localStorage.getItem("UserDepartment");
    console.log('Department from localStorage:', storedDept);
    if (storedDept) {
      setDepartmentName(storedDept);
    } else {
      setError('لم يتم العثور على معلومات القسم');
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('Fetching revenues...');
        const res = await api.get('/RevenuInfo/GetAllRevenues');
        console.log('Raw response:', res);
        console.log('Response data:', res.data);
        
        let revenueData = [];
        if (res.data.loans) {
          revenueData = res.data.loans;
        } else if (res.data.revenues) {
          revenueData = res.data.revenues;
        } else if (Array.isArray(res.data)) {
          revenueData = res.data;
        }
        
        console.log('Processed revenue data:', revenueData);
        setRevenues(revenueData);
        
      } catch (err) {
        console.error('Error fetching revenues:', err);
        setError('فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (id, value) => {
    console.log(`Changing revenue ${id} to value:`, value);
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const checkExistingEntry = async (revenueId, department, year, month) => {
    try {
      const response = await api.get('/BudgetRevenue/CheckExisting', {
        params: {
          revenueId: revenueId,
          department: department,
          year: year,
          month: month
        }
      });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking existing entry:', error);
      return false; // If check fails, allow submission
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setDebugInfo('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Department:', departmentName);
    console.log('Year:', selectedYear, typeof selectedYear);
    console.log('Month:', selectedMonth, typeof selectedMonth);
    console.log('Revenues:', revenues);

    try {
      const submissions = [];
      const duplicateEntries = [];
      
      for (const revenue of revenues) {
        const cost = formData[revenue.id];
        if (cost != null && cost !== '') {
          // Check if entry already exists
          const exists = await checkExistingEntry(
            revenue.id,
            departmentName?.trim(),
            selectedYear,
            selectedMonth
          );

          if (exists) {
            duplicateEntries.push(revenue.revenueName);
            submissions.push({
              revenue: revenue.revenueName,
              status: 'duplicate',
              response: 'البيانات موجودة مسبقاً'
            });
            continue;
          }

          const submissionData = {
            RevenueId: parseInt(revenue.id),
            Department: departmentName?.trim() || '',
            RevenueCost: parseFloat(cost),
            Year: parseInt(selectedYear),
            Month: parseInt(selectedMonth),
            Notes: "تمت الإضافة من الواجهة",
          };

          console.log(`\n--- Submitting for ${revenue.revenueName} ---`);
          console.log('Submission data:', submissionData);

          try {
            const response = await api.post('/BudgetRevenue/AddRevenueCost', submissionData);
            console.log('✅ Success:', response.data);

            submissions.push({
              revenue: revenue.revenueName,
              status: 'success',
              response: response.data
            });

          } catch (error) {
            console.error('❌ Error:', error);

            submissions.push({
              revenue: revenue.revenueName,
              status: 'error',
              response: error.response?.data || error.message
            });
          }
        }
      }

      console.log('=== SUBMISSION SUMMARY ===');
      console.log('All submissions:', submissions);

      const successful = submissions.filter(s => s.status === 'success');
      const failed = submissions.filter(s => s.status === 'error');

      // Single notification at the end based on results
      if (successful.length > 0 && failed.length === 0) {
        // All submissions successful
        setSuccess(`تمت إضافة تكاليف بنجاح!`);
        setFormData({});
        
        toast({
          title: 'تمت العملية بنجاح',
          description: `تمت إضافة جميع التكاليف بنجاح )`,
          type: 'success'
        });

      } else if (successful.length > 0 && failed.length > 0) {
        // Partial success
        const errorMessages = failed.map(f => 
          `${f.revenue}: ${JSON.stringify(f.response)}`
        ).join('\n');
        setError(`تمت إضافة ${successful.length} تكاليف، وفشل ${failed.length} تكاليف`);
        setDebugInfo(`التفاصيل:\n${errorMessages}`);

        toast({
          title: 'تمت العملية جزئياً',
          description: `تمت إضافة ${successful.length} تكاليف بنجاح، وفشل ${failed.length} تكاليف`,
          type: 'warning'
        });

      } else if (failed.length > 0) {
        // All submissions failed
        const errorMessages = failed.map(f => 
          `${f.revenue}: ${JSON.stringify(f.response)}`
        ).join('\n');
        setError(`فشل في حفظ جميع التكاليف (${failed.length} عنصر)`);
        setDebugInfo(`التفاصيل:\n${errorMessages}`);

        toast({
          title: 'فشلت العملية',
          description: `فشل في حفظ جميع التكاليف (${failed.length} عنصر)`,
          type: 'error'
        });

      } else {
        // No submissions (no data entered)
        toast({
          title: 'تنبيه',
          description: 'الايرادات لهذا التاريخ مدخلة مسبقا',
          type: 'info'
        });
      }

    } catch (err) {
      console.error('General error:', err);
      setError('خطأ عام في الإرسال');
      setDebugInfo(err.message);

      toast({
        title: 'خطأ عام',
        description: 'حدث خطأ غير متوقع أثناء الإرسال',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavMenu />
      <main className="flex-fill container my-4">
        <div className="contract-form-container">
          <h2>إضافة تكاليف الإيرادات لقسم {departmentName}</h2>

          {error && (
            <div className="alert alert-danger">
              <strong>{error}</strong>
              {debugInfo && (
                <pre className="mt-2" style={{fontSize: '12px'}}>
                  {debugInfo}
                </pre>
              )}
            </div>
          )}
          
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">السنة</label>
              <input
                type="number"
                className="form-control"
                min="2000"
                max="2100"
                step="1"
                value={selectedYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  console.log('Year changed to:', val, typeof val);
                  setSelectedYear(val);
                }}
                placeholder="أدخل السنة"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">الشهر</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  console.log('Month changed to:', val, typeof val);
                  setSelectedMonth(val);
                }}
                required
              >
                {[
                  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
                ].map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">القسم</label>
              <input readOnly
                type="text"
                className="form-control"
                value={departmentName}
                onChange={(e) => {
                  console.log('Department changed to:', e.target.value);
                  setDepartmentName(e.target.value);
                }}
                placeholder="اسم القسم"
                required
              />
            </div>

            <hr />
            <h5 className="mt-2 text-center font-bold">الايرادات التشغيلية</h5>
            <div className="row">
              {revenues
                .filter(rev => rev.revenueName !== "الايرادات الاستثمارية")
                .map(rev => (
                  <div key={rev.id} className="col-md-6">
                    <label className="form-label">{rev.revenueName}</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData[rev.id] || ''}
                      onChange={(e) => {
                        console.log(`Revenue ${rev.id} (${rev.revenueName}) changed to:`, e.target.value);
                        handleChange(rev.id, e.target.value);
                      }}
                      placeholder="أدخل قيمة التكلفة"
                    />
                  </div>
                ))}
            </div>

            <hr />
            <h5 className="mt-4 text-center font-bold">الايرادات الاستثمارية</h5>
            <div className="row">
              {revenues
                .filter(rev => rev.revenueName === "الايرادات الاستثمارية")
                .map(rev => (
                  <div key={rev.id} className="col-md-6">
                    <label className="form-label">{rev.revenueName}</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData[rev.id] || ''}
                      onChange={(e) => {
                        console.log(`Revenue ${rev.id} (${rev.revenueName}) changed to:`, e.target.value);
                        handleChange(rev.id, e.target.value);
                      }}
                      placeholder="أدخل قيمة التكلفة"
                    />
                  </div>
                ))}
            </div>

            <div className="col-12">
              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={loading || revenues.length === 0}
              >
                {loading ? 'جارٍ الإضافة...' : 'حفظ التكاليف'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}