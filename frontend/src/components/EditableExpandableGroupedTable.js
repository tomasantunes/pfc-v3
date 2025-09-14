import React, { useState } from 'react';

const EditableExpandableGroupedTable = ({tableData, tableHeaders, title, onSave}) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // State to track which rows are being edited
  const [editingRows, setEditingRows] = useState({});
  
  // State to store temporary edit values
  const [editValues, setEditValues] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const startEditing = (itemId, item) => {
    setEditingRows(prev => ({
      ...prev,
      [itemId]: true
    }));
    
    // Initialize edit values with current item values (excluding id)
    const editableValues = {};
    Object.keys(item).filter(key => key !== 'id').forEach(key => {
      editableValues[key] = item[key];
    });
    
    setEditValues(prev => ({
      ...prev,
      [itemId]: editableValues
    }));
  };

  const cancelEditing = (itemId) => {
    setEditingRows(prev => {
      const newState = {...prev};
      delete newState[itemId];
      return newState;
    });
    
    setEditValues(prev => {
      const newState = {...prev};
      delete newState[itemId];
      return newState;
    });
  };

  const saveRow = (itemId) => {
    if (onSave) {
      onSave(itemId, editValues[itemId]);
    }
    
    setEditingRows(prev => {
      const newState = {...prev};
      delete newState[itemId];
      return newState;
    });
    
    setEditValues(prev => {
      const newState = {...prev};
      delete newState[itemId];
      return newState;
    });
  };

  const handleInputChange = (itemId, fieldName, value) => {
    setEditValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [fieldName]: value
      }
    }));
  };

  // Create headers with Actions column
  const headersWithActions = [...tableHeaders, 'Actions'];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{title}</h2>
      
      <div className="table-responsive">
        <table className="table table-striped table-fixed">
          <thead className="table-dark">
            <tr>
                {headersWithActions.map((header, index) => (
                    <th scope="col" key={index} style={{ width: (100/headersWithActions.length).toString() + '%' }}>{header}</th>
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
                  <td colSpan={headersWithActions.length} className="fw-bold">
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
                      <td key={index}>
                        {editingRows[item.id] ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editValues[item.id]?.[key] || ''}
                            onChange={(e) => handleInputChange(item.id, key, e.target.value)}
                          />
                        ) : (
                          item[key]
                        )}
                      </td>
                    ))}
                    
                    {/* Actions Column */}
                    <td>
                      {editingRows[item.id] ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveRow(item.id)}
                          >
                            <i className="fa-solid fa-check"></i> Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => cancelEditing(item.id)}
                          >
                            <i className="fa-solid fa-times"></i> Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => startEditing(item.id, item)}
                        >
                          <i className="fa-solid fa-edit"></i> Edit
                        </button>
                      )}
                    </td>
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

export default EditableExpandableGroupedTable;