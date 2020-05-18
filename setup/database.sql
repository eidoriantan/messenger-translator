
/**
 *  Copyright 2020 Adriane Justine Tan
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
