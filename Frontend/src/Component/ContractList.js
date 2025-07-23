import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast as toastify } from 'react-toastify';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../Style/Cards.css';
import AddContract from './AddContract';
import EditContract from './EditContract';
import AddRevenue from './AddRevenu'
export default function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [totalPages, setTotalPages] = useState(1);
  const [totalContractsCount, setTotalContractsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [contractDocuments, setContractDocuments] = useState([]);
  const [showAddContract, setShowAddContract] = useState(false);
  const [showEditContract, setShowEditContract] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [dateFilterType, setDateFilterType] = useState('contractSigningDate'); // or 'startDate'
  const [quickDateFilter, setQuickDateFilter] = useState('');

  const CONTRACT_TYPES = [
    { id: 1, label: 'استشاري' },
    { id: 2, label: 'تجهيز' },
    { id: 3, label: 'اعمال' },
    { id: 4, label: 'اخرى' }
  ];
  
  const STATE_TYPES = [
    { id: '1', Status: 'مستمر' },
    { id: '2', Status: 'منجز' },
  ];

  const QUICK_DATE_FILTERS = [
    { value: '', label: 'جميع التواريخ' },
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'thisWeek', label: 'هذا الأسبوع' },
    { value: 'lastWeek', label: 'الأسبوع الماضي' },
    { value: 'thisMonth', label: 'هذا الشهر' },
    { value: 'lastMonth', label: 'الشهر الماضي' },
    { value: 'thisYear', label: 'هذا العام' },
    { value: 'lastYear', label: 'العام الماضي' },
    { value: 'custom', label: 'تخصيص' }
  ];
const initialColumns = [
  { key: 'contractNumber', label: 'رقم العقد', visible: true },
  { key: 'contractName', label: 'اسم العقد', visible: true },
  { key: 'companyName', label: 'اسم الشركة', visible: true },
  { key: 'contractType', label: 'نوع العقد', visible: true },
  { key: 'status', label: 'حالة العقد', visible: true },
  { key: 'durationInDays', label: 'المدة المطلوبة (يوم)', visible: true },
  { key: 'addedDays', label: 'المدة المضافة', visible: false },
  { key: 'costChange', label: 'أوامر الغيار', visible: false },
  { key: 'costPlanMins', label: 'كلف الادراج بوزارة التخطيط', visible: false },
  { key: 'costToNatiBank', label: 'المرفوع للبنك الدولي', visible: false },
  { key: 'totalCostPaid', label: 'المصروف التراكمي', visible: false },
  { key: 'loanId', label: 'القرض المرتبط', visible: false },
  { key: 'contractSigningDate', label: 'تاريخ توقيع العقد', visible: false },
  { key: 'startDate', label: 'تاريخ المباشرة', visible: false },
  { key: 'contractAmount', label: 'مبلغ العقد', visible: false },
  { key: 'insuranceDeposits', label: 'الضمانات', visible: false },
  { key: 'taxTrusts', label: 'الأمانات الضريبية', visible: false },
  { key: 'penalties', label: 'الغرامات', visible: false },
  { key: 'operationLoanCost', label: 'تكلفة تشغيل القرض', visible: false },
  { key: 'actions', label: 'الإجراءات', visible: true }
];

const [columns, setColumns] = useState(initialColumns);
    const printReport = () => {
  window.print();
    };
const getContractTypeLabel = (id) => {
  return CONTRACT_TYPES.find(type => type.id === id)?.label ?? '';
};

const getStateTypeLabel = (id) => {
  return STATE_TYPES.find(type => type.id === id)?.Status ?? '';
};

const handleCancel = () => {
    setShowEditContract(false);
    setShowAddContract(false);
    setShowAddRevenue(false);
    fetchContracts(currentPage);
    fetchLoans();
};

  const getLoanNameById = (loanId) => {
    if (!loanId || !loans.length) return 'غير محدد';
    const loan = loans.find((loan) => (loan.id || loan.ID) == loanId);
    return loan ? (loan.loanName || loan.name || 'قرض') : 'غير موجود';
  };

  const fetchContracts = async (page) => {
    const size = pageSize === '' ? 0 : parseInt(pageSize);
    try {
      const res = await api.get(`/Contracts/GetAllContracts?page=${page}&pageSize=${size}`);
      setContracts(res.data.contracts);
      setTotalContractsCount(res.data.totalCount || res.data.contracts.length);
      setTotalPages(size > 0 ? Math.ceil(res.data.totalCount / size) : 1);
      setError('');
    } catch (err) {
      setError('حدث خطأ أثناء جلب العقود.');
    }
  };

  const fetchDocuments = async (contractId) => {
    try {
      const res = await api.get(`/Contracts/GetDocumentsByContractId/${contractId}`);
      setContractDocuments(res.data.documents || []);
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في جلب الوثائق' });
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/Loan/GetAllLoans');
      setLoans(response.data?.loans || []);
    } catch {
      console.error('Error fetching loans');
    }
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

  const getDateRangeFromQuickFilter = (filterType) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filterType) {
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return { start: yesterdayStr, end: yesterdayStr };
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { 
          start: startOfWeek.toISOString().split('T')[0], 
          end: endOfWeek.toISOString().split('T')[0] 
        };
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return { 
          start: lastWeekStart.toISOString().split('T')[0], 
          end: lastWeekEnd.toISOString().split('T')[0] 
        };
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { 
          start: firstDayOfMonth.toISOString().split('T')[0], 
          end: lastDayOfMonth.toISOString().split('T')[0] 
        };
      case 'lastMonth':
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { 
          start: firstDayOfLastMonth.toISOString().split('T')[0], 
          end: lastDayOfLastMonth.toISOString().split('T')[0] 
        };
      case 'thisYear':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
        return { 
          start: firstDayOfYear.toISOString().split('T')[0], 
          end: lastDayOfYear.toISOString().split('T')[0] 
        };
      case 'lastYear':
        const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        return { 
          start: firstDayOfLastYear.toISOString().split('T')[0], 
          end: lastDayOfLastYear.toISOString().split('T')[0] 
        };
      default:
        return { start: '', end: '' };
    }
  };

  // Handle quick date filter change
  const handleQuickDateFilterChange = (filterType) => {
    setQuickDateFilter(filterType);
    if (filterType === 'custom') {
      // Keep current custom dates
      return;
    }
    if (filterType === '') {
      // Reset all dates
      setStartDate('');
      setEndDate('');
      return;
    }
    const { start, end } = getDateRangeFromQuickFilter(filterType);
    setStartDate(start);
    setEndDate(end);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setQuickDateFilter('');
    setDateFilterType('contractSigningDate');
    setShowDateFilters(false);
  };

  useEffect(() => {
    fetchContracts(currentPage);
    fetchLoans();
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (id) => setShowEditContract(id);
  const handleRevenue = (id) => setShowAddRevenue(id);
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا العقد؟')) {
      try {
        await api.delete(`/Contracts/DeleteContract/${id}`);
        fetchContracts(currentPage);
        toast({ title: 'تم الحذف بنجاح', description: '' });
      } catch {
        alert('حدث خطأ أثناء حذف العقد.');
      }
    }
  };

  const handleDeleteDoc = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستند')) {
      try {
        await api.delete(`/Contracts/DeleteContractDocument/${id}`);
        fetchContracts(currentPage);
        toast({ title: 'تم الحذف بنجاح', description: '' });
      } catch {
        alert('حدث خطأ أثناء حذف العقد.');
      }
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      (contract.contractNumber?.toString() ?? '').includes(searchTerm.toLowerCase()) ||
      (contract.contractName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (contract.companyName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (contract.durationInDays?.toString() ?? '').includes(searchTerm.toLowerCase()) ||
  (contract.contractAmount?.toString() ?? '').includes(searchTerm.toLowerCase()) ||
      (getContractTypeLabel(contract.contractType)?.toLowerCase() ?? '').includes(searchTerm)||
      (getStateTypeLabel(contract.status)?.toLowerCase() ?? '').includes(searchTerm)||

      getLoanNameById(contract.loanId).toLowerCase().includes(searchTerm.toLowerCase());

    // Use the selected date field for filtering
    const contractDate = new Date(contract[dateFilterType]);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const isInRange =
      (!start || contractDate >= start) &&
      (!end || contractDate <= end);

    return matchesSearch && isInRange;
  });

  return (
    <>
      <NavMenu />
      <div className="contracts-container"> 
        <div className="dashboard-cards">
          <div className="fss">
            <div>العقود المنجزة: {filteredContracts.filter((c) => c.status == 2).length} من أصل {filteredContracts.length}</div>
            <div>العقود المستمرة: {filteredContracts.filter((c) => c.status == 1).length} من أصل {filteredContracts.length}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/Images/checked.png" alt="" width="50px" height="50px" />
            </div>
          </div>

          <div className="fss">
            <div>العقود الاستشارية: {filteredContracts.filter((c) => c.contractType == 1).length} من أصل {filteredContracts.length}</div>
            <div>العقود التجهيزية: {filteredContracts.filter((c) => c.contractType == 2).length} من أصل {filteredContracts.length}</div>
            <div>عقود الاعمال: {filteredContracts.filter((c) => c.contractType == 3).length} من أصل {filteredContracts.length}</div>
            <div>عقود اخرى: {filteredContracts.filter((c) => c.contractType == 4).length} من أصل {filteredContracts.length}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/Images/statistics.png" alt="" width="50px" height="50px" />
            </div>
          </div>
          
          <div className="fss">
            {loans.map((loan) => {
              const loanId = loan.id || loan.ID;
              const loanName = loan.loanName || loan.name || 'قرض غير معروف';
              const count = filteredContracts.filter((c) => c.loanId == loanId).length;
              return (
                <div key={loanId}>
                  <div>{loanName}: {count} عقد</div>
                </div>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/Images/list.png" alt="" width="50px" height="50px" />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-around align-items-start p-2 gap-1">
          {error && <p className="error">{error}</p>}

          <button className="btn btn-success" onClick={() => setShowAddContract(true)}>
              اضافة عقد <img src="/Images/notes.png" alt="" width="30px" height="30px" />
          </button>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="البحث في العقود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/Images/search.png" alt="" className="search-icon" />
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowDateFilters(!showDateFilters)}
            >
              <img src="/Images/calendar.png" alt="" width="20px" height="20px" className="m-1" />
              {showDateFilters ? 'إخفاء تصفية التاريخ' : 'تصفية حسب التاريخ'}
            </button>
            
            <button
              className="btn btn-outline-warning"
              onClick={resetAllFilters}
              title="إعادة تعيين جميع الفلاتر"
            >
              <img src="/Images/reload.png" alt="" width="20px" height="20px" className="m-1" />
              إعادة تعيين
            </button>
          </div>
<div className="dropdown mb-2">
  <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    تخصيص الأعمدة
  </button>
  <ul className="dropdown-menu p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
    {columns.map((col, idx) => (
      <li key={col.key} className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id={`col-${col.key}`}
          checked={col.visible}
          onChange={() => {
            const updated = [...columns];
            updated[idx].visible = !updated[idx].visible;
            setColumns(updated);
          }}
        />
        <label className="form-check-label" htmlFor={`col-${col.key}`}>
          {col.label}
        </label>
      </li>
    ))}
  </ul>
</div>
<button onClick={printReport} className="btn btn-outline-secondary mb-3 mx-3">
  طباعة التقرير
</button>
          {showDateFilters && (
            <div className="date-filters-container bg-light p-3 rounded border w-100">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label fw-bold">نوع التاريخ للتصفية:</label>
                  <select
                    className="form-select"
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                  >
                    <option value="contractSigningDate">تاريخ توقيع العقد</option>
                    <option value="startDate">تاريخ مباشرة العقد</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">تصفية سريعة:</label>
                  <select
                    className="form-select"
                    value={quickDateFilter}
                    onChange={(e) => handleQuickDateFilterChange(e.target.value)}
                  >
                    {QUICK_DATE_FILTERS.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(quickDateFilter === 'custom' || quickDateFilter === '') && (
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">من تاريخ:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setQuickDateFilter('custom');
                      }}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">إلى تاريخ:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setQuickDateFilter('custom');
                      }}
                    />
                  </div>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <strong>التصفية الحالية:</strong> 
                      {startDate && ` من ${startDate}`}
                      {endDate && ` إلى ${endDate}`}
                      {` (${dateFilterType === 'contractSigningDate' ? 'تاريخ التوقيع' : 'تاريخ المباشرة'})`}
                      <span className="ms-2">
                        عدد العقود المطابقة: <strong>{filteredContracts.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="col-md-2">
            <select
              name="ContractType"
              className="form-control"
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 عقود (من أصل {totalContractsCount} عقد)</option>
              <option value={20}>20 عقد (من أصل {totalContractsCount} عقد)</option>
              <option value={30}>30 عقد (من أصل {totalContractsCount} عقد)</option>
              <option value={40}>40 عقد (من أصل {totalContractsCount} عقد)</option>
              <option value={50}>50 عقد (من أصل {totalContractsCount} عقد)</option>
              <option value={100}>100 عقد (من أصل {totalContractsCount} عقد)</option>
            </select>
          </div>
        </div>

        <table className="contracts-table table-responsive" id="print-area">

          <thead>
  <tr>
    {columns.map(
      (col) => col.visible && <th key={col.key}>{col.label}</th>
    )}
  </tr>
</thead>
<tbody>
  {filteredContracts.map((c) => (
    <tr key={c.id}>
      {columns.map((col) => {
        if (!col.visible) return null;

        switch (col.key) {
          case 'contractType':
            return <td key={col.key}>{getContractTypeLabel(c.contractType)}</td>;
          case 'status':
            return <td key={col.key}>{getStateTypeLabel(c.status)}</td>;
          case 'loanId':
            return <td key={col.key}>{getLoanNameById(c.loanId)}</td>;
          case 'contractSigningDate':
          case 'startDate':
            return <td key={col.key}>{c[col.key]?.slice(0, 10)}</td>;
          case 'actions':
            return (
              <td key={col.key}>
<OverlayTrigger placement="top" overlay={<Tooltip>اضافة الوثائق</Tooltip>}>
                    <button
                      className="btn btn-warning mx-2 btn-sm me-0"
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setShowUploadModal(true);
                      }}
                    >
                      <img src="/Images/folder.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>عرض</Tooltip>}>
                    <button className="btn btn-info btn-sm me-0" onClick={() => {
                      setSelectedContract(c);
                      fetchDocuments(c.id);
                      setShowModal(true);
                    }}>
                      <img src="/Images/eye-care.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>تعديل</Tooltip>}>
                    <button className="btn btn-outline-primary btn-sm me-1" onClick={() => handleEdit(c.id)}>
                      <img src="/Images/edit.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>حذف</Tooltip>}>
                    <button className="btn btn-danger mx-2 btn-sm me-1" onClick={() => handleDelete(c.id)}>
                      <img src="/Images/trash.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>البيانات المالية</Tooltip>}>
                    <button className="btn btn-success mx-2 btn-sm me-1" onClick={() => handleRevenue(c.id)}>
                      <img src="/Images/increase.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
              </td>
            );
          default:
            return <td key={col.key}>{c[col.key]}</td>;
        }
      })}
    </tr>
  ))}
</tbody>

        </table>

        {pageSize !== '' && (
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/Images/next.png" alt="" width="50px" height="50px" />
              </div>
            </button>
            <span>الصفحة {currentPage} من {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/Images/previous.png" alt="" width="50px" height="50px" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Modal for viewing contract details */}
      {showModal && selectedContract && (
<div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setShowModal(false)}>
  <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>

            <div className="modal-content" >
              <div className="modal-header">
                <h5 className="modal-title">تفاصيل العقد</h5>
              </div>
              <div className="modal-body" >
                <p><strong>رقم العقد:</strong> {selectedContract.contractNumber}</p>
                <p><strong>اسم العقد:</strong> {selectedContract.contractName}</p>
                <p><strong>الشركة:</strong> {selectedContract.companyName}</p>
                <p><strong>نوع العقد:</strong> {CONTRACT_TYPES.find(t => t.id === selectedContract.contractType)?.label || 'غير معروف'}</p>
                <p><strong>حالة العقد:</strong> {STATE_TYPES.find(s => s.id === selectedContract.status)?.Status || 'غير معروف'}</p>
                <p><strong>المدة المطلوبة:</strong> {selectedContract.durationInDays} يوم</p>
                <p><strong>القرض المرتبط:</strong> {getLoanNameById(selectedContract.loanId)}</p>
                <p><strong>المدة المضافة:</strong> {selectedContract.addedDays}</p>
                <p><strong>تاريخ التوقيع:</strong> {selectedContract.contractSigningDate?.slice(0, 10)}</p>
                <p><strong>تاريخ المباشرة:</strong> {selectedContract.startDate?.slice(0, 10)}</p>
                <p><strong>مبلغ العقد:</strong> {selectedContract.contractAmount}</p>
                <p><strong>ملاحظات:</strong> {selectedContract.notes}</p>
                <hr />
                <h5>الوثائق المرفقة:</h5>
                {contractDocuments.length > 0 ? (
                  <ul>
                    {contractDocuments.map((doc) => (
                      <li key={doc.id}>
                        <NavLink
                          to={`http://localhost:5109${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 {doc.fileName}
                        </NavLink>
                                          <OverlayTrigger placement="top" overlay={<Tooltip>حذف</Tooltip>}>
                    <button className="btn btn-danger mx-2 btn-sm me-1" onClick={() => handleDeleteDoc(doc.id)}>
                      <img src="/Images/trash.png" alt="" width="15px" height="15px" />
                    </button>
                  </OverlayTrigger>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>لا توجد وثائق مرفقة لهذا العقد.</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddContract && (
        <div className="modal-backdrop" onClick={() => setShowAddContract(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowAddContract(false)}
            >
              إغلاق
            </button>
            <AddContract 
              onClose={() => handleCancel()} 
            />
          </div>
        </div>
      )}

      {/* Modal for uploading documents */}
      {showUploadModal && (
<div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setShowUploadModal(false)}>
  <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>

            <div className="modal-content"  >
              <div className="modal-header">
                <h5 className="modal-title">إرفاق وثائق للعقد ذو التسلسل {selectedContractId}</h5>
                <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles([...e.target.files])}
                  className="form-control"
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (selectedFiles.length === 0) {
                      toast({ title: 'تنبيه', description: 'يرجى اختيار ملفات أولاً' });
                      return;
                    }
                    const formData = new FormData();
                    selectedFiles.forEach((file) => formData.append('Files', file));
                    formData.append('ContractId', selectedContractId);

                    try {
                      await api.post('/Contracts/UploadContractDocuments', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      toast({ title: 'تم الرفع', description: 'تم رفع الوثائق بنجاح' });
                      setShowUploadModal(false);
                      setSelectedFiles([]);
                    } catch (error) {
                      toast({ title: 'خطأ', description: 'فشل في رفع الوثائق' });
                    }
                  }}
                >
                  رفع الوثائق
                </button>
                <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
{showEditContract && (
        <div className="modal-backdrop" onClick={() => setShowEditContract(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowEditContract(false)}
            >
              إغلاق
            </button>
            <EditContract
              contractId={showEditContract}
              onClose={() => handleCancel()}
            />
          </div>
        </div>
      )}

      {showAddRevenue && (
        <div className="modal-backdrop" onClick={() => setShowAddRevenue(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowAddRevenue(false)}
            >
              إغلاق
            </button>
            <AddRevenue
              contractId={showAddRevenue}
              onClose={() => handleCancel()}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}