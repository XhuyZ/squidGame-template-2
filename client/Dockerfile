# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the static files
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build .

EXPOSE 3001

CMD ["serve", "-s", ".", "-l", "3001"]
 
 
