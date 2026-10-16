FROM nginxinc/nginx-unprivileged:1.27-alpine

LABEL org.opencontainers.image.title="Bus Booking App" \
      org.opencontainers.image.description="Static bus booking web application"

COPY --chown=nginx:nginx index.html styles.css app.js /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
