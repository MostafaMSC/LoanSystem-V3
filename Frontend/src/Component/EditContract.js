import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';

const CONTRACT_TYPES = [
  { id: '1', label: 'استشاري' },
  { id: '2', label: 'تجهيز' },
  { id: '3', label: 'اعمال' },
  { id: '4', label: 'اخرى' }
];
const State_TYPES = [
  { id: '1', Status: 'مستمر' },
  { id: '2', Status: 'منجز' },
];

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

export default function EditContract({ contractId, onClose  }) {
  const navigate = useNavigate();
  // const { id } = useParams();
  const id = contractId;
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState('');

  const [formData, setFormData] = useState({
  ContractNumber: '',
  ContractName: '',
  ContractType: '',
  CompanyName: '',
  Status: '',
  LoanId: '',
  ContractSigningDate: '',
  StartDate: '',
  CompleteDate: '',
  DurationInDays: '',
  AddedDays: '',
  ContractAmount: '',
  CostPlanMins: '',
  CostAfterChange: '',
  CostToNatiBank: '',
  TotalCostPaid: '',
  OperationLoanCost: '',
  CashPaid: '',
  TaxesAndBlockedmoney: '',
  PrivateMoneyPaid: '',
  Notes: '',

  // ✅ الحقول الجديدة
  InsuranceDeposits: '',
  TaxTrusts: '',
  Penalties: '',
  OtherTrusts: ''
});


  const [validationErrors, setValidationErrors] = useState({});

  // Helper function to get loan name by ID
  const getLoanNameById = (loanId) => {
    if (!loanId || !loans.length) return '';
    const loan = loans.find(loan => (loan.id || loan.ID) == loanId);
    return loan ? (loan.loanName || loan.LoanName || loan.name || loan.Name) : '';
  };

  // Fetch loans & contract data if editing
  useEffect(() => {
    const fetchLoans = async () => {
      setLoansLoading(true);
      try {
        const response = await api.get('/Loan/GetAllLoans');
        setLoans(response.data?.loans || []);

      } catch (err) {
        setLoansError('فشل تحميل قائمة القروض');
        console.error('Error fetching loans:', err);
      } finally {
        setLoansLoading(false);
      }
    };

    const fetchContract = async () => {
      if (!isEditMode) return;

      setIsLoading(true);
      try {
        const response = await api.get(`/Contracts/GetContract/${id}`);
        let contractData;

        if (response.data?.data) contractData = response.data.data;
        else if (response.data?.contract) contractData = response.data.contract;
        else contractData = response.data;

        if (!contractData || Object.keys(contractData).length === 0) {
          throw new Error('No contract data was returned from the API');
        }

        // Normalize keys (case insensitive)
        const normalizedData = {};
        Object.keys(formData).forEach((key) => {
          const matchKey = Object.keys(contractData).find(
            (k) => k.toLowerCase() === key.toLowerCase()
          );
          if (matchKey) normalizedData[key] = contractData[matchKey];
        });

        // Format date fields for date inputs
        ['ContractSigningDate', 'StartDate', 'CompleteDate'].forEach((dateField) => {
          if (normalizedData[dateField]) {
            const d = new Date(normalizedData[dateField]);
            if (!isNaN(d)) normalizedData[dateField] = d.toISOString().split('T')[0];
          }
        });

        setFormData((prev) => ({ ...prev, ...normalizedData }));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'فشل تحميل بيانات العقد.');
        console.error('Error fetching contract:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
    fetchContract();
  }, [id, isEditMode]);

  // Handle input change & clear validation error for the field
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
     setFormData((prev) => ({
    ...prev,
    [name]: [ 'ContractType'].includes(name) ? Number(value) : value,
  }));
    
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.ContractNumber.trim()) errors.ContractNumber = 'رقم العقد مطلوب';
    if (!formData.ContractName.trim()) errors.ContractName = 'اسم العقد مطلوب';

    // Numeric fields validation (should be numbers >= 0)
    const numericFields = [
  'ContractAmount',
  'CostPlanMins',
  'CostAfterChange',
  'CostToNatiBank',
  'TotalCostPaid',
  'OperationLoanCost',
  'CashPaid',
  'TaxesAndBlockedmoney',
  'PrivateMoneyPaid',
  'DurationInDays',
  'AddedDays',

  // ✅ الحقول الجديدة
  'InsuranceDeposits',
  'TaxTrusts',
  'Penalties',
  'OtherTrusts'
];

    numericFields.forEach((field) => {
      if (formData[field] && (isNaN(Number(formData[field])) || Number(formData[field]) < 0)) {
        errors[field] = 'يجب أن تكون القيمة رقمية وغير سالبة';
      }
    });

    // Date validation
    if (formData.StartDate && formData.CompleteDate) {
      const start = new Date(formData.StartDate);
      const complete = new Date(formData.CompleteDate);
      if (start > complete) {
        errors.CompleteDate = 'تاريخ الإنجاز يجب أن يكون بعد تاريخ المباشرة';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) {
      setError('يرجى تصحيح الأخطاء في النموذج قبل الإرسال.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/Contracts/UpdateContract/${id}`, formData);
        const loanName = getLoanNameById(formData.LoanId);
        toast({
          title: 'تمت التعديل بنجاح',
          description: `${formData.ContractName} تمت تعديل العقد باسم الشركة ${formData.CompanyName}${loanName ? ` - القرض: ${loanName}` : ''}`,
        });
        setSuccess('تم تحديث العقد بنجاح!');
            onClose(true);  

      } else {
        const response = await api.post('/Contracts/AddContract', formData);
        setSuccess('تم إضافة العقد بنجاح!');
        if (response.data?.id) {
          setTimeout(() => navigate(`/EditContract/${response.data.id}`), 1500);
              onClose(true);  

        }
        
      }
    } catch (err) {
      console.error('Error saving contract:', err);
      setError(
        err.response?.status === 401
          ? 'غير مصرح - الرجاء تسجيل الدخول.'
          : err.response?.data?.message || 'حدث خطأ أثناء حفظ العقد.'
      );
    } finally {
      setIsSaving(false);
      
    }
  };

  const handleCancel = () => onClose();

  // Input renderer helper
  const renderInput = (label, name, type = 'text', required = false) => (
    <div className="col-md-4 mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control ${validationErrors[name] ? 'is-invalid' : ''}`}
        value={formData[name] ?? ''}
        onChange={handleChange}
        required={required}
      />
      {validationErrors[name] && <div className="invalid-feedback">{validationErrors[name]}</div>}
    </div>
  );

  if (isLoading)
    return (
      <div className="d-flex flex-column min-vh-100">
        <NavMenu />
        <main className="flex-fill container my-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* <NavMenu /> */}
      <main className="flex-fill container my-4">
        <div className="card contract-form-container">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{isEditMode ? 'تعديل عقد' : 'إضافة عقد جديد'}</h2>

          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                {renderInput('رقم العقد', 'ContractNumber', 'text', true)}
                {renderInput('اسم العقد', 'ContractName', 'text', true)}

                <div className="col-md-4 mb-3">
                  <label className="form-label">نوع العقد</label>
                  <select
                    name="ContractType"
                    className="form-select"
                    value={formData.ContractType}
                    onChange={handleChange}
                    
                  >
                    
                    <option value="">-- اختر نوع العقد --</option>
                    {CONTRACT_TYPES.map(({ id, label }) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {renderInput('اسم الشركة', 'CompanyName')}
                                <div className="col-md-4 mb-3">
                  <label className="form-label">حالة العقد</label>
                  <select
                    name="Status"
                    className="form-select"
                    value={formData.Status}
                    onChange={handleChange}
                  >
                    <option value="">-- اختر حالة العقد --</option>
                    {State_TYPES.map(({ id, Status }) => (
                      <option key={id} value={id}>
                        {Status}
                      </option>
                    ))}
                  </select>
                </div>

                
                <div className="col-md-4 mb-3">
                  <label className="form-label">القرض</label>
                  <select
                    name="LoanId"
                    className="form-select"
                    value={formData.LoanId}
                    onChange={handleChange}
                    disabled={loansLoading}
                  >
                    <option value="">-- اختر القرض --</option>
                    {loans.map((loan) => (
                      <option key={loan.id || loan.ID} value={loan.id || loan.ID}>
                        {loan.loanName || loan.LoanName || loan.name || loan.Name}
                      </option>
                    ))}
                  </select>
                  {loansError && <small className="text-danger">{loansError}</small>}
                  {/* Display selected loan name */}
                  {formData.LoanId && (
                    <small className="text-muted d-block mt-1">
                      القرض المختار: {getLoanNameById(formData.LoanId)}
                    </small>
                  )}
                </div>

                {renderInput('تاريخ توقيع العقد', 'ContractSigningDate', 'date')}
                {renderInput('تاريخ المباشرة', 'StartDate', 'date')}
                {renderInput('تاريخ الإنجاز', 'CompleteDate', 'date')}
                {renderInput('مدة العقد بالأيام', 'DurationInDays', 'number')}
                {renderInput('الأيام المضافة', 'AddedDays', 'number')}

                {renderInput('مبلغ العقد', 'ContractAmount', 'number')}
                {renderInput('الضمانات', 'InsuranceDeposits', 'number')}
                {renderInput('الأمانات الضريبية', 'TaxTrusts', 'number')}
                {renderInput('الغرامات', 'Penalties', 'number')}
                {renderInput('الأمانات الأخرى', 'OtherTrusts', 'number')}


                <div className="col-12 mb-3">
                  <label className="form-label">ملاحظات</label>
                  <textarea
                    name="Notes"
                    className="form-control"
                    rows="3"
                    value={formData.Notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                                    onClick={() => {
                    navigate('/contracts');
                  }}
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  إلغاء
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