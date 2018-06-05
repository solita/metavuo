import React from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import UploadDialog from '../../common/components/UploadDialog';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import LocaleConverter from '../../common/util/LocaleConverter';
import '../css/MetadataSummary.scss';

class MetadataSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metadataError: '',
      buttonDisabled: false,
      dialogOpen: false,
      delDialogOpen: false,
    };
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
    this.discardMetadataClick = this.discardMetadataClick.bind(this);
    this.discardMetadata = this.discardMetadata.bind(this);
    this.openDelDialog = this.openDelDialog.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
    this.disableButton = this.disableButton.bind(this);
  }

  openDialog() {
    this.setState({ dialogOpen: true });
  }

  closeDialog() {
    this.setState({ dialogOpen: false });
  }

  disableButton() {
    this.setState({ buttonDisabled: true });
    setTimeout(() => {
      this.setState({ buttonDisabled: false });
    }, 1000);
  }

  discardMetadataClick() {
    this.setState({ delDialogOpen: true });
  }

  passResponse(res) {
    this.closeDialog();
    this.props.passResponse(res, true);
  }

  discardMetadata() {
    this.setState({ buttonDisabled: true });
    axios.delete(`/api/projects/${this.props.projectId}/metadata`)
      .then((res) => {
        if (res.status === 204) {
          this.props.passResponse({}, false);
        }
      })
      .catch((err) => {
        this.setState({ metadataError: `Metadata could not be removed: ${err}` });
      })
      .finally(() => {
        this.setState({ buttonDisabled: false });
      });
    this.closeDelDialog();
  }

  openDelDialog() {
    this.setState({ delDialogOpen: true });
  }

  closeDelDialog() {
    this.setState({ delDialogOpen: false });
  }

  render() {
    return (
      <div className="secondary-card">
        <h2>Sample metadata</h2>
        {this.props.showMetadata && this.props.metadataProps ?
          <div className="secondary-card-body">
            <Grid container>
              <Grid item xs={9}>
                <p className="message-errors">{this.state.metadataError}</p>
                <p className="secondary-card-rows bold-text">Sample metadata file has {this.props.metadataProps.rowcount || '?'} data rows.</p>
                <Grid container className="secondary-card-rows">
                  <Grid item xs={5}>
                    <p className="bold-text">Custom fields:</p>
                  </Grid>
                  <Grid item xs={7}>
                    <p className="light-text">
                      {this.props.metadataProps.headers.length > 0
                        ? this.props.metadataProps.headers.slice(4)
                          .map((h, index) => (index ? ', ' : '') + h)
                        : 'no custom fields'
                      }
                    </p>
                  </Grid>
                </Grid>

                <Grid container className="secondary-card-rows">
                  <Grid item xs={5}>
                    <p className="bold-text">Uploaded at:</p>
                  </Grid>
                  <Grid item xs={7}>
                    <p className="light-text">
                      {LocaleConverter(this.props.metadataProps.uploadedat)}
                    </p>
                  </Grid>
                </Grid>

                <Grid container className="secondary-card-rows">
                  <Grid item xs={5}>
                    <p className="bold-text">Added by:</p>
                  </Grid>
                  <Grid item xs={7}>
                    <p className="light-text">
                      {this.props.metadataProps.uploadedby}
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3} className="secondary-card-body-buttons">
                <a
                  href={`/api/projects/${this.props.projectId}/metadata/download`}
                  onClick={this.disableButton}
                  className="button-link"
                >
                  <Tooltip title="Download" placement="bottom">
                    <Button variant="fab" className="gray-button round-button" disabled={this.state.buttonDisabled}>
                      <i className="material-icons">file_download</i>
                    </Button>
                  </Tooltip>
                </a>
                <Tooltip title="Delete" placement="bottom">
                  <Button
                    variant="fab"
                    className="gray-button round-button"
                    onClick={this.openDelDialog}
                    disabled={this.state.buttonDisabled}
                  >
                    <i className="material-icons">delete_outline</i>
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </div>
        :
          <div className="divider-section">
            <Button variant="raised" className="primary-button text-button" onClick={this.openDialog}>
              <i className="material-icons text-button-icon">add_circle_outline</i>Add metadata file
            </Button>
          </div>
        }
        <UploadDialog
          dialogOpen={this.state.dialogOpen}
          titleText="Metadata file upload"
          url={`/api/projects/${this.props.projectId}/metadata`}
          closeDialog={this.closeDialog}
          passResponse={this.passResponse}
        />

        <ConfirmDialog
          dialogOpen={this.state.delDialogOpen}
          closeDialog={this.closeDelDialog}
          titleText="Remove metadata"
          contentText="Are you sure you want to remove metadata permanently?"
          action={this.discardMetadata}
          actionButtonText="Delete metadata"
        />
      </div>
    );
  }
}

MetadataSummary.propTypes = {
  showMetadata: PropTypes.bool.isRequired,
  projectId: PropTypes.string.isRequired,
  metadataProps: PropTypes.shape({
    rowcount: PropTypes.number,
    headers: PropTypes.arrayOf(PropTypes.string),
    uploadedat: PropTypes.string,
    uploadedby: PropTypes.string,
  }),
  passResponse: PropTypes.func.isRequired,
};

MetadataSummary.defaultProps = {
  metadataProps: null,
};

export default MetadataSummary;
