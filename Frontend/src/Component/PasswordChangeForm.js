import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../Api/AxiosClient'
import { toast } from 'react-toastify';
import '../Style/PasswordChangeForm.css';
import { useNavigate } from 'react-router-dom';

const PasswordChangeForm = () => {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
const navigate = useNavigate();

  const validateCurrentPassword = async () => {
    const currentPassword = watch('currentPassword');
    if (!currentPassword) return;
    
    try {
      const response = await api.post('/Auth/validate-current-password', {
        password: currentPassword
      });
      setCurrentPasswordValid(response.data.isValid);
    } catch (error) {
      toast.error("Failed to validate current password");
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const onSubmit = async (data) => {
    if (!currentPasswordValid) {
      toast.error("Please validate your current password first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/Auth/change-password', data);
      
      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        setCurrentPasswordValid(null);
        setPasswordStrength(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.join('\n') || 
                      "Password change failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-change-form">
      <h2>تغيير كلمة السر</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>كلمة السر الحالية</label>
          <input
            type="password"
            className={`form-control ${errors.currentPassword || currentPasswordValid === false ? 'is-invalid' : ''} ${currentPasswordValid ? 'is-valid' : ''}`}
            {...register('currentPassword', { 
              required: 'كلمة السر الحالية مطلوبة',
              onBlur: validateCurrentPassword
            })}
          />
          {errors.currentPassword && (
            <div className="invalid-feedback">{errors.currentPassword.message}</div>
          )}
          {currentPasswordValid === false && (
            <div className="invalid-feedback">Current password is incorrect</div>
          )}
        </div>

        <div className="form-group">
          <label>كلمة السر الجديدة</label>
          <input
            type="password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            {...register('newPassword')}
            onChange={(e) => setPasswordStrength(calculatePasswordStrength(e.target.value))}
          />
          {errors.newPassword && (
            <div className="invalid-feedback">{errors.newPassword.message}</div>
          )}
          <PasswordStrengthMeter strength={passwordStrength} />
        </div>

        <div className="form-group">
          <label>تأكيد كلمة السر الجديدة</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'يتم التغيير...' : 'تغيير كلمة السر'}
        </button>
        
                <button 
                  type="button" 
                  className="btn btn-default form-control p-1 mt-1"
                  onClick={() => {

                    navigate('/');
                  }}
                >
                  إلغاء/ العودة
                </button>
      </form>
    </div>
  );
};

const PasswordStrengthMeter = ({ strength }) => {
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['danger', 'danger', 'warning', 'info', 'success', 'success'];
  
  return (
    <div className="password-strength mt-2">
      <div className="progress" style={{ height: '5px' }}>
        <div 
          className={`progress-bar bg-${strengthColors[strength]}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      <small className={`text-${strengthColors[strength]}`}>
        {strengthLabels[strength]}
      </small>
    </div>
  );
};

export default PasswordChangeForm;