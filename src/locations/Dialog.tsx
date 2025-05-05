import { Heading, Paragraph, Grid, GridItem, Card, Box } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';

const tokens = [
  { type: 'RP', id: 'firstName', name: 'First Name' },
  { type: 'RP', id: 'lastName', name: 'Last Name' },
  { type: 'RP', id: 'email', name: 'Email' },
  { type: 'RP', id: 'phone', name: 'Phone' },
];

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();

  // autoresize the dialog
  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleTokenSelect = (token: { type: string; id: string; name: string }) => {
    sdk.close(token );
  };

  return (
    <Box padding="none" style={{ minWidth: 350, maxWidth: 600 }}>
      <Heading as="h2" marginBottom="spacingM">Select a token to insert:</Heading>
      <Grid columns={2}>
        {tokens.map((token: { type: string; id: string; name: string }) => (
          <GridItem key={token.id}>
            <Card
              padding="default"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => handleTokenSelect(token)}
              tabIndex={0}
              role="button"
              aria-pressed="false"
              as="button"
            >
              <Paragraph fontWeight="fontWeightDemiBold">{token.name}</Paragraph>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Dialog;
