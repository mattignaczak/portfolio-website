interface Project {
  name: string;
  description: string;
  tech: string[];
  url?: string;
}

const PROJECTS: Project[] = [
  {
    name: 'Portfolio Website',
    description: 'This site. React 19, 98.css, TypeScript. Deployed to S3 + CloudFront via CDK.',
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
    <div className="projects">
      <ul className="tree-view" role="list">
        {PROJECTS.map((project) => (
          <li key={project.name}>
            <details open>
              <summary>
                <strong>{project.name}</strong>
              </summary>
              <p>{project.description}</p>
              <p className="tech-tags">
                {project.tech.map((t) => (
                  <span key={t} className="tech-tag">
                    {t}
                  </span>
                ))}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
