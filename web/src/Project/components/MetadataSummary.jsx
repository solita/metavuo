import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Tooltip from 'material-ui/Tooltip';
import PropTypes from 'prop-types';
import '../css/MetadataSummary.scss';

class MetadataSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
    };
    this.discardMetadata = this.discardMetadata.bind(this);
    this.disableButton = this.disableButton.bind(this);
  }

  discardMetadata() {
    this.props.discardMetadata();
  }

  disableButton() {
    this.setState({ buttonDisabled: true });
    setTimeout(() => {
      this.setState({ buttonDisabled: false });
    }, 1000);
  }

  render() {
    return (
      <div className="metadata-container">
        <Grid container>
          <Grid item xs={10}>
            <h3>Metadata</h3>
            <p className="message-errors">{this.props.metadataError}</p>
            <p>The metadata file has {this.props.rowCount || '?'} data rows.</p>
            <p>Custom fields: {this.props.headers.length > 0
              ? this.props.headers
                .map((h, index) => (index ? ', ' : '') + h)
              : 'no custom fields'}
            </p>
            <p>Uploaded at: {new Date(this.props.uploadedat).toLocaleString()}</p>
            <p>Added by: {this.props.uploadedby}</p>
          </Grid>
          <Grid item xs={2} className="buttons-container">
            <a
              href={`/api/projects/${this.props.projectId}/metadata/download`}
              onClick={this.disableButton}
              className="button-link"
            >
              <Tooltip title="Download" placement="right">
                <Button variant="fab" disabled={this.state.buttonDisabled}>
                  <i className="material-icons">file_download</i>
                </Button>
              </Tooltip>
            </a>
            <Tooltip id="tooltip-fab" title="Delete" placement="right">
              <Button variant="fab" onClick={this.discardMetadata}>
                <i className="material-icons">delete</i>
              </Button>
            </Tooltip>
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
  projectId: PropTypes.string.isRequired,
  discardMetadata: PropTypes.func.isRequired,
};

MetadataSummary.defaultProps = {
  metadataError: '',
  rowCount: null,
  headers: [],
};

export default MetadataSummary;
