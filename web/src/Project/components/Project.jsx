import React from 'react';
import axios from 'axios';
import Grid from 'material-ui/Grid';
import Card from 'material-ui/Card';
import Button from 'material-ui/Button';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import PropTypes from 'prop-types';
import ProjectStatusButton from './ProjectStatusButton';
import MetadataSummary from './MetadataSummary';
import StorageFileUpload from '../../common/components/StorageFileUpload';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import UploadDialog from '../../common/components/UploadDialog';
import ConvertStatus from '../../common/util/ProjectStatusConverter';
import ProjectUpdateDialog from './ProjectUpdateDialog';
import ProjectFileList from './ProjectFileList';
import CollaboratorList from './CollaboratorList';

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      errorMsg: '',
      id: '',
      name: '',
      description: '',
      createdAt: '',
      createdbyEmail: '',
      status: '',
      showMetadata: false,
      metadataError: '',
      metadataProps: {},
      dialogOpen: false,
      delDialogOpen: false,
      fileDialogOpen: false,
      organization: '',
      invoiceAddress: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerReference: '',
      internalReference: '',
      sampleLocation: '',
      info: '',
      storageFiles: [],
      storageDelDialogOpen: false,
      storageFileToDelete: '',

    };
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openFileDialog = this.openFileDialog.bind(this);
    this.closeFileDialog = this.closeFileDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
    this.discardMetadata = this.discardMetadata.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.discardMetadataClick = this.discardMetadataClick.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
    this.getProject = this.getProject.bind(this);
    this.getProjectFiles = this.getProjectFiles.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.closeStorageDelDialog = this.closeStorageDelDialog.bind(this);
    this.deleteStorageFileClick = this.deleteStorageFileClick.bind(this);
  }

  componentDidMount() {
    this.getProject();
    this.getProjectFiles();
  }

  getProject() {
    axios.get(`/api/projects/${this.props.match.params.id}`)
      .then((res) => {
        const project = res.data;
        this.setState({
          id: project.project_id,
          name: project.project_name,
          description: project.project_description,
          createdAt: res.data.Created,
          createdbyEmail: res.data.createdby_email,
          status: res.data.project_status,
          organization: project.customer_organization,
          invoiceAddress: project.customer_invoice_address,
          customerName: project.customer_name,
          customerEmail: project.customer_email,
          customerPhone: project.customer_phone,
          customerReference: project.customer_reference,
          internalReference: project.customer_internal_reference,
          sampleLocation: project.sample_location,
          info: project.additional_information,
          fetching: false,
          hideContent: false,
        });
        if (res.data.sample_summary !== null) {
          this.setState({
            showMetadata: true,
            metadataProps: res.data.sample_summary,
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 403) {
          this.setState({ errorMsg: 'No access', fetching: false, hideContent: true });
        } else if (err.response.status === 404) {
          this.setState({ errorMsg: 'no such project', fetching: false });
        } else {
          this.setState({ errorMsg: 'unknown error', fetching: false });
        }
      });
  }
  getProjectFiles() {
    axios.get(`/api/projects/${this.props.match.params.id}/files`).then((res) => {
      this.setState({ storageFiles: res.data });
    }).catch((err) => {
      console.log(err);
    });
  }

  setStatus(value) {
    this.setState({ status: value });
  }

  openDialog() {
    this.setState({ dialogOpen: true });
  }

  closeDialog() {
    this.setState({ dialogOpen: false });
  }

  closeDelDialog() {
    this.setState({ delDialogOpen: false });
  }

  passResponse(res) {
    this.closeDialog();
    this.setState({ metadataProps: res, showMetadata: true });
  }

  discardMetadataClick() {
    this.setState({ delDialogOpen: true });
  }

  discardMetadata() {
    axios.delete(`/api/projects/${this.props.match.params.id}/metadata`)
      .then((res) => {
        if (res.status === 204) {
          this.setState({ metadataProps: {}, showMetadata: false });
        }
      })
      .catch((err) => {
        this.setState({ metadataError: `Metadata could not be removed: ${err}` });
      });
    this.closeDelDialog();
  }

  openFileDialog() {
    this.setState({ fileDialogOpen: true });
  }

  closeFileDialog() {
    this.setState({ fileDialogOpen: false });
  }

  deleteFile() {
    axios.delete(`/api/projects/${this.props.match.params.id}/files/${this.state.storageFileToDelete}`)
      .then((res) => {
        if (res.status === 204) {
          this.getProjectFiles();
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
    return (
      <div>
        {this.state.fetching
          ?
            <div>
              <p>Getting project</p>
              <CircularProgress />
            </div>
          :
            <div>
              <Grid container>
                <Grid item xs={7}>
                  <Card className="table-card">
                    <div className="table-card-head">
                      {!this.state.hideContent &&
                      <div>
                        <h1>{this.state.name || 'not found'}</h1>
                        <p>ID: <span className="bold-text">{this.state.id}</span></p>
                      </div>
                      }
                    </div>
                    <div className="table-card-body">
                      {this.state.errorMsg
                        ? <p>{this.state.errorMsg}</p>
                        :
                        <div>
                          <p>Description: {this.state.description}</p>
                          <p>Project started: {new Date(this.state.createdAt).toLocaleString()}</p>
                          <p>Project creator: {this.state.createdbyEmail}</p>
                          <p>Project status: {ConvertStatus(this.state.status)}</p>
                          <h2>Customer details</h2>
                          <p>Organization: {this.state.organization}</p>
                          {this.state.invoiceAddress &&
                            <p>Invoice address: {this.state.invoiceAddress}</p>
                          }
                          {this.state.customerName &&
                            <p>Name: {this.state.customerName}</p>
                          }
                          {this.state.customerEmail &&
                            <p>Email: {this.state.customerEmail}</p>
                          }
                          {this.state.customerPhone &&
                            <p>Phone number: {this.state.customerPhone}</p>
                          }
                          {this.state.customerReference &&
                            <p>Customer reference: {this.state.customerReference}</p>
                          }
                          {this.state.internalReference &&
                            <p>Internal reference: {this.state.internalReference}</p>
                          }
                          {this.state.sampleLocation &&
                            <p>Sample location: {this.state.sampleLocation}</p>
                          }
                          {this.state.info &&
                            <p>Additional information: {this.state.info}</p>
                          }
                          <div className="flex-row">
                            <ProjectStatusButton
                              projectId={this.props.match.params.id}
                              projectStatus={this.state.status}
                              setStatus={this.setStatus}
                            />
                            <ProjectUpdateDialog
                              url={`/api/projects/${this.props.match.params.id}`}
                              updateMainView={this.getProject}
                              parentState={this.state}
                            />
                          </div>
                        </div>
                      }
                    </div>
                  </Card>
                </Grid>
                <Grid item xs={5}>
                  {!this.state.errorMsg &&
                  <div className="secondary-card">
                    <CollaboratorList
                      projectId={this.props.match.params.id}
                      projectCreatorEmail={this.state.createdbyEmail}
                      userEmail={this.props.userEmail}
                    />
                  </div>}
                </Grid>
              </Grid>
              {!this.state.errorMsg &&
                <Grid container>
                  <Grid xs={7}>
                    <Card className="table-card">
                      <div className="table-card-head">
                        <h2>Result files</h2>
                        <Button variant="raised" className="primary-button text-button">
                          <i className="material-icons text-button-icon">add_circle_outline</i>Add file
                        </Button>
                      </div>
                      <div className="table-card-body">
                        <p>Here be result files</p>
                      </div>
                    </Card>
                  </Grid>
                  <Grid xs={5}>
                    {this.state.showMetadata ?
                      <div className="secondary-card">
                        <MetadataSummary
                          rowCount={this.state.metadataProps.rowcount}
                          headers={this.state.metadataProps.headers.slice(4)}
                          uploadedat={this.state.metadataProps.uploadedat}
                          uploadedby={this.state.metadataProps.uploadedby}
                          metadataError={this.state.metadataError}
                          projectId={this.props.match.params.id}
                          discardMetadata={this.discardMetadataClick}
                        />
                      </div>
                      :
                      <Button variant="raised" color="primary" onClick={this.openDialog}>
                        <i className="material-icons icon-left">add_circle</i>Add metadata file
                      </Button>
                    }
                  </Grid>
                  <Button variant="raised" color="primary" onClick={this.openFileDialog} style={{ margin: 12 }}>
                    <i className="material-icons icon-left">add_circle</i>Add file
                  </Button>

                  <StorageFileUpload
                    dialogOpen={this.state.fileDialogOpen}
                    closeDialog={this.closeFileDialog}
                    titleText="Upload file"
                    url={`/api/projects/${this.props.match.params.id}/files/generate-upload-url`}
                    userEmail={this.props.userEmail}
                  />
                  <UploadDialog
                    dialogOpen={this.state.dialogOpen}
                    titleText="Metadata file upload"
                    url={`/api/projects/${this.props.match.params.id}/metadata`}
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
                  <ConfirmDialog
                    dialogOpen={this.state.storageDelDialogOpen}
                    closeDialog={this.closeStorageDelDialog}
                    titleText="Remove file"
                    contentText="Are you sure you want to remove this file permanently?"
                    action={this.deleteFile}
                    actionButtonText="Delete file"
                  />
                </Grid>
              }
            </div>
        }
        {!this.state.fetching && !this.state.errorMsg && this.state.storageFiles.length > 0 &&
        <ProjectFileList
          files={this.state.storageFiles}
          url={this.props.match.params.id}
          deleteStorageFileClick={this.deleteStorageFileClick}
        />}
      </div>
    );
  }
}

Project.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  userEmail: PropTypes.string.isRequired,
};

export default Project;
