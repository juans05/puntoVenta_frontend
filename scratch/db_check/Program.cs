using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connStr = "Server=localhost;Port=5432;Database=PuntoVenta;User Id=postgres;Password=root;";
        using var conn = new NpgsqlConnection(connStr);
        conn.Open();

        Console.WriteLine("=== TENANTS ===");
        using (var cmd = new NpgsqlCommand("SELECT \"Identificador\", \"Name\", \"TenantKey\", \"RubroId\" FROM \"Tenant\"", conn))
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                Console.WriteLine($"Identificador: {reader["Identificador"]}, Name: {reader["Name"]}, TenantKey: {reader["TenantKey"]}, RubroId: {reader["RubroId"]}");
            }
        }

        Console.WriteLine("\n=== CATEGORIAS ===");
        using (var cmd = new NpgsqlCommand("SELECT \"Id\", \"Nombre\", \"RubroId\", \"TenantId\", \"Estado\", \"UsuarioCreacion\", \"FechaCreacion\" FROM \"Categoria\"", conn))
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                Console.WriteLine($"Id: {reader["Id"]}, Nombre: {reader["Nombre"]}, RubroId: {reader["RubroId"]}, TenantId: '{reader["TenantId"]}', Estado: {reader["Estado"]}, Usuario: {reader["UsuarioCreacion"]}, Fecha: {reader["FechaCreacion"]}");
            }
        }
    }
}
