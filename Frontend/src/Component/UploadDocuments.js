import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/AxiosClient';
import { toast } from 'react-toastify';
import NavMenu from './NavMenu';
import Footer from './Footer';

export default function UploadDocuments() {
  const { id } = useParams(); // Contract ID from route
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('يرجى اختيار ملفات للرفع');
      return;
    }

    const formData = new FormData();
    formData.append('ContractId', id);
    files.forEach(file => formData.append('Files', file));

    try {
      setUploading(true);
      await api.post('/Contracts/UploadContractDocuments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('تم رفع الوثائق بنجاح');
      navigate('/contracts');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء رفع الوثائق');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <NavMenu />
      <div className="container mt-5 mb-5">
        <h2 className="mb-4">رفع وثائق العقد</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="fileUpload" className="form-label">اختر الملفات:</label>
            <input
              type="file"
              id="fileUpload"
              className="form-control"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <div className="d-flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'جارٍ الرفع...' : 'رفع الملفات'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              رجوع
            </button>
          </div>
        </form>
        {files.length > 0 && (
          <div className="mt-4">
            <h5>الملفات المختارة:</h5>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
