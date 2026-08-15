# HIA Website — Docker Deployment Guide

## Architecture

```
Internet
   │
   ▼
[Nginx Container :80/:443]  ←── Serves static site files
   │                              Handles SSL termination
   │ /api/payment/*               Proxies payment requests
   ▼
[Node.js Container :3001]   ←── Stripe payment processing
   │                              Isolated, no direct internet access
   ▼
[Stripe API]
```

## Prerequisites

- A VPS/server (DigitalOcean, AWS EC2, Hetzner) running Ubuntu 22.04+
- Docker + Docker Compose installed
- Domain pointing to server IP (A record: hope-international-association.com → YOUR_SERVER_IP)
- Port 80 and 443 open in firewall

## Install Docker on Ubuntu

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y
```

## Deploy

```bash
# 1. Clone the repo
git clone https://github.com/brunsomasse/hia-website.git
cd hia-website
git checkout docker

# 2. Set up environment variables
cp .env.example .env
nano .env  # fill in your real Stripe keys

# 3. Copy your site files into the site/ container folder
# (index.html, images/, videos/, etc. are already there)

# 4. Get SSL certificate first (HTTP must be reachable)
docker compose up certbot --no-deps -d
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d hope-international-association.com \
  -d www.hope-international-association.com \
  --email hopeinternationalassociation@gmail.com \
  --agree-tos --no-eff-email

# 5. Start all containers
docker compose up -d

# 6. Verify everything is running
docker compose ps
docker compose logs payment  # check payment service
docker compose logs site     # check nginx
```

## Useful Commands

```bash
# Check container status
docker compose ps

# View live logs
docker compose logs -f

# Restart a specific container
docker compose restart payment
docker compose restart site

# Update site content (after git pull)
docker compose build site
docker compose up -d site

# Update payment service (after code change)
docker compose build payment
docker compose up -d payment

# Stop everything
docker compose down

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Updating Images on the Containerized Site

When you update images:
```bash
git pull origin main
docker compose build site
docker compose up -d site
```

## Environment Variables Reference

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_live_...) |
| `ALLOWED_ORIGIN` | Your domain for CORS |
| `NODE_ENV` | `production` or `development` |

## Health Check

```bash
# Payment service health
curl https://hope-international-association.com/api/payment/health

# Expected response:
# {"status":"ok","service":"hia-payment","timestamp":"..."}
```

## Switching from Netlify to Docker

When you're ready to go fully containerized:

1. Deploy to your VPS using steps above
2. Update DNS A record to point to your server IP
3. Test everything works
4. Cancel Netlify (or keep as backup)

The site files (`index.html`, `images.js`, `images/`) need one change:
- Update the payment endpoint in `index.html`:
  ```
  From: /.netlify/functions/create-payment-intent
  To:   /api/payment/create-payment-intent
  ```
