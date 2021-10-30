FROM alpine:edge
VOLUME /data

RUN apk update
RUN apk add nano
RUN apk add nodejs-current~=17.0 npm

WORKDIR /data
CMD node src/app.js
