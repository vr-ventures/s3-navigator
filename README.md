# S3 Navigator 🧭

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
  <img src="https://img.shields.io/badge/electron-29.1.0-9feaf9.svg" alt="Electron">
  <img src="https://img.shields.io/badge/react-18.3.1-61dafb.svg" alt="React">
</div>

<div align="center">
  <h3>A Universal S3 File Browser and Viewer</h3>
  <p>Navigate, explore, and view your AWS S3 buckets with ease. Support for JSON, Markdown, Images, and comprehensive folder navigation.</p>
</div>

---

## ✨ Features

### 🗂️ **Universal File Support**
- **📄 JSON Files**: Advanced viewer with collapsible tree structure, JSONPath queries, and intelligent search
- **📝 Markdown Files**: Beautiful rendering with GitHub-flavored markdown and syntax highlighting
- **🖼️ Image Files**: Full-featured viewer with zoom controls, pan, full-screen mode, and download functionality
- **📁 Folder Navigation**: Intuitive directory browsing with breadcrumb navigation and file type detection
- **📋 Text Files**: Syntax highlighting and proper formatting for various text formats

### 🔍 **Advanced Search & Navigation**
- **JSONPath Queries**: Powerful data extraction using JSONPath expressions (e.g., `$.users[*].name`)
- **Text Search**: Real-time filtering across JSON structures with highlighting
- **Smart File Detection**: Automatic file type recognition based on extensions and content-type
- **Breadcrumb Navigation**: Easy navigation through nested folder structures
- **Quick Access**: Direct file/folder access via path input

### 🎨 **Modern User Interface**
- **Professional Design**: Clean, modern interface with intuitive controls
- **Custom Logo**: Distinctive branding with cloud, folder, and compass elements
- **Responsive Layout**: Optimized for various screen sizes and resolutions
- **Loading States**: Clear feedback during file operations
- **Error Handling**: Comprehensive error messages with recovery options

### 🔧 **Technical Excellence**
- **AWS SDK v3**: Latest AWS SDK for optimal performance and security
- **Electron Framework**: Cross-platform desktop application
- **React + TypeScript**: Modern, type-safe frontend development
- **Secure Architecture**: Proper IPC communication with context isolation

### 🔖 Bookmarked Buckets Sidebar
- **Collapsible sidebar** with toggle button
- **Manual bookmarking** of frequently used buckets
- **Quick bucket switching** from sidebar
- **Persistent storage** of bookmarks in localStorage
- **Responsive design** for mobile and desktop

### How to Use
1. **Toggle Sidebar**: Click the toggle button (▶/◀) in the top-left corner
2. **Bookmark Buckets**: Use the star button (☆/⭐) next to bucket names in the breadcrumb
3. **Quick Access**: Click any bookmarked bucket in the sidebar for instant navigation
4. **Remove Bookmarks**: Click the ✕ button next to any bookmarked bucket
5. **Download Files**: Click the 💾 button next to any file to download it locally
6. **Copy S3 URLs**: Click the 📋 button to copy the S3 URL to clipboard

### 🎨 Enhanced Visual Experience
- **Smart File Icons**: Contextual icons based on file types and extensions
- **File Information**: Size, last modified date, and type indicators
- **Loading Skeletons**: Smooth placeholder animations instead of spinners
- **Professional Interface**: Clean, modern design with intuitive interactions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **AWS Credentials** configured (via AWS CLI, environment variables, or IAM roles)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/s3-navigator.git
   cd s3-navigator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS credentials** (choose one method):
   
   **Option A: AWS CLI**
   ```bash
   aws configure
   ```
   
   **Option B: Environment Variables**
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```
   
   **Option C: IAM Roles** (for EC2 instances)
   - Attach appropriate IAM role with S3 permissions

4. **Start the application**
   ```bash
   npm start
   ```

---

## 📖 Usage Guide

### Getting Started

1. **Launch S3 Navigator**
   - Enter your S3 bucket name in the input field
   - Optionally specify a path/key to start from a specific location
   - Click "🧭 Start Navigation" to begin exploring

2. **Navigation Modes**
   - **Empty path**: Browse from the root of the bucket
   - **Folder path** (ending with `/`): Navigate directly to a specific folder
   - **File path**: Open a specific file directly

### File Type Support

#### 📄 JSON Files
- **Tree View**: Collapsible, hierarchical display of JSON structure
- **Search Modes**:
  - **Text Search**: Filter by key names and values
  - **JSONPath**: Advanced queries like `$.users[*].email`
- **Interactive Features**:
  - Click to expand/collapse nodes
  - Copy values to clipboard
  - Syntax highlighting

**JSONPath Examples:**
```javascript
$.users[*].name          // All user names
$.products[?(@.price > 100)]  // Products over $100
$..email                 // All email addresses (recursive)
$.data.items[0:3]        // First 3 items
```

#### 📝 Markdown Files
- **GitHub-Flavored Markdown**: Full GFM support including tables, task lists, and strikethrough
- **Syntax Highlighting**: Code blocks with language-specific highlighting
- **Responsive Tables**: Properly formatted tables with scrolling
- **Typography**: Professional typography with proper spacing and hierarchy

#### 🖼️ Image Files
- **Supported Formats**: JPG, PNG, GIF, BMP, WebP, SVG
- **Zoom Controls**: 25% to 300% zoom with precise control
- **View Modes**: Fit to screen or full-size viewing
- **Download**: Save images locally with original filename
- **Pan & Navigate**: Smooth image navigation

#### 📁 Folder Navigation
- **File Listing**: Tabular view with file details (name, type, size, modified date)
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy
- **File Type Icons**: Visual indicators for different file types
- **Sorting**: Organized display with folders first, then files
- **Quick Actions**: Click to navigate folders or open files

### Keyboard Shortcuts
- **Ctrl/Cmd + R**: Refresh current view
- **Escape**: Return to file selector
- **Ctrl/Cmd + F**: Focus search (in JSON viewer)

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Desktop Framework**: Electron 29.1.0
- **AWS Integration**: AWS SDK v3 (@aws-sdk/client-s3)
- **Markdown Rendering**: react-markdown with remark-gfm
- **JSON Processing**: jsonpath-plus for advanced queries
- **Styling**: Custom CSS with modern design principles

### Project Structure
```
s3-navigator/
├── src/
│   ├── components/           # React components
│   │   ├── JsonViewer.tsx   # JSON file viewer with search
│   │   ├── MarkdownViewer.tsx # Markdown renderer
│   │   ├── ImageViewer.tsx  # Image viewer with controls
│   │   ├── FolderBrowser.tsx # Directory navigation
│   │   ├── S3FileSelector.tsx # Initial file selection
│   │   └── Logo.tsx         # Custom logo component
│   ├── types/               # TypeScript type definitions
│   ├── styles.css          # Application styling
│   └── App.tsx             # Main application component
├── main.ts                 # Electron main process
├── preload.ts             # Secure IPC bridge
└── public/                # Static assets
```

### Security Features
- **Context Isolation**: Secure separation between main and renderer processes
- **No Node Integration**: Renderer process runs in secure context
- **IPC Communication**: Controlled communication via preload script
- **AWS Credentials**: Secure credential handling without exposure to renderer

---

## 🔧 Development

### Development Mode
```bash
# Start in development mode with hot reload
npm run dev
```

### Building for Production
```bash
# Build the application
npm run build

# Start the built application
npm start
```

### Testing
```bash
# Run tests
npm test
```

### Code Quality
- **TypeScript**: Full type safety and IntelliSense support
- **ESLint**: Code linting and style enforcement
- **Modern React**: Hooks-based components with functional programming patterns

---

## 📋 Requirements

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 500MB available space
- **Network**: Internet connection for S3 access

### AWS Permissions
Your AWS credentials need the following S3 permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Troubleshooting

### Common Issues

**Q: "NoSuchKey" errors when accessing files**
- Verify the bucket name and file path are correct
- Check AWS credentials and permissions
- Ensure the file exists in the specified location

**Q: Application won't start**
- Verify Node.js version (16.0.0+)
- Run `npm install` to ensure all dependencies are installed
- Check for any error messages in the terminal

**Q: Images not displaying**
- Verify the file is a supported image format
- Check file permissions in S3
- Ensure the file isn't corrupted

**Q: JSON search not working**
- Verify JSONPath syntax (use online validators)
- Check that the JSON structure matches your query
- Try simpler queries first (e.g., `$.key`)

### Getting Help
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions for questions and tips
- **Documentation**: Check this README and inline code comments

---

## 🎯 Roadmap

### Upcoming Features
- [ ] **File Upload**: Upload files directly to S3 buckets
- [ ] **Batch Operations**: Select and operate on multiple files
- [ ] **Search Across Files**: Global search functionality
- [ ] **File Caching**: Offline viewing of recently accessed files
- [ ] **Custom Themes**: Dark mode and customizable UI themes
- [ ] **Plugin System**: Extensible architecture for custom file viewers
- [ ] **Performance Optimization**: Lazy loading and virtual scrolling
- [ ] **Advanced Filtering**: Filter files by type, size, date
- [ ] **Bookmarks**: Save frequently accessed locations
- [ ] **Export Options**: Export data in various formats

### Long-term Vision
- Multi-cloud support (Azure Blob, Google Cloud Storage)
- Collaborative features (sharing, comments)
- Advanced analytics and insights
- Integration with other AWS services

---

<div align="center">
  <p>Made with ❤️ for the AWS community</p>
  <p>
    <a href="#s3-navigator-">⬆️ Back to Top</a>
  </p>
</div> 