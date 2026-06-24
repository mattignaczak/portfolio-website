import { Button } from '@/components/ui/button';

export function Resume() {
  return (
    <div className="space-y-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">Matt Ignaczak</h1>
        <p className="text-sm text-muted-foreground">mattignaczak@proton.me · Toronto, Canada</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Experience</h2>
        <div>
          <p className="text-sm font-medium">Software Developer</p>
          <p className="text-sm text-muted-foreground">
            Building IoT and mobile apps. AWS, TypeScript, Flutter.
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Skills</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>AWS (Lambda, DynamoDB, IoT Core, CDK, CloudFront)</li>
          <li>TypeScript / JavaScript / Node.js</li>
          <li>Flutter / Dart</li>
          <li>React</li>
          <li>Infrastructure as Code</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Download</h2>
        <Button asChild variant="outline" size="sm">
          <a href="/resume.pdf" download>
            resume.pdf
          </a>
        </Button>
      </section>
    </div>
  );
}
