import { Paragraph, Textarea, TextInput } from '@contentful/f36-components'; // Import TextInput
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [fieldType, setFieldType] = useState<string | null>(null);
  // Ensure fieldValue can handle null/undefined from Contentful initially
  const [fieldValue, setFieldValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Get the initial value of the field
    const initialValue = sdk.field.getValue();
    // Check if it's a string or explicitly null/undefined
    if (typeof initialValue === 'string' || initialValue === null || initialValue === undefined) {
      setFieldValue(initialValue ?? undefined); // Use undefined for empty state consistency
    }

    // Listen for changes to the field value
    const detachValueChangeHandler = sdk.field.onValueChanged((value) => {
      if (typeof value === 'string' || value === null || value === undefined) {
        setFieldValue(value ?? undefined);
      }
    });

    // Set the field type directly from the SDK
    setFieldType(sdk.field.type);

    // Clean up the listener when the component unmounts
    return () => {
      detachValueChangeHandler();
    };
  }, [sdk]); // Only sdk is needed as a dependency here

  // Generic handler for input changes (works for both Textarea and TextInput)
  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setFieldValue(newValue); // Update local state
    // Only set value in Contentful if it's not empty, or if the field allows empty strings
    // For simplicity here, we'll set it directly. Consider adding checks if needed.
    sdk.field.setValue(newValue); // Update Contentful field
  };

  // --- Conditional Rendering Logic ---

  if (fieldType === null) {
    // Still determining the field type (should be very brief now)
    return <Paragraph>Loading field information...</Paragraph>;
  }

  if (fieldType === 'Text') {
    // Render Textarea for 'Text' fields
    return (
      <Textarea
        value={fieldValue || ''} // Use empty string for controlled component if value is undefined
        onChange={handleInputChange} // Use the generic handler
        placeholder={`Enter ${sdk.field.name}... (AppId: ${sdk.ids.app})`}
        rows={4}
        style={{ marginTop: '10px' }}
      />
    );
  }

  if (fieldType === 'Symbol') {
    // Render TextInput for 'Symbol' fields
    return (
      <TextInput
        value={fieldValue || ''} // Use empty string for controlled component if value is undefined
        onChange={handleInputChange} // Use the generic handler
        placeholder={`Enter ${sdk.field.name}... (AppId: ${sdk.ids.app})`}
        style={{ marginTop: '10px' }}
      />
    );
  }

  // Default rendering for other field types
  return (
    <Paragraph>
      Field Type: {fieldType} (AppId: {sdk.ids.app}) - Value: {fieldValue ?? '(empty)'} {/* Handle undefined/null */}
    </Paragraph>
  );
};

export default Field;
