import { Heading, Paragraph, Grid, GridItem, Card, Box } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  let tokens: string[] = [];
  const invocation = sdk.parameters.invocation;
  if (invocation && Array.isArray((invocation as any).tokens)) {
    tokens = (invocation as any).tokens;
  }

  // autoresize the dialog
  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleTokenSelect = (token: string) => {
    sdk.close({ selectedToken: token });
  };

  return (
    <Box padding="none" style={{ minWidth: 350, maxWidth: 600 }}>
      <Heading as="h2" marginBottom="spacingM">Select a token to insert:</Heading>
      <Grid columns={2}>
        {tokens.map((token: string) => (
          <GridItem key={token}>
            <Card
              padding="default"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => handleTokenSelect(token)}
              tabIndex={0}
              role="button"
              aria-pressed="false"
              as="button"
            >
              <Paragraph fontWeight="fontWeightDemiBold">{token}</Paragraph>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Dialog;
