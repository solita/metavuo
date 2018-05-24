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
import ConvertStatus from '../../common/util/ProjectStatusConverter';
import ProjectUpdateDialog from './ProjectUpdateDialog';
import ProjectFileList from './ProjectFileList';
import CollaboratorList from './CollaboratorList';

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      errorMsg: 'Getting project',
      id: '',
      name: '',
      description: '',
      createdAt: '',
      createdbyEmail: '',
      status: '',
      showMetadata: false,
      metadataProps: {},
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
    this.getProject = this.getProject.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.passMetadataResponse = this.passMetadataResponse.bind(this);
    this.openFileDialog = this.openFileDialog.bind(this);
    this.closeFileDialog = this.closeFileDialog.bind(this);
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
          errorMsg: '',
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
          this.setState({ errorMsg: 'No access', fetching: false });
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

  passMetadataResponse(res, showMetadata) {
    this.setState({ metadataProps: res, showMetadata });
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
            <div className="page-divider">
              <p>Getting project</p>
              <CircularProgress />
            </div>
          :
            <div>
              <Grid container className="page-divider">
                <Grid item xs={7}>
                  <Card className="table-card">
                    <div className="table-card-head">
                      {!this.state.errorMsg &&
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
                          <div>
                            <Grid container className="divider-section">
                              <Grid item xs={4}>
                                <p className="bold-text">Description:</p>
                                <p className="bold-text">Project started:</p>
                                <p className="bold-text">Project creator:</p>
                                <p className="bold-text">Project status:</p>
                              </Grid>
                              <Grid item xs={8}>
                                <p>{this.state.description}</p>
                                <p>{new Date(this.state.createdAt).toLocaleString()}</p>
                                <p>{this.state.createdbyEmail}</p>
                                <p>{ConvertStatus(this.state.status)}</p>
                              </Grid>
                            </Grid>
                            <p className="bold-text">Customer details</p>
                            <Grid container className="divider-section">
                              <Grid item xs={4}>
                                <p className="bold-text">Organization:</p>
                                {this.state.invoiceAddress && <p className="bold-text">Invoice address:</p>}
                                {this.state.customerName && <p className="bold-text">Name:</p>}
                                {this.state.customerEmail && <p className="bold-text">Email:</p>}
                                {this.state.customerPhone && <p className="bold-text">Phone number:</p>}
                                {this.state.customerReference && <p className="bold-text">Customer reference:</p>}
                              </Grid>
                              <Grid item xs={8}>
                                <p>{this.state.organization}</p>
                                {this.state.invoiceAddress && <p>{this.state.invoiceAddress}</p>}
                                {this.state.customerName && <p>{this.state.customerName}</p>}
                                {this.state.customerEmail && <p>{this.state.customerEmail}</p>}
                                {this.state.customerPhone && <p>{this.state.customerPhone}</p>}
                                {this.state.customerReference &&
                                  <p>{this.state.customerReference}</p>
                                }
                              </Grid>
                            </Grid>
                            <Grid container className="divider-section">
                              <Grid item xs={4}>
                                {this.state.internalReference && <p className="bold-text">Internal reference:</p>}
                                {this.state.sampleLocation && <p className="bold-text">Sample location:</p>}
                                {this.state.info && <p className="bold-text">Additional information:</p>}
                              </Grid>
                              <Grid item xs={8}>
                                {this.state.internalReference &&
                                <p>{this.state.internalReference}</p>
                                }
                                {this.state.sampleLocation && <p>{this.state.sampleLocation}</p>}
                                {this.state.info && <p>{this.state.info}</p>}
                              </Grid>
                            </Grid>
                          </div>
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
                <Grid container className="page-divider">
                  <Grid item xs={7}>
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
                  <Grid item xs={5}>
                    <MetadataSummary
                      showMetadata={this.state.showMetadata}
                      metadataProps={this.state.metadataProps}
                      projectId={this.props.match.params.id}
                      passResponse={this.passMetadataResponse}
                    />
                  </Grid>
                </Grid>
              }
              {!this.state.errorMsg &&
                <div className="page-divider">
                  <Card className="table-card">
                    <div className="table-card-head">
                      <h2>Files in progress</h2>
                      <Button variant="raised" className="primary-button text-button" onClick={this.openFileDialog}>
                        <i className="material-icons text-button-icon">add_circle_outline</i>Add file
                      </Button>
                    </div>
                    <div className="table-card-body">
                      {this.state.storageFiles.length > 0
                        ?
                          <ProjectFileList
                            files={this.state.storageFiles}
                            url={this.props.match.params.id}
                            deleteStorageFileClick={this.deleteStorageFileClick}
                          />
                        : <p>No files added.</p>
                      }
                    </div>
                  </Card>
                  <StorageFileUpload
                    dialogOpen={this.state.fileDialogOpen}
                    closeDialog={this.closeFileDialog}
                    titleText="Upload file"
                    url={`/api/projects/${this.props.match.params.id}/files/generate-upload-url`}
                    userEmail={this.props.userEmail}
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
              }
            </div>
        }
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
