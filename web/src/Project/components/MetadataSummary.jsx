import React from 'react';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
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
      <div>
        <h2>Sample metadata</h2>
        <div className="secondary-card-body">
          <Grid container>
            <Grid item xs={8}>
              <p>{this.props.metadataError}</p>
              <p className="secondary-card-rows bold-text">The metadata file has {this.props.rowCount || '?'} data rows.</p>
              <p className="secondary-card-rows">
                Custom fields:&nbsp;
                <span className="light-text">
                  {this.props.headers.length > 0
                  ? this.props.headers
                    .map((h, index) => (index ? ', ' : '') + h)
                  : 'no custom fields'
                  }
                </span>
              </p>
              <p className="secondary-card-rows">
                Uploaded at: <span className="light-text">{new Date(this.props.uploadedat).toLocaleString()}</span>
              </p>
              <p className="secondary-card-rows">Added by: <span className="light-text">{this.props.uploadedby}</span></p>
            </Grid>
            <Grid item xs={4} className="secondary-card-body-buttons">
              <a
                href={`/api/projects/${this.props.projectId}/metadata/download`}
                onClick={this.disableButton}
                className="button-link"
              >
                <Tooltip title="Download" placement="right">
                  <Button variant="fab" className="transparent-button round-button" disabled={this.state.buttonDisabled}>
                    <i className="material-icons">file_download</i>
                  </Button>
                </Tooltip>
              </a>
              <Tooltip id="tooltip-fab" title="Delete" placement="right">
                <Button variant="fab" className="transparent-button round-button" onClick={this.discardMetadata}>
                  <i className="material-icons">delete_outline</i>
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </div>
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
