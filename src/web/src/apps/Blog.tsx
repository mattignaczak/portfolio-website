import { Link } from 'react-router-dom';
import { content, format } from '../content';
import { formatPostDate, getAllPosts } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';

const { blog } = content;

export function Blog() {
  const posts = getAllPosts();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl">{blog.heading}</h1>
        <p className="text-foreground/70">{blog.intro}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-foreground/70">{blog.empty}</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-heading text-xl group-hover:underline">{post.title}</h2>
                  <span className="font-mono text-sm text-foreground/60">
                    {formatPostDate(post.date)}
                  </span>
                </div>
                {post.description && <p className="mt-2 text-foreground/70">{post.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-foreground/60">
                    {format(blog.readingTime, { minutes: post.readingMinutes })}
                  </span>
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
