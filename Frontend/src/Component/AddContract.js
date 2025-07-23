import { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddContract({ onClose }) {
  const initialState = {
    ContractNumber: '',ContractName: '',
    ContractType: null,
    CompanyName: '',
    Status: '',
    LoanId: null,
    ContractSigningDate: null,
    StartDate: null,
    CompleteDate: null,
    DurationInDays: null,
    AddedDays: null,
    ContractAmount: null,
    CostPlanMins: null,
    CostAfterChange: null,
    CostToNatiBank: null,
    TotalCostPaid: null,
    OperationLoanCost: null,
    CashPaid: null,
    TaxesAndBlockedmoney: null,
    PrivateMoneyPaid: null,
    Notes: '',
    CostChange: null,
  };
const navigate = useNavigate();
  const numericFields = [
    'ContractType',
    'LoanId',
    'DurationInDays',
    'AddedDays',
    'ContractAmount',
    'CostPlanMins',
    'CostAfterChange',
    'CostToNatiBank',
    'TotalCostPaid',
    'OperationLoanCost',
    'CashPaid',
    'TaxesAndBlockedmoney',
    'PrivateMoneyPaid',
    'CostChange',
  ];

  const dateFields = ['ContractSigningDate', 'StartDate', 'CompleteDate'];

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanError, setLoanError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      setLoanLoading(true);
      setLoanError('');  
      try {
        console.log('Fetching loans...');
        const response = await api.get('/Loan/GetAllLoans', {
          params: { page: 1, pageSize: 1000 },
        });
        const loansData = response.data?.loans ?? [];
        setLoans(loansData);
        if (loansData.length === 0) {
          setLoanError('لا توجد قروض متاحة');
        }
      } catch (err) {
        const errorMessage = err.response?.status === 401
          ? 'غير مصرح – الرجاء تسجيل الدخول.'
          : err.response?.data?.message || 'حدث خطأ أثناء جلب القروض.';
        setLoanError(errorMessage);
      } finally {
        setLoanLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let convertedValue = value;
    if (numericFields.includes(name)) {
      convertedValue = value === '' ? null : Number(value);
      if (isNaN(convertedValue)) convertedValue = null;
    } else if (dateFields.includes(name)) {
      convertedValue = value === '' ? null : value;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.ContractNumber || !formData.ContractName) {
      setError('يرجى إدخال رقم واسم العقد.');
      return;
    }
    
    if (formData.ContractAmount !== null && formData.ContractAmount < 0) {
      setError('مبلغ العقد لا يمكن أن يكون سالباً.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/Contracts/AddContract', formData);
      setSuccess('تم إضافة العقد بنجاح!');
      toast({
        title: 'تمت الإضافة بنجاح',
        description: `تمت إضافة العقد ${formData.ContractName} للشركة ${formData.CompanyName || 'غير محدد'}`,
      });
      setFormData(initialState);
    } catch (err) {
      const errorMessage = err.response?.status === 401
        ? 'غير مصرح – الرجاء تسجيل الدخول.'
        : err.response?.data?.message || 'حدث خطأ أثناء إضافة العقد.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      if (onClose) onClose();
    }
  };

  const getLoanDisplayName = (loan) => {
    return loan.loanName || loan.LoanName || loan.name || loan.Name || loan.title || 
          loan.Title ||`قرض رقم ${loan.id || loan.Id}`;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* <NavMenu /> */}
      <main className="flex-fill container my-4">
        <div className="contract-form-container">
          <h2 className="mb-4">إضافة عقد جديد</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">المعلومات الأساسية</h4>
            </div>

            <div className="col-md-6">
              <label className="form-label">رقم العقد <span className="text-danger">*</span>:</label>
              <input type="text" name="ContractNumber" required
                className="form-control" value={formData.ContractNumber}
                onChange={handleChange} placeholder="أدخل رقم العقد"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">اسم العقد <span className="text-danger">*</span>:</label>
              <input type="text" name="ContractName" className="form-control"
                value={formData.ContractName} onChange={handleChange} required
                placeholder="أدخل اسم العقد"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">نوع العقد:</label>
              <select required name="ContractType" className="form-control"
                value={formData.ContractType ?? ''} onChange={handleChange}
              >
                <option value="">-- اختر نوع العقد --</option>
                <option value={1}>استشاري (Mentor)</option>
                <option value={2}>تجهيز (Equipment)</option>
                <option value={3}>اعمال (Work)</option>
                <option value={4}>اخرى (Others)</option>

              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">اسم الشركة:</label>
              <input type="text" name="CompanyName" className="form-control"
                value={formData.CompanyName} onChange={handleChange} placeholder="أدخل اسم الشركة"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">الحالة:</label>
              <select type="text" name="Status" className="form-control"
                value={formData.Status} onChange={handleChange} placeholder="حالة العقد">
                <option value="">-- اختر حالة العقد --</option>
                <option value="1">مستمر</option>
                <option value="2">منجز</option>
                </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">اختر القرض المرتبط:</label>
              {loanLoading ? (
                <div className="form-control d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  جارٍ تحميل القروض...
                </div>
              ) : loanError ? (
                <div>
                  <div className="form-control text-danger">{loanError}</div>
                  <small className="text-muted">تحقق من الاتصال بالخادم أو صلاحياتك</small>
                </div>
              ) : (
                <>
                  <select name="LoanId" className="form-control" value={formData.LoanId ?? ''} onChange={handleChange}
                    required >
                    <option value="">-- اختر القرض --</option>
                    {loans.map((loan) => (
                      <option key={loan.id || loan.Id} value={loan.id || loan.Id}>
                        {getLoanDisplayName(loan)}
                      </option>
                    ))}
                  </select>
                  {loans.length === 0 && (
                    <small className="text-muted">لا توجد قروض متاحة</small>
                  )}
                </>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">مبلغ العقد:</label>
              <input type="number" name="ContractAmount" className="form-control"
                value={formData.ContractAmount ?? ''} onChange={handleChange} required
                min="0" step="0.01" placeholder="0.00" />
            </div>
            <div className="col-12 mt-4">
              <h4 className="text-primary border-bottom pb-2">التواريخ والمدد</h4>
            </div>
            <div className="col-md-4">
              <label className="form-label">تاريخ توقيع العقد:</label>
              <input
                type="date"
                name="ContractSigningDate"
                className="form-control"
                value={formData.ContractSigningDate ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Start Date */}
            <div className="col-md-4">
              <label className="form-label">تاريخ المباشرة:</label>
              <input
                type="date"
                name="StartDate"
                className="form-control"
                value={formData.StartDate ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Complete Date */}
            <div className="col-md-4">
              <label className="form-label">تاريخ الإنجاز:</label>
              <input
                type="date"
                name="CompleteDate"
                className="form-control"
                value={formData.CompleteDate ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Duration In Days */}
            <div className="col-md-6">
              <label className="form-label">المدة المطلوبة (يوم):</label>
              <input
                type="number"
                name="DurationInDays"
                className="form-control"
                value={formData.DurationInDays ?? ''}
                onChange={handleChange}
                min="1"
                placeholder="عدد الأيام"
              />
            </div>

            {/* Added Days */}
            <div className="col-md-6">
              <label className="form-label">المدة المضافة (يوم):</label>
              <input
                type="number"
                name="AddedDays"
                className="form-control"
                value={formData.AddedDays ?? ''}
                onChange={handleChange}
                min="0"
                placeholder="الأيام الإضافية"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">اوامر الغيار:</label>
              <input type="number" name="CostChange" className="form-control"
                value={formData.CostChange ?? ''} onChange={handleChange} required
                min="0" step="0.01" placeholder="0.00" />
            </div>
            {/* Notes Section */}
            <div className="col-12 mt-4">
              <h4 className="text-primary border-bottom pb-2">ملاحظات إضافية</h4>
            </div>

            {/* Notes */}
            <div className="col-12">
              <label className="form-label">ملاحظات:</label>
              <textarea
                name="Notes"
                className="form-control"
                rows="4"
                value={formData.Notes}
                onChange={handleChange}
                placeholder="اكتب أي ملاحظات إضافية هنا..."
              />
            </div>

            {/* Submit button */}
            <div className="col-12 mt-4">
              <div className="d-flex gap-3">
                <button 
                  type="submit" 
                  className="btn btn-success btn-lg px-4" 
                  disabled={loading}
                  onClick={() => {
                    // navigate('/contracts');
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    'إضافة العقد'
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg px-4"
                  onClick={() => {
                    setFormData(initialState);
                    setError('');
                    setSuccess('');
                    navigate('/contracts');
                    if (onClose) onClose();
                  }}
                  disabled={loading}
                >
                  إلغاء / مسح
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}