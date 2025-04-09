const fs = require('fs');
const path = require('path');

/**
 * Extracts slug values from blog post files
 * This is a simplified example. In a real application, you might:
 * 1. Extract data from your CMS API
 * 2. Parse markdown files for frontmatter
 * 3. Access a database to get blog post information
 */
function getBlogPostRoutes() {
  try {
    // Look for blog posts in the Blog.tsx file as an example
    const blogPagePath = path.resolve(__dirname, '../src/pages/Blog.tsx');
    const blogPageContent = fs.readFileSync(blogPagePath, 'utf8');
    
    // Extract slugs using a simple regex
    // This pattern looks for slug: "something" in the file
    const slugPattern = /slug:\s*['"]([^'"]+)['"]/g;
    const slugMatches = [...blogPageContent.matchAll(slugPattern)];
    
    // Create routes from the slugs
    const blogRoutes = slugMatches.map(match => `/blog/${match[1]}`);
    
    return blogRoutes;
  } catch (error) {
    console.error('Error generating blog routes:', error);
    return [];
  }
}

// Export the blog routes so they can be used in the Vite config
module.exports = getBlogPostRoutes; 