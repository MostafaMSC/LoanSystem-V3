import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';

const toast = ({ title, description }) => {
  toastify(
    <div>
      <strong>{title}</strong>
      <div>{description}</div>
    </div>,
    {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
};

export default function EditLoan() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    LoanName: '',
    Budget: '',
    Loan_Type: '',
    Currency: '',
    BenfitDep: '',
    Gate: '',
    DepartmentId: '',
    ChapterId: '',
    ObjectId: '',
    GateType: '',
    InvestType: '',
    ProjectType: '',
    Location: '',
    District: '',
    Subdistrict: '',
    GPS_X: '',
    GPS_Y: '',
    ProjectTarget: '',
    ProjectDescription: '',
    PutYear: '',
    NoYearTOComplete: '',
    ActualFinishYear: '',
    SerialNo: '',
    ChangedBudget: '',
    FinalTotalBudget: '',
    CustomizeAnnualId: '',
    customizeannual: '',
    ActualAnnualId: '',
    actualannual: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!id) {
      setError('معرف القرض غير صحيح');
      return;
    }

    const fetchLoan = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get(`/Loan/GetLoan/${id}`);
        const data = response.data?.data || response.data;

        if (!data || Object.keys(data).length === 0) {
          throw new Error('No loan data found.');
        }

        // Convert all values to strings to prevent controlled/uncontrolled input issues
        setFormData({
          LoanName: String(data.loanName || ''),
          Loan_Type: String(data.loan_Type || ''),
          Budget: String(data.budget || ''),
          Currency: String(data.currency || ''),
          BenfitDep: String(data.benfitDep || ''),
          Gate: String(data.gate || ''),
          DepartmentId: String(data.departmentId || ''),
          ChapterId: String(data.chapterId || ''),
          ObjectId: String(data.objectId || ''),
          GateType: String(data.gateType || ''),
          InvestType: String(data.investType || ''),
          ProjectType: String(data.projectType || ''),
          Location: String(data.location || ''),
          District: String(data.district || ''),
          Subdistrict: String(data.subdistrict || ''),
          GPS_X: String(data.gps_x || ''),
          GPS_Y: String(data.gps_y || ''),
          ProjectTarget: String(data.projectTarget || ''),
          ProjectDescription: String(data.projectDescription || ''),
          PutYear: String(data.putYear || ''),
          NoYearTOComplete: String(data.noYearToComplete || ''),
          ActualFinishYear: String(data.actualFinishYear || ''),
          SerialNo: String(data.serialNo || ''),
          ChangedBudget: String(data.changedBudget || ''),
          FinalTotalBudget: String(data.finalTotalBudget || ''),
          CustomizeAnnualId: String(data.customizeAnnualId || ''),
          customizeannual: String(data.customizeannual || ''),
          ActualAnnualId: String(data.actualAnnualId || ''),
          actualannual: String(data.actualannual || ''),
        });
      } catch (err) {
        console.error('Error fetching loan:', err);
        setError(err.response?.data?.message || err.message || 'فشل تحميل بيانات القرض.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when user starts editing
    if (success) {
      setSuccess('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.LoanName.trim()) {
      errors.LoanName = 'اسم القرض مطلوب';
    }
    
    if (!formData.Loan_Type) {
      errors.Loan_Type = 'نوع القرض مطلوب';
    }
    
    if (!formData.Budget || isNaN(Number(formData.Budget)) || Number(formData.Budget) <= 0) {
      errors.Budget = 'الميزانية يجب أن تكون رقم صحيح أكبر من صفر';
    }
    
    if (!formData.Currency.trim()) {
      errors.Currency = 'العملة مطلوبة';
    }
    
    // Validate numeric fields if they have values
    const numericFields = ['Gate', 'DepartmentId', 'ChapterId', 'ObjectId', 'GateType', 'InvestType', 'SerialNo', 'PutYear', 'NoYearTOComplete', 'ActualFinishYear'];
    numericFields.forEach(field => {
      if (formData[field] && (isNaN(Number(formData[field])) || Number(formData[field]) < 0)) {
        errors[field] = `${field} يجب أن يكون رقم صحيح`;
      }
    });
    
    // Validate year fields
    const currentYear = new Date().getFullYear();
    if (formData.PutYear && (Number(formData.PutYear) < 1900 || Number(formData.PutYear) > currentYear + 10)) {
      errors.PutYear = 'سنة الإدراج غير صحيحة';
    }
    
    if (formData.ActualFinishYear && (Number(formData.ActualFinishYear) < 1900 || Number(formData.ActualFinishYear) > currentYear + 50)) {
      errors.ActualFinishYear = 'سنة الانتهاء الفعلية غير صحيحة';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for API - convert numeric fields back to numbers and handle enums
      const dataToSubmit = {
        LoanName: formData.LoanName.trim(),
        Loan_Type: Number(formData.Loan_Type),
        Budget: Number(formData.Budget),
        Currency: formData.Currency.trim(),
        BenfitDep: formData.BenfitDep.trim() || null,
        Gate: formData.Gate ? Number(formData.Gate) : null,
        DepartmentId: formData.DepartmentId ? Number(formData.DepartmentId) : null,
        ChapterId: formData.ChapterId ? Number(formData.ChapterId) : null,
        ObjectId: formData.ObjectId ? Number(formData.ObjectId) : null,
        GateType: formData.GateType ? Number(formData.GateType) : null,
        InvestType: formData.InvestType ? Number(formData.InvestType) : null,
        ProjectType: formData.ProjectType ? Number(formData.ProjectType) : null,
        Location: formData.Location.trim() || null,
        District: formData.District.trim() || null,
        Subdistrict: formData.Subdistrict.trim() || null,
        GPS_X: formData.GPS_X ? Number(formData.GPS_X) : null,
        GPS_Y: formData.GPS_Y ? Number(formData.GPS_Y) : null,
        ProjectTarget: formData.ProjectTarget.trim() || null,
        ProjectDescription: formData.ProjectDescription.trim() || null,
        PutYear: formData.PutYear ? Number(formData.PutYear) : null,
        NoYearTOComplete: formData.NoYearTOComplete ? Number(formData.NoYearTOComplete) : null,
        ActualFinishYear: formData.ActualFinishYear ? Number(formData.ActualFinishYear) : null,
        SerialNo: formData.SerialNo ? Number(formData.SerialNo) : null,
        ChangedBudget: formData.ChangedBudget ? Number(formData.ChangedBudget) : null,
        FinalTotalBudget: formData.FinalTotalBudget ? Number(formData.FinalTotalBudget) : null,
        CustomizeAnnualId: formData.CustomizeAnnualId ? Number(formData.CustomizeAnnualId) : null,
        customizeannual: formData.customizeannual.trim() || null,
        ActualAnnualId: formData.ActualAnnualId ? Number(formData.ActualAnnualId) : null,
        actualannual: formData.actualannual.trim() || null,
      };

      // Remove null/empty values to avoid serialization issues
      Object.keys(dataToSubmit).forEach(key => {
        if (dataToSubmit[key] === null || dataToSubmit[key] === '' || dataToSubmit[key] === undefined) {
          delete dataToSubmit[key];
        }
      });

      // Debug: Log the data being sent
      console.log('Data being sent to API:', JSON.stringify(dataToSubmit, null, 2));

      await api.put(`/Loan/UpdateLoan/${id}`, dataToSubmit);
      
      toast({ 
        title: 'تم التعديل بنجاح', 
        description: `تم تحديث القرض: ${formData.LoanName}` 
      });
      
      setSuccess('تم تحديث بيانات القرض بنجاح.');
      
      // Optional: Navigate back after successful update
       setTimeout(() => navigate(-1), 2000);
      
    } catch (err) {
      console.error('Error updating loan:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'حدث خطأ أثناء حفظ القرض.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle ASP.NET Core validation problem details
        if (errorData.errors) {
          const validationErrors = [];
          Object.keys(errorData.errors).forEach(field => {
            const fieldErrors = errorData.errors[field];
            validationErrors.push(`${field}: ${fieldErrors.join(', ')}`);
          });
          errorMessage = `أخطاء التحقق: ${validationErrors.join(' | ')}`;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('هل أنت متأكد من الإلغاء؟ ستفقد جميع التغييرات غير المحفوظة.')) {
      navigate(-1);
    }
  };

  const renderInput = (label, name, type = 'text', required = false) => (
    <div className="col-md-4 mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control ${validationErrors[name] ? 'is-invalid' : ''}`}
        value={formData[name] || ''}
        onChange={handleChange}
        required={required}
        disabled={isSaving}
      />
      {validationErrors[name] && (
        <div className="invalid-feedback">{validationErrors[name]}</div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <NavMenu />
        <main className="flex-fill container my-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل بيانات القرض...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavMenu />
      <main className="flex-fill container my-4" dir="rtl">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>تعديل قرض</h2>
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              عودة
            </button>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {success}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccess('')}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">
              {renderInput('اسم القرض', 'LoanName', 'text', true)}
              
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  نوع القرض <span className="text-danger">*</span>
                </label>
                <select
                  name="Loan_Type"
                  className={`form-select ${validationErrors.Loan_Type ? 'is-invalid' : ''}`}
                  value={formData.Loan_Type}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                >
                  <option value="">اختر النوع</option>
                  <option value="1">قرض خارجي</option>
                  <option value="2">قرض داخلي</option>
                  <option value="3">منحة</option>
                </select>
                {validationErrors.Loan_Type && (
                  <div className="invalid-feedback">{validationErrors.Loan_Type}</div>
                )}
              </div>
              
              {renderInput('الميزانية', 'Budget', 'number', true)}
              {renderInput('العملة', 'Currency', 'text', true)}
              {renderInput('الجهة المستفيدة من المشروع', 'BenfitDep')}
              {renderInput('الباب', 'Gate', 'number')}
              {renderInput('القسم', 'DepartmentId', 'number')}
              {renderInput('الفصل', 'ChapterId', 'number')}
              {renderInput('المادة', 'ObjectId', 'number')}
              {renderInput('النوع', 'GateType', 'number')}
              {renderInput('نوع الاستثمار', 'InvestType', 'number')}
              
              <div className="col-md-4 mb-3">
                <label className="form-label">نوع المشروع</label>
                <select
                  name="ProjectType"
                  className="form-select"
                  value={formData.ProjectType}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value={0}>-- اختر نوع المشروع --</option>
                <option value={1}>مستمر</option>
                <option value={2}>جديد</option>
                <option value={3}>مستحدث</option>
                <option value={4}>إعادة ادراج</option>
                </select>
              </div>
              
              {renderInput('التسلسل', 'SerialNo', 'number')}
              {renderInput('الموقع', 'Location','text',true)}
              {renderInput('الحي', 'District')}
              {renderInput('البلدية', 'Subdistrict')}
              {renderInput('GPS_X', 'GPS_X', 'number')}
              {renderInput('GPS_Y', 'GPS_Y', 'number')}

              <div className="col-md-6 mb-3">
                <label className="form-label">الهدف من المشروع</label>
                <textarea
                  name="ProjectTarget"
                  className="form-control"
                  value={formData.ProjectTarget || ''}
                  onChange={handleChange}
                  rows="3"
                  disabled={isSaving}
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label">وصف المشروع</label>
                <textarea
                  name="ProjectDescription"
                  className="form-control"
                  value={formData.ProjectDescription || ''}
                  onChange={handleChange}
                  rows="3"
                  disabled={isSaving}
                />
              </div>
              
              {renderInput('سنة الإدراج', 'PutYear', 'number')}
              {renderInput('عدد السنوات التنفيذ للمشروع', 'NoYearTOComplete', 'number')}
              {renderInput('تاريخ الانجاز الفعلي للمشروع', 'ActualFinishYear', 'number')}
              {renderInput('مقدار التغيير في الكلفة الكلية للمشروع', 'ChangedBudget', 'number')}
              {renderInput('إجمالي الميزانية النهائية', 'FinalTotalBudget', 'number')}
              {renderInput('معرف السنة المخصصة', 'CustomizeAnnualId', 'number')}
              {renderInput('السنة المخصصة', 'customizeannual')}
              {renderInput('معرف السنة الفعلية', 'ActualAnnualId', 'number')}
              {renderInput('السنة الفعلية', 'actualannual')}

              <div className="col-12 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSaving}
                  style={{width: '100%'}}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      جارٍ الحفظ...
                    </>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}