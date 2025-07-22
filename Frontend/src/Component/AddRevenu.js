import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/AxiosClient';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';

const CONTRACT_TYPES = [
  { id: '1', label: 'استشاري' },
  { id: '2', label: 'تجهيز' },
  { id: '3', label: 'مشاريع' },
];
  const STATE_TYPES = [
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

export default function AddRevenu({ contractId, onClose }) {
  const navigate = useNavigate();
  const id = contractId;
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState('');

  // State for previous payments (from API)
  const [previousPayments, setPreviousPayments] = useState([]);
  const [previousPrivatePayments, setPreviousPrivatePayments] = useState([]);
  const [previousPaymentsLoading, setPreviousPaymentsLoading] = useState(false);
  const [previousPaymentsError, setPreviousPaymentsError] = useState('');
  const [showPaymentsCash, setShowPaymentsCash] = useState(false);
  const [showPaymentsPrivate, setShowPaymentsPrivate] = useState(false);
  const [cashPayments, setCashPayments] = useState([]);
  const [privatePayments, setPrivatePayments] = useState([]);
const [previousPrivatePaymentsLoading, setPreviousPrivatePaymentsLoading] = useState(false);
const [previousPrivatePaymentsError, setPreviousPrivatePaymentsError] = useState('');

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
    CostChange: '',
    CostPlanMins: '',
    CostAfterChange: '',
    CostToNatiBank: '',
    TotalCostPaid: '',
    OperationLoanCost: '',
    CashPaid: '',
    TaxesAndBlockedmoney: '',
    PrivateMoneyPaid: '',
    Notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Cash payment functions
  const addPayment = () => {
    setCashPayments(prev => [
      ...prev,
      { Amount: '', PaymentDate: '' }
    ]);
  };

  const addPrivatePayment = () => {
    setPrivatePayments(prev => [
      ...prev,
      { Amount: '', PaymentDate: '' }
    ]);
  };

  const removePayment = (index) => {
    if (cashPayments.length >= 1) {
      setCashPayments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removePrivatePayment = (index) => {
    if (privatePayments.length >= 1) {
      setPrivatePayments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePaymentField = (index, field, value) => {
    setCashPayments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updatePrivatePaymentField = (index, field, value) => {
  setPrivatePayments(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };
    return updated;
  });
};

  // Calculate total cash payments
  const totalCashPayments = cashPayments.reduce((sum, payment) => {
    const amount = parseFloat(payment.Amount) || 0;
    return sum + amount;
  }, 0);

  const totalPrivatePayments = privatePayments.reduce((sum, payment) => {
    const amount = parseFloat(payment.Amount) || 0;
    return sum + amount;
  }, 0);

  // Calculate total previous payments
    const totalPreviousPayments = previousPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount || payment.Amount) || 0;
      return sum + amount;
    }, 0);


  // Calculate total previous private payments
  const totalPreviousPrivatePayments = previousPrivatePayments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount || payment.Amount) || 0;
    return sum + amount;
  }, 0);

  // Update CashPaid in formData when payments change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      CashPaid: totalCashPayments.toString(),
      PrivateMoneyPaid: totalPrivatePayments.toString()
    }));
  }, [totalCashPayments, totalPrivatePayments]);

  // Helper function to get loan name by ID
  const getLoanNameById = (loanId) => {
    if (!loanId || !loans.length) return '';
    const loan = loans.find(loan => (loan.id || loan.ID) == loanId);
    return loan ? (loan.loanName || loan.LoanName || loan.name || loan.Name) : '';
  };

  const fetchPreviousPayments = async () => {
  if (!contractId) return;
  
  setPreviousPaymentsLoading(true);
  setPreviousPaymentsError('');
  
  try {
    const response = await api.get(`/Contracts/GetPaymentsByContractId/${contractId}`);
    console.log('Payments response:', response.data); // Debug log
    
    let paymentsData = response.data;
    
    // Handle different response structures
    if (response.data?.payments) {
      paymentsData = response.data.payments;
    } else if (response.data?.data) {
      paymentsData = response.data.data;
    } else if (Array.isArray(response.data)) {
      paymentsData = response.data;
    }
    
    if (Array.isArray(paymentsData)) {
      // Format the payments data
      const formattedPayments = paymentsData.map(payment => ({
        id: payment.id || payment.ID || payment.Id,
        amount: payment.amount || payment.Amount,
        paymentDate: payment.paymentDate || payment.PaymentDate,
        createdAt: payment.createdAt || payment.CreatedAt,
        updatedAt: payment.updatedAt || payment.UpdatedAt
      }));
      
      setPreviousPayments(formattedPayments);
    } else {
      console.warn('Unexpected payments data format:', paymentsData);
      setPreviousPayments([]);
    }
    
  } catch (err) {
    console.error("Failed to load previous payments:", err);
    setPreviousPaymentsError('فشل تحميل الدفعات السابقة');
  } finally {
    setPreviousPaymentsLoading(false);
  }
};

const fetchPreviousPrivatePayments = async () => {
  if (!contractId) return;
  
  setPreviousPrivatePaymentsLoading(true);
  setPreviousPrivatePaymentsError('');
  
  try {
    const response = await api.get(`/Contracts/GetPrivatePaymentsByContractId/${contractId}`);
    console.log('Private payments response:', response.data); // Debug log

    let paymentsData = response.data;
    
    // Handle different response structures
    if (response.data?.payments) {
      paymentsData = response.data.payments;
    } else if (response.data?.data) {
      paymentsData = response.data.data;
    } else if (Array.isArray(response.data)) {
      paymentsData = response.data;
    }
    
    if (Array.isArray(paymentsData)) {
      // Format the payments data
      const formattedPayments = paymentsData.map(payment => ({
        id: payment.id || payment.ID || payment.Id,
        amount: payment.amount || payment.Amount,
        paymentDate: payment.paymentDate || payment.PaymentDate,
        createdAt: payment.createdAt || payment.CreatedAt,
        updatedAt: payment.updatedAt || payment.UpdatedAt
      }));
      
      setPreviousPrivatePayments(formattedPayments);
    } else {
      console.warn('Unexpected private payments data format:', paymentsData);
      setPreviousPrivatePayments([]);
    }
    
  } catch (err) {
    console.error("Failed to load previous private payments:", err);
    setPreviousPrivatePaymentsError('فشل تحميل الدفعات الخاصة السابقة');
  } finally {
    setPreviousPrivatePaymentsLoading(false);
  }
};


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

        console.log('Contract data received:', contractData);

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

        setFormData(prev => ({ ...prev, ...normalizedData }));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'فشل تحميل بيانات العقد.');
        console.error('Error fetching contract:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
    fetchContract();
    fetchPreviousPayments(); // Fetch previous payments
    fetchPreviousPrivatePayments(); // Fetch previous private payments
  }, [id, isEditMode, contractId]);

  // Handle input change & clear validation error for the field
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.ContractNumber.trim()) errors.ContractNumber = 'رقم العقد مطلوب';
    if (!formData.ContractName.trim()) errors.ContractName = 'اسم العقد مطلوب';

    // Validate cash payments
    cashPayments.forEach((payment, index) => {
      if (payment.Amount && (isNaN(Number(payment.Amount)) || Number(payment.Amount) < 0)) {
        errors[`cashPayment_${index}`] = 'يجب أن يكون المبلغ رقمية وغير سالبة';
      }
    });

     privatePayments.forEach((payment, index) => {
    if (payment.Amount && (isNaN(Number(payment.Amount)) || Number(payment.Amount) < 0)) {
      errors[`privatePayment_${index}`] = 'يجب أن يكون المبلغ رقمية وغير سالبة';
    }
  });
    // Numeric fields validation (should be numbers >= 0)
    const numericFields = [
      'ContractAmount',
      'CostPlanMins',
      'CostAfterChange',
      'CostToNatiBank',
      'TotalCostPaid',
      'OperationLoanCost',
      'TaxesAndBlockedmoney',
      'PrivateMoneyPaid',
      'DurationInDays',
      'AddedDays',
      'CostChange'
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

  // Submit handler
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
    // Remove the calculated fields from formData
    const { CashPaid, PrivateMoneyPaid, ...cleanFormData } = formData;

    const submitData = {
      ...cleanFormData,
      // Use consistent property names that match backend DTO
      cashPaidPayments: cashPayments
        .filter(p => p.Amount && p.Amount !== '')
        .map(p => ({
          amount: Number(p.Amount),
          paymentDate: p.PaymentDate || null
        })),
      privatePaidPayments: privatePayments
        .filter(p => p.Amount && p.Amount !== '')
        .map(p => ({
          amount: Number(p.Amount),
          paymentDate: p.PaymentDate || null
        }))
    };

    console.log('Submitting data:', submitData); // Debug log

    if (isEditMode) {
      await api.put(`/Contracts/UpdateContract/${id}`, submitData);
      const loanName = getLoanNameById(formData.LoanId);
      toast({
        title: 'تمت التعديل بنجاح',
        description: `${formData.ContractName} تمت تعديل العقد باسم الشركة ${formData.CompanyName}${loanName ? ` - القرض: ${loanName}` : ''}`,
      });
      setSuccess('تم تحديث العقد بنجاح!');
      
      // Refresh the payments data
      await fetchPreviousPayments();
      await fetchPreviousPrivatePayments();

      // Clear new payment forms
      setCashPayments([]);
      setPrivatePayments([]);

      onClose(true);
    } else {
      const response = await api.post('/Contracts/AddContract', submitData);
      setSuccess('تم إضافة العقد بنجاح!');
      if (response.data?.id) {
        setTimeout(() => navigate(`/EditContract/${response.data.id}`), 1500);
      }
    }
  } catch (err) {
    console.error('Error saving contract:', err);
    console.error('Error response:', err.response?.data); // Debug log
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
  const renderInput = (label, name, type = 'text', required = false, additionalProps = {}) => (
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
        {...additionalProps}
      />
      {validationErrors[name] && <div className="invalid-feedback">{validationErrors[name]}</div>}
    </div>
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US');
    } catch {
      return 'Not specified';
    }
  };

  // Delete previous payment
  const deletePreviousPayment = async (paymentId) => {
    if (!paymentId) return;
    
    if (!window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      return;
    }
    
    try {
      await api.delete(`/Contracts/DeletePayment/${paymentId}`);
      
      // Remove from local state
      setPreviousPayments(prev => prev.filter(p => p.id !== paymentId));
      
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الدفعة بنجاح',
      });
      
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast({
        title: 'خطأ في الحذف',
        description: err.response?.data?.message || 'فشل في حذف الدفعة',
      });
    }
  };
  const deletePreviousPrivatePayment = async (paymentId) => {

if (!paymentId) return;
    
    if (!window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      return;
    }
    
    try {
      await api.delete(`/Contracts/DeletePrivatePayment/${paymentId}`);
      
      // Remove from local state
      setPreviousPrivatePayments(prev => prev.filter(p => p.id !== paymentId));

      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الدفعة بنجاح',
      });
      
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast({
        title: 'خطأ في الحذف',
        description: err.response?.data?.message || 'فشل في حذف الدفعة',
      });
    }
  };



  if (isLoading)
    return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-fill container my-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </main>
      </div>
    );

  return (
    <div className="d-flex flex-column min-vh-100 ">
      <main className="flex-fill container my-4">
        <div className="card contract-form-container">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{isEditMode ? 'البيانات المالية للعقد' : 'إضافة عقد جديد'}</h2>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                {renderInput('رقم العقد', 'ContractNumber', 'text', true, { readOnly: true })}
                {renderInput('اسم العقد', 'ContractName', 'text', true, { readOnly: true })}

                <div className="col-md-4 mb-3">
                  <label className="form-label">نوع العقد</label>
                  <select
                    name="ContractType"
                    className="form-select"
                    value={formData.ContractType}
                    onChange={handleChange}
                    disabled
                  >
                    <option value="">-- اختر نوع العقد --</option>
                    {CONTRACT_TYPES.map(({ id, label }) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {renderInput('اسم الشركة', 'CompanyName', 'text', false, { readOnly: true })}
                <div className="col-md-4 mb-3">
                  <label className="form-label">الحالة</label>
                  <select
                    name="Status"
                    className="form-select"
                    value={formData.Status}
                    onChange={handleChange}
                    disabled
                  >
                    <option value="">-- اختر الحالة --</option>
                    {STATE_TYPES.map(({ id, Status }) => (
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
                    disabled
                  >
                    <option value="">-- اختر القرض --</option>
                    {loans.map((loan) => (
                      <option key={loan.id || loan.ID} value={loan.id || loan.ID}>
                        {loan.loanName || loan.LoanName || loan.name || loan.Name}
                      </option>
                    ))}
                  </select>
                  {loansError && <small className="text-danger">{loansError}</small>}
                  {formData.LoanId && (
                    <small className="text-muted d-block mt-1">
                      القرض المختار: {getLoanNameById(formData.LoanId)}
                    </small>
                  )}
                </div>

                {renderInput('تاريخ توقيع العقد', 'ContractSigningDate', 'date', false, { readOnly: true })}
                {renderInput('تاريخ المباشرة', 'StartDate', 'date', false, { readOnly: true })}
                {renderInput('تاريخ الإنجاز', 'CompleteDate', 'date', false, { readOnly: true })}
                {renderInput('مدة العقد بالأيام', 'DurationInDays', 'number', false, { readOnly: true })}
                {renderInput('الأيام المضافة', 'AddedDays', 'number', false, { readOnly: true })}

                {renderInput('مبلغ العقد', 'ContractAmount', 'number', false, { readOnly: true })}
                
                <div className="col-12">
                  <h4 className="text-primary border-bottom pb-2">بيانات الايرادات</h4>
                </div>
                
                {renderInput('اوامر الغيار', 'CostChange', 'number')}
                {renderInput('كلف الادراج في وزارة التخطيط', 'CostPlanMins', 'number')}
                {renderInput('كلف العقد بعد اضافة اوامر تغير العمل', 'CostAfterChange', 'number', false, { readOnly: true })}
                {renderInput('المرفوع للبنك الدولي', 'CostToNatiBank', 'number')}
                {renderInput('المصروف التراكمي', 'TotalCostPaid', 'number')}
                {renderInput('المبالغ المصروفة كسلفة تشغيلية 10 %', 'OperationLoanCost', 'number')}


<div className='border-bottom d-flex justify-content-between'>
<h6 
  className={`ChangeBg pb-2 ${showPaymentsCash ? 'text-danger' : 'text-info'}`}
  style={{ cursor: 'pointer' }}
  onClick={() => setShowPaymentsCash(prev => !prev)}
>
  {showPaymentsCash ? 'إخفاء الدفعات النقدية' : 'الاطلاع على الدفعات النقدية السابقة'}
</h6>

<h6 
  className={`ChangeBg pb-2 ${showPaymentsPrivate ? 'text-danger' : 'text-info'}`}
  style={{ cursor: 'pointer' }}
  onClick={() => setShowPaymentsPrivate(prev => !prev)}
>
  {showPaymentsPrivate ? 'إخفاء الدفعات الخاصة' : 'الاطلاع على الدفعات الخاصة السابقة'}
</h6>

  </div>

                <div className="col-12 mb-4">
                  { showPaymentsCash && (
                  <h5 className="text-info border-bottom pb-2">
                  الدفعات المالية السابقة كاش
                    {previousPayments.length > 0 && showPaymentsCash && (
                      <span className="badge bg-info p-1 m-2">
                        {previousPayments.length} دفعة
                      </span>
                    )}
                  </h5>
                  )}
                  {previousPaymentsLoading && showPaymentsCash && (
                    <div className="text-center p-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                      </div>
                      <span className="ms-2">جاري تحميل الدفعات السابقة...</span>
                    </div>
                  )}
                  
                  {previousPaymentsError && showPaymentsCash  && (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle"></i> {previousPaymentsError}
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={fetchPreviousPayments}
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  )}
                  
                  {!previousPaymentsLoading && !previousPaymentsError && previousPayments.length === 0 && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle"></i> لا توجد دفعات نقدية سابقة مسجلة لهذا العقد
                    </div>
                  )}
                  
                  {previousPayments.length > 0  && showPaymentsCash && (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>المبلغ</th>
                            <th>تاريخ الدفع</th>
                            <th>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previousPayments.map((payment, index)  => (
                            <tr key={payment.id || index}>
                              <td>{index + 1}</td>
                              <td>
                                <span className="text-success fw-bold">
                                  {parseFloat(payment.amount).toLocaleString()} دينار
                                </span>
                              </td>
                              <td>{formatDate(payment.paymentDate)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm p-0 w-50"
                                  onClick={() => deletePreviousPayment(payment.id)}
                                  title="حذف الدفعة"
                                >
                                  <i className="bi bi-trash"></i> حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th colSpan="1">المجموع:</th>
                            <th className="text-success">
                              {totalPreviousPayments.toLocaleString()} دينار
                            </th>
                            <th colSpan="3"></th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
                
                  <div className="col-12 mb-3">
                    {showPaymentsCash && (
                    <h5 className="text-secondary border-bottom pb-2">
                      إضافة دفعات نقدية جديدة
                      {cashPayments.filter(p => p.Amount).length > 0 && (
                        <span className="badge bg-success ms-2">
                        {cashPayments.filter(p => p.Amount).length} دفعة جديدة
                      </span>
                    )}
                  </h5>)
                    }
  
                  
                  {cashPayments.map((payment, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">المبلغ</label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors[`cashPayment_${index}`] ? 'is-invalid' : ''}`}
                            value={payment.Amount}
                            onChange={(e) => updatePaymentField(index, 'Amount', e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="أدخل المبلغ"
                          />
                          {validationErrors[`cashPayment_${index}`] && (
                            <div className="invalid-feedback">{validationErrors[`cashPayment_${index}`]}</div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">تاريخ الدفع</label>
                          <input
                            type="date"
                            className="form-control"
                            value={payment.PaymentDate}
                            onChange={(e) => updatePaymentField(index, 'PaymentDate', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removePayment(index)}
                          >
                            حذف
                          </button>
                          {payment.Amount && (
                            <span className="ms-2 badge bg-info">
                              {parseFloat(payment.Amount).toLocaleString()} دينار
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
{showPaymentsCash && (
  <div>
    <button
      type="button"
      className="btn btn-outline-success mb-3"
      onClick={addPayment}
    >
      ➕ إضافة دفعة نقدية
    </button>

    <div className="alert alert-info">
      <strong>إجمالي الدفعات الجديدة: </strong>
      <span className="text-success fs-5">
        {totalCashPayments.toLocaleString()} دينار
      </span>

      {cashPayments.filter(p => p.Amount).length > 0 && (
        <small className="d-block text-muted mt-2">
          عدد الدفعات الجديدة: {cashPayments.filter(p => p.Amount).length}
        </small>
      )}
    </div>
  </div>
)}


                  {showPaymentsCash && (
                    <div className="alert alert-info">
                      <h6 className="alert-heading">ملخص إجمالي الدفعات النقدية</h6>
                      <div className="row">
                        <div className="col-md-4">
                          <strong>الدفعات النقدية السابقة:</strong> {totalPreviousPayments.toLocaleString()} دينار
                        </div>
                        <div className="col-md-4">
                          <strong>الدفعات النقدية الجديدة:</strong> {totalCashPayments.toLocaleString()} دينار
                        </div>
                        <div className="col-md-4">
                          <strong>المجموع الكلي:</strong>
                          <span className="text-success fs-5 ms-1">
                            {(totalPreviousPayments + totalCashPayments).toLocaleString()} دينار
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                </div>



<div className="col-12 mb-4">
  {showPaymentsPrivate && (
    <h5 className="text-info border-bottom pb-2">
      الدفعات المالية السابقة خاصة
      {previousPrivatePayments.length > 0 && showPaymentsPrivate && (
        <span className="badge bg-info p-1 m-2">
          {previousPrivatePayments.length} دفعة
        </span>
      )}
    </h5>
  )}


{previousPrivatePayments.length === 0 && showPaymentsPrivate && (
  <div className="alert alert-info">
    <i className="bi bi-info-circle"></i> لا توجد دفعات خاصة سابقة مسجلة لهذا العقد
  </div>
)}

                  {previousPrivatePayments.length > 0 && showPaymentsPrivate && (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>المبلغ</th>
            <th>تاريخ الدفع</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {previousPrivatePayments.map((payment, index) => (
            <tr key={payment.id || index}>
              <td>{index + 1}</td>
              <td>
                <span className="text-success fw-bold">
                  {parseFloat(payment.amount).toLocaleString()} دينار
                </span>
              </td>
              <td>{formatDate(payment.paymentDate)}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm p-0 w-50"
                  onClick={() => deletePreviousPrivatePayment(payment.id)}
                  title="حذف الدفعة"
                >
                  <i className="bi bi-trash"></i> حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-light">
          <tr>
            <th colSpan="1">المجموع:</th>
            <th className="text-success">
              {totalPreviousPrivatePayments.toLocaleString()} دينار
            </th>
            <th colSpan="3"></th>
          </tr>
        </tfoot>
      </table>
    </div>
  )}
                </div>
                
<div className="col-12 mb-3">
  {showPaymentsPrivate && (
    <h5 className="text-secondary border-bottom pb-2">
      إضافة دفعات خاصة جديدة
      {privatePayments.filter(p => p.Amount).length > 0 && (
        <span className="badge bg-success ms-2">
          {privatePayments.filter(p => p.Amount).length} دفعة جديدة
        </span>
      )}
    </h5>
  )}
  
                  
                  {privatePayments.map((payment, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">المبلغ</label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors[`privatePayment_${index}`] ? 'is-invalid' : ''}`}
                            value={payment.Amount}
                            onChange={(e) => updatePrivatePaymentField(index, 'Amount', e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="أدخل المبلغ"
                          />
                          {validationErrors[`privatePayment_${index}`] && (
                            <div className="invalid-feedback">{validationErrors[`privatePayment_${index}`]}</div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">تاريخ الدفع</label>
                          <input
                            type="date"
                            className="form-control"
                            value={payment.PaymentDate}
                            onChange={(e) => updatePrivatePaymentField(index, 'PaymentDate', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removePrivatePayment(index)}
                          >
                            حذف
                          </button>
                          {payment.Amount && (
                            <span className="ms-2 badge bg-info">
                              {parseFloat(payment.Amount).toLocaleString()} دينار
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
{ showPaymentsPrivate && (
  <div>
<button
                    type="button"
                    className="btn btn-outline-success mb-3"
                    onClick={addPrivatePayment}
                  >
                    ➕ اضافة دفعة خاصة
                  </button>

                  <div className="alert alert-info">
                    <strong>إجمالي الدفعات الجديدة: </strong>
                    <span className="text-success fs-5">{totalPrivatePayments.toLocaleString()} دينار</span>
                    {privatePayments.filter(p => p.Amount).length > 0 && (
                      <small className="d-block text-muted">
                        عدد الدفعات الجديدة: {privatePayments.filter(p => p.Amount).length}
                      </small>
                    )}
                  </div>


  </div>

)}
                  


{showPaymentsPrivate && (
  <div className="alert alert-info">
    <h6 className="alert-heading">ملخص إجمالي الدفعات الخاصة</h6>
    <div className="row">
      <div className="col-md-4">
        <strong>الدفعات الخاصة السابقة:</strong> {totalPreviousPrivatePayments.toLocaleString()} دينار {/* Fixed variable */}
      </div>
      <div className="col-md-4">
        <strong>الدفعات الخاصة الجديدة:</strong> {totalPrivatePayments.toLocaleString()} دينار {/* Fixed variable */}
      </div>
      <div className="col-md-4">
        <strong>المجموع الكلي:</strong>
        <span className="text-success fs-5 ms-1">
          {(totalPreviousPrivatePayments + totalPrivatePayments).toLocaleString()} دينار {/* Fixed variables */}
        </span>
      </div>
    </div>
  </div>
)}
                  
                </div>
                {renderInput('التامينات المحجوزة (10% والضريبة) والغرامات', 'TaxesAndBlockedmoney', 'number')}
                {renderInput('المبالغ المطلوقة من الحساب الخاص', 'PrivateMoneyPaid', 'number')}

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
    </div>
  );
}