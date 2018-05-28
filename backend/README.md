### Getting started
Run with `dev_appserver.py app.yaml --default_gcs_bucket_name <your-bucket-name-here>`

To enable Storage-operations, authenticate yourself by running `gcloud auth application-default login`

Comment out the line `login: required` from the `app.yaml` if you want to test the APIs with `curl/postman` etc.

Add your project's service account to the commented sections in `project_files.go` if you want to use Storage locally.

In order to use Storage and signed urls, you need to change your project's CORS-configuration via `gsutil`

Example configuration:

`[{"method": ["GET", "PUT"], "origin": ["https://your-project.appspot.com", "http://localhost:9000"], "responseHeader": ["x-goog-meta-uploadedby", "x-goog-meta-description", "x-goog-meta-filetype"]}]`

See https://cloud.google.com/storage/docs/gsutil/commands/cors for details.


#### Storage-related issues
Uploading files via generated signed urls doesn't work as of SDK 201.0.0.
The url generation itself works though, so you can test it locally. Just be aware that you will get a
"Signature does not match"-response even if the url is correct.