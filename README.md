# luxor_challenege Database
Shane Winn Luxor Challenge Submission
The Database was developed using POSTGRESQL to associate the relational portions of the coding challenge requirements.
There have been some additional columns added to faciliate additional functionality for the frontend and server.

There is also a required query that will need to run if the pgcrypto extension is not already established

1. To enable pgcrypto for password
run query: CREATE EXTENSION IF NOT EXISTS pgcrypto;

The additional columns added to each of the table schema are
bids:
  id uuid,
  collection_id integer,
  price numeric,
  status text,
  number_bids numeric, (Added Column)
  date timestamp with time zone (Added Column)

collections:
  No change

owner: (New Table to allow front end to understand if an owner or a user is logged in)
  id uuid,
  name text,
  email charvar,
  username charvar,
  password charvard (hashed),

user:
  id uuid,
  name text,
  email charvar,
  username charvar,
  password charvar (New column, also hashed),
  login_pin charvar (hashed)

Guide to Restoring a PostgreSQL 17 Database from an SQL File on macOS and Windows

This guide explains how to restore a PostgreSQL 17 database from a plain-text SQL dump file (.sql) on macOS and Windows using the `psql` command.

---

Prerequisites

1. PostgreSQL 17 Installed:
   - Ensure PostgreSQL 17 is installed.
   - macOS: Install via Homebrew (`brew install postgresql@17`), Postgres.app, or EnterpriseDB installer.
   - Windows: Use the EnterpriseDB installer.
   - Verify: `psql --version` (Output: psql (PostgreSQL) 17.x)

2. SQL Backup File:
   - Have a .sql file (e.g., mydb.sql) accessible.
   - Example locations:
     - macOS: ~/backups/mydb.sql
     - Windows: C:\backups\mydb.sql

3. Database User:
   - Know the username (e.g., postgres) and password for a superuser or privileged user.

4. Target Database:
   - The database must exist unless the .sql file includes a CREATE DATABASE statement (common with pg_dumpall).

---

Step 1: Start PostgreSQL

Ensure the PostgreSQL server is running.

macOS: 
- brew services start postgresql@17
- Or launch Postgres.app.
- Verify: `pg_isready -h localhost` (Output: /tmp:5432 - accepting connections)

Windows:
- net start postgresql-x64-17
- Or use Services (services.msc) to start postgresql-x64-17.
- Verify: `pg_isready -h localhost` (Output: /tmp:5432 - accepting connections)

---

Step 2: Create the Target Database (If Needed)

If the .sql file doesn’t include CREATE DATABASE, create the database manually.

macOS:
createdb -U postgres -T template0 mydb
- -U postgres: Superuser.
- T template0: Clean template.
- mydb: Database name.

Windows:
- "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres -T template0 mydb
- Use full path if createdb isn’t in PATH.
- Enter password if prompted.

Note: Replace mydb with your database name. If it exists, drop it first:
dropdb -U postgres mydb
createdb -U postgres -T template0 mydb
---

Step 3: Restore the SQL File

Use `psql` to execute the SQL commands in the .sql file.

macOS:
- psql -U postgres -d mydb -f ~/backups/mydb.sql
- U postgres: User.
- d mydb: Target database.
- f ~/backups/mydb.sql: Path to SQL file.
- Enter password if prompted.

Windows:
- "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d mydb -f C:\backups\mydb.sql
- Use forward slashes (C:/backups/mydb.sql) or double backslashes (C:\\backups\\mydb.sql).
- Use full path if psql isn’t in PATH.
- Enter password if prompted.

Notes:
- If the .sql file includes CREATE DATABASE (e.g., from pg_dumpall), use:
- psql -U postgres -d postgres -f ~/backups/mydb.sql
- Log errors

  psql -U postgres -d mydb -f ~/backups/mydb.sql 2> restore_errors.log
---

Step 4: Verify the Restoration

Confirm the database restored correctly.

Connect:
macOS:
- psql -U postgres -d mydb

Windows:
- "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d mydb
