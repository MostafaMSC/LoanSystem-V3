import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = lazy(() => import('./Component/Login'));
const RegisterForm = lazy(() => import('./Component/Register'));
const MainDashboard = lazy(() => import('./Component/MainDashboard'));
const ContractsList = lazy(() => import('./Component/ContractList'));
const AddContract = lazy(() => import('./Component/AddContract'));
const EditContract = lazy(() => import('./Component/EditContract'));
const LoanList = lazy(() => import('./Component/LoanList'));
const AddLoan = lazy(() => import('./Component/AddLoan'));
const EditLoan = lazy(() => import('./Component/EditLoan'));
const AddRevenu = lazy(() => import('./Component/AddRevenu'));
const ReportLoan = lazy(() => import('./Component/ReportLoan'));
const AdminPanel = lazy(() => import('./Component/AdminPanel'));
const ProtectedRoute = lazy(() => import('./Component/ProtectedRoute'));
const NotFound = lazy(() => import('./Component/NotFound'));
const Revenue = lazy(()=>  import('./Component/AddRevenuCosts'))
const EditRevenue = lazy(()=> import('./Component/EditRevenueCost'))
const RevenueList = lazy(()=> import('./Component/RevenueCostList'))
const RevenueCostReport = lazy(()=> import('./Component/RevenueCostReport'))
const ChangePassword = lazy(()=> import('./Component/PasswordChangeForm'))
const UploadDocuments = lazy(() => import('./Component/UploadDocuments'));
const RevenueTotalReport = lazy(() => import('./Component/RevenueTotalReport'));
const AdminDashboard = lazy(() => import('./Component/AdminDashboard.tsx'));
const Department = lazy(() => import('./Component/Departments.js'));
function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard" element={<MainDashboard />} />

          {/* Contracts */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'ArchiveUser']}>
                <ContractsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddContract"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'ArchiveUser']}>
                <AddContract />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UploadDocuments/:id"
            element={<UploadDocuments />}
          />

          <Route
            path="/EditContract/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'ArchiveUser']}>
                <EditContract />
              </ProtectedRoute>
            }
          />

          {/* Loans */}
          <Route
            path="/loans"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'LoanUser']}>
                <LoanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddLoan"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'LoanUser']}>
                <AddLoan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditLoan/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'LoanUser']}>
                <EditLoan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ReportLoan/:loanId"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ReportLoan />
              </ProtectedRoute>
            }
          />
          {/* Department */}
          <Route
            path="/Department"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                <Department />
              </ProtectedRoute>
            }
          />

          {/* Revenue */}
          <Route
            path="/AddRevenu/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                <AddRevenu />
              </ProtectedRoute>
            }
          />

          {/* AdminDashboard */}
          <Route
            path="/AdminDashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/AdminPanel"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Revenue"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Revenue />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/EditRevenueCosts/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <EditRevenue />
              </ProtectedRoute>
            }
          />
          
                    <Route
            path="/RevenueList"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RevenueList />
              </ProtectedRoute>
            }
          />
          
                    <Route
            path="/RevenueCostReport"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RevenueCostReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RevenueTotalReport"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RevenueTotalReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ChangePassword"
            element={
                <ChangePassword />
            }
          />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>


      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
