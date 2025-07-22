import { useState } from 'react';
import api from '../Api/AxiosClient';
import NavMenu from './NavMenu';
import Footer from './Footer';
import '../Style/AddContract.css';
import { toast as toastify } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

export default function AddLoan() {
  const initialState = {
  // Required API fields
  id: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  enteredUserName: "admin",
  
  // Your form fields
  loanName: '',
  budget: 0,
  loan_Type: null,
  currency: '',
  benfitDep: '',

  gate: null,
  departmentId: null,
  chapterId: null,
  objectId: null,
  gateType: null,
  investType: null,
  projectType: null,
  serialNo: null,

  location: '',
  district: '',
  subdistrict: '',

  // GPS coordinates as strings, not numbers
  gpS_X: '',
  gpS_Y: '',

  projectTarget: '',
  projectDescription: '',

  putYear: null,
  noYearTOComplete: null,
  actualFinishYear: null,
  changedBudget: 0,
  finalTotalBudget: 0,

  customizeAnnualId: null,
  customizeannual: null,
  actualAnnualId: null,
  actualannual: null,
};

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const numericFields = [
  'budget',
  'gate',
  'departmentId',
  'chapterId',
  'objectId',
  'gateType',
  'investType',
  'serialNo',
  'putYear',
  'noYearTOComplete',
  'actualFinishYear',
  'changedBudget',
  'finalTotalBudget',
  'customizeAnnualId',
  'actualAnnualId'
  // NOTE: Removed gpS_X and gpS_Y from here - they should stay as strings
  // NOTE: loan_Type is handled separately
];
  const handleChange = (e) => {
  const { name, value } = e.target;
  let convertedValue = value;

  // Special handling for GPS coordinates - keep as strings
  if (name === 'gpS_X' || name === 'gpS_Y') {
    // Keep GPS coordinates as strings, validate format
    convertedValue = value.trim();
    // Optional: Add validation for GPS format
    if (convertedValue && !(/^-?\d+\.?\d*$/.test(convertedValue))) {
      console.warn(`Invalid GPS format for ${name}: ${convertedValue}`);
    }
  }
  // Special handling for enum fields to convert to integer
  else if (name === 'loan_Type' || name === 'projectType') {
    convertedValue = value === '' ? null : parseInt(value, 10);
    if (isNaN(convertedValue)) convertedValue = null;
  }
  // Handle other numeric fields (EXCLUDE GPS fields)
  else if (numericFields.includes(name)) {
    convertedValue = value === '' ? null : Number(value);
    if (isNaN(convertedValue)) convertedValue = null;
  }
  
  setFormData((prev) => ({
    ...prev,
    [name]: convertedValue,
    updatedAt: new Date().toISOString()
  }));
};
  const toast = ({ title, description }) => {
    toastify(
      <div>
        <strong>{title}</strong>
        <div>{description}</div>
      </div>,
      {
        position: "top-right",
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
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.loanName || !formData.loan_Type) {
      setError('يرجى إدخال اسم ونوع القرض.');
      setLoading(false);
      return;
    }
    
    if (!formData.location) {
      setError('يرجى إدخال الموقع.');
      setLoading(false);
      return;
    }

    if (formData.budget && formData.budget < 0) {
      setError('مبلغ القرض لا يمكن أن يكون سالباً.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending payload:', formData); // Debug log
      await api.post('/Loan/AddLoan', formData);
      setSuccess('تم اضافة القرض بنجاح!');
      toast({
        title: "تمت الاضافة بنجاح",
        description: `${formData.loanName} تمت اضافة القرض`
      });
      setFormData(initialState);
    } catch (err) {
      console.error('Error details:', err.response?.data); // Debug log
      setError(
        err.response?.status === 401
          ? 'غير مصرح – الرجاء تسجيل الدخول.'
          : err.response?.data?.message || 'حدث خطأ أثناء إضافة القرض.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavMenu />

      <main className="flex-fill container my-4">
        <div className="contract-form-container">
          <h2>إضافة قرض جديد</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="row g-3">
            {/* Loan Name */}
            <div className="col-md-6">
              <label className="form-label">اسم القرض:</label>
              <input
                type="text"
                name="loanName"
                className="form-control"
                value={formData.loanName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Loan Type */}
            <div className="col-md-3">
              <label className="form-label">نوع القرض:</label>
              <select
                name="loan_Type"
                className="form-control"
                value={formData.loan_Type ?? ''}
                onChange={handleChange}
                required
              >
                <option value={0}>-- اختر نوع القرض --</option>
                <option value={1}>قرض خارجي</option>
                <option value={2}>قرض داخلي</option>
                <option value={3}>منح</option>
              </select>
            </div>

            {/* Budget */}
            <div className="col-md-3">
              <label className="form-label">الكلفة الكلية المقرة للمشروع:</label>
              <input
                type="number"
                name="budget"
                className="form-control"
                value={formData.budget ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Currency */}
            <div className="col-md-3">
              <label className="form-label">العملة:</label>
              <input
                type="text"
                name="currency"
                className="form-control"
                value={formData.currency ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* BenfitDep */}
            <div className="col-md-3">
              <label className="form-label">الجهة المستفيدة من المشروع:</label>
              <input
                type="text"
                name="benfitDep"
                className="form-control"
                value={formData.benfitDep ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">التبويب</h4>
            </div>

            {/* Gate */}
            <div className="col-md-3">
              <label className="form-label">الباب:</label>
              <input
                type="number"
                name="gate"
                className="form-control"
                value={formData.gate ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* DepartmentId */}
            <div className="col-md-3">
              <label className="form-label">القسم:</label>
              <input
                type="number"
                name="departmentId"
                className="form-control"
                value={formData.departmentId ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* ChapterId */}
            <div className="col-md-3">
              <label className="form-label">الفصل:</label>
              <input
                type="number"
                name="chapterId"
                className="form-control"
                value={formData.chapterId ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* ObjectId */}
            <div className="col-md-3">
              <label className="form-label">المادة:</label>
              <input
                type="number"
                name="objectId"
                className="form-control"
                value={formData.objectId ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* GateType */}
            <div className="col-md-3">
              <label className="form-label">النوع:</label>
              <input
                type="number"
                name="gateType"
                className="form-control"
                value={formData.gateType ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">نوع الاستثمار:</label>
              <input
                type="number"
                name="investType"
                className="form-control"
                value={formData.investType ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">التسلسل:</label>
              <input
                type="number"
                name="serialNo"
                className="form-control"
                value={formData.serialNo ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">الموقع</h4>
            </div>

            {/* Location */}
            <div className="col-md-6">
              <label className="form-label">الموقع:</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location ?? ''}
                onChange={handleChange}
                required
              />
            </div>

            {/* District */}
            <div className="col-md-3">
              <label className="form-label">القضاء:</label>
              <input
                type="text"
                name="district"
                className="form-control"
                value={formData.district ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Subdistrict */}
            <div className="col-md-3">
              <label className="form-label">الناحية:</label>
              <input
                type="text"
                name="subdistrict"
                className="form-control"
                value={formData.subdistrict ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* GPS X */}
            <div className="col-md-3">
              <label className="form-label">GPS X:</label>
              <input
                type="text"
                name="gpS_X"
                className="form-control"
                value={formData.gpS_X ?? ''}
                onChange={handleChange}
                placeholder="例: 33.3152"
              />
            </div>

            {/* GPS Y */}
            <div className="col-md-3">
              <label className="form-label">GPS Y:</label>
              <input
                type="text"
                name="gpS_Y"
                className="form-control"
                value={formData.gpS_Y ?? ''}
                onChange={handleChange}
                placeholder="例: 44.3661"
              />
            </div>

            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">تفاصيل المشروع</h4>
            </div>

            {/* Project Type */}
            <div className="col-md-3">
              <label className="form-label">نوع المشروع:</label>
              <select
                name="projectType"
                className="form-control"
                value={formData.projectType ?? ''}
                onChange={handleChange}
              >
                <option value={0}>-- اختر نوع المشروع --</option>
                <option value={1}>مستمر</option>
                <option value={2}>جديد</option>
                <option value={3}>مستحدث</option>
                <option value={4}>إعادة ادراج</option>
              </select>
            </div>

            {/* Project Target */}
            <div className="col-md-6">
              <label className="form-label">هدف المشروع:</label>
              <textarea
                name="projectTarget"
                className="form-control"
                value={formData.projectTarget ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Project Description */}
            <div className="col-md-6">
              <label className="form-label">وصف المشروع:</label>
              <textarea
                name="projectDescription"
                className="form-control"
                value={formData.projectDescription ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Years */}
            <div className="col-md-3">
              <label className="form-label">تاريخ ادراج المشروع بالمنهاج الاستثماري:</label>
              <input
                type="number"
                name="putYear"
                className="form-control"
                value={formData.putYear ?? ''}
                onChange={handleChange}
                placeholder="2024"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">عدد سنوات التنفيذ للمشروع:</label>
              <input
                type="number"
                name="noYearTOComplete"
                className="form-control"
                value={formData.noYearTOComplete ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">تاريخ الانجاز الفعلي للمشروع:</label>
              <input
                type="number"
                name="actualFinishYear"
                className="form-control"
                value={formData.actualFinishYear ?? ''}
                onChange={handleChange}
                placeholder="2025"
              />
            </div>

            {/* Budget Updates */}
            <div className="col-md-3">
              <label className="form-label">مقدار التغيير في الكلفة الكلية للمشروع:</label>
              <input
                type="number"
                name="changedBudget"
                className="form-control"
                value={formData.changedBudget ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">الكلفة الكلية المعدلة:</label>
              <input
                type="number"
                name="finalTotalBudget"
                className="form-control"
                value={formData.finalTotalBudget ?? ''}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="col-12">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'جارٍ الإضافة...' : 'إضافة القرض'}
                <img src="/Images/notes.png" alt='' width='30px' height='30px' />
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}