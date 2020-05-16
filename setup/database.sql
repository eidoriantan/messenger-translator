
/**
 *  Setting up a table in a database
 */
CREATE TABLE users (
  psid VARCHAR(16) NOT NULL,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(16) NOT NULL,
  detailed BIT NOT NULL,
  locale VARCHAR(16) NOT NULL,
  menu VARCHAR(255) NOT NULL,
  UNIQUE(psid)
);
