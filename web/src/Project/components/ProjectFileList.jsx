import React from 'react';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import StorageFileUpload from '../../common/components/StorageFileUpload';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import CardDataRow from './CardDataRow';
import LocaleConverter from '../../common/util/LocaleConverter';

const getFileSize = (number) => {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
  return 'Invalid file size';
};

class ProjectFileList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileDialogOpen: false,
      storageDelDialogOpen: false,
      storageFileToDelete: '',
    };
    this.openFileDialog = this.openFileDialog.bind(this);
    this.closeFileDialog = this.closeFileDialog.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.closeStorageDelDialog = this.closeStorageDelDialog.bind(this);
    this.deleteStorageFileClick = this.deleteStorageFileClick.bind(this);
  }

  openFileDialog() {
    this.setState({ fileDialogOpen: true });
  }

  closeFileDialog() {
    this.setState({ fileDialogOpen: false });
  }

  deleteFile() {
    axios.delete(`/api/projects/${this.props.projectId}/files/${this.state.storageFileToDelete}`)
      .then((res) => {
        if (res.status === 200) {
          this.props.updateFileList();
        }
      });
    this.closeStorageDelDialog();
  }

  closeStorageDelDialog() {
    this.setState({ storageDelDialogOpen: false });
  }

  deleteStorageFileClick(fileName) {
    this.setState({ storageDelDialogOpen: true, storageFileToDelete: fileName });
  }

  render() {
    const fileList = (
      this.props.files.length > 0
        ? (
          <div>
            {this.props.files.map(file => (
              <div key={file.id} className="divider-section">
                <div className="sub-divider-section flex-row">
                  <div className="left-divider button-container">
                    <p className="bold-text">Description:</p>
                  </div>
                  <div className="right-divider">
                    <div className="status-row">
                      <p>{file.description}</p>
                      <div className="flex-row">
                        <a
                          href={`/api/projects/${this.props.projectId}/files/${file.fileName}`}
                          className="button-link"
                        >
                          <Tooltip title="Download" placement="bottom">
                            <Button variant="fab" className="white-button round-button" aria-label="Download">
                              <i className="material-icons">file_download</i>
                            </Button>
                          </Tooltip>
                        </a>
                        <Tooltip title="Delete" placement="bottom">
                          <Button
                            variant="fab"
                            className="white-button round-button"
                            onClick={() => this.deleteStorageFileClick(file.fileName)}
                            aria-label="Delete"
                          >
                            <i className="material-icons">delete_outline</i>
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider-section border-bottom flex-row">
                  <Grid container>
                    <Grid item xs={6}>
                      <CardDataRow name="File name" content={file.fileName} />
                      <CardDataRow name="Size" content={getFileSize(file.fileSize)} />
                    </Grid>
                    <Grid item xs={6}>
                      <CardDataRow name="Added" content={LocaleConverter(file.created)} />
                      <CardDataRow name="Added by" content={file.createdBy} />
                    </Grid>
                  </Grid>
                </div>
              </div>
            ))}
          </div>
        )
        : <p>No files added.</p>
    );

    return (
      <Card className="table-card">
        <div className="table-card-head">
          <h2>{`${this.props.dialogTitle} (${this.props.files.length})`}</h2>
          <Button variant="raised" className="primary-button text-button" onClick={this.openFileDialog}>
            <i className="material-icons text-button-icon">add_circle_outline</i>{this.props.buttonText}
          </Button>
        </div>
        <div className="table-card-body">
          {!this.props.fileError
            ? fileList
            : <p>{this.props.fileError}</p>
          }
          <StorageFileUpload
            dialogOpen={this.state.fileDialogOpen}
            closeDialog={this.closeFileDialog}
            titleText="Upload file"
            url={`/api/projects/${this.props.projectId}/files/generate-upload-url`}
            userEmail={this.props.userEmail}
            isResult={this.props.isResult}
          />
          <ConfirmDialog
            dialogOpen={this.state.storageDelDialogOpen}
            closeDialog={this.closeStorageDelDialog}
            titleText="Remove file"
            contentText="Are you sure you want to remove this file permanently?"
            action={this.deleteFile}
            actionButtonText="Delete file"
          />
        </div>
      </Card>
    );
  }
}
export default ProjectFileList;

ProjectFileList.propTypes = {
  dialogTitle: PropTypes.string,
  isResult: PropTypes.bool.isRequired,
  buttonText: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.instanceOf(Object)),
  projectId: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  updateFileList: PropTypes.func.isRequired,
  fileError: PropTypes.string,
};

ProjectFileList.defaultProps = {
  dialogTitle: '',
  files: [],
  fileError: '',
};
