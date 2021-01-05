/**
 *  Messenger Translator
 *  Copyright (C) 2020 - 2021, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

BEGIN TRANSACTION Tables

/**
 *  Setting up the users table in a database
 */
IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE users (
    psid NVARCHAR(16) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    language NVARCHAR(16) NOT NULL,
    locale NVARCHAR(16) NOT NULL,
    menu NVARCHAR(255) NOT NULL,
    message TINYINT NOT NULL,
    CONSTRAINT pk_psid PRIMARY KEY (psid)
  )
END

/**
 *  Table for receiving feedbacks
 */
IF OBJECT_ID(N'dbo.feedbacks', N'U') IS NULL
BEGIN
  CREATE TABLE feedbacks (
    psid NVARCHAR(15) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL
  )
END

COMMIT TRANSACTION Tables
