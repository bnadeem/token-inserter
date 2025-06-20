# Token Inserter - Contentful App

A powerful Contentful app that enables content creators to insert dynamic placeholders/tokens into **short text** and **long text** fields. Perfect for creating templated content with personalized elements like doctor names, patient information, action buttons, and more.

![Token Inserter in Action](screenshots/Screenshot%202025-06-20%20at%204.10.08%20PM.png)

*The Token Inserter app integrated into Contentful's entry editor, showing Insert Placeholder buttons for both short text and long text fields*

## 🚀 Features

- **Dynamic Token Insertion**: Insert predefined tokens into short text and long text fields
- **Token Type Management**: Organize tokens by categories (Doctor Tokens, Reference Placeholders, Action Buttons, etc.)
- **Visual Color Coding**: Each token type has its own color for easy identification
- **Search & Filter**: Quickly find tokens with search functionality and type-based filtering
- **Configurable Parameters**: Control button text, dialog title, allowed token types, and more
- **Field Integration**: Seamlessly integrates with Contentful's short text and long text fields

## 📋 Token Types

The app comes with pre-configured token types:

- **Doctor Token (DT)** - Light Blue (#e3f2fd)
  - Doctor Name
  - Doctor Email
  
- **Reference Placeholder (RP)** - Light Teal (#e0f2f1)
  - Patient Name
  
- **Action Button (AB)** - Light Orange (#ffccbc)
  - Submit Application

## 🎬 How It Works

The Token Inserter provides a seamless workflow for adding dynamic content to your fields:

1. **Field Integration**: The app adds "Insert Placeholder" buttons to your short text and long text fields
2. **Token Selection**: Click the button to open a searchable dialog with categorized tokens  
3. **Visual Feedback**: Selected tokens appear as colored badges in your content
4. **Easy Management**: Tokens are stored as Contentful entries and can be managed like any other content

## 🛠 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Contentful account with management access
- Contentful CLI installed globally

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd token-inserter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Contentful**
   
   Create a `.env` file in the root directory:
   ```env
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
   CONTENTFUL_ENVIRONMENT_ID=master
   ```
   
   > **Note**: You'll also need a Content Delivery API (CDA) access token for the installation parameters when deploying the app.

4. **Initialize Contentful Content Models**
   ```bash
   node contentful/cma-init-script.js
   ```
   
   This script will:
   - Create content types for tokens and token types
   - Set up sample token data
   - Publish all content

5. **Build and deploy the app**
   ```bash
   npm run build
   contentful app upload --bundle-dir ./dist
   ```

## 🔧 Development

### Local Development

```bash
npm run dev
```

This starts the development server at `http://localhost:3000`.

### Testing

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
```

## 📖 Usage

### Installing the App in Contentful

1. Go to your Contentful space
2. Navigate to **Apps** → **Custom Apps**
3. Find your uploaded app and click **Install**
4. Configure the installation parameters as shown below:

![App Configuration](screenshots/Screenshot%202025-06-20%20at%204.11.18%20PM.png)

*App configuration screen showing the required installation parameters: Space ID, Environment ID, and Access Token*

### Using in Short Text and Long Text Fields

1. Open any entry with a short text or long text field where the app is installed
2. Click the **"Insert Placeholder"** button next to the field
3. Search or browse available tokens in the dialog
4. Click on a token to insert it into your field content

![Field Integration](screenshots/Screenshot%202025-06-20%20at%204.10.19%20PM.png)

*Close-up view showing the Insert Placeholder buttons integrated into short text and long text fields, with tokens displayed as colored badges*

![Token Selection Dialog](screenshots/Screenshot%202025-06-20%20at%204.10.30%20PM.png)

*The token selection dialog showing categorized tabs (All, Action Button, Reference Placeholder, Doctor Token, etc.) with searchable tokens organized by type and color-coded for easy identification*

### Managing Tokens

Tokens are managed as Contentful entries:
- **Token Types**: Define categories and colors for tokens
- **Tokens**: Individual placeholders with names, descriptions, and types

## 🏗 Architecture

### Key Components

- **`Dialog.tsx`**: Main token selection interface
- **`Editor.tsx`**: Rich text editor integration
- **`TokenRepository.ts`**: Contentful API interactions
- **`Token.ts`**: Data models for tokens and token types

### Content Models

- **`tokenType`**: Defines token categories
  - `id`: Unique identifier
  - `name`: Display name
  - `color`: Hex color code

- **`token`**: Individual token entries
  - `id`: Unique identifier
  - `name`: Display name
  - `description`: Token description
  - `type`: Reference to token type

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── locations/          # App location components
├── Models/             # TypeScript type definitions
├── repositories/       # Data access layer  
├── utils/              # Utility functions
└── setupTests.ts       # Test configuration

contentful/
├── contentModel/       # Content type definitions
└── cma-init-script.js  # Setup script

test/
└── mocks/              # Test mocks
```

## ⚙️ Configuration Parameters

The app uses two types of parameters to customize its behavior:

### Installation Parameters

Global parameters configured when installing the app in your Contentful space:

![Installation Parameters](screenshots/Screenshot%202025-06-20%20at%204.11.48%20PM.png)

*Installation parameter configuration showing spaceId, environmentId, and accessToken fields*

| Parameter ID | Display Name | Type | Description |
|-------------|--------------|------|-------------|
| `spaceId` | Space Id | Short text | Your Contentful space identifier |
| `environmentId` | Environment Id | Short text | Target environment (usually 'master') |
| `accessToken` | CDA Access Token | Short text | Content Delivery API access token |

### Instance Parameters

Field-specific parameters configured when adding the app to individual fields:

![Instance Parameters](screenshots/Screenshot%202025-06-20%20at%204.11.41%20PM.png)

*Instance parameter configuration showing buttonText, allowedTokenTypes, dialogTitle, and size parameters*

| Parameter ID | Display Name | Type | Description |
|-------------|--------------|------|-------------|
| `buttonText` | Button Text | Short text | Text displayed on the token inserter button |
| `allowedTokenTypes` | Allowed Placeholder Types | Short text | Comma-separated token type IDs (`DT,RP,AB`) or `ALL` |
| `dialogTitle` | Dialog Title | Short text | Title shown in the token selection dialog |
| `size` | Size | Select | Button size (small, medium, large) |

### Parameter Examples

**Instance Parameters:**
- `buttonText`: "Insert Token", "Add Placeholder", "Select Token"
- `allowedTokenTypes`: `"DT,RP"` (specific types) or `"ALL"` (all types)
- `dialogTitle`: "Select a Placeholder", "Choose Token"
- `size`: "medium"

## 🐛 Troubleshooting

### Common Issues

1. **No tokens showing with "ALL" parameter**
   - Ensure the parameter value is exactly `"ALL"` or `"all"`
   - Check browser console for debug information

2. **Tokens not loading**
   - Verify installation parameters (`spaceId`, `environmentId`, `accessToken`)
   - Check that the CDA access token has proper permissions
   - Run the initialization script again: `node contentful/cma-init-script.js`
   - Check network requests in browser dev tools

3. **Button not appearing in fields**
   - Ensure the app is installed on the correct field type (Short text or Long text)
   - Check instance parameters are configured correctly
   - Verify the field has the app enabled in its settings

4. **Parameter configuration issues**
   - Installation parameters: Set at the space level when installing the app
   - Instance parameters: Set per field when adding the app to a field
   - Ensure `allowedTokenTypes` format: `"DT,RP,AB"` or `"ALL"`

5. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run typecheck`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [Contentful App Framework documentation](https://www.contentful.com/developers/docs/extensibility/app-framework/)