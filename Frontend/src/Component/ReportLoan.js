import React, { useEffect, useState } from 'react';
import api from '../Api/AxiosClient';
import '../Style/ContractsList.css';
import NavMenu from './NavMenu';
import Footer from './Footer';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';
export default function ReportLoan() {
    const [contracts, setContracts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { loanId } = useParams();
const totals = {
  contractAmount: 0,
  costChange: 0,
  costPlanMins: 0,
  costAfterChange: 0,
  costToNatiBank: 0,
  totalCostPaid: 0,
  operationLoanCost: 0,
  cashPaid: 0,
  taxesAndBlockedmoney: 0,
  privateMoneyPaid: 0,

  cashExecutionPercentage: 0,
  financialExecutionPercentage: 0,
  materialExecutionPercentage: 0,
  count: 0,
};


const actualFields = [
  { key: 'contractNumber', label: 'رقم المشروع' },
  { key: 'contractName', label: 'اسم المشروع' },
  { key: 'companyName', label: 'اسم الشركة' },
  { key: 'durationInDays', label: 'المدة المطلوبة (يوم)' },
  { key: 'addedDays', label: 'المدة المضافة' },
  { key: 'contractSigningDate', label: 'تاريخ توقيع العقد' },
  { key: 'startDate', label: 'تاريخ المباشرة' },
  { key: 'completeDate', label: 'تاريخ الانجاز على وفق العقد' },
  { key: 'contractAmount', label: 'مبلغ العقد' },
  { key: 'costChange', label: 'أوامر الغيار' },
  { key: 'costPlanMins', label: 'كلف الادراج بوزارة التخطيط' },
  { key: 'costAfterChange', label: 'كلفة العقد بعد أوامر التغيير' },
  { key: 'costToNatiBank', label: 'المرفوع للبنك الدولي' },
  { key: 'totalCostPaid', label: 'المصروف التراكمي' },
  { key: 'operationLoanCost', label: 'سلفة تشغيلية (10%)' },
  { key: 'cashPaid', label: 'المبالغ النقدية للشركة' },
  { key: 'taxesAndBlockedmoney', label: 'التأمينات والضرائب والغرامات' },
  { key: 'cashExecutionPercentage', label: 'نسب التنفيذ النقدية' },
  { key: 'financialExecutionPercentage', label: 'نسب التنفيذ المالية' },
  { key: 'materialExecutionPercentage', label: 'نسب التنفيذ المادية' },
  { key: 'privateMoneyPaid', label: 'المبالغ المطلوقة من الحساب الخاص' },
  { key: 'notes', label: 'الملاحظات' }
];

// Move this after defining `actualFields`
const [selectedFields, setSelectedFields] = useState(actualFields.map(f => f.key));


contracts.forEach(c => {
  totals.contractAmount += c.contractAmount || 0;
  totals.costChange += c.costChange || 0;
  totals.costPlanMins += c.costPlanMins || 0;
  totals.costAfterChange += c.costAfterChange || 0;
  totals.costToNatiBank += c.costToNatiBank || 0;
  totals.totalCostPaid += c.totalCostPaid || 0;
  totals.operationLoanCost += c.operationLoanCost || 0;
  totals.cashPaid += c.cashPaid || 0;
  totals.taxesAndBlockedmoney += c.taxesAndBlockedmoney || 0;
  totals.privateMoneyPaid += c.privateMoneyPaid || 0;

  const cashPercent = c.totalCostPaid ? (c.cashPaid / c.totalCostPaid) * 100 : 0;
  const financialPercent = c.totalCostPaid ? (c.costToNatiBank / c.totalCostPaid) * 100 : 0;
  const materialPercent = c.totalCostPaid ? (c.costAfterChange / c.totalCostPaid) * 100 : 0;

  totals.cashExecutionPercentage += cashPercent;
  totals.financialExecutionPercentage += financialPercent;
  totals.materialExecutionPercentage += materialPercent;

  totals.count += 1;
});

    console.log('loanId from params:', loanId);
const exportToExcel = () => {
  const table = document.getElementById('projects-table');

  if (!table) return;

  const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, 'projects.xlsx');
};

    const printReport = () => {
  window.print();
    };

    const fetchContracts = (page) => {
        console.log('fetchContracts called with:', { loanId, page }); // Debug log
        
        if (!loanId) {
            console.log('No loanId provided, exiting fetchContracts'); // Debug log
            return;
        }

        const url = `/Contracts/GetAllContractsByLoan?LoanId=${loanId}&page=${page}&pageSize=${pageSize}`;

        api.get(url)
            .then(res => {

                
                setContracts(res.data);
                setTotalPages(1);
                setError('');
            })
            .catch(err => {

                
                if (err.response?.status === 401) setError("Unauthorized – please login.");
                else setError("Error fetching contracts.");
            });
    };
const fieldOptions = actualFields.map(field => ({
  value: field.key,
  label: field.label
}));

const handleFieldChange = (selectedOptions) => {
  setSelectedFields(selectedOptions.map(option => option.value));
};
    const fetchLoans = async () => {
        try {
            const response = await api.get('/Loan/GetAllLoans');
            console.log('Loans response:', response.data); // Debug log
            setLoans(response.data?.loans || []);
        } catch (err) {
            console.error('Error fetching loans:', err);
        }
    };

    useEffect(() => {
        console.log('useEffect triggered with:', { loanId, currentPage }); // Debug log
        fetchContracts(currentPage);
        fetchLoans();
    }, [loanId, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Debug: Log current state
    console.log('Current state:', { contracts, contractsLength: contracts.length });


    return (
        <>
            <NavMenu />
            <div className="container my-5" style={{ direction: 'rtl' }}>
                <div style={{width: '100%'}} className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary">تقرير </h2>

                </div>

                <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
                          <InputLabel>اختر الأعمدة</InputLabel>
                    <FormControl style={{width:'400px'}} className="p-2">
  <Select
    multiple
    value={selectedFields}
    onChange={(e) => setSelectedFields(e.target.value)}
    renderValue={(selected) =>
      actualFields.filter(f => selected.includes(f.key)).map(f => f.label).join(', ')
    }
  >
    {actualFields.map((field) => (
      <MenuItem key={field.key} value={field.key}>
        <Checkbox checked={selectedFields.includes(field.key)} />
        <ListItemText primary={field.label} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
                    </div>


                {error && <div className="text-danger mb-3">{error}</div>}
                <button onClick={exportToExcel} className="btn btn-success mb-3">
  تصدير إلى Excel
</button>
<button onClick={printReport} className="btn btn-secondary mb-3 mx-3">
  طباعة التقرير
</button>


                </div>




                <div className="table-responsive" id="print-area">
                    <table className="table table-bordered table-hover text-center align-middle" id="projects-table">
                       <thead className="table-light">
  <tr>
    {actualFields
      .filter(field => selectedFields.includes(field.key))
      .map(field => (
        <th key={field.key}>{field.label}</th>
      ))}
  </tr>
</thead>


                        <tbody>
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan="23" className="text-center">لا توجد بيانات</td>
                                </tr>
                            ) : (
                                contracts.map(c => (
                                    <tr key={c.Id}>
  {actualFields
    .filter(field => selectedFields.includes(field.key))
    .map(field => {
      let value = c[field.key];
      if (['contractSigningDate', 'startDate', 'completeDate'].includes(field.key)) {
        value = value ? value.slice(0, 10) : '-';
      }
      if (
        ['cashExecutionPercentage', 'financialExecutionPercentage', 'materialExecutionPercentage'].includes(
          field.key
        )
      ) {
        const numerator =
          field.key === 'cashExecutionPercentage'
            ? c.cashPaid
            : field.key === 'financialExecutionPercentage'
            ? c.costToNatiBank
            : c.costAfterChange;
        value = c.totalCostPaid > 0 ? `%${((numerator / c.totalCostPaid) * 100).toFixed(1)}` : '0%';
      }
      return <td key={field.key}>{value ?? '-'}</td>;
    })}
</tr>

                                    
                                    
                                ))
                            )}
                            <tr className="table-secondary fw-bold">
  <td colSpan="8" className="text-end">المجموع</td>
  <td>{totals.contractAmount.toLocaleString()}</td>
  <td>{totals.costChange.toLocaleString()}</td>
  <td>{totals.costPlanMins.toLocaleString()}</td>
  <td>{totals.costAfterChange.toLocaleString()}</td>
  <td>{totals.costToNatiBank.toLocaleString()}</td>
  <td>{totals.totalCostPaid.toLocaleString()}</td>



  <td>{totals.operationLoanCost.toLocaleString()}</td>
  <td>{totals.cashPaid.toLocaleString()}</td>
  <td>{totals.taxesAndBlockedmoney.toLocaleString()}</td>
  {/* Percentages */}
  <td>{totals.count ? (totals.cashExecutionPercentage / totals.count).toFixed(2) + '%' : '0%'}</td>
  <td>{totals.count ? (totals.financialExecutionPercentage / totals.count).toFixed(2) + '%' : '0%'}</td>
  <td>{totals.count ? (totals.materialExecutionPercentage / totals.count).toFixed(2) + '%' : '0%'}</td>

  <td>{totals.privateMoneyPaid.toLocaleString()}</td>
  <td></td>
</tr>
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-center my-4 gap-3">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </button>
                    <span className="align-self-center">
                        الصفحة {currentPage} من {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}