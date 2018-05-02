import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import '../css/MetadataSummary.scss';

class MetadataSummary extends React.Component {
  constructor(props) {
    super(props);
    this.discardMetadata = this.discardMetadata.bind(this);
  }

  discardMetadata() {
    this.props.discardMetadata();
  }

  render() {
    return (
      <div className="metadata-container">
        <h3>Metadata</h3>
        <Grid container>
          <Grid item xs={10}>
            <p>The uploaded metadata file has {this.props.rowcount || '?'} data rows.</p>
            <p>Custom fields: {this.props.headers.length > 0
              ? this.props.headers
                .map((h, index) => (index ? ', ' : '') + h)
              : 'no custom fields'}
            </p>
            <p>{this.props.uploadedat}</p>
            <p>{this.props.uploadedby}</p>
          </Grid>
          <Grid item xs={2} className="button-container">
            <Button variant="fab" onClick={this.discardMetadata}>
              <i className="material-icons">delete</i>
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default MetadataSummary;
