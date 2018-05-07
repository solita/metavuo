import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import PropTypes from 'prop-types';
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
        <p className="message-errors">{this.props.metadataError}</p>
        <Grid container>
          <Grid item xs={10}>
            <p>The uploaded metadata file has {this.props.rowCount || '?'} data rows.</p>
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

MetadataSummary.propTypes = {
  metadataError: PropTypes.string,
  rowCount: PropTypes.number,
  headers: PropTypes.arrayOf(PropTypes.string),
  uploadedat: PropTypes.string.isRequired,
  uploadedby: PropTypes.string.isRequired,
  discardMetadata: PropTypes.func.isRequired,
};

MetadataSummary.defaultProps = {
  metadataError: '',
  rowCount: null,
  headers: [],
};

export default MetadataSummary;
