#!/bin/bash

export DRCB_RUN_DIR=$(pwd)

# echo "DRCB_RUN_DIR $DRCB_RUN_DIR"

export DRCB_DATA_DIR="$HOME/.drcb_data_dir"
# echo "DRCB_DATA_DIR $DRCB_DATA_DIR"
mkdir -p $DRCB_DATA_DIR

# Get the directory containing the script
DRCB_MODULE_DIR=$(dirname "$0")

# Convert the directory to an absolute path
DRCB_MODULE_DIR=$(cd "$DRCB_MODULE_DIR" && pwd)

# echo "The script is located in: $DRCB_MODULE_DIR"



bun $DRCB_MODULE_DIR/index.ts
