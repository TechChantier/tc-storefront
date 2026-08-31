# Deploy TC Storefront (EC2 + Apache + PM2 + wildcard SSL)

Production guide for **tc-storefront** on an Ubuntu EC2/VPS.

Domain: **`tcpos.site`**. EC2 IP: **`3.83.159.34`**. Every shop is a subdomain:

```text
https://shop1.tcpos.site
https://shop2.tcpos.site
https://anything.tcpos.site
```

One Next.js process serves all of them. Tenant identity comes from the `Host` header (Laravel `/api/storefront/resolve`). Apache must **preserve that host**.

```text
Browser  https://shop1.tcpos.site
   → Apache :443  (*.tcpos.site wildcard cert)
   → http://127.0.0.1:3001  (PM2 → next start)
   → POST {TCPOS_API_BASE_URL}/api/storefront/resolve
```

---

## 0. What must already be true

- EC2 public IP is **`3.83.159.34`**.
- Namecheap **A** records:
  - `@` → `3.83.159.34` (optional, apex `tcpos.site`)
  - `*` → `3.83.159.34` (wildcard `*.tcpos.site`)
- Security group / firewall: **22**, **80**, **443** inbound. Do **not** open the Node port to the world.
- Central TCPoS API is reachable from the EC2 box (resolve runs server-side).
- Each live shop hostname exists as a **verified** row in Laravel `storefront_domains` (e.g. `shop1.tcpos.site`) with `template_key` `classic` or `pro`.

If another app on this same instance already uses port **3000** (for example manager), this guide uses **3001** for the storefront. Change it everywhere if needed.

---

## 1. DNS check

From your laptop:

```bash
dig +short tcpos.site A
dig +short shop1.tcpos.site A
dig +short anything-random.tcpos.site A
```

All of those should return `3.83.159.34`. Wildcard is working when a name you never created still resolves.

---

## 2. Server baseline

SSH in, then:

```bash
sudo apt-get update
sudo apt-get install -y git nginx-common apache2 python3-certbot-apache
```

If Apache is not installed yet:

```bash
sudo apt-get install -y apache2
sudo a2enmod proxy proxy_http headers rewrite ssl
sudo systemctl enable --now apache2
```

Install Node 22 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

Install PM2:

```bash
sudo npm i -g pm2
```

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

## 4. Clone and build the app

```bash
sudo mkdir -p /var/www/tc-storefront
sudo chown "$USER":"$USER" /var/www/tc-storefront
cd /var/www/tc-storefront
git clone <YOUR_REPO_URL> .
```

Create production env (never `NEXT_PUBLIC_` for the service token):

```bash
cd /var/www/tc-storefront
cat > .env <<'EOF'
NODE_ENV=production
PORT=3001
TCPOS_API_BASE_URL=https://api.tcpos.app
STOREFRONT_SERVICE_TOKEN=replace-with-production-token
STOREFRONT_RESOLVE_REVALIDATE_SECONDS=60
EOF
chmod 600 .env
```

`TCPOS_API_BASE_URL` is the **central** TCPoS host (the one that serves `POST /api/storefront/resolve`), not a tenant POS host. `STOREFRONT_SERVICE_TOKEN` must match Laravel `STOREFRONT_SERVICE_TOKEN`.

Install and build:

```bash
cd /var/www/tc-storefront
npm ci
npm run build
```

---

## 5. Start with PM2

```bash
cd /var/www/tc-storefront
PORT=3001 pm2 start npm --name tc-storefront -- start
pm2 save
pm2 startup
```

Run the command `pm2 startup` prints so it survives reboot.

Check Node only (not public DNS yet):

```bash
curl -I http://127.0.0.1:3001
pm2 status
pm2 logs tc-storefront --lines 50
```

You should get a response from Next. `Host: 127.0.0.1` is not a shop hostname, so the HTML may be “storefront not found”. That is expected.

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

From your laptop:

```bash
curl -I https://shop1.tcpos.site
curl -I https://shop2.tcpos.site
echo | openssl s_client -servername shop1.tcpos.site -connect shop1.tcpos.site:443 2>/dev/null | openssl x509 -noout -dates -ext subjectAltName
```

The certificate SAN list should include `tcpos.site` and `*.tcpos.site`.

In a browser:

1. `https://shop1.tcpos.site/` should redirect to `/{default_locale}` (e.g. `/en`) **if** Laravel knows that hostname.
2. You should see `Classic — Home — …` or `Pro — Home — …` from `template_key`.
3. If Laravel still returns `modern`, you get the **unsupported template** page (that is correct until you change the key).
4. Unknown subdomains show **storefront not found**.

Laravel must receive the Market hostname in resolve, e.g. `{ "hostname": "shop1.tcpos.site" }`. Add/verify those rows in `storefront_domains` before expecting a themed shop.

---

## After a change

### Code (pushed to git)

```bash
cd /var/www/tc-storefront
git pull
npm ci
npm run build
pm2 restart tc-storefront
```

Always rebuild. `pm2 restart` alone keeps the previous `.next` build.

### Only `.env` (API URL or token)

These are read at **runtime** by `next start` (not baked in like `NEXT_PUBLIC_*`):

```bash
cd /var/www/tc-storefront
# edit .env
pm2 restart tc-storefront --update-env
```

If the process was started with an inline `PORT=3001` and PM2 is not picking up `.env`:

```bash
cd /var/www/tc-storefront
pm2 delete tc-storefront
PORT=3001 pm2 start npm --name tc-storefront -- start
pm2 save
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
| App status | `pm2 status` |
| App logs | `pm2 logs tc-storefront` |
| Restart app | `pm2 restart tc-storefront` |
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
| Apache 503 | PM2 not running, or proxy port is not `3001` |
| `dig` for a subdomain is empty | Namecheap `*` A record not pointing at `3.83.159.34` |
