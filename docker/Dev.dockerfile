FROM node:8.7.0-slim

WORKDIR /package

# Install dependencies
ADD package.json package.json
ADD yarn.lock yarn.lock
ADD .yarn-cache.tgz /
RUN yarn

# Add node_modules/.bin to PATH
ENV PATH "/package/node_modules/.bin:${PATH}"
