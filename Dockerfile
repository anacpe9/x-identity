FROM registry.gitlab.com/token-x/node:16-alpine-builder AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN NODE_ENV=development yarn install --frozen-lockfile

COPY . .
RUN NODE_ENV=development yarn run build

RUN sed -i 's/..\/..\/package.json/..\/package.json/g' dist/common/constants.js
RUN NODE_ENV=production yarn install  --frozen-lockfile --production
RUN node -e 'const package = require("./package.json"); const str = JSON.stringify({name: package.name, version: package.version, description: package.description, license: package.license, private: package.private}, null, 2); console.log(str);' > dist/package.json
RUN find ./ -type f -name '*.d.ts' -delete
RUN find ./ -type f -name '*.js.map' -delete

FROM registry.gitlab.com/token-x/node:16-alpine
LABEL maintainer="Anucha Nualsi <ana.cpe9@gmail.com>"

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/dist ./

EXPOSE 3000
CMD ["node", "main.js"]