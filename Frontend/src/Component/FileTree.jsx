import React, { useState } from "react";
import api from '../Api/AxiosClient';

function buildTree(files) {
  const tree = {};
  
  if (!Array.isArray(files) || files.length === 0) {
    return tree;
  }

  files.forEach((item) => {
    // Handle both string paths and objects
    let path = typeof item === 'string' ? item : item.path || item.filePath || item.name || '';
    
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path value:', item);
      return;
    }

    // Extract the relevant part of the path
    // If it contains the full URL structure, get everything after the contractId
    let cleanPath = path;
    
    // Handle URLs like: http://localhost:5109/UploadedContracts/1047/uploads/contracts/0256d4ba-24e2-451a-b292-cd0d5d800d2f.pdf
    const urlMatch = path.match(/UploadedContracts\/\d+\/(.+)$/);
    if (urlMatch) {
      cleanPath = urlMatch[1];
    }
    
    // Handle paths with backslashes (Windows paths)
    cleanPath = cleanPath.replace(/\\/g, '/');
    
    const parts = cleanPath.split('/').filter(p => p.length > 0);
    if (parts.length === 0) return;
    
    let current = tree;
    
    parts.forEach((part, i) => {
      if (!current[part]) {
        current[part] = i === parts.length - 1 ? { isFile: true } : {};
      }
      if (current[part] !== null && typeof current[part] === 'object') {
        current = current[part];
      }
    });
  });

  return tree;
}

const FileTree = ({ files, contractId }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const tree = buildTree(files);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (node, currentPath = "") => {
    const entries = Object.entries(node).sort((a, b) => {
      const aIsFile = a[1]?.isFile;
      const bIsFile = b[1]?.isFile;
      if (aIsFile === bIsFile) return a[0].localeCompare(b[0]);
      return aIsFile ? 1 : -1;
    });

    return entries.map(([key, value]) => {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      const isFile = value?.isFile === true;

      if (isFile) {
        const getFileIcon = (fileName) => {
          const ext = fileName.split('.').pop().toLowerCase();
          if (ext === 'pdf') return '📄';
          if (['doc', 'docx'].includes(ext)) return '📝';
          if (['xls', 'xlsx'].includes(ext)) return '📊';
          if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
          if (['zip', 'rar', '7z'].includes(ext)) return '📦';
          return '📎';
        };

        const handleOpenFile = async () => {
          try {
            const fileUrl = `/UploadedContracts/${fullPath}`;
            const response = await api.get(fileUrl, {
              responseType: 'blob'
            });
            
            // Create blob URL and open in new tab
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            // Clean up the URL after opening
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
          } catch (error) {
            console.error('File open error:', error);
            alert('فشل في فتح الملف');
          }
        };

        const icon = getFileIcon(key);
        return (
          <li key={fullPath} style={{ marginLeft: '20px', padding: '6px 0' }}>
            <button
              onClick={handleOpenFile}
              style={{ 
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                textDecoration: 'underline',
                wordBreak: 'break-word',
                fontSize: '14px',
                padding: 0,
                font: 'inherit',
                textAlign: 'left'
              }}
              title={fullPath}
            >
              {icon} {key}
            </button>
          </li>
        );
      }

      const isExpanded = expandedFolders[fullPath];
      const hasChildren = Object.keys(value).length > 0 && value !== null;

      return (
        <li key={fullPath} style={{ padding: '6px 0' }}>
          <div
            style={{
              cursor: hasChildren ? 'pointer' : 'default',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
              fontSize: '14px'
            }}
            onClick={() => hasChildren && toggleFolder(fullPath)}
          >
            <span style={{ fontSize: '12px', width: '12px', display: 'inline-block', textAlign: 'center' }}>
              {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
            </span>
            <span style={{ fontWeight: hasChildren ? '500' : 'normal' }}>📁 {key}</span>
            {hasChildren && (
              <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
                ({Object.keys(value).length})
              </span>
            )}
          </div>
          {isExpanded && hasChildren && (
            <ul style={{ listStyle: 'none', paddingLeft: '0px', borderLeft: '2px solid #ddd', marginLeft: '8px', paddingLeft: '12px' }}>
              {renderTree(value, fullPath)}
            </ul>
          )}
        </li>
      );
    });
  };

  if (!files || !Array.isArray(files) || files.length === 0) {
    return <p style={{ color: '#999' }}>لا توجد وثائق متاحة</p>;
  }

  const hasTreeData = Object.keys(tree).length > 0;

  return (
    <div style={{ padding: '10px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
      {hasTreeData ? (
        <ul style={{ listStyle: 'none', paddingLeft: '0px', fontSize: '14px' }}>
          {renderTree(tree)}
        </ul>
      ) : (
        <p style={{ color: '#d9534f' }}>
          ⚠️ تم الحصول على {files.length} وثيقة لكن لم يتم تحليلها بشكل صحيح.
          <br />
          تحقق من وحدة التحكم (Console) لمعرفة صيغة البيانات.
        </p>
      )}
    </div>
  );
};

export default FileTree;