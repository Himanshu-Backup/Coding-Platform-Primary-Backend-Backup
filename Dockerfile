# Use official Node.js image as the base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port your app will run on
EXPOSE 8080

# Start the Node.js application
CMD ["node", "src/index.js"]