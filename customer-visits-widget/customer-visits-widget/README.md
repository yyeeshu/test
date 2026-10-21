# Customer Visits Widget

Responsive React + Tailwind CSS calendar widget for embedding in a modern SharePoint page.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploy the generated `dist` folder to an HTTPS static host such as Azure Static Web Apps. The Vite base is set to `./` for portable static hosting.

## Update visit data

Edit `src/visits.js`. Required fields:

- `customerName`
- `visitDate` in `YYYY-MM-DD` format
- `location`
- `technology` (optional, used by the technology filter)

The included records are fictional demo data and must be replaced before production deployment.

## Embed in SharePoint

1. Deploy the `dist` folder and copy its HTTPS URL.
2. Edit the modern SharePoint page.
3. Add the **Embed** web part.
4. Paste the hosted URL or an iframe using that URL.
5. If SharePoint blocks the domain, ask the site administrator to permit the hosting domain in the site's HTML Field Security settings.

Example iframe:

```html
<iframe src="YOUR_HTTPS_WIDGET_URL" width="100%" height="900" frameborder="0" title="Upcoming Customer Visits"></iframe>
```

## Production note

Do not put secrets, client secrets, or privileged API credentials in this front-end project. For live SharePoint List data, use an approved authentication pattern or a secured API rather than embedding credentials in JavaScript.
