import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { Panel } from '@trackflix-live/ui';
import { Authenticator } from '@aws-amplify/ui-react';
import Topbar from './topbar';

import { amplifyConfig } from '../amplify.config';

Amplify.configure(amplifyConfig);

export function App() {
  return (
    <Authenticator hideSignUp>
      <div className="flex flex-col h-screen">
        <Topbar />
        <div
          className={
            'flex justify-center items-center w-screen h-full bg-base-200 relative'
          }
        >
          <Panel>
            <SingleAssetFlow />
          </Panel>
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
