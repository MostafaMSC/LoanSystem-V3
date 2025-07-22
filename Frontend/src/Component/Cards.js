import '../Style/Cards.css';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Cards() {
    const navigate = useNavigate();

  return (

    <div className="ag-format-container">
      <div className="ag-courses_box">
        <div className="ag-courses_item">
          <navlink to="/contracts"
                    onClick={() => navigate('/contracts')}
          style={{ cursor: 'pointer'}}
          className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
              ارشفة العقود
              <img src="/Images/sign.jpg" alt='' className='px-1' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
        <div className="ag-courses_item">
          <navlink to="/Loans" 
          onClick={() => navigate('/Loans')}
          style={{ cursor: 'pointer'}}
          className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
              سجل القروض
              <img src="/Images/loan.png" alt='' className='px-1' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
        <div className="ag-courses_item">
          <navlink to="#"
          onClick={() => navigate('/#')}
          style={{ cursor: 'pointer'}}
          className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
              التقارير
              <img src="/Images/report.png" alt='' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
                <div className="ag-courses_item">
          <navlink to="/AdminPanel" 
          onClick={() => navigate('/AdminPanel')}
          style={{ cursor: 'pointer'}}
          className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
            ادارة المستخدمين
              <img src="/Images/management.png" alt='' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
                <div className="ag-courses_item">
          <navlink to="/RevenueList" 
          onClick={() => navigate('/RevenueList')}
          style={{ cursor: 'pointer'}}
          className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
              الايرادات
              <img src="/Images/growth.png" alt='' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
                <div className="ag-courses_item">
          <navlink to="#" className="ag-courses-item_link">
            <div className="ag-courses-item_bg"></div>
            <div className="ag-courses-item_title">
              التراميز
              <img src="/Images/control.png" alt='' width='50px' height='50px' />
            </div>
          </navlink>
        </div>
      </div>
    </div>
  );
}
