#!/bin/bash

export DRCB_DIR=$(pwd)

echo "DRCB_DIR $DRCB_DIR"

export DRCB_DATA_DIR="$HOME/.drcb_data_dir"
echo "DRCB_DATA_DIR $DRCB_DATA_DIR"
mkdir -p $DRCB_DATA_DIR

# Get the directory containing the script
SCRIPT_DIR=$(dirname "$0")

# Convert the directory to an absolute path
SCRIPT_DIR=$(cd "$SCRIPT_DIR" && pwd)

echo "The script is located in: $SCRIPT_DIR"



bun index.ts
