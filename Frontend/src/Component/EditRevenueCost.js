import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';

export default function EditRevenueCosts() {
  const { id } = useParams(); // Get ID from URL params for edit mode
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [revenues, setRevenues] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [debugInfo, setDebugInfo] = useState('');
  const [existingRecords, setExistingRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  
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

  // Fetch record for editing if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchRecordForEdit(id);
    }
  }, [isEditMode, id]);

  const fetchRecordForEdit = async (recordId) => {
    try {
      setLoading(true);
      console.log('Fetching record for edit, ID:', recordId);
      
      const response = await api.get(`/BudgetRevenue/GetRevenueCostById/${recordId}`);
      const record = response.data;
      
      console.log('Fetched record:', record);
      
      setEditingRecord(record);
      setDepartmentName(record.department);
      setSelectedYear(record.year);
      setSelectedMonth(record.month);
      
      // Set form data with the existing value
      setFormData({
        [record.revenueId]: record.revenueCost.toString()
      });
      
    } catch (err) {
      console.error('Error fetching record for edit:', err);
      setError('فشل في تحميل البيانات للتعديل');
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات للتعديل',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Fetch existing records for the selected year/month/department
  useEffect(() => {
    if (!isEditMode && departmentName && selectedYear && selectedMonth) {
      fetchExistingRecords();
    }
  }, [departmentName, selectedYear, selectedMonth, isEditMode]);

  const fetchExistingRecords = async () => {
    try {
      console.log('Fetching existing records...');
      const response = await api.get('/BudgetRevenue/GetAllRevenuesCost', {
        params: {
          page: 1,
          pageSize: 1000 // Get all records
        }
      });
      
      const allRecords = response.data.revenues || [];
      const filteredRecords = allRecords.filter(record => 
        record.department === departmentName &&
        record.year === selectedYear &&
        record.month === selectedMonth
      );
      
      console.log('Existing records for this period:', filteredRecords);
      setExistingRecords(filteredRecords);
      
      // Pre-populate form with existing values
      const existingFormData = {};
      filteredRecords.forEach(record => {
        existingFormData[record.revenueId] = record.revenueCost.toString();
      });
      setFormData(existingFormData);
      
    } catch (err) {
      console.error('Error fetching existing records:', err);
    }
  };

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
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setDebugInfo('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Is Edit Mode:', isEditMode);
    console.log('Form data:', formData);
    console.log('Department:', departmentName);
    console.log('Year:', selectedYear, typeof selectedYear);
    console.log('Month:', selectedMonth, typeof selectedMonth);
    console.log('Revenues:', revenues);

    try {
      if (isEditMode) {
        // Handle single record update
        await handleUpdateRecord();
      } else {
        // Handle multiple records add/update
        await handleBulkAddUpdate();
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

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    const revenueId = editingRecord.revenueId;
    const cost = formData[revenueId];

    if (cost == null || cost === '') {
      setError('يجب إدخال قيمة التكلفة');
      return;
    }

    const updateData = {
      RevenueId: parseInt(revenueId),
      Department: departmentName?.trim() || '',
      RevenueCost: parseFloat(cost),
      Year: parseInt(selectedYear),
      Month: parseInt(selectedMonth),
      Notes: "تم التحديث من الواجهة",
    };

    console.log('Updating record with data:', updateData);

    try {
      const response = await api.put(`/BudgetRevenue/UpdateRevenueCost/${editingRecord.id}`, updateData);
      console.log('✅ Update Success:', response.data);

      setSuccess('تم تحديث التكلفة بنجاح!');
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث التكلفة بنجاح',
        type: 'success'
      });

      // Navigate back after successful update
      setTimeout(() => {
        navigate('/RevenueList'); // Adjust path as needed
      }, 2000);

    } catch (error) {
      console.error('❌ Update Error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.Error || 'فشل في التحديث';
      setError(errorMsg);
      setDebugInfo(JSON.stringify(error.response?.data, null, 2));

      toast({
        title: 'فشل التحديث',
        description: errorMsg,
        type: 'error'
      });
    }
  };

  const handleBulkAddUpdate = async () => {
    const submissions = [];
    const duplicateEntries = [];
    
    for (const revenue of revenues) {
      const cost = formData[revenue.id];
      if (cost != null && cost !== '') {
        // Check if this is an update to an existing record
        const existingRecord = existingRecords.find(r => r.revenueId === revenue.id);
        
        const submissionData = {
          RevenueId: parseInt(revenue.id),
          Department: departmentName?.trim() || '',
          RevenueCost: parseFloat(cost),
          Year: parseInt(selectedYear),
          Month: parseInt(selectedMonth),
          Notes: existingRecord ? "تم التحديث من الواجهة" : "تمت الإضافة من الواجهة",
        };

        console.log(`\n--- ${existingRecord ? 'Updating' : 'Adding'} for ${revenue.revenueName} ---`);
        console.log('Submission data:', submissionData);

        try {
          let response;
          if (existingRecord) {
            // Update existing record
            response = await api.put(`/BudgetRevenue/UpdateRevenueCost/${existingRecord.id}`, submissionData);
            console.log('✅ Update Success:', response.data);
          } else {
            // Add new record
            response = await api.post('/BudgetRevenue/AddRevenueCost', submissionData);
            console.log('✅ Add Success:', response.data);
          }

          submissions.push({
            revenue: revenue.revenueName,
            status: 'success',
            action: existingRecord ? 'updated' : 'added',
            response: response.data
          });

        } catch (error) {
          console.error('❌ Error:', error);

          submissions.push({
            revenue: revenue.revenueName,
            status: 'error',
            action: existingRecord ? 'update' : 'add',
            response: error.response?.data || error.message
          });
        }
      }
    }

    console.log('=== SUBMISSION SUMMARY ===');
    console.log('All submissions:', submissions);

    const successful = submissions.filter(s => s.status === 'success');
    const failed = submissions.filter(s => s.status === 'error');

    // Handle results
    if (successful.length > 0 && failed.length === 0) {
      const addedCount = successful.filter(s => s.action === 'added').length;
      const updatedCount = successful.filter(s => s.action === 'updated').length;
      
      let message = '';
      if (addedCount > 0 && updatedCount > 0) {
        message = `تمت إضافة ${addedCount} وتحديث ${updatedCount} تكاليف بنجاح!`;
      } else if (addedCount > 0) {
        message = `تمت إضافة ${addedCount} تكاليف بنجاح!`;
      } else {
        message = `تم تحديث ${updatedCount} تكاليف بنجاح!`;
      }
      
      setSuccess(message);
      
      toast({
        title: 'تمت العملية بنجاح',
        description: message,
        type: 'success'
      });

      // Refresh existing records
      fetchExistingRecords();

    } else if (successful.length > 0 && failed.length > 0) {
      const errorMessages = failed.map(f => 
        `${f.revenue}: ${JSON.stringify(f.response)}`
      ).join('\n');
      setError(`تمت معالجة ${successful.length} تكاليف، وفشل ${failed.length} تكاليف`);
      setDebugInfo(`التفاصيل:\n${errorMessages}`);

      toast({
        title: 'تمت العملية جزئياً',
        description: `تمت معالجة ${successful.length} تكاليف بنجاح، وفشل ${failed.length} تكاليف`,
        type: 'warning'
      });

    } else if (failed.length > 0) {
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
      toast({
        title: 'تنبيه',
        description: 'لم يتم إدخال أي بيانات',
        type: 'info'
      });
    }
  };

  const getFieldStatus = (revenueId) => {
    const existingRecord = existingRecords.find(r => r.revenueId === revenueId);
    if (existingRecord) {
      const currentValue = formData[revenueId];
      const originalValue = existingRecord.revenueCost.toString();
      return currentValue !== originalValue ? 'modified' : 'existing';
    }
    return formData[revenueId] ? 'new' : 'empty';
  };

  const getFieldClassName = (revenueId) => {
    const status = getFieldStatus(revenueId);
    let baseClass = "form-control";
    
    switch (status) {
      case 'existing':
        return `${baseClass} border-info`; // Blue border for existing
      case 'modified':
        return `${baseClass} border-warning`; // Orange border for modified
      case 'new':
        return `${baseClass} border-success`; // Green border for new
      default:
        return baseClass;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavMenu />
      <main className="flex-fill container my-4">
        <div className="contract-form-container">
          <h2>
            {isEditMode ? 'تعديل تكلفة الإيراد' : `إضافة تكاليف الإيرادات لقسم ${departmentName}`}
          </h2>

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

          {!isEditMode && existingRecords.length > 0 && (
            <div className="alert alert-info">
              <strong>تنبيه:</strong> توجد بيانات مسجلة مسبقاً لهذه الفترة. 
              <br />
              <small>
                الحقول الزرقاء: بيانات موجودة | 
                الحقول البرتقالية: تم تعديلها | 
                الحقول الخضراء: بيانات جديدة
              </small>
            </div>
          )}

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
                disabled={isEditMode}
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
                disabled={isEditMode}
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
              <input
                type="text"
                className="form-control"
                value={departmentName}
                onChange={(e) => {
                  console.log('Department changed to:', e.target.value);
                  setDepartmentName(e.target.value);
                }}
                placeholder="اسم القسم"
                disabled={isEditMode}
                readOnly={!isEditMode}
                required
              />
            </div>

            {isEditMode ? (
              // Edit mode - show only the specific revenue being edited
              editingRecord && (
                <div className="col-12">
                  <hr />
                  <h5 className="mt-2 text-center font-bold">تعديل التكلفة</h5>
                  <div className="row justify-content-center">
                    <div className="col-md-6">
                      <label className="form-label">
                        {revenues.find(r => r.id === editingRecord.revenueId)?.revenueName || 'الإيراد'}
                      </label>
                      <input
                        type="number"
                        className="form-control border-warning"
                        min="0"
                        step="0.01"
                        value={formData[editingRecord.revenueId] || ''}
                        onChange={(e) => {
                          console.log(`Revenue ${editingRecord.revenueId} changed to:`, e.target.value);
                          handleChange(editingRecord.revenueId, e.target.value);
                        }}
                        placeholder="أدخل قيمة التكلفة"
                        required
                      />
                      <small className="text-muted">
                        القيمة الأصلية: {editingRecord.revenueCost}
                      </small>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Add/bulk edit mode - show all revenues
              <>
                <hr />
                <h5 className="mt-2 text-center font-bold">الايرادات التشغيلية</h5>
                <div className="row">
                  {revenues
                    .filter(rev => rev.revenueName !== "الايرادات الاستثمارية")
                    .map(rev => (
                      <div key={rev.id} className="col-md-6">
                        <label className="form-label">
                          {rev.revenueName}
                          {getFieldStatus(rev.id) === 'existing' && <span className="badge bg-info ms-2">موجود</span>}
                          {getFieldStatus(rev.id) === 'modified' && <span className="badge bg-warning ms-2">تم التعديل</span>}
                          {getFieldStatus(rev.id) === 'new' && <span className="badge bg-success ms-2">جديد</span>}
                        </label>
                        <input
                          type="number"
                          className={getFieldClassName(rev.id)}
                          min="0"
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
                        <label className="form-label">
                          {rev.revenueName}
                          {getFieldStatus(rev.id) === 'existing' && <span className="badge bg-info ms-2">موجود</span>}
                          {getFieldStatus(rev.id) === 'modified' && <span className="badge bg-warning ms-2">تم التعديل</span>}
                          {getFieldStatus(rev.id) === 'new' && <span className="badge bg-success ms-2">جديد</span>}
                        </label>
                        <input
                          type="number"
                          className={getFieldClassName(rev.id)}
                          min="0"
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
              </>
            )}

            <div className="col-12">
              <button 
                type="submit" 
                className={`btn ${isEditMode ? 'btn-warning' : 'btn-success'}`}
                disabled={loading || revenues.length === 0}
              >
                {loading 
                  ? (isEditMode ? 'جارٍ التحديث...' : 'جارٍ الإضافة...') 
                  : (isEditMode ? 'تحديث التكلفة' : 'حفظ التكاليف')
                }
              </button>
              
              {isEditMode && (
                <button 
                  type="button" 
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate('/RevenueList')}
                  disabled={loading}
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}