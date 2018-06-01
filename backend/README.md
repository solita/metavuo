# Backend

Backend application developed with [Go](https://golang.org) for use in the Google App Engine standard -environment

* [Running](#running)
* [Deploying](#deploying)
* [Working with Google Cloud Storage](#working-with-google-cloud-storage)
* [CORS configuration](#cors-configuration)
* [Api reference](#api-reference)

### Running

Install the [Cloud SDK for Go](https://cloud.google.com/appengine/docs/standard/go/download)

#### Development mode

Run with `dev_appserver.py service/app.yaml` starts a local server in `localhost:8080` and an admin server in `localhost:8000`

#### Testing
`go test` Runs all tests in the service-package

#### Building
`go build` Compiles the backend

### Deploying
Deploy to Google App Engine by running `gcloud app deploy app.yaml`

Deploy composite indexes by running `gcloud app deploy index.yaml`

### Working with Google Cloud Storage
To enable Storage-operations, authenticate yourself by running `gcloud auth application-default login`

Run the local server with the flag `--default_gcs_bucket_name <your-bucket-name-here>`

Add your project's service account to the commented sections in `project_files.go`

### CORS-configuration
In order to use Storage and signed urls, you need to change your project's CORS-configuration via `gsutil`

Example configuration:

`[{"method": ["GET", "PUT"], "origin": ["https://your-project.appspot.com", "http://localhost:9000"], "responseHeader": ["x-goog-meta-uploadedby", "x-goog-meta-description", "x-goog-meta-filetype"]}]`

See [CORS-documentation](https://cloud.google.com/storage/docs/gsutil/commands/cors) for details.

#### Storage-related issues
Uploading files via generated signed urls doesn't work as of SDK 201.0.0.
Deploy the application to use all Cloud Storage -features.


## Api reference

### Access for all users

**Projects**

Method | Path | Path variables | Description
-------|------|-----------|------------
`/api/projects` | GET | | List own projects (admin gets all)
`/api/projects` | POST | | Create new project
`/api/projects/{id}` | GET | `id` int | Get project
`/api/projects/{id}` | PUT | `id` int | Update project
`/api/projects/{id}/collaborators` | `id` int | GET | List collaborators
`/api/projects/{id}/collaborators` | `id` int | POST | Add collaborator
`/api/projects/{id}/collaborators` | `id` int | PUT | Delete collaborator
`/api/projects/{id}/files` | GET | `id` int | List files attached to project
`/api/projects/{id}/files/generate-upload-url` | `id` int | POST | Create storage upload url
`/api/projects/{id}/files/{filename}` | `id` int, `filename` string | GET | Get file 
`/api/projects/{id}/files/{filename}` | `id` int, `filename` string | DELETE | Delete file
`/api/projects/{id}/metadata/` | `id` int | POST | Add sample metadata file
`/api/projects/{id}/metadata/` | `id` int | DELETE | Delete sample metadata
`/api/projects/{id}/metadata/download` | `id` int | GET | Get sample metadata file
`/api/projects/{id}/status` | POST | `id` int | Change project status

**Users**

Path | Method | Description
-------|------|------------
`/api/users` | GET | List users, who can be added to project
`/api/users/me` | GET | Returns user data

**Info**

Path | Method | Description
-------|------|------------
`/api/info` | GET | Get app information


### Admin only access

**Admin**

Path | Method | Path variables | Description
-------|------|------------|------------
`api/admin/info` | POST | | Create app information
`api/admin/info` | PUT | | Update app information
`/api/admin/project/{id}` | `id` int | DELETE | Delete project
`/api/admin/users` | GET | | List all users
`/api/admin/users` | POST | | Add user
`/api/admin/users/{id}` | `id` int | DELETE | Delete user

**Tasks**

Path | Method | Description
-------|------|------------
`/api/tasks/remove-sample-metadata` | POST | Add task to remove sample metadata
`/api/tasks/remove-storage-files` | POST | Add task to remove storage file



