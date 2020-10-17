#!/bin/bash

script_id='Script (ci.sh)'

# Install MSSQL Server
echo "$script_id: Installing MSSQL Server..."
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/16.04/mssql-server-2019.list)"
sudo apt-get update
sudo apt-get install -y mssql-server
sudo /opt/mssql/bin/mssql-conf -n setup accept-eula
systemctl status mssql-server --no-pager

# Install MSSQL Server CMD Tools
echo "$script_id: Installing MSSQL Server CMD Tools..."
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list | sudo tee /etc/apt/sources.list.d/msprod.list
sudo apt-get update
sudo apt-get install mssql-tools unixodbc-dev
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' | sudo tee -a ~/.bash_profile
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' | sudo tee -a ~/.bashrc
source ~/.bashrc

# Connect to MSSQL Server
echo "$script_id: Connecting to MSSQL Server..."
sqlcmd -S $SERVER -U $USERNAME -xP $PASSWORD -Q "CREATE DATABASE $DATABASE"
sqlcmd -S $SERVER -U $USERNAME -P $PASSWORD -i ./setup/database.sql
