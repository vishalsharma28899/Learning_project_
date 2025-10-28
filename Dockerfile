# Use Node LTS image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all app files
COPY . .

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "run", "start"]
