import { useEffect, useState } from 'react';

interface Employee {
    id: number;
    name: string;
    value: number;
}

interface AggregateResult {
    firstLetter: string;
    totalValue: number;
    employeeCount: number;
}

function App() {
    const [employeeCount, setEmployeeCount] = useState<number>(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [newEmployee, setNewEmployee] = useState<{name: string, value: number}>({name: '', value: 0});
    const [aggregateResults, setAggregateResults] = useState<AggregateResult[]>([]);
    const [showAggregateResults, setShowAggregateResults] = useState<boolean>(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const tableStyle = {
        borderCollapse: 'collapse' as const,
        width: '100%',
        marginTop: '20px'
    };

    const cellStyle = {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left' as const
    };

    const headerStyle = {
        ...cellStyle,
        backgroundColor: '#f2f2f2',
        fontWeight: 'bold' as const
    };

    const buttonStyle = {
        margin: '2px',
        padding: '5px 10px',
        cursor: 'pointer'
    };

    const formStyle = {
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9'
    };

    return (<>
        <div style={{padding: '20px'}}>
            <h1>Employee Management System</h1>
            <div>Connectivity check: {employeeCount > 0 ? `OK (${employeeCount} employees)` : `NOT READY`}</div>
            
            {error && <div style={{color: 'red', margin: '10px 0'}}>Error: {error}</div>}
            
            <div style={{margin: '20px 0'}}>
                <button 
                    style={{...buttonStyle, backgroundColor: '#4CAF50', color: 'white'}}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add New Employee'}
                </button>
                <button 
                    style={{...buttonStyle, backgroundColor: '#FF9800', color: 'white', marginLeft: '10px'}}
                    onClick={handleIncrementValues}
                    disabled={loading}
                    title="Increment values: E* +1, G* +10, Others +100"
                >
                    Increment Values
                </button>
                <button 
                    style={{...buttonStyle, backgroundColor: '#9C27B0', color: 'white', marginLeft: '10px'}}
                    onClick={handleShowAggregateQuery}
                    disabled={loading}
                    title="Show sum of values for names A*/B*/C* where sum >= 11171"
                >
                    Show ABC Aggregate Query
                </button>
            </div>

            <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#e8f4fd', border: '1px solid #bee5eb', borderRadius: '5px'}}>
                <strong>Increment Values Button:</strong> This will increment employee values based on their names:
                <ul style={{margin: '5px 0', paddingLeft: '20px'}}>
                    <li>Names starting with 'E': +1</li>
                    <li>Names starting with 'G': +10</li>
                    <li>All other names: +100</li>
                </ul>
            </div>

            <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: '5px'}}>
                <strong>ABC Aggregate Query Button:</strong> This will show the sum of all values for names that begin with A, B, or C, but only display results where the summed values are greater than or equal to 11171.
            </div>

            {showAggregateResults && (
                <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#fff3e0', border: '2px solid #ff9800', borderRadius: '5px'}}>
                    <h3>Aggregate Query Results</h3>
                    <p><em>Sum of values for names starting with A, B, or C (where sum ≥ 11171)</em></p>
                    {aggregateResults.length === 0 ? (
                        <p>No results found matching the criteria (sum ≥ 11171)</p>
                    ) : (
                        <table style={{...tableStyle, marginTop: '10px'}}>
                            <thead>
                                <tr>
                                    <th style={headerStyle}>First Letter</th>
                                    <th style={headerStyle}>Total Value</th>
                                    <th style={headerStyle}>Employee Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aggregateResults.map((result, index) => (
                                    <tr key={index}>
                                        <td style={cellStyle}>{result.firstLetter}</td>
                                        <td style={cellStyle}>{result.totalValue.toLocaleString()}</td>
                                        <td style={cellStyle}>{result.employeeCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <button 
                        style={{...buttonStyle, backgroundColor: '#f44336', color: 'white', marginTop: '10px'}}
                        onClick={() => setShowAggregateResults(false)}
                    >
                        Close Results
                    </button>
                </div>
            )}

            {showAddForm && (
                <div style={formStyle}>
                    <h3>Add New Employee</h3>
                    <div>
                        <label>Name: </label>
                        <input 
                            type="text" 
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                            style={{margin: '5px', padding: '5px'}}
                        />
                    </div>
                    <div>
                        <label>Value: </label>
                        <input 
                            type="number" 
                            value={newEmployee.value}
                            onChange={(e) => setNewEmployee({...newEmployee, value: parseInt(e.target.value) || 0})}
                            style={{margin: '5px', padding: '5px'}}
                        />
                    </div>
                    <div style={{marginTop: '10px'}}>
                        <button 
                            style={{...buttonStyle, backgroundColor: '#4CAF50', color: 'white'}}
                            onClick={handleAddEmployee}
                        >
                            Add Employee
                        </button>
                        <button 
                            style={{...buttonStyle, backgroundColor: '#f44336', color: 'white'}}
                            onClick={() => {
                                setShowAddForm(false);
                                setNewEmployee({name: '', value: 0});
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loading && <div>Loading employees...</div>}
            
            {!loading && employees.length === 0 && !error && <div>No employees found</div>}
            
            {!loading && employees.length > 0 && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={headerStyle}>ID</th>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Value</th>
                            <th style={headerStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td style={cellStyle}>{employee.id}</td>
                                <td style={cellStyle}>
                                    {editingEmployee?.id === employee.id ? (
                                        <input 
                                            type="text"
                                            value={editingEmployee.name}
                                            onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                                        />
                                    ) : (
                                        employee.name
                                    )}
                                </td>
                                <td style={cellStyle}>
                                    {editingEmployee?.id === employee.id ? (
                                        <input 
                                            type="number"
                                            value={editingEmployee.value}
                                            onChange={(e) => setEditingEmployee({...editingEmployee, value: parseInt(e.target.value) || 0})}
                                        />
                                    ) : (
                                        employee.value
                                    )}
                                </td>
                                <td style={cellStyle}>
                                    {editingEmployee?.id === employee.id ? (
                                        <>
                                            <button 
                                                style={{...buttonStyle, backgroundColor: '#4CAF50', color: 'white'}}
                                                onClick={() => handleUpdateEmployee()}
                                            >
                                                Save
                                            </button>
                                            <button 
                                                style={{...buttonStyle, backgroundColor: '#f44336', color: 'white'}}
                                                onClick={() => setEditingEmployee(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                style={{...buttonStyle, backgroundColor: '#2196F3', color: 'white'}}
                                                onClick={() => setEditingEmployee(employee)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                style={{...buttonStyle, backgroundColor: '#f44336', color: 'white'}}
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </>);

    async function loadEmployees() {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('api/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEmployees(data);
            setEmployeeCount(data.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddEmployee() {
        if (!newEmployee.name.trim()) {
            setError('Employee name cannot be empty');
            return;
        }

        try {
            setError('');
            const response = await fetch('api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployee),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNewEmployee({name: '', value: 0});
            setShowAddForm(false);
            await loadEmployees();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error adding employee');
        }
    }

    async function handleUpdateEmployee() {
        if (!editingEmployee || !editingEmployee.name.trim()) {
            setError('Employee name cannot be empty');
            return;
        }

        try {
            setError('');
            const response = await fetch(`api/employees/${editingEmployee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingEmployee),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setEditingEmployee(null);
            await loadEmployees();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating employee');
        }
    }

    async function handleDeleteEmployee(id: number) {
        if (!confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            setError('');
            const response = await fetch(`api/employees/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await loadEmployees();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting employee');
        }
    }

    async function handleIncrementValues() {
        if (!confirm('This will increment values for all employees:\n- Names starting with "E": +1\n- Names starting with "G": +10\n- All others: +100\n\nAre you sure?')) {
            return;
        }

        try {
            setError('');
            setLoading(true);
            const response = await fetch('api/employees/increment-values', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Show success message with details
            alert(`Values incremented successfully!\n` +
                  `- Names starting with E: ${result.updatedCounts.namesStartingWithE} updated\n` +
                  `- Names starting with G: ${result.updatedCounts.namesStartingWithG} updated\n` +
                  `- Others: ${result.updatedCounts.others} updated\n` +
                  `Total: ${result.updatedCounts.total} employees updated`);

            await loadEmployees();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error incrementing values');
        } finally {
            setLoading(false);
        }
    }

    async function handleShowAggregateQuery() {
        try {
            setError('');
            const response = await fetch('api/employees/aggregate-abc-values');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAggregateResults(result.results);
            setShowAggregateResults(true);
            
            // Show info message
            if (result.results.length === 0) {
                alert('No results found. No names starting with A, B, or C have summed values >= 11171.');
            } else {
                alert(`Found ${result.results.length} letter group(s) with summed values >= 11171`);
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching aggregate data');
        }
    }
}

export default App;