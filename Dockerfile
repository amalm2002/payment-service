# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build TypeScript code
RUN npm run build

# Copy all proto files into dist
# RUN cp -r src/proto dist/

# Expose service port
EXPOSE 3008

# Start the service
CMD ["node", "dist/server.js"]
