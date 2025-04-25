import { Flex, Paragraph, TextInput } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';
import { TokenSelector } from '../components/TokenSelector';
import TokenTextarea from '../components/TokenTextarea';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [fieldType, setFieldType] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initialValue = sdk.field.getValue();
    if (typeof initialValue === 'string' || initialValue === null || initialValue === undefined) {
      setFieldValue(initialValue ?? undefined);
    }

    const detachValueChangeHandler = sdk.field.onValueChanged((value) => {
      if (typeof value === 'string' || value === null || value === undefined) {
        setFieldValue(value ?? undefined);
      }
    });

    setFieldType(sdk.field.type);

    return () => {
      detachValueChangeHandler();
    };
  }, [sdk]);

  const handleInputChange = (newValue: string) => {
    setFieldValue(newValue);
    sdk.field.setValue(newValue);
  };

  const handleTokenSelect = (token: { value: string }) => {
    const newValue = fieldValue ? `${fieldValue}${token.value}` : token.value;
    setFieldValue(newValue);
    sdk.field.setValue(newValue);
  };

  if (fieldType === null) {
    return <Paragraph>Loading field information...</Paragraph>;
  }

  if (fieldType === 'Text') {
    return (
      <Flex flexDirection="column" gap="spacingXs">
        <TokenSelector onTokenSelect={handleTokenSelect} />
        <TokenTextarea
          value={fieldValue || ''}
          onChange={handleInputChange}
          placeholder={`Enter ${sdk.field.name}... (AppId: ${sdk.ids.app})`}
          rows={4}
        />
      </Flex>
    );
  }

  if (fieldType === 'Symbol') {
    return (
      <TextInput
        value={fieldValue || ''}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={`Enter ${sdk.field.name}... (AppId: ${sdk.ids.app})`}
        style={{ marginTop: '10px' }}
      />
    );
  }

  return (
    <Paragraph>
      Field Type: {fieldType} (AppId: {sdk.ids.app}) - Value: {fieldValue ?? '(empty)'}
    </Paragraph>
  );
};

export default Field;
