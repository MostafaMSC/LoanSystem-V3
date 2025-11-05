  import React, { useEffect, useState } from 'react';
  import api from '../Api/AxiosClient'
  import { NavLink, useNavigate } from 'react-router-dom';
  import { User, Lock } from 'lucide-react';
  import '../Style/LoginForm.css';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faCoins, faLockOpen } from '@fortawesome/free-solid-svg-icons';
  import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

  export default function LoginForm() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/dashboard');
      }
    }, [navigate]);

    // ✅ Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/Auth/login', {
        userName,
        password,
      });

      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('roles', JSON.stringify(res.data.roles));
      localStorage.setItem("username", res.data.userName);
  if (res.data.department) {
    localStorage.setItem("UserDepartment", res.data.department.departmentName);
  } else {
    localStorage.setItem("UserDepartment", "غير محدد");
  }
      setError('');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "اسم المستخدم او كلمة المرور غير صحيحة");
    }
  };
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h4>نظام المنح والقروض</h4>
          <h6>تسجيل الدخول الى النظام</h6>

          <div className="logo">
            <FontAwesomeIcon icon={faCoins} size="2x" style={{ color: 'white' }} />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="input-group">
            <User className="icon" />
            <input
              type="text"
              value={userName}
              autoFocus
              onChange={e => setUserName(e.target.value)}
              placeholder="اسم المستخدم"
              required
            />
          </div>

          <div className="input-group">
            <Lock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
            />
    <FontAwesomeIcon
      icon={showPassword ? faEyeSlash : faEye}
      className="toggle-password"
      onClick={() => setShowPassword(prev => !prev)}
      style={{ cursor: "pointer", marginLeft: "10px", color: "#555" }}
    />
          </div>

          <button type="submit">
            <FontAwesomeIcon icon={faLockOpen} style={{ marginLeft: '8px' }} />
            تسجيل الدخول
          </button>

          <NavLink to='/register'
            onClick={() => navigate('/register')}
            style={{ cursor: 'pointer', color: 'red', marginTop: '10px', display: 'block', textDecoration:'none' }}
          >
            التسجيل كمستخدم جديد
          </NavLink>

          <p>جميع الحقوق محفوظة © 2025 قسم تقنية المعلومات</p>
        </form>
      </div>
    );
  }
