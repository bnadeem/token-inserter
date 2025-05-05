import { Heading, Grid, GridItem, EntryCard, TextInput } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState, useRef } from 'react';
import { TokenRepository, TokenEntry } from '../repositories/TokenRepository';

const tokenRepository = new TokenRepository();

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    sdk.window.startAutoResizer();
    // Initial load
    tokenRepository.getAllTokens().then(setTokens);
  }, [sdk]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      if (search.trim() === '') {
        const all = await tokenRepository.getAllTokens();
        setTokens(all);
      } else {
        const results = await tokenRepository.searchTokens(search);
        setTokens(results);
      }
      setLoading(false);
    }, 800); // Wait 800ms after last keystroke

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const handleTokenSelect = (token: TokenEntry) => {
    sdk.close(token);
  };

  return (
    <div style={{ padding: 24 }}>
      <Heading as="h2" marginBottom="spacingM">Select a Token</Heading>
      <TextInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search tokens..."
        isDisabled={loading}
        style={{ marginBottom: 16 }}
      />
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
      {loading && <div style={{ marginTop: 16 }}>Searching...</div>}
    </div>
  );
};

export default Dialog;
