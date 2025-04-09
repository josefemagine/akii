const fs = require('fs');
const path = require('path');
const getBlogPostRoutes = require('./generate-blog-routes');

// Configuration
const siteUrl = 'https://www.akii.com';
const outputPath = path.join(__dirname, '../dist/sitemap.xml');

// Define static routes
const staticRoutes = [
  '/',
  '/about',
  '/plans',
  '/blog',
  '/contact',
  '/products/web-chat',
  '/products/mobile-chat',
  '/products/whatsapp-chat',
  '/products/telegram-chat',
  '/products/shopify-chat',
  '/products/wordpress-chat',
  '/products/private-ai-api',
  '/products/integrations/zapier',
  '/products/integrations/n8n',
  '/terms-of-service',
  '/privacy-policy',
  '/legal/cookie-policy',
];

// Add blog post routes
const blogRoutes = getBlogPostRoutes();

// Combine all routes
const allRoutes = [...staticRoutes, ...blogRoutes];

// Generate sitemap XML
function generateSitemap() {
  console.log('Generating sitemap.xml...');

  const today = new Date().toISOString().split('T')[0];
  
  // XML header
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add each URL
  allRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}${route}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Close XML
  xml += '</urlset>';
  
  // Write to file
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated at: ${outputPath}`);
  
  // Also create robots.txt
  const robotsContent = `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml`;
  
  fs.writeFileSync(path.join(__dirname, '../dist/robots.txt'), robotsContent, 'utf8');
  console.log('robots.txt generated');
}

// Check if this script is run directly
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap; 