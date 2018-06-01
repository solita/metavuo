## Backend
Backend application developed with [Go](https://golang.org) for use in the Google App Engine standard -environment

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