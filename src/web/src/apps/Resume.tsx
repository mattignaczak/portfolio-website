import { DownloadSimple } from '@phosphor-icons/react';
import { content, format } from '../content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const { site, resume } = content;

export function Resume() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b-4 border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl">{site.name}</h1>
          <p className="text-sm">
            {format(resume.contactLine, { email: site.email, location: site.location })}
          </p>
        </div>
        <Button asChild>
          <a href="/resume.pdf" download>
            <DownloadSimple weight="bold" />
            {resume.downloadLabel}
          </a>
        </Button>
      </header>

      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>{resume.summary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{resume.summary.body}</p>
        </CardContent>
      </Card>

      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>{resume.skills.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resume.skills.groups.map((group) => (
            <div key={group.label} className="text-sm">
              <span className="font-heading">{group.label}: </span>
              <span>{group.items}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>{resume.experience.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {resume.experience.companies.map((company) => (
            <div key={company.company} className="space-y-4">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="font-heading text-lg">{company.company}</p>
                <p className="text-sm">
                  {company.period}
                  {company.location ? ` · ${company.location}` : ''}
                </p>
              </div>
              {company.note ? <p className="text-sm italic">{company.note}</p> : null}

              {company.roles.map((role) => (
                <div key={role.title} className="space-y-1.5 border-l-4 border-border pl-4">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="font-heading">{role.title}</p>
                    {role.period ? <p className="text-sm">{role.period}</p> : null}
                  </div>
                  {role.subtitle ? <p className="text-sm font-base">{role.subtitle}</p> : null}
                  {role.summary ? <p className="text-sm">{role.summary}</p> : null}
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>{resume.education.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resume.education.items.map((item) => (
            <div
              key={item.primary}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <span className="font-heading">{item.primary}</span>
                {item.secondary ? <span className="text-sm"> — {item.secondary}</span> : null}
              </div>
              {item.meta ? <p className="text-sm">{item.meta}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
