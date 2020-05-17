
/**
 *  Setting up a table in a database
 */
CREATE TABLE users (
  psid NVARCHAR(16) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  language NVARCHAR(16) NOT NULL,
  detailed BIT NOT NULL,
  locale NVARCHAR(16) NOT NULL,
  menu NVARCHAR(255) NOT NULL,
  UNIQUE(psid)
);
