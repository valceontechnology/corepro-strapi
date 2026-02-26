# CorePro Strapi CMS

Headless CMS backend for CorePro Products. Provides the admin panel and API for managing brands, products, and datasheets.

## Content Model

```
Brand (1) ──→ (many) Product (1) ──→ (many) Datasheet
  ├─ name              ├─ name                 ├─ title
  ├─ slug (auto)       ├─ slug (auto)          ├─ file (PDF upload)
  ├─ domain            ├─ sku (unique)         ├─ version
  ├─ tagline           ├─ description (rich)   └─ product (relation)
  ├─ description       ├─ shortDescription
  ├─ logo (upload)     ├─ category
  ├─ accentColor       ├─ images (multi upload)
  ├─ sortOrder         ├─ featuredImage
  └─ products (rel)    ├─ specifications (JSON)
                       ├─ dealerOnly (bool)
                       └─ sortOrder
```

### Specifications Field

The `specifications` field on Product is a JSON object. Client enters key-value pairs like:

```json
{
  "Dimensions": "12\" x 8\" x 4\"",
  "Weight": "2.5 lbs",
  "Material": "Stainless Steel",
  "Certification": "UL Listed"
}
```

This keeps specs flexible per product without requiring schema changes.

## Deployment

### 1. Set up environment

```bash
ssh deploy@129.212.185.26
cd /home/deploy/apps
git clone <your-repo> corepro-strapi
cd corepro-strapi
cp .env.example .env
```

Generate real secrets:

```bash
# Run this 5 times, paste each output into .env for the 5 secret fields
openssl rand -base64 32
```

Set a real Postgres password (same value for both `DATABASE_PASSWORD` and `POSTGRES_PASSWORD`).

### 2. Add DNS record

Point `admin.corepro.co` → `129.212.185.26` (A record)

### 3. Add Caddy block

Edit the Caddyfile (on the droplet):

```
admin.corepro.co {
    reverse_proxy corepro-strapi:1337
}
```

### 4. Start the stack

```bash
docker compose up -d --build
```

Wait ~60 seconds for the first build and DB migration.

### 5. Reload Caddy

```bash
docker exec capstone_local-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

### 6. Create admin account

Visit `https://admin.corepro.co/admin` and create the first admin user.

## Giving the Client Access

Once admin is created:

1. Go to **Settings → Administration panel → Roles**
2. Create a role called "Content Editor" with permissions to create/read/update Brands, Products, and Datasheets (but not delete or access Settings)
3. Invite the client's email under **Settings → Administration panel → Users**

They'll get an email to set their password and can start adding products immediately.

## API Endpoints

Once content types have data and public permissions are enabled:

```
GET /api/brands                         # All brands
GET /api/brands?filters[slug]=brand-a   # Single brand by slug
GET /api/brands?populate=products       # Brands with products
GET /api/products?populate=*            # All products with relations
GET /api/products?filters[brand][slug]=brand-a  # Products for a brand
GET /api/datasheets?filters[product][id]=1       # Datasheets for a product
```

### Enable Public Read Access

After first launch, go to:
**Settings → Users & Permissions → Roles → Public**

Enable `find` and `findOne` for Brand, Product, and Datasheet.
This lets the Next.js frontend read data without authentication.

## Local Development

```bash
cp .env.example .env
# Edit .env — set DATABASE_HOST=localhost if running Postgres locally
npm install
npm run develop    # http://localhost:1337/admin
```
