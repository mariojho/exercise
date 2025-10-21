using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;

class Program
{
    public class Employee
    {
        public string Name { get; set; }
        public int Value { get; set; }
    }

    static void Main()
    {
        var employees = new List<Employee>();
        
        var connectionStringBuilder = new SqliteConnectionStringBuilder() 
        { 
            DataSource = "./InterviewTest.Server/SqliteDB.db" 
        };
        
        try
        {
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                Console.WriteLine("Successfully connected to database!");
                
                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"SELECT Name, Value FROM Employees";
                
                using (var reader = queryCmd.ExecuteReader())
                {
                    Console.WriteLine("\n=== EMPLOYEES TABLE CONTENTS ===");
                    Console.WriteLine("Name\t\t\tValue");
                    Console.WriteLine("----\t\t\t-----");
                    
                    while (reader.Read())
                    {
                        var employee = new Employee
                        {
                            Name = reader.GetString(0),
                            Value = reader.GetInt32(1)
                        };
                        employees.Add(employee);
                        Console.WriteLine($"{employee.Name}\t\t\t{employee.Value}");
                    }
                }
            }
            
            Console.WriteLine($"\nTotal employees found: {employees.Count}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
        
        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();
    }
}