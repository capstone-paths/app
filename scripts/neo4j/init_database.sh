#!/bin/sh
# The script creates a python virual environment , installs all dependencies and runs a python script that interactively
# allows setting up the db .env file, wipe existing data, load course node and run cypher queries to create sequences
# This script is tested on a mac and will require Python V3 installed
# and pip installed
# installing pip - 1) curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py 2) python get-pip.py
# ----------------------------------------------------------
# pass python version 3 symbolic link
# Example : sh init_database.sh python3.7
# ----------------------------------------------------------

# check if python3 symlink is passed
if [ $# -lt 1 ];
then
  echo "$0: python v3 symlink not passed [ Example : sh init_database.sh python3.7 ]"
  exit 2
fi

# install / upgrade pip
$1 -m pip install --upgrade pip

# install / upgrade virtual env
$1 -m pip install --upgrade virtualenv

# set up virtual environment by the name 'env'
$1 -m virtualenv env

# activate env
source env/bin/activate

# install dependencies defined in requirements.txt
pip install -r requirements.txt

# execute database init script
$1 init_database.py

# deactivate virtual env
deactivate
