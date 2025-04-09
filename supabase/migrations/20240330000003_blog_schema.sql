-- Create blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id),
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.blog_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Blog categories policies (viewable by all)
DROP POLICY IF EXISTS "Blog categories are viewable by all users" ON public.blog_categories;
CREATE POLICY "Blog categories are viewable by all users"
  ON public.blog_categories
  FOR SELECT
  USING (true);

-- Blog tags policies (viewable by all)
DROP POLICY IF EXISTS "Blog tags are viewable by all users" ON public.blog_tags;
CREATE POLICY "Blog tags are viewable by all users"
  ON public.blog_tags
  FOR SELECT
  USING (true);

-- Blog posts policies
DROP POLICY IF EXISTS "Published blog posts are viewable by all users" ON public.blog_posts;
CREATE POLICY "Published blog posts are viewable by all users"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view all their blog posts" ON public.blog_posts;
CREATE POLICY "Authors can view all their blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can create their own blog posts" ON public.blog_posts;
CREATE POLICY "Authors can create their own blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update their own blog posts" ON public.blog_posts;
CREATE POLICY "Authors can update their own blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete their own blog posts" ON public.blog_posts;
CREATE POLICY "Authors can delete their own blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (author_id = auth.uid());

-- Blog post tags policies
DROP POLICY IF EXISTS "Blog post tags are viewable by all users" ON public.blog_post_tags;
CREATE POLICY "Blog post tags are viewable by all users"
  ON public.blog_post_tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authors can manage tags for their own posts" ON public.blog_post_tags;
CREATE POLICY "Authors can manage tags for their own posts"
  ON public.blog_post_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE blog_posts.id = blog_post_tags.post_id
      AND blog_posts.author_id = auth.uid()
    )
  );

-- Blog comments policies
DROP POLICY IF EXISTS "Approved blog comments are viewable by all users" ON public.blog_comments;
CREATE POLICY "Approved blog comments are viewable by all users"
  ON public.blog_comments
  FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Users can create blog comments" ON public.blog_comments;
CREATE POLICY "Users can create blog comments"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for all tables
alter publication supabase_realtime add table public.blog_categories;
alter publication supabase_realtime add table public.blog_tags;
alter publication supabase_realtime add table public.blog_posts;
alter publication supabase_realtime add table public.blog_post_tags;
alter publication supabase_realtime add table public.blog_comments;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_blog_tags_updated_at ON public.blog_tags;
CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON public.blog_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, description)
VALUES 
('AI News', 'ai-news', 'Latest news and updates in the AI industry'),
('Tutorials', 'tutorials', 'Step-by-step guides and tutorials'),
('Case Studies', 'case-studies', 'Real-world examples and success stories'),
('Product Updates', 'product-updates', 'Latest features and improvements to our platform');

-- Insert default blog tags
INSERT INTO public.blog_tags (name, slug)
VALUES 
('AI', 'ai'),
('Chatbots', 'chatbots'),
('Machine Learning', 'machine-learning'),
('Natural Language Processing', 'nlp'),
('Customer Support', 'customer-support'),
('Sales', 'sales'),
('E-commerce', 'ecommerce'),
('WhatsApp', 'whatsapp'),
('Telegram', 'telegram'),
('Shopify', 'shopify'),
('WordPress', 'wordpress');