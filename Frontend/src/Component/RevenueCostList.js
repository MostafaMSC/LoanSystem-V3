import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { toast as toastify } from 'react-toastify';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../Style/Cards.css';

export default function RevenueCostList() {
  // Sovereign revenues state
  const [revenues, setRevenues] = useState([]);
  const [allRevenueInfo, setAllRevenueInfo] = useState([]);
  
  // Non-sovereign revenues state
  const [nonSovereignRevenues, setNonSovereignRevenues] = useState([]);
  
  // Common state
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenuesCount, setTotalRevenuesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('sovereign');
  const navigate = useNavigate();

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

  const [showModal, setShowModal] = useState(false);
  const [showNonSovereignModal, setShowNonSovereignModal] = useState(false);
  const [showEditNonSovereignModal, setShowEditNonSovereignModal] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const DeleteTooltip = <Tooltip id="delete-tooltip">حذف</Tooltip>;

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nonSovereignForm, setNonSovereignForm] = useState({
    departmentName: '',
    ministryShare: 0,
    financeShare: 0,
    resourceMaximizationInsurance: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    recordedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [editNonSovereignForm, setEditNonSovereignForm] = useState({
    id: 0,
    department: '',
    ministryShare: 0,
    financeShare: 0,
    resourceMaximizationInsurance: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    recordedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const resetNonSovereignForm = () => {
    setNonSovereignForm({
      department: '',
      ministryShare: 0,
      financeShare: 0,
      resourceMaximizationInsurance: 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      recordedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const resetEditNonSovereignForm = () => {
    setEditNonSovereignForm({
      id: 0,
      department: '',
      ministryShare: 0,
      financeShare: 0,
      resourceMaximizationInsurance: 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      recordedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleNonSovereignSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!nonSovereignForm.department || 
        nonSovereignForm.ministryShare < 0 || 
        nonSovereignForm.financeShare < 0 || 
        nonSovereignForm.resourceMaximizationInsurance < 0) {
      toast({ 
        title: 'خطأ في التحقق', 
        description: 'يرجى ملء جميع الحقول المطلوبة بقيم صحيحة' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        id: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        enteredUserName: "string",
        department: nonSovereignForm.department,
        ministryShare: nonSovereignForm.ministryShare,
        financeShare: nonSovereignForm.financeShare,
        resourceMaximizationInsurance: nonSovereignForm.resourceMaximizationInsurance,
        year: nonSovereignForm.year,
        month: nonSovereignForm.month,
        recordedDate: new Date(nonSovereignForm.recordedDate).toISOString(),
        notes: nonSovereignForm.notes || ""
      };

      const response = await api.post('/BudgetRevenue/CreateNonSovereignRevenue', submitData);
      
      if (response.status === 200 || response.status === 201) {
        toast({ 
          title: 'تم بنجاح', 
          description: 'تم إضافة الإيراد غير السيادي بنجاح' 
        });
        
        resetNonSovereignForm();
        setShowNonSovereignModal(false);
        
        if (activeTab === 'non-sovereign') {
          fetchNonSovereignRevenues();
        }
      }
    } catch (error) {
      console.error('Error creating non-sovereign revenue:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إضافة الإيراد';
      toast({ 
        title: 'خطأ', 
        description: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNonSovereignSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!editNonSovereignForm.department || 
        editNonSovereignForm.ministryShare < 0 || 
        editNonSovereignForm.financeShare < 0 || 
        editNonSovereignForm.resourceMaximizationInsurance < 0) {
      toast({ 
        title: 'خطأ في التحقق', 
        description: 'يرجى ملء جميع الحقول المطلوبة بقيم صحيحة' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        id: editNonSovereignForm.id,
        department: editNonSovereignForm.department,
        ministryShare: editNonSovereignForm.ministryShare,
        financeShare: editNonSovereignForm.financeShare,
        resourceMaximizationInsurance: editNonSovereignForm.resourceMaximizationInsurance,
        year: editNonSovereignForm.year,
        month: editNonSovereignForm.month,
        recordedDate: new Date(editNonSovereignForm.recordedDate).toISOString(),
        notes: editNonSovereignForm.notes || ""
      };

      const response = await api.put(`/BudgetRevenue/UpdateNonSovereignRevenues/${editNonSovereignForm.id}`, submitData);
      
      if (response.status === 200) {
        toast({ 
          title: 'تم بنجاح', 
          description: 'تم تحديث الإيراد غير السيادي بنجاح' 
        });
        
        resetEditNonSovereignForm();
        setShowEditNonSovereignModal(false);
        
        if (activeTab === 'non-sovereign') {
          fetchNonSovereignRevenues();
        }
      }
    } catch (error) {
      console.error('Error updating non-sovereign revenue:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تحديث الإيراد';
      toast({ 
        title: 'خطأ', 
        description: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNonSovereign = (revenue) => {
    setEditNonSovereignForm({
      id: revenue.id,
      department: revenue.department || '',
      ministryShare: revenue.ministryShare || 0,
      financeShare: revenue.financeShare || 0,
      resourceMaximizationInsurance: revenue.resourceMaximizationInsurance || 0,
      year: revenue.year || new Date().getFullYear(),
      month: revenue.month || new Date().getMonth() + 1,
      recordedDate: revenue.recordedDate ? revenue.recordedDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: revenue.notes || ''
    });
    setShowEditNonSovereignModal(true);
  };

  useEffect(() => {
    if (activeTab === 'sovereign') {
      fetchRevenues(currentPage);
      fetchAllRevenueInfo();
    } else {
      fetchNonSovereignRevenues();
    }
    const storedDept = localStorage.getItem("UserDepartment");
    console.log('Department from localStorage:', storedDept);
    if (storedDept) {
      setNonSovereignForm({...nonSovereignForm, department: storedDept});
    } else {
      setError('لم يتم العثور على معلومات القسم');
    }
  }, [currentPage, pageSize, activeTab]);

  const fetchRevenues = async (page) => {
    const size = pageSize === '' ? 0 : parseInt(pageSize);
    try {
      const res = await api.get(`/BudgetRevenue/GetAllRevenuesCost?page=${page}&pageSize=${size}`);
      setRevenues(res.data.revenues || []);
      setTotalRevenuesCount(res.data.totalCount || res.data.revenues?.length || 0);
      setTotalPages(size > 0 ? Math.ceil(res.data.totalCount / size) : 1);
      setError('');
    } catch (err) {
      setError(err.response?.status === 401 ? 'غير مصرح – يرجى تسجيل الدخول.' : 'حدث خطأ أثناء جلب البيانات.');
    }
  };

  const fetchAllRevenueInfo = async () => {
    try {
      const res = await api.get('/RevenuInfo/GetAllRevenues');
      let revenueData = [];
      if (Array.isArray(res.data)) revenueData = res.data;
      else if (res.data?.Loans) revenueData = res.data.Loans;
      else if (res.data?.loans) revenueData = res.data.loans;
      setAllRevenueInfo(revenueData);
    } catch {
      console.error('Error fetching revenue info');
      setAllRevenueInfo([]);
    }
  };

  const fetchNonSovereignRevenues = async () => {
    try {
      const res = await api.get('/BudgetRevenue/GetAllNonSovereignRevenues');
      setNonSovereignRevenues(res.data || []);
      setTotalRevenuesCount(res.data?.length || 0);
      setError('');
    } catch (err) {
      setError(err.response?.status === 401 ? 'غير مصرح – يرجى تسجيل الدخول.' : 'حدث خطأ أثناء جلب البيانات.');
    }
  };

  const handleEdit = (id) => navigate(`/EditRevenueCosts/${id}`);
  
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الايراد؟')) {
      try {
        await api.delete(`/BudgetRevenue/DeleteRevenueCostById/${id}`);
        if (activeTab === 'sovereign') {
          fetchRevenues(currentPage);
        } else {
          fetchNonSovereignRevenues();
        }
        toast({ title: 'تم الحذف بنجاح', description: '' });
      } catch {
        alert('حدث خطأ أثناء حذف الإيراد.');
      }
    }
  };

  const enrichedRevenues = revenues.map((rev) => {
    const matchedInfo = allRevenueInfo.find((info) => info.id === rev.revenueId || info.revenueId === rev.revenueId);
    return { ...rev, revenueInfo: matchedInfo || {} };
  });

  const filteredSovereignRevenues = enrichedRevenues.filter((rev) => {
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = (
      rev.department?.toLowerCase().includes(term) ||
      rev.notes?.toLowerCase().includes(term) ||
      rev.year?.toString().includes(term) ||
      rev.month?.toString().includes(term) ||
      rev.enteredUserName?.toLowerCase().includes(term) ||
      rev.revenueCost?.toString().includes(term) ||
      (rev.revenueInfo?.revenueName || '').toLowerCase().includes(term)
    );

    const revenueDate = new Date(rev.recordedDate || rev.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    let matchesDateRange = true;
    if (start && end) {
      matchesDateRange = revenueDate >= start && revenueDate <= end;
    } else if (start) {
      matchesDateRange = revenueDate >= start;
    } else if (end) {
      matchesDateRange = revenueDate <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  const filteredNonSovereignRevenues = nonSovereignRevenues.filter((rev) => {
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = (
      rev.department?.toLowerCase().includes(term) ||
      rev.notes?.toLowerCase().includes(term) ||
      rev.year?.toString().includes(term) ||
      rev.month?.toString().includes(term) ||
      rev.enteredUserName?.toLowerCase().includes(term) ||
      rev.ministryShare?.toString().includes(term) ||
      rev.financeShare?.toString().includes(term) ||
      rev.resourceMaximizationInsurance?.toString().includes(term)
    );

    const revenueDate = new Date(rev.recordedDate || rev.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    let matchesDateRange = true;
    if (start && end) {
      matchesDateRange = revenueDate >= start && revenueDate <= end;
    } else if (start) {
      matchesDateRange = revenueDate >= start;
    } else if (end) {
      matchesDateRange = revenueDate <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const currentFilteredData = activeTab === 'sovereign' ? filteredSovereignRevenues : filteredNonSovereignRevenues;

  return (
    <>
      <NavMenu />
      <div className="contracts-container"> 
        <div className="custom-tab glass-effect mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'sovereign' ? 'custom-active' : ''}`}
                onClick={() => {
                  setActiveTab('sovereign');
                  setCurrentPage(1);
                  resetFilters();
                }}
              >
                السيادية
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'non-sovereign' ? 'custom-active' : ''}`}
                onClick={() => {
                  setActiveTab('non-sovereign');
                  setCurrentPage(1);
                  resetFilters();
                }}
              >
                غير السيادية
              </button>
            </li>
          </ul>
        </div>

        {/* Sovereign Revenues Table */}
        {activeTab === 'sovereign' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              {error && <p className="error">{error}</p>}

              <div>
                <OverlayTrigger placement="top" overlay={<Tooltip>اضافة ايراد جديد</Tooltip>}>
                  <button className="btn btn-outline-success btn-lg m-2" onClick={() => navigate(`/Revenue`)}>
                    اضافة الايرادات السيادية <img src="/Images/notes.png" alt="" width="25px" height="25px" />
                  </button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>تقرير الإيرادات لكل تشكيل</Tooltip>}>
                  <button className="btn btn-outline-primary btn-lg me-2" onClick={() => navigate(`/RevenueCostReport`)}>
                    <img src="/Images/report.png" alt="" width="25px" height="25px" />
                  </button>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={<Tooltip>التقرير الإجمالي</Tooltip>}>
                  <button className="btn btn-outline-info btn-lg me-2" onClick={() => navigate(`/RevenueTotalReport`)}>
                    <img src="/Images/reporttotal.png" alt="" width="25px" height="25px" />
                  </button>
                </OverlayTrigger>
              </div>

              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="البحث في الإيرادات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <img src="/Images/search.png" alt="" className="search-icon" />
              </div>

              {activeTab === 'sovereign' && (
                <div className="col-md-4">
                  <select
                    className="form-control"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10 من أصل {totalRevenuesCount} سجل</option>
                    <option value={20}>20 من أصل {totalRevenuesCount} سجل</option>
                    <option value={30}>30 من أصل {totalRevenuesCount} سجل</option>
                    <option value={50}>50 من أصل {totalRevenuesCount} سجل</option>
                    <option value={100}>100 من أصل {totalRevenuesCount} سجل</option>
                  </select>
                </div>
              )}
            </div>
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>التشكيل</th>
                  <th>اسم الإيراد</th>
                  <th>قسم</th>
                  <th>الفصل</th>
                  <th>المادة</th>
                  <th>النوع</th>
                  <th>تفاصيل النوع</th>
                  <th>المبلغ</th>
                  <th>تاريخ التسجيل</th>
                  <th>المستخدم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSovereignRevenues.map((rev) => (
                  <tr key={rev.id}>
                    <td>{rev.department}</td>
                    <td>{rev.revenueInfo?.revenueName || ''}</td>
                    <td>{rev.revenueInfo?.section || ''}</td>
                    <td>{rev.revenueInfo?.chapter || ''}</td>
                    <td>{rev.revenueInfo?.material || ''}</td>
                    <td>{rev.revenueInfo?.type || ''}</td>
                    <td>{rev.revenueInfo?.typeDetails || ''}</td>
                    <td>{parseFloat(rev.revenueCost || 0).toLocaleString()}</td>
                    <td>{rev.recordedDate?.slice(0, 10) || rev.createdAt?.slice(0, 10)}</td>
                    <td>{rev.enteredUserName || ''}</td>
                    <td>
                      <OverlayTrigger placement="top" overlay={<Tooltip>عرض</Tooltip>}>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => {
                            setSelectedRevenue(rev);
                            setShowModal(true);
                          }}
                        >
                          <img src="/Images/eye-care.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="top" overlay={<Tooltip>تعديل</Tooltip>}>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(rev.id)}>
                          <img src="/Images/edit.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={DeleteTooltip}>
                        <button className="btn btn-danger mx-2 btn-sm" onClick={() => handleDelete(rev.id)}>
                          <img src="/Images/trash.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Non-Sovereign Revenues Table */}
        {activeTab === 'non-sovereign' && (
          <div>
            <div>
              <OverlayTrigger placement="top" overlay={<Tooltip>اضافة ايراد جديد</Tooltip>}>
                <button className="btn btn-outline-success btn-lg m-2" onClick={() => setShowNonSovereignModal(true)}>
                   اضافة الايرادات غير السيادية <img src="/Images/notes.png" alt="" width="25px" height="25px" />
                </button>
              </OverlayTrigger>
            </div>
            
            {/* Date Filter Section */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <label className="me-2">من تاريخ:</label>
                <input
                  type="date"
                  className="form-control me-3"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '150px' }}
                />
                <label className="me-2">إلى تاريخ:</label>
                <input
                  type="date"
                  className="form-control me-3"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '150px' }}
                />
                <OverlayTrigger placement="top" overlay={<Tooltip>إعادة تعيين الفلاتر</Tooltip>}>
                  <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                    إعادة تعيين
                  </button>
                </OverlayTrigger>
              </div>
              <div className="text-muted">
                النتائج المعروضة: {currentFilteredData.length} من أصل {totalRevenuesCount}
              </div>
            </div>
            
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>التشكيل</th>
                  <th>حصة الوزارة</th>
                  <th>حصة المالية</th>
                  <th>تأمين تعظيم الموارد</th>
                  <th>السنة</th>
                  <th>الشهر</th>
                  <th>تاريخ التسجيل</th>
                  <th>الملاحظات</th>
                  <th>المستخدم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredNonSovereignRevenues.map((rev) => (
                  <tr key={rev.id}>
                    <td>{rev.department}</td>
                    <td>{parseFloat(rev.ministryShare || 0).toLocaleString()}</td>
                    <td>{parseFloat(rev.financeShare || 0).toLocaleString()}</td>
                    <td>{parseFloat(rev.resourceMaximizationInsurance || 0).toLocaleString()}</td>
                    <td>{rev.year}</td>
                    <td>{rev.month}</td>
                    <td>{rev.recordedDate?.slice(0, 10) || rev.createdAt?.slice(0, 10)}</td>
                    <td>{rev.notes || ''}</td>
                    <td>{rev.enteredUserName || ''}</td>
                    <td>
                      <OverlayTrigger placement="top" overlay={<Tooltip>عرض</Tooltip>}>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => {
                            setSelectedRevenue(rev);
                            setShowModal(true);
                          }}
                        >
                          <img src="/Images/eye-care.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="top" overlay={<Tooltip>تعديل</Tooltip>}>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditNonSovereign(rev)}>
                          <img src="/Images/edit.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={DeleteTooltip}>
                        <button className="btn btn-danger mx-2 btn-sm" onClick={() => handleDelete(rev.id)}>
                          <img src="/Images/trash.png" alt="" width="15px" height="15px" />
                        </button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - only for sovereign revenues */}
        {activeTab === 'sovereign' && pageSize !== '' && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/Images/next.png" alt="" width="50px" height="50px" />
              </div>
            </button>
            <span>الصفحة {currentPage} من {totalPages}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/Images/previous.png" alt="" width="50px" height="50px" />
              </div>
            </button>
          </div>
        )}
      </div>
      
      {/* View Details Modal */}
      {showModal && selectedRevenue && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {activeTab === 'sovereign' ? 'تفاصيل الإيراد السيادي' : 'تفاصيل الإيراد غير السيادي'}
                </h5>
              </div>
              <div className="modal-body" style={{ direction: 'rtl', textAlign: 'right' }}>
                <p><strong>التشكيل:</strong> {selectedRevenue.department}</p>
                
                {activeTab === 'sovereign' ? (
                  <>
                    <p><strong>اسم الإيراد:</strong> {selectedRevenue.revenueInfo?.revenueName ?? 'غير متوفر'}</p>
                    <p><strong>القسم:</strong> {selectedRevenue.revenueInfo?.section ?? 'غير متوفر'}</p>
                    <p><strong>الفصل:</strong> {selectedRevenue.revenueInfo?.chapter ?? 'غير متوفر'}</p>
                                        <p><strong>المادة:</strong> {selectedRevenue.revenueInfo?.material ?? 'غير متوفر'}</p>
                    <p><strong>النوع:</strong> {selectedRevenue.revenueInfo?.type ?? 'غير متوفر'}</p>
                    <p><strong>تفاصيل النوع:</strong> {selectedRevenue.revenueInfo?.typeDetails ?? 'غير متوفر'}</p>
                    <p><strong>المبلغ:</strong> {parseFloat(selectedRevenue.revenueCost || 0).toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p><strong>حصة الوزارة:</strong> {parseFloat(selectedRevenue.ministryShare || 0).toLocaleString()}</p>
                    <p><strong>حصة المالية:</strong> {parseFloat(selectedRevenue.financeShare || 0).toLocaleString()}</p>
                    <p><strong>تأمين تعظيم الموارد:</strong> {parseFloat(selectedRevenue.resourceMaximizationInsurance || 0).toLocaleString()}</p>
                    <p><strong>السنة:</strong> {selectedRevenue.year}</p>
                    <p><strong>الشهر:</strong> {selectedRevenue.month}</p>
                  </>
                )}
                <p><strong>تاريخ التسجيل:</strong> {selectedRevenue.recordedDate?.slice(0, 10) || selectedRevenue.createdAt?.slice(0, 10)}</p>
                <p><strong>الملاحظات:</strong> {selectedRevenue.notes || 'لا توجد ملاحظات'}</p>
                <p><strong>المستخدم:</strong> {selectedRevenue.enteredUserName || 'غير متوفر'}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Non-Sovereign Revenue Modal */}
      {showNonSovereignModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">إضافة إيراد غير سيادي</h5>
                <button type="button" className="btn-close" onClick={() => setShowNonSovereignModal(false)}></button>
              </div>
              <div className="modal-body" style={{ direction: 'rtl', textAlign: 'right' }}>
                <form onSubmit={handleNonSovereignSubmit}>
                  <div className="mb-3">
                    <label className="form-label">التشكيل</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nonSovereignForm.department}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">حصة الوزارة</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nonSovereignForm.ministryShare}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, ministryShare: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">حصة المالية</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nonSovereignForm.financeShare}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, financeShare: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">تأمين تعظيم الموارد</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nonSovereignForm.resourceMaximizationInsurance}
                      onChange={(e) =>
                        setNonSovereignForm({ ...nonSovereignForm, resourceMaximizationInsurance: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">السنة</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nonSovereignForm.year}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      min="2000"
                      max="2100"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">الشهر</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nonSovereignForm.month}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, month: parseInt(e.target.value) || new Date().getMonth() + 1 })}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">تاريخ التسجيل</label>
                    <input
                      type="date"
                      className="form-control"
                      value={nonSovereignForm.recordedDate}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, recordedDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">الملاحظات</label>
                    <textarea
                      className="form-control"
                      value={nonSovereignForm.notes}
                      onChange={(e) => setNonSovereignForm({ ...nonSovereignForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNonSovereignModal(false)}>
                      إلغاء
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Non-Sovereign Revenue Modal */}
      {showEditNonSovereignModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تعديل الإيراد غير السيادي</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditNonSovereignModal(false)}></button>
              </div>
              <div className="modal-body" style={{ direction: 'rtl', textAlign: 'right' }}>
                <form onSubmit={handleEditNonSovereignSubmit}>
                  <div className="mb-3">
                    <label className="form-label">التشكيل</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editNonSovereignForm.department}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">حصة الوزارة</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editNonSovereignForm.ministryShare}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, ministryShare: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">حصة المالية</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editNonSovereignForm.financeShare}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, financeShare: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">تأمين تعظيم الموارد</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editNonSovereignForm.resourceMaximizationInsurance}
                      onChange={(e) =>
                        setEditNonSovereignForm({ ...editNonSovereignForm, resourceMaximizationInsurance: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">السنة</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editNonSovereignForm.year}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      min="2000"
                      max="2100"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">الشهر</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editNonSovereignForm.month}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, month: parseInt(e.target.value) || new Date().getMonth() + 1 })}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">تاريخ التسجيل</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editNonSovereignForm.recordedDate}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, recordedDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">الملاحظات</label>
                    <textarea
                      className="form-control"
                      value={editNonSovereignForm.notes}
                      onChange={(e) => setEditNonSovereignForm({ ...editNonSovereignForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditNonSovereignModal(false)}>
                      إلغاء
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}