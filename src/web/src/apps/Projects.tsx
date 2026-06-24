import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  name: string;
  description: string;
  tech: string[];
  url?: string;
}

const PROJECTS: Project[] = [
  {
    name: 'Portfolio Website',
    description: 'This site. React 19, shadcn/ui, TypeScript. Deployed to S3 + CloudFront via CDK.',
    tech: ['react', 'typescript', 'aws-cdk', 'cloudfront'],
  },
  {
    name: 'Place Home Solutions',
    description: 'IoT platform for smart home devices. Lambda, DynamoDB, IoT Core, Alexa.',
    tech: ['aws', 'typescript', 'lambda', 'dynamodb'],
  },
  {
    name: 'eSight Go & 4',
    description: 'Flutter app for smart glasses — Bluetooth, analytics, device diagnostics.',
    tech: ['flutter', 'dart', 'bluetooth'],
  },
];

export function Projects() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>

      <div className="grid gap-4">
        {PROJECTS.map((project) => (
          <Card key={project.name}>
            <CardHeader>
              <CardTitle>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
