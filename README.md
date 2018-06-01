# Metavuo

Metavuo is a platform for managing metabolomics projects. Metavuo is developed by University of Eastern Finland in collaboration with Solita Ltd.

## Getting Started

### Setup

1. Clone repo:

        git clone https://github.com/solita/metavuo

1. Build frontend

        pushd frontend
        npm install
        npm run build
        popd

### Run locally

1. Build and run

        dev_appserver.py dispatch.yaml frontend/app.yaml backend/service/app.yaml

1. Open and sign in

        http://localhost:8080/

See more about local development in [frontend](frontend/) and [backend](backend/).

### Deploy

Frontend and backend can be deployed separately. Datastore composite indexes are defined in index.yaml

1. Deploy datastore indexes

        gcloud app deploy index.yaml

1. Deploy frontend service

        gcloud app deploy frontend/app.yaml

1. Deploy backend service

        gcloud app deploy backend/service/app.yaml

1. Setup CORS configuration for Storage

        echo '[{"method": ["GET", "PUT"], "origin": ["https://your-project-id.appspot.com"], "responseHeader": ["x-goog-meta-uploadedby", "x-goog-meta-description", "x-goog-meta-filetype"]}]' > cors.json
        gsutil cors set cors.json gs://your-project-id.appspot.com/

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/solita/uef-projektipankki/tags).

## Commit messages

Read and follow: http://chris.beams.io/posts/git-commit/

### TL;DR
```
Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequences of this
change? Here's the place to explain them.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded
   by a single space, with blank lines in between, but conventions
   vary here

If you use an issue tracker, put references to them at the bottom,
like this:

Resolves: #123
See also: #456, #789
```
For github issue tracker use `Resolves`, `Fixes` or `Closes` depending on the issue type.



## Authors

- **Kai Kirjavainen** - Software Designer
- **Krista Väänänen** - Software Designer
- **Esko Oramaa** - Architect
- **Teo Ahonen** - Project Manager
- **Jussi Paananen** - Product owner
- **Antton Mattsson** - Researcher
- **Kati Hanhineva** - Principal investigator

## License

Metavuo is open-source and licensed with the MIT License.

