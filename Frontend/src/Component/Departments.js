  import React, { useEffect, useState } from "react";
  import { Plus, Edit2, Trash2, Save, X, Loader2, Building2 } from "lucide-react";
  import api from "../Api/AxiosClient"
  import NavMenu from "../Component/NavMenu"
  import Footer  from "./Footer";
  // Mock API for demonstration - replace with your actual API
  const mockApi = api;

  export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [newDep, setNewDep] = useState("");
    const [editDep, setEditDep] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // 📌 جلب جميع الأقسام
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const res = await mockApi.get("/Department/GetAllDep");
        setDepartments(res.data.departments);
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setLoading(false);
      }
    };

    // 📌 إضافة قسم
    const addDepartment = async () => {
      if (!newDep.trim()) return alert("اكتب اسم القسم!");
      setActionLoading("add");
      try {
        await mockApi.post("/Department/AddDep", { departmentName: newDep });
        setDepartments([...departments, { id: Date.now(), departmentName: newDep }]);
        setNewDep("");
      } catch (err) {
        console.error("Error adding department:", err);
      } finally {
        setActionLoading(null);
      }
    };

    // 📌 تحديث قسم
    const updateDepartment = async (id) => {
      if (!editDep?.departmentName.trim()) return;
      setActionLoading(`update-${id}`);
      try {
        await mockApi.put(`/Department/UpdateDep/${id}`, editDep);
        setDepartments(departments.map((d) => (d.id === id ? editDep : d)));
        setEditDep(null);
      } catch (err) {
        console.error("Error updating department:", err);
      } finally {
        setActionLoading(null);
      }
    };

    // 📌 حذف قسم
    const deleteDepartment = async (id) => {
      if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
      setActionLoading(`delete-${id}`);
      try {
        await mockApi.delete(`/Department/DeleteDep/${id}`);
        setDepartments(departments.filter((d) => d.id !== id));
      } catch (err) {
        console.error("Error deleting department:", err);
      } finally {
        setActionLoading(null);
      }
    };

    useEffect(() => {
      fetchDepartments();
    }, []);

    const styles = {
      container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        direction: 'rtl'
      },
      header: {
        textAlign: 'center',
        marginBottom: '40px'
      },
      title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '8px'
      },
      subtitle: {
        color: '#64748b',
        fontSize: '16px',
        margin: 0
      },
      addSection: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      },
      addTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '16px',
        margin: '0 0 16px 0'
      },
      inputGroup: {
        display: 'flex',
        gap: '12px'
      },
      input: {
        flex: 1,
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.2s',
        textAlign: 'right'
      },
      inputFocus: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      },
      button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '120px'
      },
      addButton: {
        backgroundColor: '#10b981',
        color: 'white'
      },
      addButtonHover: {
        backgroundColor: '#059669'
      },
      addButtonDisabled: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
      },
      tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse'
      },
      tableHeader: {
        backgroundColor: '#f8fafc'
      },
      th: {
        padding: '16px',
        textAlign: 'right',
        fontWeight: '600',
        color: '#374151',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '14px'
      },
      thCenter: {
        textAlign: 'center'
      },
      td: {
        padding: '16px',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '14px'
      },
      tdCenter: {
        textAlign: 'center'
      },
      row: {
        transition: 'background-color 0.2s'
      },
      rowHover: {
        backgroundColor: '#f8fafc'
      },
      indexBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '50%',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      departmentName: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: '500',
        color: '#1e293b'
      },
      statusDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#10b981',
        borderRadius: '50%'
      },
      editInput: {
        width: '100%',
        padding: '8px 12px',
        border: '2px solid #3b82f6',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        textAlign: 'right'
      },
      actionButtons: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
      },
      actionButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '80px'
      },
      editButton: {
        backgroundColor: '#f59e0b',
        color: 'white'
      },
      editButtonHover: {
        backgroundColor: '#d97706'
      },
      deleteButton: {
        backgroundColor: '#ef4444',
        color: 'white'
      },
      deleteButtonHover: {
        backgroundColor: '#dc2626'
      },
      saveButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
      },
      saveButtonHover: {
        backgroundColor: '#2563eb'
      },
      cancelButton: {
        backgroundColor: '#6b7280',
        color: 'white'
      },
      cancelButtonHover: {
        backgroundColor: '#4b5563'
      },
      disabledButton: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
      },
      loading: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#64748b'
      },
      emptyState: {
        textAlign: 'center',
        padding: '60px 20px'
      },
      emptyIcon: {
        color: '#cbd5e1',
        marginBottom: '16px'
      },
      emptyTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#64748b',
        marginBottom: '8px',
        margin: '0 0 8px 0'
      },
      emptyText: {
        color: '#94a3b8',
        margin: 0
      },
      stats: {
        marginTop: '20px',
        textAlign: 'center',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      },
      statsText: {
        color: '#64748b',
        fontSize: '14px',
        margin: 0
      },
      statsNumber: {
        color: '#3b82f6',
        fontWeight: 'bold'
      }
    };

    return (
      <>
                    <NavMenu />

      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Building2 size={32} color="#3b82f6" />
            إدارة الأقسام
          </h1>
          <p style={styles.subtitle}>إدارة وتنظيم أقسام الشركة بسهولة</p>
        </div>

        {/* Add Department Section */}
        <div style={styles.addSection}>
          <h2 style={styles.addTitle}>
            <Plus size={18} color="#10b981" />
            إضافة قسم جديد
          </h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={newDep}
              onChange={(e) => setNewDep(e.target.value)}
              placeholder="اسم القسم الجديد"
              style={styles.input}
              onKeyPress={(e) => e.key === "Enter" && addDepartment()}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
            />
            <button
              onClick={addDepartment}
              disabled={actionLoading === "add"}
              style={{
                ...styles.button,
                ...styles.addButton,
                ...(actionLoading === "add" ? styles.addButtonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (actionLoading !== "add") {
                  Object.assign(e.target.style, styles.addButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (actionLoading !== "add") {
                  Object.assign(e.target.style, styles.addButton);
                }
              }}
            >
              {actionLoading === "add" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              إضافة
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 16px' }} />
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : departments.length === 0 ? (
            <div style={styles.emptyState}>
              <Building2 size={48} style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>لا يوجد أقسام</h3>
              <p style={styles.emptyText}>ابدأ بإضافة أول قسم لشركتك</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>الرقم</th>
                  <th style={styles.th}>اسم القسم</th>
                  <th style={{ ...styles.th, ...styles.thCenter }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dep, i) => (
                  <tr
                    key={dep.id}
                    style={styles.row}
                    onMouseEnter={(e) => Object.assign(e.target.style, styles.rowHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                  >
                    <td style={styles.td}>
                      <div style={styles.indexBadge}>{i + 1}</div>
                    </td>
                    <td style={styles.td}>
                      {editDep?.id === dep.id ? (
                        <input
                          value={editDep.departmentName}
                          onChange={(e) => setEditDep({ ...editDep, departmentName: e.target.value })}
                          style={styles.editInput}
                          autoFocus
                        />
                      ) : (
                        <div style={styles.departmentName}>
                          <div style={styles.statusDot}></div>
                          {dep.departmentName}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, ...styles.tdCenter }}>
                      <div style={styles.actionButtons}>
                        {editDep?.id === dep.id ? (
                          <>
                            <button
                              onClick={() => updateDepartment(dep.id)}
                              disabled={actionLoading === `update-${dep.id}`}
                              style={{
                                ...styles.actionButton,
                                ...(actionLoading === `update-${dep.id}` ? styles.disabledButton : styles.saveButton)
                              }}
                              onMouseEnter={(e) => {
                                if (actionLoading !== `update-${dep.id}`) {
                                  Object.assign(e.target.style, styles.saveButtonHover);
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (actionLoading !== `update-${dep.id}`) {
                                  Object.assign(e.target.style, styles.saveButton);
                                }
                              }}
                            >
                              {actionLoading === `update-${dep.id}` ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditDep(null)}
                              style={{ ...styles.actionButton, ...styles.cancelButton }}
                              onMouseEnter={(e) => Object.assign(e.target.style, styles.cancelButtonHover)}
                              onMouseLeave={(e) => Object.assign(e.target.style, styles.cancelButton)}
                            >
                              <X size={14} />
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditDep(dep)}
                              style={{ ...styles.actionButton, ...styles.editButton }}
                              onMouseEnter={(e) => Object.assign(e.target.style, styles.editButtonHover)}
                              onMouseLeave={(e) => Object.assign(e.target.style, styles.editButton)}
                            >
                              <Edit2 size={14} />
                              تعديل
                            </button>
                            <button
                              onClick={() => deleteDepartment(dep.id)}
                              disabled={actionLoading === `delete-${dep.id}`}
                              style={{
                                ...styles.actionButton,
                                ...(actionLoading === `delete-${dep.id}` ? styles.disabledButton : styles.deleteButton)
                              }}
                              onMouseEnter={(e) => {
                                if (actionLoading !== `delete-${dep.id}`) {
                                  Object.assign(e.target.style, styles.deleteButtonHover);
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (actionLoading !== `delete-${dep.id}`) {
                                  Object.assign(e.target.style, styles.deleteButton);
                                }
                              }}
                            >
                              {actionLoading === `delete-${dep.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        {departments.length > 0 && (
          <div style={styles.stats}>
            <p style={styles.statsText}>
              إجمالي الأقسام: <span style={styles.statsNumber}>{departments.length}</span>
            </p>
          </div>
        )}
        
      </div>
      <Footer />

          </>

      
    );
  }