import {
  Authenticator,
  ThemeProvider,
  Theme,
  useTheme,
} from '@aws-amplify/ui-react';
import { ReactNode } from 'react';

interface AuthStyleProps {
  children: ReactNode;
}

export function AuthStyle({ children }: AuthStyleProps) {
  const { tokens } = useTheme();

  const theme: Theme = {
    name: 'Auth Theme',
    tokens: {
      components: {
        authenticator: {
          router: {
            boxShadow: `0 0 16px ${tokens.colors.overlay['10']}`,
            borderWidth: '0',
          },
          form: {
            padding: `${tokens.space.medium} ${tokens.space.xl} ${tokens.space.medium}`,
          },
        },
        button: {
          primary: {
            backgroundColor: tokens.colors.blue['60'],
            _hover: {
              backgroundColor: tokens.colors.blue['80'],
              color: tokens.colors.white,
            },
          },
          link: {
            color: tokens.colors.blue['60'],
            _hover: {
              color: tokens.colors.blue['80'],
              backgroundColor: tokens.colors.blue['10'],
            },
          },
        },
        fieldcontrol: {
          _focus: {
            boxShadow: `0 0 0 2px ${tokens.colors.blue['60']}`,
          },
        },
        tabs: {
          item: {
            color: tokens.colors.neutral['80'],
            _active: {
              borderColor: tokens.colors.neutral['100'],
              color: tokens.colors.blue['100'],
            },
          },
        },
      },
    },
  };

  return (
    <div className="w-full content-center h-full justify-center">
      <ThemeProvider theme={theme}>
        <Authenticator hideSignUp loginMechanism={'email'}>
          {children}
        </Authenticator>
      </ThemeProvider>
    </div>
  );
}
