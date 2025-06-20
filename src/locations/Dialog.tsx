import { Heading, Grid, GridItem, EntryCard, TextInput, Tabs } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState, useRef } from 'react';
import { TokenRepository } from '../repositories/TokenRepository';
import { Token } from '../Models/Token';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const tokenRepository = new TokenRepository(sdk);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');

  // Debug logging for parameters
  useEffect(() => {
    console.log('Dialog parameters:', sdk.parameters);
  }, [sdk.parameters]);

  // Get allowed token types from dialog parameters
  const allowedTokenTypes = sdk.parameters.invocation?.allowedTokenTypes
    ? String(sdk.parameters.invocation.allowedTokenTypes).split(',').map((type: string) => type.trim().toLowerCase())
    : [];

  useEffect(() => {
    console.log('Processed allowedTokenTypes:', allowedTokenTypes);
    sdk.window.startAutoResizer();
    // Initial load
    tokenRepository.getAllTokens().then(tokens => {
      console.log('Tokens loaded:', tokens);
      setTokens(tokens);
    }).catch(error => {
      console.error('Error loading tokens:', error);
    });
  }, [sdk]);

  useEffect(() => {
    console.log('allowedTokenTypes', allowedTokenTypes);
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

  // Filter token types based on allowed types
  const tokenTypes = Array.from(new Set(
    tokens
      .filter(token => allowedTokenTypes.length === 0 || allowedTokenTypes.includes('all') || allowedTokenTypes.includes(token.type.id.toLowerCase()))
      .map(token => token.type.name.trim())
  ));

  const handleTabChange = (tabId: string) => setSelectedType(tabId);

  // Filter tokens based on selected type and allowed types
  const filteredTokens = tokens.filter(token => {
    // If 'all' is in allowedTokenTypes, show all tokens
    if (allowedTokenTypes.includes('all')) {
      return selectedType === 'All' || token.type.name.trim() === selectedType;
    }
    // Otherwise, filter by both allowed types and selected type
    const typeAllowed = allowedTokenTypes.length === 0 || allowedTokenTypes.includes(token.type.id.toLowerCase());
    const typeMatches = selectedType === 'All' || token.type.name.trim() === selectedType;
    return typeAllowed && typeMatches;
  });

  // Debug logging
  console.log('Debug Info:', {
    allowedTokenTypes,
    selectedType,
    totalTokens: tokens.length,
    filteredTokens: filteredTokens.length,
    tokenTypes,
    hasAllInAllowed: allowedTokenTypes.includes('all')
  });

  return (
    <div style={{ padding: 24, height: '700px', display: 'flex', flexDirection: 'column' }}>
      {/* <Heading as="h2" marginBottom="spacingM">Select a Placeholder</Heading> */}
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
