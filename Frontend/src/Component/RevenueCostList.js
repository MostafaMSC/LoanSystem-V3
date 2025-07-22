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
  const [revenues, setRevenues] = useState([]);
  const [allRevenueInfo, setAllRevenueInfo] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenuesCount, setTotalRevenuesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const DeleteTooltip = <Tooltip id="delete-tooltip">حذف</Tooltip>;

  useEffect(() => {
    fetchRevenues(currentPage);
    fetchAllRevenueInfo();
  }, [currentPage, pageSize]);

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

  const handleEdit = (id) => navigate(`/EditRevenueCosts/${id}`);
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الايراد؟')) {
      try {
        await api.delete(`/BudgetRevenue/DeleteRevenueCostById/${id}`);
        fetchRevenues(currentPage);
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

  const filteredRevenues = enrichedRevenues.filter((rev) => {
    const term = searchTerm.toLowerCase();
    
    // Text search filter
    const matchesSearch = (
      rev.department?.toLowerCase().includes(term) ||
      rev.notes?.toLowerCase().includes(term) ||
      rev.year?.toString().includes(term) ||
      rev.month?.toString().includes(term) ||
      rev.enteredUserName?.toLowerCase().includes(term) ||
      rev.revenueCost?.toString().includes(term) ||
      (rev.revenueInfo?.revenueName || '').toLowerCase().includes(term)
    );

    // Date range filter
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

  return (
    <>
      <NavMenu />
      <div className="contracts-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>جدول الإيرادات</h2>
          {error && <p className="error">{error}</p>}

          <div>
            <OverlayTrigger placement="top" overlay={<Tooltip>اضافة ايراد جديد</Tooltip>}>
              <button className="btn btn-outline-success btn-lg me-2" onClick={() => navigate(`/Revenue`)}>
                اضافة <img src="/Images/notes.png" alt="" width="25px" height="25px" />
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
            النتائج المعروضة: {filteredRevenues.length} من أصل {totalRevenuesCount}
          </div>
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
            {filteredRevenues.map((rev) => (
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

        {pageSize !== '' && (
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
      
      {showModal && selectedRevenue && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تفاصيل الإيراد</h5>
              </div>
              <div className="modal-body" style={{ direction: 'rtl', textAlign: 'right' }}>
                <p><strong>التشكيل:</strong> {selectedRevenue.department}</p>
                <p><strong>اسم الإيراد:</strong> {selectedRevenue.revenueInfo?.revenueName ?? 'غير متوفر'}</p>
                <p><strong>القسم:</strong> {selectedRevenue.revenueInfo?.section ?? 'غير متوفر'}</p>
                <p><strong>الفصل:</strong> {selectedRevenue.revenueInfo?.chapter ?? 'غير متوفر'}</p>
                <p><strong>المادة:</strong> {selectedRevenue.revenueInfo?.material ?? 'غير متوفر'}</p>
                <p><strong>النوع:</strong> {selectedRevenue.revenueInfo?.type ?? 'غير متوفر'}</p>
                <p><strong>تفاصيل النوع:</strong> {selectedRevenue.revenueInfo?.typeDetails ?? 'غير متوفر'}</p>
                <p><strong>المبلغ:</strong> {parseFloat(selectedRevenue.revenueCost || 0).toLocaleString()} د.ع</p>
                <p><strong>التاريخ:</strong> {selectedRevenue.recordedDate?.slice(0, 10) || selectedRevenue.createdAt?.slice(0, 10)}</p>
                <p><strong>الملاحظات:</strong> {selectedRevenue.notes || 'لا يوجد'}</p>
                <p><strong>المستخدم:</strong> {selectedRevenue.enteredUserName || 'غير معروف'}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}