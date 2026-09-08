/* eslint-disable @typescript-eslint/no-unused-vars */
import { Construct } from 'constructs';

export interface AudioBookshelfHostingProps {
  region: string;
}

export class AudioBookshelfHosting extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: AudioBookshelfHostingProps = { region: 'ca-central-1' },
  ) {
    super(scope, id);
  }
}
