### Getting started
Run with `dev_appserver.py app.yaml `

Comment out the line `login: required` from the `app.yaml` if you want to test the API with `curl`

**Remember not to commit the modified app.yaml**

Example command for adding a project:
`curl -H "Content-Type: application/json" -X POST --data "@./myfile.json" http://localhost:8080/api/projects/add`
