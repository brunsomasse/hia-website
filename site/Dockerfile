# ── Container 1: HIA Static Website ─────────────────────────────────────────
# Serves index.html, images/, videos/, and all static assets via Nginx
# Lightweight Alpine-based image (~25MB)

FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy site files
COPY . /usr/share/nginx/html/

# Remove Dockerfile and nginx config from web root
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/nginx.conf

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
