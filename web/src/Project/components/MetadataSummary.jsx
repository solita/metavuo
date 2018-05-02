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
      <Grid container className="metadata-container">
        <Grid item xs={10}>
          <p>The uploaded metadata file has {this.props.rows || '?'} data rows and {this.props.cols || '?'} columns.</p>
          <p>Custom fields: {this.props.headers.length > 0
            ? this.props.headers
              .map((h, index) => (index ? ', ' : '') + h)
            : 'no custom fields'}
          </p>
        </Grid>
        <Grid item xs={2} className="button-container">
          <Button variant="fab" onClick={this.discardMetadata}>
            <i className="material-icons">delete</i>
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default MetadataSummary;
