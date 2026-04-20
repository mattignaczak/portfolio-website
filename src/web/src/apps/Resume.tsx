export function Resume() {
  return (
    <div className="resume">
      <header>
        <h2>Matt Ignaczak</h2>
        <p className="resume-contact">mattignaczak@proton.me · Toronto, Canada</p>
      </header>

      <section>
        <h3>Experience</h3>
        <dl>
          <dt>Software Developer</dt>
          <dd>Building IoT and mobile apps. AWS, TypeScript, Flutter.</dd>
        </dl>
      </section>

      <section>
        <h3>Skills</h3>
        <ul className="skills-list">
          <li>AWS (Lambda, DynamoDB, IoT Core, CDK, CloudFront)</li>
          <li>TypeScript / JavaScript / Node.js</li>
          <li>Flutter / Dart</li>
          <li>React</li>
          <li>Infrastructure as Code</li>
        </ul>
      </section>

      <section>
        <h3>Download</h3>
        <p>
          <a href="/resume.pdf" download>
            resume.pdf
          </a>
        </p>
      </section>
    </div>
  );
}
