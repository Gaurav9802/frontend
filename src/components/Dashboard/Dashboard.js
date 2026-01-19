import React from 'react';
import './Dashboard.css';

const data = [
  { title: 'Clients', count: '22' },
  { title: 'Projects', count: '10+' },
  { title: 'Invoices', count: '15' },
  { title: 'Followups', count: '8' },
  { title: 'Expenses', count: '$4,500' }
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <input type="text" placeholder="Search...." className="search-input" />
      </div>

      <div className="dashboard-cards">
        {data.map((item, index) => (
          <div className="dashboard-card" key={index}>
            <div className="card-content">
              <div className="card-header">
                <div>
                  <h4>{item.title}</h4>
                  <p className="card-count">{item.count}</p>
                </div>
                <div className="card-icon">
                  <span>📈</span> {/* replace with icon if needed */}
                </div>
              </div>
              <p className="card-desc">1960s with the release of Letraset sheets</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
