export function About() {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-semibold">About Me</h1>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Hi, I&apos;m <strong className="text-foreground">Matt Ignaczak</strong> — a software
          developer specializing in cloud infrastructure, TypeScript, and mobile applications.
        </p>
        <p>
          I build on AWS (Lambda, DynamoDB, IoT Core, CDK) and cross-platform mobile apps with
          Flutter. I enjoy working at the boundary between embedded devices, cloud services, and
          user-facing apps.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Currently</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Building IoT platforms with AWS serverless</li>
          <li>Shipping Flutter apps to iOS and Android</li>
          <li>Exploring React 19 and modern frontend patterns</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Previously</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Full-stack web development</li>
          <li>Backend systems and APIs</li>
        </ul>
      </section>
    </article>
  );
}
