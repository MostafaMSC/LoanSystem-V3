import React from 'react';
import { Navigate } from 'react-router-dom';

const getUserRoles = () => {
const rolesStr = localStorage.getItem('roles');
if (!rolesStr) return [];
try {
    return JSON.parse(rolesStr);
} catch {
    return [];
}
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRoles = getUserRoles();

  // Check if userRoles has at least one role in allowedRoles
  const isAllowed = userRoles.some(role => allowedRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
