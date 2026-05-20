$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d yugiohdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
