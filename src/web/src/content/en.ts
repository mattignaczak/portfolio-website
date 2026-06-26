/**
 * English copy for the site. Single source of truth for all user-facing strings.
 *
 * This is intentionally a plain, structured object (no i18n library yet). When real
 * i18n lands, add sibling locale files (e.g. `fr.ts`) that satisfy the `Content` type
 * derived from this file, and resolve the active locale in `content/index.ts`.
 *
 * Dynamic strings use `{token}` placeholders resolved by `format()` — never embed
 * values with template literals, so word order stays translatable.
 */
export const en = {
  site: {
    name: 'Matt Ignaczak',
    role: 'Software Engineer',
    location: 'Ottawa, Ontario',
    email: 'mattignaczak@proton.me',
  },

  nav: {
    about: 'About',
    projects: 'Projects',
    blog: 'Blog',
    resume: 'Resume',
    contact: 'Contact',
  },

  socials: {
    github: { label: 'GitHub', href: 'https://github.com/mattignaczak' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mattignaczak' },
    email: { label: 'Email', href: 'mailto:mattignaczak@proton.me' },
  },

  footer: {
    // {year} -> current year
    rights: '© {year} Matt Ignaczak',
  },

  about: {
    eyebrow: 'Software Engineer',
    heading: 'Matt Ignaczak',
    intro:
      'I build cloud-first IoT platforms on AWS — owning systems from architecture ' +
      'proposal through production, across serverless backends and the connected ' +
      'devices they run on.',
    ctaProjects: 'View projects',
    ctaContact: 'Get in touch',
    currently: {
      title: 'Currently',
      items: [
        'Architecting AWS serverless backends for connected fire-safety devices',
        'Owning IoT infrastructure: provisioning, OTA firmware, and device telemetry',
        'Designing event-driven pipelines for real-time, life-safety alerts',
      ],
    },
    latestPost: {
      title: 'Latest from the blog',
      empty: 'No posts yet — check back soon.',
    },
  },

  resume: {
    // {email} · {location}
    contactLine: '{email} · {location}',
    downloadLabel: 'Download PDF',

    summary: {
      title: 'Summary',
      body:
        'Software Engineer with 6+ years of experience building cloud-first IoT platforms on ' +
        'AWS. I architected the backend for a smart fire detector serving ~5K devices today, ' +
        'designed to scale to 290K. I own features from architecture proposal through ' +
        "production, and I've built teams and mentored the engineers to ship them.",
    },

    skills: {
      title: 'Skills',
      groups: [
        { label: 'Languages', items: 'TypeScript, Java, Kotlin, Python, SQL' },
        {
          label: 'Cloud (AWS)',
          items:
            'CDK, Lambda, DynamoDB, DynamoDB Streams, IoT Core, Cognito, SQS, SNS, ' +
            'EventBridge, CloudWatch, S3, Timestream, SES',
        },
        {
          label: 'Backend',
          items:
            'Node.js, Serverless (Lambda), Event-Driven Architecture, Spring Boot, ' +
            'REST APIs, Microservices',
        },
        {
          label: 'IoT',
          items: 'Device Provisioning, Device Shadows, OTA Firmware Management, MQTT, BLE GATT',
        },
        {
          label: 'Mobile',
          items: 'Android (Jetpack Compose, MVVM, Clean Architecture), Flutter',
        },
        { label: 'Databases', items: 'DynamoDB, Timestream, PostgreSQL, MySQL, Firebase' },
        {
          label: 'Tools',
          items: 'Git, Azure DevOps, Jira, Postman, Mixpanel, Agentic Development',
        },
      ],
    },

    experience: {
      title: 'Experience',
      companies: [
        {
          company: 'Gentex Corporation',
          period: 'Nov 2023 – Present',
          location: 'Ottawa',
          note: 'Continued from eSight following acquisition',
          roles: [
            {
              title: 'Software Engineer',
              period: '',
              subtitle: 'Place Smart Fire Detector — Cloud / IoT Platform',
              summary:
                'Core developer on the Place connected smoke / fire detector cloud platform.',
              bullets: [
                'Architected the AWS cloud backend for a smart IoT fire detector (~5K devices, ' +
                  'built to scale to 290K) using CDK, Lambda, DynamoDB, IoT Core, SQS, SNS, and EventBridge',
                'Built the API layer that powers the mobile app: household management, user ' +
                  'invitations and access control, device scheduling, admin controls, and push notifications',
                'Designed an event-driven CDC architecture with DynamoDB Streams to decouple ' +
                  'notifications from the API request path, improving delivery reliability',
                'Built the push notification pipeline end-to-end (SQS → Lambda → SNS → Firebase) ' +
                  'for real-time fire, smoke, heat, and CO alerts with sub-second delivery via user-level MQTT topics',
                'Own the observability layer across 58 Lambda functions: composite alarms, ' +
                  'concurrency alerts, DynamoDB compliance audits, and the device event pipeline ' +
                  'feeding 100+ event types into Mixpanel',
                'Own the OTA firmware update infrastructure: automated job creation, S3 firmware ' +
                  'hosting, and IoT job lifecycle management across multiple device groups',
                'Manage the full IoT device lifecycle: provisioning, shadow state, connectivity ' +
                  'reporting, and event schema validation',
                'Write architecture proposals with cost analyses and tradeoff matrices to align ' +
                  'engineering and product on technical direction',
                'Led architecture deep dives on scalability (regional deployment), disaster ' +
                  'recovery (48-hour SLA), localization, and cybersecurity',
                'Built production analytics dashboards for device and user metrics used by upper ' +
                  'management for decision-making',
                'Coordinate across mobile, embedded, and product teams to deliver features across ' +
                  'the full IoT stack',
              ],
            },
          ],
        },
        {
          company: 'eSight',
          period: 'May 2019 – Nov 2023',
          location: 'Ottawa / Toronto',
          note: '',
          roles: [
            {
              title: 'Software Engineer — Team Lead, Flutter Migration',
              period: '2022 – 2023',
              subtitle: '',
              summary: '',
              bullets: [
                'Led migration of the eSight Go companion app from native Android and iOS to ' +
                  'Flutter, managing 2 contract developers from requirements through production',
                'Architected the Flutter app from scratch: project structure, navigation patterns, ' +
                  'and state management conventions adopted as team standard',
                'Served as primary engineering contact for internal stakeholders, translating ' +
                  'business requirements into technical deliverables',
                'Set up and maintained Azure DevOps CI/CD pipelines for build, test, and release',
              ],
            },
            {
              title: 'Software Engineer — Mobile & Platform Architecture',
              period: '2020 – 2022',
              subtitle: '',
              summary: '',
              bullets: [
                'Designed the software architecture for the eSight Go platform: on-device ' +
                  'applications, BLE communication layer, and the companion mobile app',
                'Built the Android companion app from scratch in Kotlin with MVVM, Clean ' +
                  'Architecture, and Jetpack Compose',
                'Developed Java-based Android applications running on the eSight Go HMD, owning ' +
                  'the full on-device software stack',
                'Built the BLE GATT server for bidirectional communication between the glasses ' +
                  'and companion app',
                'Implemented WebRTC with a BLE signalling channel for real-time data exchange ' +
                  'between the HMD and phone',
                'Contributed to the eSight AWS cloud backend (Lambda)',
              ],
            },
            {
              title: 'Software Engineering Intern → Software Engineer',
              period: '2019 – 2020',
              subtitle: '',
              summary: '',
              bullets: [
                'Developed front-end Android features (Java) for the eSight 4 companion app across ' +
                  'multiple production releases',
                'Integrated custom touchpad gesture recognition for hands-free HMD navigation',
                'Evaluated multiple time-of-flight sensors through comparative testing; results ' +
                  'informed component selection for the production HMD',
                'Promoted to Software Engineer after 7 months',
              ],
            },
            {
              title: 'Cloud, Backend & Operations',
              period: 'Throughout tenure',
              subtitle: '',
              summary: '',
              bullets: [
                'Built AWS backend infrastructure with Lambda for the HMD product line',
                'Developed full-stack Java application layer with Spring Boot for mobile and web clients',
                'Built an in-house ERP platform used by 25 production floor staff, with a reporting ' +
                  'dashboard for upper management',
                'Created production analytics dashboards on AWS-hosted PostgreSQL used to identify ' +
                  'bottlenecks and prioritize improvements',
                'Mentored 4 interns',
                'Led the company-wide GDPR compliance initiative, bringing data privacy posture up ' +
                  'to regulatory standards across all products and internal systems',
                'Defined the data privacy and cybersecurity strategy; policies adopted organization-wide',
              ],
            },
          ],
        },
      ],
    },

    education: {
      title: 'Education & Certifications',
      items: [
        {
          primary: 'University of Ottawa',
          secondary: 'Coursework in Computer Science, minor in Entrepreneurship & Management',
          meta: '',
        },
        {
          primary: 'AWS Certified Developer – Associate',
          secondary: '',
          meta: 'May 2025',
        },
        {
          primary: 'CIPT (Certified Information Privacy Technologist)',
          secondary: '',
          meta: 'Sept 2024',
        },
      ],
    },
  },

  projects: {
    heading: 'Projects',
    // `kind` drives each link's icon in <Projects>: 'website' | 'appstore' | 'playstore'.
    items: [
      {
        name: 'Place Smart Fire Detector',
        description:
          'Cloud / IoT platform behind PLACE’s connected smoke & CO alarms. I architected the AWS ' +
          'serverless backend — ~5K devices today, built to scale to 290K — powering real-time ' +
          'fire, smoke, heat, and CO alerts, OTA firmware, and the companion app.',
        tech: ['aws-cdk', 'lambda', 'dynamodb', 'iot-core'],
        image: '/projects/place.png',
        imageAlt: 'PLACE Any Space smart smoke and carbon monoxide alarm',
        details: `**PLACE Smart Home Safety System** — a suite of connected smoke & CO alarms by Gentex. I architected and own the AWS serverless backend.

- **Scale by design** — ~5K devices in production today, architected to scale to 290K.
- **Event-driven alerts** — DynamoDB Streams CDC decouples notifications from the API path; SQS → Lambda → SNS → Firebase delivers fire / smoke / heat / CO alerts in under a second over user-level MQTT topics.
- **Fleet & firmware** — full device lifecycle (provisioning, shadow state, connectivity) plus OTA firmware jobs across device groups.
- **Observability** — composite alarms, concurrency alerts, and 100+ event types streamed into Mixpanel across 58 Lambdas.`,
        links: [
          {
            kind: 'website',
            label: 'placehomesolutions.com',
            href: 'https://www.placehomesolutions.com/',
          },
        ],
      },
      {
        name: 'eSight Go',
        description:
          'On-headset software for the eSight Go assistive smart glasses — BLE GATT servers, ' +
          'on-device WebRTC video sharing, and the OTA update pipeline.',
        tech: ['android', 'java', 'ble-gatt', 'webrtc', 'ota'],
        image: '/projects/esight-go.png',
        imageAlt: 'eSight Go assistive smart glasses',
        details: `**On-headset software** for the eSight Go assistive smart glasses (an Android-based head-mounted display).

- Built the **BLE GATT servers** for bidirectional communication between the glasses and the companion phone.
- Implemented **on-device local video sharing** — WebRTC over a BLE signalling channel.
- Built the **OTA update pipeline** for shipping software to the headset in the field.
- Owned slices of the on-device application stack running on the HMD.

Separate from the [eSight Go Companion](#) phone app — different platform, different codebase.`,
        links: [
          {
            kind: 'website',
            label: 'esighteyewear.com',
            href: 'https://www.esighteyewear.com/esight-go/',
          },
        ],
      },
      {
        name: 'eSight Go Companion',
        description:
          'The eSight Go mobile companion app. Built native Android (Kotlin + Jetpack Compose), ' +
          'then led a team migrating it to Flutter.',
        tech: ['kotlin', 'jetpack-compose', 'flutter', 'dart', 'ble'],
        image: '/projects/esight-companion.png',
        imageAlt: 'eSight Companion app icon',
        details: `**Mobile companion app** for eSight Go — a separate codebase from the on-headset software, sharing only the BLE/WebRTC link.

- Built the **native Android app from scratch** in Kotlin with Jetpack Compose, MVVM, and Clean Architecture.
- **Led a team** of two contract developers migrating the app to **Flutter**, from requirements through production.
- Shipped Wi-Fi onboarding, **eShare**, and **eRemote** device control over the BLE / WebRTC link.
- Set up and maintained Azure DevOps CI/CD for build, test, and release.`,
        links: [
          {
            kind: 'appstore',
            label: 'App Store',
            href: 'https://apps.apple.com/us/app/esight-companion/id6480528386',
          },
          {
            kind: 'playstore',
            label: 'Google Play',
            href: 'https://play.google.com/store/apps/details?id=com.gentex.eSightCompanion.mobile.app.release',
          },
          {
            kind: 'website',
            label: 'esighteyewear.com',
            href: 'https://www.esighteyewear.com/esight-go/',
          },
        ],
      },
      {
        name: 'eSight 4',
        description:
          'Enhanced-vision headset that runs its software on the device itself. I built the ' +
          'on-device applications — including the main user-facing UI/UX worn on the glasses — ' +
          'and contributed across the on-device software stack.',
        tech: ['android', 'kotlin', 'java', 'on-device', 'ui-ux'],
        image: '/projects/esight-4.png',
        imageAlt: 'eSight 4 enhanced-vision headset',
        details: `**Enhanced-vision headset** whose software runs on the device itself.

- Built the **on-device applications** that run on the eSight 4 HMD.
- Designed and built the **main user-facing UI/UX** worn on the glasses.
- Contributed across the on-device software stack and early companion features (eCast video streaming, eMirror screen mirroring).`,
        links: [
          {
            kind: 'website',
            label: 'esighteyewear.com',
            href: 'https://www.esighteyewear.com/esight-4/',
          },
          {
            kind: 'appstore',
            label: 'App Store',
            href: 'https://apps.apple.com/us/app/esight/id1504145192',
          },
          {
            kind: 'playstore',
            label: 'Google Play',
            href: 'https://play.google.com/store/apps/details?id=com.esightcorp.eSight',
          },
        ],
      },
      {
        name: 'Portfolio Website',
        description:
          'This site. React 19, neobrutalism / shadcn, TypeScript. Deployed to S3 + CloudFront via CDK.',
        tech: ['react', 'typescript', 'aws-cdk', 'cloudfront'],
        image: '',
        imageAlt: '',
        details: `This site — a React 19 SPA with a hand-built neobrutalist design system.

- TypeScript throughout, shadcn-style primitives, and centralized i18n-ready copy.
- Infrastructure as code: S3 + CloudFront via AWS CDK, multi-environment with GitHub OIDC CI/CD.`,
        links: [],
      },
    ],
  },

  blog: {
    heading: 'Blog',
    intro: 'Notes on AWS, IoT, and building things — written when I have something worth saying.',
    empty: 'No posts yet. Check back soon.',
    backToList: '← All posts',
    // {minutes} -> read-time estimate
    readingTime: '{minutes} min read',
  },

  contact: {
    heading: 'Contact',
    intro: "Drop me a line — I'll get back to you.",
    fields: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
    },
    submit: 'Send',
    sending: 'Sending…',
    status: {
      allRequired: 'All fields are required.',
      invalidEmail: 'Please enter a valid email address.',
      shortMessage: 'Your message is a little short — tell me a bit more.',
      // {name} -> submitter's name
      success: 'Thanks {name} — message received.',
    },
  },
} as const;
