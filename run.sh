#!/bin/bash

export DRCB_DIR=$(pwd)

echo "DRCB_DIR $DRCB_DIR"

export DRCB_DATA_DIR="$HOME/.drcb_data_dir"
echo "DRCB_DATA_DIR $DRCB_DATA_DIR"
mkdir -p $DRCB_DATA_DIR



bun index.ts
