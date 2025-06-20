require('dotenv').config();
const contentful = require('contentful-management');
const placeholderTypeContentType = require('./contentModel/placeholderType.json');
const placeholderContentType = require('./contentModel/placeholder.json');

// --- Configuration ---
// Make sure to set these environment variables
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error(
    'Error: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be provided as environment variables.'
  );
  process.exit(1);
}

// --- Sample Data ---

const placeholderTypes = [
  {
    id: 'DT',
    name: 'Doctor Token',
    color: '#e3f2fd', // A light blue
  },
  {
    id: 'RP',
    name: 'Reference Placeholder',
    color: '#e0f2f1', // A light teal
  },
  {
    id: 'AB',
    name: 'Action Button',
    color: '#ffccbc', // A light orange
  },
];

const placeholders = [
  {
    id: 'doctor-name',
    name: 'Doctor Name',
    description: 'The full name of the doctor.',
    typeId: 'DT',
  },
  {
    id: 'doctor-email',
    name: 'Doctor Email',
    description: 'The primary email address of the doctor.',
    typeId: 'DT',
  },
  {
    id: 'patient-name',
    name: 'Patient Name',
    description: 'The full name of the patient.',
    typeId: 'RP',
  },
  {
    id: 'submit-application',
    name: 'Submit Application',
    description: 'A button to submit the application.',
    typeId: 'AB',
  },
];

// --- CMA Script ---

async function main() {
  console.log('--- Starting Contentful CMA Initialization Script ---');

  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  // 1. Create/Update Content Types
  console.log('Step 1: Creating/Updating Content Types...');
  await createOrUpdateContentType(environment, placeholderTypeContentType);
  await createOrUpdateContentType(environment, placeholderContentType);
  console.log('Content Types are up to date.');

  // 2. Create and Publish Placeholder Types
  console.log('\nStep 2: Creating and publishing Placeholder Types...');
  const createdTypes = {};
  for (const typeData of placeholderTypes) {
    const entry = await createOrUpdateEntry(
      environment,
      'tokenType',
      typeData.id,
      {
        id: { 'en-US': typeData.id },
        name: { 'en-US': typeData.name },
        color: { 'en-US': typeData.color },
      }
    );
    createdTypes[typeData.id] = entry;
  }
  console.log('Placeholder Types created and published successfully.');

  // 3. Create and Publish Placeholders
  console.log('\nStep 3: Creating and publishing Placeholders...');
  for (const placeholderData of placeholders) {
    const linkedType = createdTypes[placeholderData.typeId];
    if (!linkedType) {
      console.warn(
        `Warning: Could not find type with ID "${placeholderData.typeId}" for placeholder "${placeholderData.name}". Skipping.`
      );
      continue;
    }

    await createOrUpdateEntry(
      environment,
      'token',
      placeholderData.id,
      {
        id: { 'en-US': placeholderData.id },
        name: { 'en-US': placeholderData.name },
        description: { 'en-US': placeholderData.description },
        type: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: linkedType.sys.id,
            },
          },
        },
      }
    );
  }
  console.log('Placeholders created and published successfully.');

  console.log('\n--- Initialization Complete! ---');
}

/**
 * Creates a content type if it doesn't exist, otherwise updates it.
 * Publishes the content type after creation or update.
 */
async function createOrUpdateContentType(environment, contentTypeData) {
  const contentTypeId = contentTypeData.sys.id;
  try {
    const contentType = await environment.getContentType(contentTypeId);
    console.log(`Content type "${contentTypeId}" already exists. Updating...`);
    contentType.name = contentTypeData.name;
    contentType.displayField = contentTypeData.displayField;
    contentType.fields = contentTypeData.fields;
    const updatedContentType = await contentType.update();
    await updatedContentType.publish();
    console.log(`Content type "${contentTypeId}" updated and published.`);
  } catch (error) {
    if (error.name === 'NotFound') {
      console.log(`Content type "${contentTypeId}" not found. Creating...`);
      const newContentType = await environment.createContentTypeWithId(contentTypeId, {
        name: contentTypeData.name,
        displayField: contentTypeData.displayField,
        fields: contentTypeData.fields,
      });
      await newContentType.publish();
      console.log(`Content type "${contentTypeId}" created and published.`);
    } else {
      console.error(`Error processing content type "${contentTypeId}":`, error);
      throw error;
    }
  }
}

/**
 * Creates an entry if it doesn't exist, otherwise updates it.
 * Publishes the entry after creation or update.
 */
async function createOrUpdateEntry(environment, contentType, entryId, fields) {
    try {
        let entry = await environment.getEntry(entryId);
        console.log(`Entry "${entryId}" in "${contentType}" exists. Updating...`);
        entry.fields = fields;
        entry = await entry.update();
        await entry.publish();
        console.log(`Entry "${entryId}" updated and published.`);
        
        return entry;
    } catch (error) {
        if (error.name === 'NotFound') {
            console.log(`Entry "${entryId}" not found. Creating...`);
            let entry = await environment.createEntryWithId(contentType, entryId, { fields });
            await entry.publish();
            console.log(`Entry "${entryId}" created and published.`);
            return entry;
        } else {
            console.error(`Error processing entry "${entryId}":`, error);
            throw error;
        }
    }
}


main().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
}); 