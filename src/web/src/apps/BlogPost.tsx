import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { content, format } from '../content';
import { formatPostDate, getPostBySlug } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';

const { blog, site } = content;

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = `${post.title} · ${site.name}`;
    return () => {
      document.title = previous;
    };
  }, [post]);

  if (!post) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl">Post not found</h1>
        <Link to="/blog" className="font-mono text-sm hover:underline">
          {blog.backToList}
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <Link
        to="/blog"
        className="inline-block font-mono text-sm text-foreground/60 hover:underline"
      >
        {blog.backToList}
      </Link>

      <header className="space-y-3 border-b-2 border-border pb-6">
        <h1 className="font-heading text-3xl leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 font-mono text-sm text-foreground/60">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{format(blog.readingTime, { minutes: post.readingMinutes })}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="prose">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.body}
        </Markdown>
      </div>
    </article>
  );
}
