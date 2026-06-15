import React, { useState } from 'react';

const hiddenFields = ['id', 'snapshot_id', 'snapshot_balance', 'snapshot_profit'];
const editableFields = ['name', 'asset_type', 'price', 'quantity', 'value', 'return'];

const getDisplayKeys = (item) => Object.keys(item).filter(key => !hiddenFields.includes(key));

const normalizeGroup = (groupValue) => {
  if (Array.isArray(groupValue)) {
    return {
      items: groupValue
    };
  }

  return {
    ...groupValue,
    items: groupValue.items || []
  };
};

const getSnapshotId = (snapshot) => snapshot.snapshot_id || snapshot.items[0]?.snapshot_id || snapshot.items[0]?.id;

const getSnapshotHeaderValue = (snapshot, groupName, key) => {
  if (snapshot[key] !== undefined) {
    return snapshot[key];
  }
  if (key === 'balance' && snapshot.items[0]?.snapshot_balance !== undefined) {
    return snapshot.items[0].snapshot_balance;
  }
  if (key === 'profit' && snapshot.items[0]?.snapshot_profit !== undefined) {
    return snapshot.items[0].snapshot_profit;
  }

  const match = groupName.match(new RegExp(`${key.charAt(0).toUpperCase() + key.slice(1)}: ([^-]+)`));
  return match ? match[1].trim() : '';
};

const getEmptyPosition = () => ({
  name: '',
  asset_type: '',
  price: '',
  quantity: '',
  value: '',
  return: ''
});

const ExpandableGroupedTable = ({tableData, tableHeaders, title, onSaveSnapshot}) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editingGroups, setEditingGroups] = useState({});
  const [editValues, setEditValues] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const startEditing = (groupName, snapshot) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: true
    }));
    setEditingGroups(prev => ({
      ...prev,
      [groupName]: true
    }));
    setEditValues(prev => ({
      ...prev,
      [groupName]: {
        balance: getSnapshotHeaderValue(snapshot, groupName, 'balance'),
        profit: getSnapshotHeaderValue(snapshot, groupName, 'profit'),
        positions: snapshot.items.map(item => ({
          name: item.name ?? '',
          asset_type: item.asset_type ?? '',
          price: item.price ?? '',
          quantity: item.quantity ?? '',
          value: item.value ?? '',
          return: item.return ?? ''
        }))
      }
    }));
  };

  const cancelEditing = (groupName) => {
    setEditingGroups(prev => {
      const newState = {...prev};
      delete newState[groupName];
      return newState;
    });
    setEditValues(prev => {
      const newState = {...prev};
      delete newState[groupName];
      return newState;
    });
  };

  const saveSnapshot = (groupName, snapshot) => {
    if (onSaveSnapshot) {
      onSaveSnapshot(getSnapshotId(snapshot), editValues[groupName]);
    }
    cancelEditing(groupName);
  };

  const handleHeaderChange = (groupName, fieldName, value) => {
    setEditValues(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [fieldName]: value
      }
    }));
  };

  const handlePositionChange = (groupName, index, fieldName, value) => {
    setEditValues(prev => {
      const positions = [...prev[groupName].positions];
      positions[index] = {
        ...positions[index],
        [fieldName]: value
      };

      return {
        ...prev,
        [groupName]: {
          ...prev[groupName],
          positions
        }
      };
    });
  };

  const addPosition = (groupName) => {
    setEditValues(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        positions: [
          ...prev[groupName].positions,
          getEmptyPosition()
        ]
      }
    }));
  };

  const removePosition = (groupName, index) => {
    setEditValues(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        positions: prev[groupName].positions.filter((_, positionIndex) => positionIndex !== index)
      }
    }));
  };

  const colSpan = onSaveSnapshot ? tableHeaders.length + 1 : tableHeaders.length;

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
                {onSaveSnapshot && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableData).map(([groupName, groupValue]) => {
              const snapshot = normalizeGroup(groupValue);
              const items = snapshot.items;

              return (
              <React.Fragment key={groupName}>
                {/* Group Header Row */}
                <tr 
                  className="table-secondary cursor-pointer"
                  onClick={() => toggleGroup(groupName)}
                  style={{ cursor: 'pointer' }}
                >
                  <td colSpan={colSpan} className="fw-bold">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <i className={`fa-solid ${expandedGroups[groupName] ? 'fa-chevron-down' : 'fa-chevron-right'} me-2`}></i>
                        {groupName} ({items.length} items)
                      </div>
                      {onSaveSnapshot && (
                        <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {editingGroups[groupName] ? (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => saveSnapshot(groupName, snapshot)}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => cancelEditing(groupName)}>Cancel</button>
                            </>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => startEditing(groupName, snapshot)}>Edit</button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {expandedGroups[groupName] && editingGroups[groupName] && (
                  <tr className="table-light">
                    <td colSpan={colSpan}>
                      <div className="row g-2">
                        <div className="col-md-3">
                          <label className="form-label fw-bold">Balance</label>
                          <input type="text" className="form-control form-control-sm" value={editValues[groupName]?.balance || ''} onChange={(e) => handleHeaderChange(groupName, 'balance', e.target.value)} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-bold">Profit</label>
                          <input type="text" className="form-control form-control-sm" value={editValues[groupName]?.profit || ''} onChange={(e) => handleHeaderChange(groupName, 'profit', e.target.value)} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Expandable Group Rows */}
                {expandedGroups[groupName] && (editingGroups[groupName] ? editValues[groupName]?.positions : items).map((item, itemIndex) => (
                  <tr key={`${groupName}-${itemIndex}`} className="table-light">
                    {(editingGroups[groupName] ? editableFields : getDisplayKeys(item)).map((key, index) => (
                      <td key={index}>
                        {editingGroups[groupName] ? (
                          <input type="text" className="form-control form-control-sm" value={item[key] || ''} onChange={(e) => handlePositionChange(groupName, itemIndex, key, e.target.value)} />
                        ) : (
                          item[key]
                        )}
                      </td>
                    ))}
                    {onSaveSnapshot && (
                      <td>
                        {editingGroups[groupName] && (
                          <button className="btn btn-danger btn-sm" onClick={() => removePosition(groupName, itemIndex)}>Remove</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}

                {expandedGroups[groupName] && editingGroups[groupName] && (
                  <tr className="table-light">
                    <td colSpan={colSpan} className="text-end">
                      <button className="btn btn-success btn-sm" onClick={() => addPosition(groupName)}>Add Position</button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandableGroupedTable;
