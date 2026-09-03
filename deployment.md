# Deploy TC Storefront (EC2 + Apache + Docker)

Production guide for **tc-storefront** on an Ubuntu EC2/VPS.

The Next.js image is **built on GitHub Actions** and pulled on the server. Do **not** run `npm run build` on the t2.small — that OOM-kills the box.

Domain: **`tcpos.site`**. EC2 IP: **`54.152.179.126`**. Every shop is a subdomain:

```text
https://shop1.tcpos.site
https://shop2.tcpos.site
https://anything.tcpos.site
```

One Next.js container serves all of them. Tenant identity comes from the `Host` header (Laravel `/api/storefront/resolve`). Apache must **preserve that host**.

```text
Browser  https://shop1.tcpos.site
   → Apache :443  (*.tcpos.site wildcard cert)
   → http://127.0.0.1:3001  (Docker → next standalone)
   → POST {TCPOS_API_BASE_URL}/api/storefront/resolve
```

---

## 0. What must already be true

- EC2 public IP is **`54.152.179.126`**.
- Namecheap **A** records:
  - `@` → `54.152.179.126` (optional, apex `tcpos.site`)
  - `*` → `54.152.179.126` (wildcard `*.tcpos.site`)
- Security group / firewall: **22**, **80**, **443** inbound. Do **not** open the Node/Docker port to the world.
- Central TCPoS API is reachable from the EC2 box (resolve runs server-side).
- Each live shop hostname exists as a **verified** row in Laravel `storefront_domains` (e.g. `shop1.tcpos.site`) with `template_key` `classic` or `pro`.

If another app on this same instance already uses port **3000** (for example manager), this guide uses **3001** on the host, mapped to **3000** in the container. Change the host mapping in `docker-compose.yml` if needed.

---

## 1. DNS check

From your laptop:

```bash
dig +short tcpos.site A
dig +short shop1.tcpos.site A
dig +short anything-random.tcpos.site A
```

All of those should return `54.152.179.126`. Wildcard is working when a name you never created still resolves.

---

## 2. Server baseline

SSH in, then:

```bash
sudo apt-get update
sudo apt-get install -y git nginx-common apache2 python3-certbot-apache docker.io
sudo apt-get install -y docker-compose-v2 || sudo apt-get install -y docker-compose-plugin
sudo a2enmod proxy proxy_http headers rewrite ssl
sudo systemctl enable --now apache2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in so the `docker` group applies. Confirm:

```bash
docker version
docker compose version
```

You do **not** need Node, npm, or PM2 on this box.

---

## 3. Wildcard SSL (Let’s Encrypt DNS-01)

HTTP-01 **cannot** issue `*.tcpos.site`. Use the same DNS challenge you used for `tcpos.app`.

```bash
sudo certbot certonly --manual --preferred-challenges=dns \
  --email fongohmartin@gmail.com \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d tcpos.site \
  -d "*.tcpos.site" \
  -v
```

Certbot will pause and ask you to create a **TXT** record, typically:

| Type | Host | Value |
| --- | --- | --- |
| TXT | `_acme-challenge` | (token Certbot prints) |

In Namecheap that host is `_acme-challenge` (it appends `tcpos.site` for you). TTL 1 minute if available.

If Certbot shows **two** TXT values (apex + wildcard), add **both** on the same `_acme-challenge` name.

Wait until the record is visible:

```bash
dig +short TXT _acme-challenge.tcpos.site
```

When the token appears, press Enter in Certbot.

Certificates land at:

```text
/etc/letsencrypt/live/tcpos.site/fullchain.pem
/etc/letsencrypt/live/tcpos.site/privkey.pem
```

(The folder name is the first `-d` domain.)

**Renewal:** `--manual` does **not** auto-renew. Before expiry (~90 days), run the same `certbot certonly --manual ...` command again, update the TXT record, then reload Apache:

```bash
sudo systemctl reload apache2
```

To automate later, switch to a Namecheap DNS plugin (`certbot-dns-namecheap`) so `certbot renew` can run from cron.

---

## 4. Server env (secrets only)

The app source is not built here. Keep compose + `.env` only:

```bash
sudo mkdir -p /var/www/tc-storefront
sudo chown "$USER":"$USER" /var/www/tc-storefront
cd /var/www/tc-storefront
```

Create production env (never `NEXT_PUBLIC_` for the service token):

```bash
cat > /var/www/tc-storefront/.env <<'EOF'
NODE_ENV=production
TCPOS_API_BASE_URL=https://api.tcpos.app
STOREFRONT_SERVICE_TOKEN=replace-with-production-token
STOREFRONT_RESOLVE_REVALIDATE_SECONDS=60
EOF
chmod 600 /var/www/tc-storefront/.env
```

`TCPOS_API_BASE_URL` is the **central** TCPoS host (the one that serves `POST /api/storefront/resolve`), not a tenant POS host. `STOREFRONT_SERVICE_TOKEN` must match Laravel `STOREFRONT_SERVICE_TOKEN`.

These values are read at **container start**, not baked into the image.

Copy `docker-compose.yml` from the repo into `/var/www/tc-storefront/` (GitHub Actions also scp’s it on every deploy).

---

## 5. GitHub Actions (build on GitHub, run on EC2)

Push to `main` (or run the workflow manually). GitHub:

1. Builds the Docker image (`output: "standalone"`).
2. Pushes `ghcr.io/techchantier/tc-storefront:<sha>` and `:latest`.
3. SSHs to `54.152.179.126`, pulls the image, and runs `docker compose up -d`.

### Repo secrets

In GitHub → **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | `54.152.179.126` |
| `DEPLOY_USER` | SSH user on the box (often `ubuntu`) |
| `DEPLOY_SSH_KEY` | Private key whose public half is in `~/.ssh/authorized_keys` on the server |

The workflow uses `GITHUB_TOKEN` to push/pull GHCR. After the first successful package publish, if pull on the server fails with `denied`, open the package at `https://github.com/orgs/TechChantier/packages` (or the repo **Packages** tab) and grant the `tc-storefront` repo access.

### Deploy SSH key

On your laptop:

```bash
ssh-keygen -t ed25519 -C "github-actions-tc-storefront" -f ./tc-storefront-deploy -N ""
```

Put the **private** key in `DEPLOY_SSH_KEY`. On the server:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Restrict the key to the deploy user. Do not reuse your personal SSH key.

---

## 6. Apache reverse proxy

### `/etc/apache2/sites-available/tcpos.site.conf`

HTTP → HTTPS:

```apache
<VirtualHost *:80>
    ServerName tcpos.site
    ServerAlias *.tcpos.site

    ServerAdmin webmaster@localhost

    ErrorLog ${APACHE_LOG_DIR}/tcpos.site.error.log
    CustomLog ${APACHE_LOG_DIR}/tcpos.site.access.log combined

    RewriteEngine on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

### `/etc/apache2/sites-available/tcpos.site-le-ssl.conf`

```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName tcpos.site
    ServerAlias *.tcpos.site

    ServerAdmin webmaster@localhost

    ErrorLog ${APACHE_LOG_DIR}/tcpos.site.error.log
    CustomLog ${APACHE_LOG_DIR}/tcpos.site.access.log combined

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"

    ProxyPass        / http://127.0.0.1:3001/
    ProxyPassReverse / http://127.0.0.1:3001/

    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile /etc/letsencrypt/live/tcpos.site/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/tcpos.site/privkey.pem
</VirtualHost>
</IfModule>
```

`ProxyPreserveHost On` is required. Without it, Next would see `127.0.0.1` instead of `shop1.tcpos.site` and every shop would fail resolve.

Enable and reload:

```bash
sudo a2ensite tcpos.site.conf
sudo a2ensite tcpos.site-le-ssl.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

If `options-ssl-apache.conf` is missing:

```bash
sudo certbot --apache
```

is not what you want for wildcards. Copy options from another live site, or omit the `Include` line and keep the two `SSLCertificate*` lines.

---

## 7. Smoke test

On the server:

```bash
docker compose -f /var/www/tc-storefront/docker-compose.yml ps
curl -I -H "Host: shop1.tcpos.site" http://127.0.0.1:3001
```

From your laptop:

```bash
curl -I https://shop1.tcpos.site
curl -I https://shop2.tcpos.site
echo | openssl s_client -servername shop1.tcpos.site -connect shop1.tcpos.site:443 2>/dev/null | openssl x509 -noout -dates -ext subjectAltName
```

The certificate SAN list should include `tcpos.site` and `*.tcpos.site`.

In a browser:

1. `https://shop1.tcpos.site/` should redirect to `/{default_locale}` (e.g. `/en`) **if** Laravel knows that hostname.
2. You should see Classic or Pro from `template_key`.
3. If Laravel still returns `modern`, you get the **unsupported template** page (that is correct until you change the key).
4. Unknown subdomains show **storefront not found**.

Laravel must receive the Market hostname in resolve, e.g. `{ "hostname": "shop1.tcpos.site" }`. Add/verify those rows in `storefront_domains` before expecting a themed shop.

---

## After a change

### Code (pushed to `main`)

GitHub Actions builds and deploys. On the server you should only see a new container:

```bash
cd /var/www/tc-storefront
docker compose ps
docker compose logs -f --tail 80
```

Do **not** `git pull` / `npm ci` / `npm run build` on this instance.

### Only `.env` (API URL or token)

These are read at **runtime** when the container starts:

```bash
cd /var/www/tc-storefront
# edit .env
docker compose up -d --force-recreate
```

### Apache config only

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## Useful commands

| Task | Command |
| --- | --- |
| App status | `cd /var/www/tc-storefront && docker compose ps` |
| App logs | `docker compose logs -f tc-storefront` |
| Restart app | `docker compose restart` |
| Hit Node directly | `curl -I -H "Host: shop1.tcpos.site" http://127.0.0.1:3001` |
| Apache errors | `sudo tail -f /var/log/apache2/tcpos.site.error.log` |
| Cert expiry | `sudo certbot certificates` |

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Browser cert warning on `shop1.tcpos.site` | Wildcard cert missing `*.tcpos.site`, or Apache pointing at the wrong `live/` folder |
| Every shop shows “not found” | `ProxyPreserveHost` off, or hostname not in Laravel `storefront_domains` |
| “Storefront unavailable” / misconfigured | Missing `STOREFRONT_SERVICE_TOKEN` or `TCPOS_API_BASE_URL` unreachable from EC2 |
| “Unsupported template” | Laravel `template_key` is not `classic` or `pro` (often still `modern`) |
| Apache 503 | Container not running, or proxy port is not `3001` |
| `docker compose pull` denied | GHCR package is private and the repo/token is not allowed to pull |
| Actions SSH failure | `DEPLOY_SSH_KEY` / `authorized_keys` mismatch, or `DEPLOY_USER` is wrong |
| `dig` for a subdomain is empty | Namecheap `*` A record not pointing at `54.152.179.126` |
| Instance dies during deploy | You ran `npm run build` on the t2.small — use GitHub Actions instead |
