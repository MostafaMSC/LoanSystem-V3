import React, { useMemo, useEffect, useState } from "react";
import { toast as toastify } from 'react-toastify';
import Footer from './Footer';
import NavMenu from './NavMenu';
import '../Style/UserAdmin.css';
import api from '../Api/AxiosClient'

const AdminPanel = () => {
const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    departmentId: '',
    role: ''
  });
  const [passwordModal, setPasswordModal] = useState({
    show: false,
    username: '',
    newPassword: ''
  });

const confirmAction = async (title, text, confirmBtn, action) => {
    const Swal = (await import('sweetalert2')).default;

  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmBtn,
    cancelButtonText: 'إلغاء'
  });
  if (result.isConfirmed) action();
};

const translateRole = (role) => {
  switch (role) {
    case "Admin":
      return "مدير";
    case "ArchiveUser":
      return "ارشفة العقود";
    case "LoanUser":
      return "ادمن القروض";
    case "User":
      return "مستخدم عادي";
    default:
      return role;
  }
};

const toast = ({ title, description, type = 'info' }) => {
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
      type: type
    }
  );
};

useEffect(() => {
  fetchUsers();
  fetchRoles();
  fetchDepartments();
}, []);

const fetchUsers = async () => {
  setLoading(true);
  try {
    const response = await api.get("/Auth/users");
    setUsers(
      response.data.map((u) => ({
        id: u.id,
        name: u.userName,
        email: u.email || "",
        role: u.role || "User",
        status: u.status ?? true,
        departmentId: u.departmentId
      }))
    );
  } catch (error) {
    toast({ title: "خطأ", description: "فشل في جلب بيانات المستخدمين.", type: 'error' });
  }
  setLoading(false);
};

const fetchRoles = async () => {
  setLoading(true);
  try {
    const response = await api.get("/Auth/GetAllRoles");
    setRoles(response.data);
  } catch (error) {
    toast({ title: "خطأ", description: "فشل في جلب الأدوار.", type: 'error' });
  }
  setLoading(false);
};

const fetchDepartments = async () => {
  setLoading(true);
  try {
    const response = await api.get("/Department/GetAllDep?page=1&pageSize=100");
    setDepartments(response.data.departments);
  } catch (error) {   
    toast({ title: "خطأ", description: "فشل في جلب الأقسام.", type: 'error' });
  }
  setLoading(false);
};

const handleRoleChange = async (userId, newRole) => {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  try {
    await api.post("/Auth/assign-role", { username: user.name, role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({
      title: "تم تحديث الدور",
      description: `تم تغيير دور المستخدم ${user.name} إلى ${translateRole(newRole)}`,
      type: 'success'
    });
  } catch (error) {
    toast({ title: "خطأ", description: "فشل تغيير دور المستخدم.", type: 'error' });
  }
};

const handleStatusToggle = async (userId) => {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    toast({ 
      title: "خطأ", 
      description: "المستخدم غير موجود.", 
      type: 'error' 
    });
    return;
  }

  const endpoint = user.status ? "deactivate-user" : "activate-user";
  const actionText = user.status ? "تعطيل" : "تفعيل";

  try {
    // Show loading state (optional)
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
    );

    // Make API request with proper format
    const response = await api.post(`Auth/${endpoint}`, { 
      userId: userId 
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Update user status on success
    setUsers((prev) =>
      prev.map((u) => 
        u.id === userId 
          ? { ...u, status: !u.status, loading: false } 
          : u
      )
    );

    toast({
      title: `تم ${actionText} المستخدم`,
      description: `تم ${actionText} المستخدم ${user.name} بنجاح.`,
      type: 'success'
    });

  } catch (error) {
    // Remove loading state on error
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
    );

    // Handle different error types
    let errorMessage = "فشل في تغيير حالة المستخدم.";
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = "غير مصرح لك بتنفيذ هذا الإجراء.";
          break;
        case 403:
          errorMessage = "ليس لديك صلاحية لتنفيذ هذا الإجراء.";
          break;
        case 404:
          errorMessage = "المستخدم غير موجود.";
          break;
        case 400:
          errorMessage = error.response.data?.message || "طلب غير صحيح.";
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "خطأ في الاتصال بالخادم.";
    }

    toast({ 
      title: "خطأ", 
      description: errorMessage, 
      type: 'error' 
    });

    console.error(`Error ${actionText} user:`, error);
  }
};

const handleDeleteUser = async (userId) => {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  confirmAction(
    "تأكيد الحذف",
    `هل أنت متأكد من حذف المستخدم "${user.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
    "حذف",
    async () => {
      try {
        await api.delete(`/Auth/delete-user/${userId}`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast({
          title: "تم الحذف",
          description: `تم حذف المستخدم ${user.name} بنجاح`,
          type: 'success'
        });
      } catch (error) {
        toast({ 
          title: "خطأ", 
          description: error.response?.data?.message || "فشل في حذف المستخدم", 
          type: 'error' 
        });
      }
    }
  );
};

const startEditing = (user) => {
  setEditingUser(user.id);
  setEditForm({
    username: user.name,
    email: user.email,
    departmentId: user.departmentId || '',
    role: user.role
  });
};

const cancelEditing = () => {
  setEditingUser(null);
  setEditForm({
    username: '',
    email: '',
    departmentId: '',
    role: ''
  });
};

const handleUpdateUser = async (userId) => {
  try {
    const updateData = {
      username: editForm.username,
      email: editForm.email,
      departmentId: editForm.departmentId ? parseInt(editForm.departmentId) : null,
      role: editForm.role
    };

    await api.put(`/Auth/update-user/${userId}`, updateData);
    
    // Update local state
    setUsers((prev) =>
      prev.map((u) => 
        u.id === userId 
          ? { 
              ...u, 
              name: editForm.username,
              email: editForm.email,
              departmentId: updateData.departmentId,
              role: editForm.role
            } 
          : u
      )
    );

    cancelEditing();
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات المستخدم بنجاح",
      type: 'success'
    });
  } catch (error) {
    toast({ 
      title: "خطأ", 
      description: error.response?.data?.message || "فشل في تحديث المستخدم", 
      type: 'error' 
    });
  }
};

const handleDepartmentChange = async (userId, newDepartmentId) => {
  try {
    await api.put(`/Auth/update-user-department/${userId}`, {
      departmentId: parseInt(newDepartmentId)
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, departmentId: parseInt(newDepartmentId) } : u))
    );

    const deptName = getDepartmentName(parseInt(newDepartmentId));
    toast({
      title: "تم تحديث القسم",
      description: `تم تغيير قسم المستخدم إلى ${deptName}`,
      type: 'success'
    });
  } catch (error) {
    toast({ title: "خطأ", description: "فشل في تحديث قسم المستخدم.", type: 'error' });
  }
};

const getDepartmentName = (id) => {
  if (!id) return "غير محدد";
  const department = departments.find((d) => d.id === id);
  return department ? department.departmentName : "غير معروف";
};

const handlePasswordReset = async (userId) => {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  confirmAction(
    "إعادة تعيين كلمة المرور",
    `هل تريد إعادة تعيين كلمة المرور للمستخدم "${user.name}"؟`,
    "إعادة تعيين",
    async () => {
      try {
        const response = await api.post("/Auth/reset-user-password", { 
          userId: userId 
        });
        
        if (response.data.success) {
          // Show password in modal
          setPasswordModal({
            show: true,
            username: user.name,
            newPassword: response.data.newPassword
          });
        } else {
          toast({ 
            title: "خطأ", 
            description: response.data.message || "فشل في إعادة تعيين كلمة المرور", 
            type: 'error' 
          });
        }
      } catch (error) {
        toast({ 
          title: "خطأ", 
          description: error.response?.data?.message || "فشل في إعادة تعيين كلمة المرور", 
          type: 'error' 
        });
      }
    }
  );
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    toast({
      title: "تم النسخ",
      description: "تم نسخ كلمة المرور إلى الحافظة",
      type: 'success'
    });
  }).catch(() => {
    toast({
      title: "خطأ",
      description: "فشل في نسخ كلمة المرور",
      type: 'error'
    });
  });
};

const closePasswordModal = () => {
  setPasswordModal({
    show: false,
    username: '',
    newPassword: ''
  });
};



const filteredUsers = useMemo(() => {
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [searchTerm, users]);


  return (
    <div className="d-flex flex-column min-vh-100">
      <NavMenu />
      
      <main className="container my-4">
        <div className="user-admin-container">
          <h2>إدارة المستخدمين</h2>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="بحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <img src="/Images/search.png" width={'25px'} alt="" className="search-icon" />
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الصلاحية</th>
                    <th>الحالة</th>
                    <th>القسم</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                              className="form-control form-control-sm"
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td>
                          {editingUser === user.id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="form-control form-control-sm"
                            />
                          ) : (
                            user.email
                          )}
                        </td>
                        <td>
                          {editingUser === user.id ? (
                            <select
                              className="form-select form-select-sm"
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                  {translateRole(role.name)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className="role-select"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                  {translateRole(role.name)}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleStatusToggle(user.id)}
                            className={`status-button ${user.status ? "active" : "inactive"}`}
                          >
                            {user.status ? "مفعل" : "معطل"}
                          </button>
                        </td>
                        <td>
                          {editingUser === user.id ? (
                            <select
                              className="form-select form-select-sm"
                              value={editForm.departmentId}
                              onChange={(e) => setEditForm({...editForm, departmentId: e.target.value})}
                            >
                              <option value="">اختر القسم</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.departmentName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className="department-select"
                              value={user.departmentId || ''}
                              onChange={(e) => handleDepartmentChange(user.id, e.target.value)}
                            >
                              <option value="">اختر القسم</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.departmentName}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editingUser === user.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(user.id)}
                                  className="btn btn-success btn-sm me-1"
                                  title="حفظ"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="btn btn-secondary btn-sm me-1"
                                  title="إلغاء"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(user)}
                                  className="btn btn-primary btn-sm me-1"
                                  title="تعديل"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handlePasswordReset(user.id)}
                                  className="btn btn-warning btn-sm me-1"
                                  title="إعادة تعيين كلمة المرور"
                                >
                                  🔑
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="btn btn-danger btn-sm"
                                  title="حذف"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-results">
                      <td colSpan={6}>
                        لا توجد نتائج مطابقة للبحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
     {passwordModal.show && (
  <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">كلمة المرور الجديدة</h5>
          <button type="button" className="btn-close" onClick={closePasswordModal}></button>
        </div>
        <div className="modal-body">
          <p>تم إعادة تعيين كلمة المرور للمستخدم: <strong>{passwordModal.username}</strong></p>
          
          <div className="alert alert-info mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>كلمة المرور الجديدة:</h6>
                <code className="d-block p-2 bg-light rounded">
                  {passwordModal.newPassword}
                </code>
              </div>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  copyToClipboard(passwordModal.newPassword);
                  toast({
                    title: "تم النسخ",
                    description: "تم نسخ كلمة المرور إلى الحافظة",
                    type: 'success'
                  });
                }}
              >
                نسخ
              </button>
            </div>
          </div>
          
          <div className="alert alert-warning mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>تنبيه:</strong> هذه الكلمة مؤقتة، يرجى إبلاغ المستخدم بتغييرها عند أول دخول
          </div>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={closePasswordModal}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      
      <Footer />
    </div>
  );
};

export default AdminPanel;