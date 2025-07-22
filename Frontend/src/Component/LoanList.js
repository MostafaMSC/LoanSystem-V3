import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { toast as toastify } from 'react-toastify';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function LoanList() {
    const [Loans, setLoans] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
      const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
const fetchLoans = (page) => {
  api.get(`/Loan/GetAllLoans?page=${page}&pageSize=${pageSize}`)
    .then(res => {
      console.log("API Response:", res.data);

      const LoansData = res.data.loans ?? []; // Fix here!
      const totalCount = res.data.totalCount ?? 0;

      setLoans(LoansData);
      setTotalPages(Math.max(1, Math.ceil(totalCount / pageSize)));
      setError('');
    })
    .catch(err => {
      if (err.response?.status === 401)
        setError("Unauthorized – please login.");
      else
        setError("Error fetching contracts.");
    });
};

  const DeleteTooltip = <Tooltip id="logout-tooltip">حذف</Tooltip>;
  const EditTooltip = <Tooltip id="logout-tooltip">تعديل </Tooltip>;
  const ReportTooltip = <Tooltip id="logout-tooltip">تقرير </Tooltip>;

const loanTypeMap = {
  1: 'قرض خارجي', // ExternalLoan
  2: 'قرض داخلي', // InternalLoan
  3: 'منحة'       // Giving
};
  const Project_TYPES = [
    { id: 1, label: 'مستمر' },
    { id: 2, label: 'جديد' },
    { id: 3, label: 'مستحدث' },
    { id: 4, label: 'اعادة ادراج' }
  ];
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

    useEffect(() => {
        fetchLoans(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEdit = (id) => {
        navigate(`/EditLoan/${id}`);
    };

    const handleDelete = async (id) => {
      if (window.confirm("هل أنت متأكد أنك تريد حذف هذا القرض")) {
        try {
          await api.delete(`/Loan/DeleteLoan/${id}`);
          fetchLoans(currentPage); // refresh the list
          toast({
            title: "تم الحذف بنجاح",
            description: ``
          });
        } catch (err) {
          alert("حدث خطأ أثناء حذف العقد.");
        }
      }
    };

    const handleReport = async(id) => {
      navigate(`/ReportLoan/${id}`);
    }

    // Filter contracts by searchTerm on ContractName or CompanyName
    const filteredLoans = Loans.filter(
      (Loan) =>
    (Loan.LoanName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <NavMenu />
            <div className="contracts-container">
                        <div className="fss" style={{backgroundColor: '#f8961e'}}>
              <div>القروض الخارجية: {filteredLoans.filter((c) => c.loan_Type == 1).length} من أصل {filteredLoans.length}
              </div>
              <div>
              القروض الداخلية: {filteredLoans.filter((c) => c.loan_Type == 2).length} من أصل {filteredLoans.length}
              </div>
              <div>
              المنح: {filteredLoans.filter((c) => c.loan_Type == 3).length} من أصل {filteredLoans.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' ,justifyContent: 'center'}}><img src="/Images/statistics.png"  alt="" width="50px" height="50px" /></div>
          </div>
                <div className='d-flex justify-content-around align-items-start'>
                    <h2>جدول القروض</h2>
                    {error && <p className="error">{error}</p>}
                    <button className='btn btn-success'>
                      <a href='/AddLoan' className='text-white text-decoration-none'>
                        اضافة قرض <img src="/Images/signing.png" alt='' width='30px' height='30px' />
                      </a>
                    </button>

                    <div className="search-container">
                      <input
                        type="text"
                        className="search-input"
                        placeholder="البحث في القروض..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <img src="/Images/search.png" alt="" className="search-icon" />
                    </div>
                </div>

                <table className="contracts-table">
                    <thead>
                        <tr>
                            <th>اسم القرض</th>
                            <th>الميزانية</th>
                            <th> نوع القرض</th>
                            <th>العملة</th>
                            <th>الجهة المستفيدة</th>
                            <th>الموقع</th>
                            <th>نوع المشروع</th>
                            <th>الهدف من المشروع</th>
                            <th>وصف المشروع</th>
                            <th>الاجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.map((c) => (
                            <tr  >
                                <td>{c.loanName}</td>
                                <td>{c.budget}</td>
                                <td>{loanTypeMap[c.loan_Type] || 'غير معروف'}</td>
                                <td>{c.currency}</td>
                                <td>{c.benfitDep}</td>
                                <td>{c.location}</td>
                                <td>{Project_TYPES.find((type) => type.id === c.projectType)?.label || 'غير معروف'}</td>

                                <td>{c.projectTarget}</td>
                                <td>{c.projectDescription}</td>
                                <td>
                                  <OverlayTrigger placement="top" overlay={<Tooltip>عرض</Tooltip>}>
                                    <button className="btn btn-info btn-sm me-2" onClick={() => {
                                      setSelectedLoan(c);
                                      setShowModal(true);
                                    }}>
                                      <img src="/Images/eye-care.png" alt="" width="15px" height="15px" />
                                    </button>
                                  </OverlayTrigger>

                                          <OverlayTrigger placement="top" overlay={EditTooltip}>
                                  
                                    <button
                                      className="btn btn-outline-primary btn-sm me-2"
                                      onClick={() => handleEdit(c.id)}
                                    >
                                      <img src="/Images/edit.png" alt='' width='15px' height='15px' />
                                    </button>
                                          </OverlayTrigger>

                                          <OverlayTrigger placement="top" overlay={DeleteTooltip}>

                                    <button
                                      className="btn btn-danger mx-2 btn-sm"
                                      onClick={() => handleDelete(c.id)}
                                    >
                                      <img src="/Images/trash.png" alt='' width='15px' height='15px' />
                                    </button>
                                          </OverlayTrigger>


                                    <OverlayTrigger placement="top" overlay={ReportTooltip}>

                                                              <button
                                      className="btn btn-outline-success btn-sm me-2"
                                      onClick={() => handleReport(c.id)}
                                    >
                                      <img src="/Images/Report.png" alt='' width='15px' height='15px' />
                                    </button>
                                      </OverlayTrigger>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination">
                              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <div style={{ display: 'flex', alignItems: 'center' ,justifyContent: 'center'}}><img src="/Images/next.png"  alt="" width="50px" height="50px" /></div>

            </button>
            <span>الصفحة {currentPage} من {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
    <div style={{ display: 'flex', alignItems: 'center' ,justifyContent: 'center'}}><img src="/Images/previous.png"  alt="" width="50px" height="50px" /></div>

            </button>
                </div>
            </div>
            {showModal && selectedLoan && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-lg" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">تفاصيل القرض</h5>

        </div>
        <div className="modal-body" style={{ direction: 'rtl', textAlign: 'right' }}>
          <p><strong>اسم القرض:</strong> {selectedLoan.loanName}</p>
          <p><strong>نوع القرض:</strong> {loanTypeMap[selectedLoan.loan_Type] || 'غير معروف'}</p>
          <p><strong>الميزانية:</strong> {selectedLoan.budget.toLocaleString()}</p>
          <p><strong>العملة:</strong> {selectedLoan.currency}</p>
          <p><strong>الموقع:</strong> {selectedLoan.location}</p>
          <p><strong>نوع المشروع:</strong> {selectedLoan.projectType}</p>
          <p><strong>هدف المشروع:</strong> {selectedLoan.projectTarget}</p>
          <p><strong>وصف المشروع:</strong> {selectedLoan.projectDescription || 'لا يوجد'}</p>
          <p><strong>سنة الادخال:</strong> {selectedLoan.putYear ?? 'غير محددة'}</p>
          <p><strong>مدة الإنجاز (سنة):</strong> {selectedLoan.noYearTOComplete ?? 'غير محددة'}</p>
          <p><strong>سنة الإنجاز الفعلية:</strong> {selectedLoan.actualFinishYear ?? 'غير محددة'}</p>
          <p><strong>تاريخ الإضافة:</strong> {selectedLoan.createdAt?.slice(0, 10)}</p>
          <p><strong>آخر تحديث:</strong> {selectedLoan.updatedAt?.slice(0, 10)}</p>
          <p><strong>المستخدم المدخل:</strong> {selectedLoan.enteredUserName}</p>
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
