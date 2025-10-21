using InterviewTest.Server.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace InterviewTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly string _connectionString;

        public EmployeesController()
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            _connectionString = connectionStringBuilder.ConnectionString;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var employees = new List<Employee>();

            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var queryCmd = connection.CreateCommand();
                    queryCmd.CommandText = @"SELECT ROWID, Name, Value FROM Employees";
                    using (var reader = queryCmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            employees.Add(new Employee
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Value = reader.GetInt32(2)
                            });
                        }
                    }
                }

                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving employees: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var queryCmd = connection.CreateCommand();
                    queryCmd.CommandText = @"SELECT ROWID, Name, Value FROM Employees WHERE ROWID = @id";
                    queryCmd.Parameters.AddWithValue("@id", id);

                    using (var reader = queryCmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var employee = new Employee
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Value = reader.GetInt32(2)
                            };
                            return Ok(employee);
                        }
                    }
                }

                return NotFound($"Employee with ID {id} not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving employee: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Post([FromBody] Employee employee)
        {
            if (employee == null || string.IsNullOrWhiteSpace(employee.Name))
            {
                return BadRequest("Employee name cannot be empty");
            }

            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var insertCmd = connection.CreateCommand();
                    insertCmd.CommandText = @"INSERT INTO Employees (Name, Value) VALUES (@name, @value)";
                    insertCmd.Parameters.AddWithValue("@name", employee.Name);
                    insertCmd.Parameters.AddWithValue("@value", employee.Value);

                    insertCmd.ExecuteNonQuery();

                    var getIdCmd = connection.CreateCommand();
                    getIdCmd.CommandText = @"SELECT last_insert_rowid()";
                    var newId = Convert.ToInt32(getIdCmd.ExecuteScalar());

                    employee.Id = newId;
                    return CreatedAtAction(nameof(Get), new { id = newId }, employee);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating employee: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Employee employee)
        {
            if (employee == null || string.IsNullOrWhiteSpace(employee.Name))
            {
                return BadRequest("Employee name cannot be empty");
            }

            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var updateCmd = connection.CreateCommand();
                    updateCmd.CommandText = @"UPDATE Employees SET Name = @name, Value = @value WHERE ROWID = @id";
                    updateCmd.Parameters.AddWithValue("@name", employee.Name);
                    updateCmd.Parameters.AddWithValue("@value", employee.Value);
                    updateCmd.Parameters.AddWithValue("@id", id);

                    var rowsAffected = updateCmd.ExecuteNonQuery();

                    if (rowsAffected == 0)
                    {
                        return NotFound($"Employee with ID {id} not found");
                    }

                    employee.Id = id;
                    return Ok(employee);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating employee: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var deleteCmd = connection.CreateCommand();
                    deleteCmd.CommandText = @"DELETE FROM Employees WHERE ROWID = @id";
                    deleteCmd.Parameters.AddWithValue("@id", id);

                    var rowsAffected = deleteCmd.ExecuteNonQuery();

                    if (rowsAffected == 0)
                    {
                        return NotFound($"Employee with ID {id} not found");
                    }

                    return NoContent();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting employee: {ex.Message}");
            }
        }

        [HttpPost("increment-values")]
        public IActionResult IncrementValues()
        {
            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();
                    using (var transaction = connection.BeginTransaction())
                    {
                        var updateCmd = connection.CreateCommand();
                        updateCmd.Transaction = transaction;
                        
                        updateCmd.CommandText = @"UPDATE Employees SET Value = Value + 1 WHERE Name LIKE 'E%'";
                        var eCount = updateCmd.ExecuteNonQuery();

                        updateCmd.CommandText = @"UPDATE Employees SET Value = Value + 10 WHERE Name LIKE 'G%'";
                        var gCount = updateCmd.ExecuteNonQuery();

                        updateCmd.CommandText = @"UPDATE Employees SET Value = Value + 100 WHERE Name NOT LIKE 'E%' AND Name NOT LIKE 'G%'";
                        var othersCount = updateCmd.ExecuteNonQuery();

                        transaction.Commit();

                        var result = new
                        {
                            Message = "Values incremented successfully",
                            UpdatedCounts = new
                            {
                                NamesStartingWithE = eCount,
                                NamesStartingWithG = gCount,
                                Others = othersCount,
                                Total = eCount + gCount + othersCount
                            }
                        };

                        return Ok(result);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error incrementing values: {ex.Message}");
            }
        }

        [HttpGet("aggregate-abc-values")]
        public IActionResult GetAggregateABCValues()
        {
            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    connection.Open();

                    var queryCmd = connection.CreateCommand();
                    queryCmd.CommandText = @"
                        SELECT 
                            SUBSTR(Name, 1, 1) as FirstLetter,
                            SUM(Value) as TotalValue,
                            COUNT(*) as EmployeeCount
                        FROM Employees 
                        WHERE Name LIKE 'A%' OR Name LIKE 'B%' OR Name LIKE 'C%'
                        GROUP BY SUBSTR(Name, 1, 1)
                        HAVING SUM(Value) >= 11171
                        ORDER BY FirstLetter";

                    var results = new List<object>();
                    using (var reader = queryCmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            results.Add(new
                            {
                                FirstLetter = reader.GetString(0),
                                TotalValue = reader.GetInt64(1),
                                EmployeeCount = reader.GetInt32(2)
                            });
                        }
                    }

                    return Ok(new
                    {
                        Message = "Aggregate values for names starting with A, B, or C (where sum >= 11171)",
                        Results = results,
                        Criteria = "Names starting with A, B, or C with summed values >= 11171"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving aggregate values: {ex.Message}");
            }
        }
    }
}
