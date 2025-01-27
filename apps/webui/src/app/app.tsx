import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { Panel, ThemeSwitcher } from '@trackflix-live/ui';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from '../amplify.config';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(amplifyConfig);

export function App() {
  return (
    <Authenticator hideSignUp>
      <div className={'prose   '}>
        <div className={'absolute top-2 right-2'}>
          <ThemeSwitcher />
        </div>

        <div
          className={
            'flex justify-center items-center w-screen h-screen bg-base-200'
          }
        >
          <Panel>
            <h1>Trackflix Live</h1>
            <SingleAssetFlow />
          </Panel>
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
