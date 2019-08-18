# ---------------------
#  Dockerfile - Node.js
#  Author: zihengCat
#  Version: 1.0.0
# ---------------------
# ================================
# Using Base OS -> CentOS 7 Latest
# ================================
FROM       docker.io/centos:latest
# ==========================
# MAINTAINER is `deprecated`
# ==========================
#MAINTAINER zihengCat
# =============================================
# LABEL following the standard set of labels by
# The Open Containers Initiative (OCI)
# =============================================
LABEL      org.opencontainers.image.title="DockerImage - Node.js" \
           org.opencontainers.image.description="A docker image contains node.js with dependencies based on CentOS 7 Linux." \
           org.opencontainers.image.authors="zihengCat" \
           org.opencontainers.image.version="1.0.0" \
           org.opencontainers.image.licenses="MIT" \
           org.opencontainers.image.url="https://github.com/zihengCat/docker-container-by-zihengcat"
# --------------------
# Node.js LTS 'Carbon'
# --------------------
#FROM node:carbon
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
CMD ["npm", "run", "server"]
# --------------------
# EOF
