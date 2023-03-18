# syntax=docker/dockerfile:1.4
# Build Stage
# ---
FROM node:18 AS dev
WORKDIR /opt/app

RUN npm install -g typescript
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --ignore-scripts
COPY . .

FROM dev as builder

RUN yarn build

# Run Stage
# ---

# FROM gcr.io/distroless/nodejs:16
# FROM node:18 AS runner
FROM library/nginx as static

# USER nobody

COPY --link --chown=www-data --from=builder /opt/app/dist/ /usr/share/nginx/html/

# ARG NODE_ENV=production
# ENV NODE_ENV $NODE_ENV
# ENV PATH /opt/node_app/node_modules/.bin:$PATH

# ENTRYPOINT ["yarn", "dev"]
# CMD ["dist/main.js"]
