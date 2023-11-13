FROM backpackapp/build:v0.29.0

# Initialize Solana
RUN solana-install init 1.17.2