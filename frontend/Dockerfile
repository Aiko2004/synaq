FROM node:20-slim

WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun run build

CMD ["bun", "run", "start"]