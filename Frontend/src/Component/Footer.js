import React from 'react';
import '../Style/Footer.css';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function Footer() {
  const logoutTooltip = <Tooltip id="logout-tooltip" className="custom-tooltip">المبرمجين : مصطفى نجم - جيان حسين</Tooltip>;

  return (
    <OverlayTrigger placement="top" className="custom-tooltip"  overlay={logoutTooltip}>
    
    <footer className="page-footer">
      جميع الحقوق محفوظة © {new Date().getFullYear()} قسم تقنية المعلومات
    </footer>
    </OverlayTrigger>
    
  );
}