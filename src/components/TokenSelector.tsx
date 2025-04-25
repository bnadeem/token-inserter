import { Button, Flex, Menu } from '@contentful/f36-components';
import { ChevronDownIcon } from '@contentful/f36-icons';
import React from 'react';

interface Token {
  label: string;
  value: string;
}

interface TokenSelectorProps {
  onTokenSelect: (token: Token) => void;
}

const availableTokens: Token[] = [
  { label: 'Space ID', value: '{{space_id}}' },
  { label: 'Environment ID', value: '{{environment_id}}' },
  { label: 'Entry ID', value: '{{entry_id}}' },
  { label: 'Content Type', value: '{{content_type}}' },
];

export const TokenSelector: React.FC<TokenSelectorProps> = ({ onTokenSelect }) => {
  return (
    <Menu>
      <Menu.Trigger>
        <Button
          variant="secondary"
          size="small"
          endIcon={<ChevronDownIcon />}
        >
          Insert Token
        </Button>
      </Menu.Trigger>
      <Menu.List>
        {availableTokens.map((token) => (
          <Menu.Item
            key={token.value}
            onClick={() => onTokenSelect(token)}
          >
            {token.label}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu>
  );
}; 