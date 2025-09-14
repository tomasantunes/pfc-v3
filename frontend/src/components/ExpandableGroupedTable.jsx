import React, { useState } from 'react';

const ExpandableGroupedTable = ({tableData, tableHeaders, title}) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{title}</h2>
      
      <div className="table-responsive">
        <table className="table table-striped table-fixed">
          <thead className="table-dark">
            <tr>
                {tableHeaders.map((header, index) => (
                    <th scope="col" key={index} style={{ width: (100/tableHeaders.length).toString() + '%' }}>{header}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableData).map(([groupName, items]) => (
              <React.Fragment key={groupName}>
                {/* Group Header Row */}
                <tr 
                  className="table-secondary cursor-pointer"
                  onClick={() => toggleGroup(groupName)}
                  style={{ cursor: 'pointer' }}
                >
                  <td colSpan={tableHeaders.length} className="fw-bold">
                    <div className="d-flex align-items-center">
                      <i className={`fa-solid ${expandedGroups[groupName] ? 'fa-chevron-down' : 'fa-chevron-right'} me-2`}></i>
                      {groupName} ({items.length} items)
                    </div>
                  </td>
                </tr>
                
                {/* Expandable Group Rows */}
                {expandedGroups[groupName] && items.map((item) => (
                  <tr key={item.id} className="table-light">
                    {Object.keys(item).filter(key => key !== 'id').map((key, index) => (
                      <td key={index}>{item[key]}</td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandableGroupedTable;