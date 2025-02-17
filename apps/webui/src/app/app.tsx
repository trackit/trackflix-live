import { Amplify } from 'aws-amplify';
import { Route, Routes } from 'react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import styled from 'styled-components';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { StatusView } from '@trackflix-live/status-view';
import Topbar from './topbar';


import { amplifyConfig } from '../amplify.config';

Amplify.configure(amplifyConfig);

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: '#DBEFDC',
    color: '#004D03',
    fontWeight: 400,
    boxShadow: 'rgba(0,0,0, 0.2) 0px 4px 12px',
    borderRadius: '8px',
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: '#FFDCDC',
    color: '#8C0000',
    fontWeight: 400,
    boxShadow: 'rgba(0,0,0, 0.2) 0px 4px 12px',
    borderRadius: '8px',
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: '#FEF0CC',
    color: '#8C5E00',
    fontWeight: 400,
    boxShadow: 'rgba(0,0,0, 0.2) 0px 4px 12px',
    borderRadius: '8px',
  },
}));

export function App() {
  return (
    <Authenticator hideSignUp>
      <SnackbarProvider
        Components={{
          success: StyledMaterialDesignContent,
          error: StyledMaterialDesignContent,
          warning: StyledMaterialDesignContent,
        }}
      />
      <div className="flex flex-col h-screen">
        <Topbar />
        <div
          className={
            'flex justify-center items-center w-screen h-full bg-base-200 relative'
          }
        >
          <Routes>
            <Route index element={<SingleAssetFlow />} />
            <Route path={'/status/:id'} element={<StatusView />} />
          </Routes>
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
