FROM node:10-alpine as builder
LABEL maintainer="Abhinav Khare <abhinav.khare31@gmail.com>"

WORKDIR /app

RUN apk add git python-dev make g++ gettext

COPY dist ./dist
RUN ls
#
#COPY . .
#RUN pwd
#RUN  JOBS=1 yarn build -prod

##
##

FROM node:10-alpine

WORKDIR /fastboot

COPY scripts/fastboot-server.js .
COPY --from=builder /app/dist/ app/

RUN apk add --no-cache ca-certificates && \
    cp app/package.json . && \
    yarn install && \
    yarn add fastboot-app-server && \
    rm -rf yarn.lock && \
    yarn cache clean

EXPOSE 4000

CMD ["node", "fastboot-server.js"]
