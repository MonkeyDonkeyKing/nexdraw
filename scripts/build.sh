#!/bin/bash

# Build the Anchor project
anchor build

# Check if the build was successful
if [ $? -eq 0 ]; then
  # If build was successful, replace the file
  cp target/types/nexdraw.ts typescript/src/nexdraw.ts
  echo "Build successful and nexdraw.ts replaced!"
else
  # If build failed, print an error message
  echo "Build failed. File not replaced."
fi
