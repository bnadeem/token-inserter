import { Heading, Grid, GridItem, EntryCard, TextInput, Tabs } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState, useRef } from 'react';
import { TokenRepository } from '../repositories/TokenRepository';
import { Token } from '../Models/Token';

const tokenRepository = new TokenRepository();

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');

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

  const handleTokenSelect = (token: Token) => {
    sdk.close(token);
  };

  const tokenTypes = Array.from(new Set(tokens.map(token => token.type.name.trim())));

  const handleTabChange = (tabId: string) => setSelectedType(tabId);

  const filteredTokens = selectedType === 'All'
    ? tokens
    : tokens.filter(token => token.type.name.trim() === selectedType);

  return (
    <div style={{ padding: 24, height: '700px', display: 'flex', flexDirection: 'column' }}>
      <Heading as="h2" marginBottom="spacingM">Select a Token</Heading>
      <TextInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search tokens..."
        isDisabled={loading}
        style={{ marginBottom: 16 }}
      />
      <Tabs currentTab={selectedType} onTabChange={setSelectedType}>
        <Tabs.List>
          <Tabs.Tab panelId="All">All</Tabs.Tab>
          {tokenTypes.map(type => (
            <Tabs.Tab key={type} panelId={type}>{type}</Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <div style={{ height: 16 }} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Grid columns={1} rowGap="spacingM">
          {filteredTokens.map((token) => (
            <GridItem key={token.id}>
              <EntryCard
                title={token.name}
                contentType={token.type.name}
                onClick={() => handleTokenSelect(token)}
                style={{
                  cursor: 'pointer',
                  borderLeft: `8px solid ${token.type.color}`,
                  background: '#fff',
                }}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
      {loading && <div style={{ marginTop: 16 }}>Searching...</div>}
    </div>
  );
};

export default Dialog;
