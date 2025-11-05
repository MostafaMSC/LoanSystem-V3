import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/LoginForm.css";
import NavMenu from './NavMenu'
import Cards from './Cards'
import Footer from './Footer'
export default function MainDashboard() {
  const navigate = useNavigate();
useEffect(() => {
  setTimeout(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, 1000); // 100ms delay
}, []);


  

  return (
    <div class="main-wrapper">

    <div className="main-container">
          <NavMenu />

    <div className="dashboard-container">
    
        <div className="text-center mb-8 mt-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h2>
          <p className="text-gray-500">مرحبًا بك في نظام إدارة المنح والقروض</p>
        </div>

      <Cards />

    </div>
        </div>
    <Footer />
</div>


  );
}
