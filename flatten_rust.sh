#!/bin/bash

# Check if a directory is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 /path/to/folder"
    exit 1
fi

folder_path="$1"
output_file="output.txt"

# Check if the directory exists
if [ ! -d "$folder_path" ]; then
    echo "Error: Directory $folder_path does not exist."
    exit 1
fi

# Remove output.txt if it already exists
if [ -f "$output_file" ]; then
    rm "$output_file"
fi

# Find all .rs files in the directory and its subdirectories and append them to output.txt
find "$folder_path" -type f -name "*.rs" -exec cat {} + >> "$output_file"

echo "All Rust files have been concatenated into $output_file."
