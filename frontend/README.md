# Frontend
Frontend application for Metavuo is developed with React.

* [Running](#running)
* [Deploying](#deploying)
* [Dependencies](#dependencies)
* [For developers](#for-developers)


## Running

Install dependencies by running `npm install`.

#### Development mode
`npm start` - Starts webpack-dev-server in localhost:9000

#### Testing
`npm test` - Runs all tests

#### Building
`npm run dev` - Builds files in dist/ folder.

`npm run build` - Build files minified in dist/ folder.

## Deploying

Deploy to Google App Engine by running  `gcloud app deploy web.yaml`. Remember to build project first!

## Dependencies

Styling is based on Material-ui components.

Other dependencies: see `package.json`.


## For developers

### Configuration

This app has configuration files for:
- Google App Engine - `web.yaml`
- npm - `package.json`
- webpack
- babel
- ESLint


### JS Components

`index.html` - Main HTML file

`index.jsx` - Root React file, adds history component

`App.jsx` - Router is located here, adds theme to app

#### Project list
- `ProjectList.jsx` - Main file for project list view

#### Project
- `Project.jsx` - Main file for project view
- `CollaboratorList.jsx` - Collaborator list component
- `MetadataSummary.jsx` - Project sample metadata summary component
- `ProjectFileList.jsx` - File list component

#### Create project
- `ProjectForm.jsx` - Main file for project form
- `ProjectFormFields.jsx` - shared with project's update dialog

#### Admin view
- `Admin view.jsx` - Main file for admin view
- `UserList.jsx` - User list component
- `UpadteInfoDialog.jsx` - Dialog component for updating application information

#### Header
- `Header.jsx` - Header form application.
- `InfoDialog.jsx` - Shows application information

#### Common
- `/src/common/components` - Include some common components
- `/src/common/util` - Converters and router helper for admin


### Styling with CSS

CSS is written using SASS.

- `/src/common/css/main.scss` - Main configuration file
- `/src/common/css/_variables.scss` - Includes default colours etc.

Each component may have own CSS files, too.

