import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "../Style/NavStyle.css";

export default function NavBar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [UserDepartment, setUserDepartment] = useState("");


  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const storedUserDepartment = localStorage.getItem("UserDepartment");
    if (storedUserDepartment) {
      setUserDepartment(storedUserDepartment);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5109/Auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      localStorage.removeItem("username");

      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("فشل تسجيل الخروج، حاول مرة أخرى.");
    }
  };

  const renderNavItem = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-decoration-none nav-link${isActive ? " active-link" : ""}`
      }
      end
      aria-current="page"
    >
      {label}
    </NavLink>
  );

  return (
    <nav
      className="bg-custom d-flex justify-content-between flex-row-reverse p-3"
      aria-label="Primary navigation"
    >
      <div className="fs-4 fw-bold hlogo">
        <NavLink to="/dashboard" className="nav-brand-link">
          نظام المنح والقروض
          <div style={{ display: 'flex', alignItems: 'center' ,justifyContent: 'center', margin:'0 10px' }}>
          <img src="/Images/bank.png" className="logo-shadow-rounded" alt="" width="50px" height="50px" /></div>

        </NavLink>
      </div>

      <ul className="d-flex flex-row-reverse gap-3 list-unstyled mb-0 align-items-center">
        <li>{renderNavItem("/dashboard", "الصفحة الرئيسية")}</li>
        <li>{renderNavItem("/contracts", " العقود")}</li>
        <li>{renderNavItem("/Loans", " القروض")}</li>
        <li>{renderNavItem("/RevenueList", " الايرادات")}</li>
        <li>{renderNavItem("/AdminPanel", "المستخدمين")}</li>
      </ul>

      <div className="d-flex align-items-center gap-2">
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="logout-tooltip">تسجيل الخروج</Tooltip>}
        >
          <button
            aria-label="تسجيل الخروج"
            className="btn btn-outline-danger logoutB"
            onClick={handleLogout}
            type="button"
          >
                    <span className="navbar-username">{username.toUpperCase() }</span>


            <img
              className="PowImg"
              src="/Images/power.gif"
              alt="Power GIF"
              style={{ borderRadius: "50%" }}
              width="20"
              height="20"
            />
          </button>
        </OverlayTrigger>
<h6 className="headingDep">{UserDepartment || "لا يوجد قسم"}</h6>
                  <span className="navbar-username">
                              <NavLink to="/ChangePassword" className="nav-brand-link">

                        تغيير كلمة المرور
                      </NavLink>
                    </span>
      </div>
    </nav>
  );
}
