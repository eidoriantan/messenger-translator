#!/bin/bash -e

# Messenger Translator
# Copyright (C) 2020 - 2021, Adriane Justine Tan
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

export MSSQL_SA_PASSWORD=$PASSWORD
export SQL_ENABLE_AGENT=y
export ACCEPT_EULA=y

# Install MSSQL Server
echo "Installing MSSQL Server..."
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
sudo apt-get update
sudo apt-get install -y mssql-server
sudo MSSQL_SA_PASSWORD=$MSSQL_SA_PASSWORD \
     /opt/mssql/bin/mssql-conf -n setup accept-eula

systemctl status mssql-server --no-pager

# Install MSSQL Server CMD Tools
echo "Installing MSSQL Server CMD Tools..."
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/msprod.list
sudo apt-get update
sudo ACCEPT_EULA=$ACCEPT_EULA \
     apt-get install mssql-tools unixodbc-dev

export PATH="$PATH:/opt/mssql-tools/bin"

sudo ufw allow 1433/tcp
sudo ufw reload
sudo systemctl restart mssql-server

# Connect to MSSQL Server
echo "Connecting to MSSQL Server..."
sqlcmd -S $SERVER -U $USERNAME -P $PASSWORD -d $DATABASE -i setup/database.sql
systemctl status mssql-server --no-pager
