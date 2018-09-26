# --------------------
# Node.js LTS 'Carbon'
# --------------------
FROM node:carbon
# --------------------
# Create app directory
# --------------------
WORKDIR /usr/src/app
# --------------------
# Install app dependencies
# --------------------
COPY package*.json ./
RUN  npm install
# --------------------
# Bundle app source
# --------------------
COPY . .
# --------------------
# Expose app port
# --------------------
EXPOSE 2233
# --------------------
# Start server
# --------------------
CMD [ "npm", "run", "server" ]
