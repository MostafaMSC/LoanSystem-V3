import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Lock, Building } from 'lucide-react';
import '../Style/LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';

export default function RegisterForm() {
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const navigate = useNavigate();

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5109/Department/GetAllDep?pageSize=100', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Fetched departments:", response.data.departments); // Optional: for debugging
        setDepartments(response.data.departments || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('فشل في تحميل الأقسام');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== repassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!department) {
      setError("يرجى اختيار القسم");
      return;
    }
    if (password.length < 8) {
      setError("يرجى إدخال كلمة مرور مكونة من 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      // First register the user
      await axios.post('http://localhost:5109/Auth/Register', {
        userName,
        departmentId: department,
        password,
      });

      const loginRes = await axios.post('http://localhost:5109/Auth/login', {
        username: userName,
        password: password,
      });

      const { accessToken, refreshToken, roles, UserName, department: dep } = loginRes.data;

      // Save all data to localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('userName', UserName);

      if (dep) {
        localStorage.setItem('department', JSON.stringify(dep));
        localStorage.setItem('departmentId', dep.id.toString());
        localStorage.setItem('departmentName', dep.departmentName);
      }

      setError('');
      navigate('/dashboard');
    } catch (err) {
      console.error("Register/Login error:", err);
      setError(err.response?.data?.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h4>نظام المنح والقروض</h4>
        <h6>تسجيل الدخول كمستخدم جديد إلى النظام</h6>

        {error && <p className="error">{error}</p>}

        <div className="input-group">
          <User className="icon" />
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="اسم المستخدم"
            required
          />
        </div>

        <div className="input-group">
          <Building className="icon" />
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            required
            disabled={loadingDepartments}
            className="select-input"
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '16px',
              color: '#333'
            }}
          >
            <option value="" disabled>
              {loadingDepartments ? 'جاري تحميل الأقسام...' : 'اختر القسم'}
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <Lock className="icon" />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="كلمة المرور"
            required
          />
        </div>

        <div className="input-group">
          <Lock className="icon" />
          <input
            value={repassword}
            onChange={e => setRepassword(e.target.value)}
            type="password"
            placeholder="تأكيد كلمة المرور"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          <FontAwesomeIcon icon={faLockOpen} style={{ marginLeft: '8px' }} />
          {loading ? "جارٍ التسجيل..." : "تسجيل مستخدم جديد"}
        </button>

        <NavLink
          to="/"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', color: 'red', display: 'block', marginTop: '1rem', textDecoration: 'none' }}
        >
          امتلك حساب بالفعل
        </NavLink>

        <p className="footer">جميع الحقوق محفوظة© 2025 قسم تقنية المعلومات</p>
      </form>
    </div>
  );
}
