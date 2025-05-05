import { Heading, Grid, GridItem, EntryCard } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';
import { TokenRepository, TokenEntry } from '../repositories/TokenRepository';

const tokenRepository = new TokenRepository();

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
 // autoresize the dialog
  useEffect(() => {

    sdk.window.startAutoResizer();

  tokenRepository.getAllTokens().then((tokens) => {
    setTokens(tokens)
  })
 
  }, [sdk]);

  const handleTokenSelect = (token: TokenEntry) => {
    sdk.close(token);
  };

  return (
    <div style={{ padding: 24 }}>
      <Heading as="h2" marginBottom="spacingM">Select a Token</Heading>
      <Grid columns={1} rowGap="spacingM">
        {tokens.map((token) => (
          <GridItem key={token.id}>
            <EntryCard
              title={token.name}
              description={token.description || ''}
              contentType={token.type}
              onClick={() => handleTokenSelect(token)}
              style={{ cursor: 'pointer' }}
            />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Dialog;
