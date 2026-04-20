export function About() {
  return (
    <article className="notepad">
      <h2>About Me</h2>
      <p>
        Hi, I'm <strong>Matt Ignaczak</strong> — a software developer specializing in cloud
        infrastructure, TypeScript, and mobile applications.
      </p>
      <p>
        I build on AWS (Lambda, DynamoDB, IoT Core, CDK) and cross-platform mobile apps with
        Flutter. I enjoy working at the boundary between embedded devices, cloud services, and
        user-facing apps.
      </p>
      <h3>Currently</h3>
      <ul>
        <li>Building IoT platforms with AWS serverless</li>
        <li>Shipping Flutter apps to iOS and Android</li>
        <li>Exploring React 19 and modern frontend patterns</li>
      </ul>
      <h3>Previously</h3>
      <ul>
        <li>Full-stack web development</li>
        <li>Backend systems and APIs</li>
      </ul>
    </article>
  );
}
