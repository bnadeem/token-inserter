import { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Form, Paragraph, Flex, TextInput, FormControl } from '@contentful/f36-components';
import { css } from 'emotion';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

export interface AppInstallationParameters {
  spaceId?: string;
  environmentId?: string;
  accessToken?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const sdk = useSDK<ConfigAppSDK>();
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })}>
      <Form>
        <Heading>App Config</Heading>
        <Paragraph>Welcome to your contentful app. This is your config page.</Paragraph>
        
        <FormControl>
          <FormControl.Label>Space ID</FormControl.Label>
          <TextInput
            name="spaceId"
            value={parameters.spaceId || ''}
            onChange={(e) => setParameters({ ...parameters, spaceId: e.target.value })}
          />
          <FormControl.HelpText>
            The ID of your Contentful space
          </FormControl.HelpText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Environment ID</FormControl.Label>
          <TextInput
            name="environmentId"
            value={parameters.environmentId || ''}
            onChange={(e) => setParameters({ ...parameters, environmentId: e.target.value })}
          />
          <FormControl.HelpText>
            The ID of your Contentful environment
          </FormControl.HelpText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Access Token</FormControl.Label>
          <TextInput
            name="accessToken"
            type="password"
            value={parameters.accessToken || ''}
            onChange={(e) => setParameters({ ...parameters, accessToken: e.target.value })}
          />
          <FormControl.HelpText>
            Your Contentful access token
          </FormControl.HelpText>
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
