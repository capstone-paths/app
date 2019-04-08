#!/bin/sh
# The script creates a python virual environment , installs all dependencies and runs a python script that interactively
# allows setting up the db .env file, wipe existing data, load course node and run cypher queries to create sequences
# This script is tested on a mac and will require Python3

# install / upgrade pip
python -m pip install --upgrade pip

# install / upgrade virtual env
python -m pip install --upgrade virtualenv

# set up virtual environment by the name 'env'
python -m virtualenv env

# activate env
source env/bin/activate

# install dependencies defined in requirements.txt
pip install -r requirements.txt

# execute database init script
python interactive_sequence_builder/interactive_sequence_builder.py

# deactivate virtual env
deactivate
