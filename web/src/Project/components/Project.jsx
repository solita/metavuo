import React from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import ProjectStatusButton from './ProjectStatusButton';
import MetadataSummary from './MetadataSummary';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import ConvertStatus from '../../common/util/ProjectStatusConverter';
import ProjectUpdateDialog from './ProjectUpdateDialog';
import ProjectFileList from './ProjectFileList';
import CollaboratorList from './CollaboratorList';
import StorageFileUpload from '../../common/components/StorageFileUpload';

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
      projectDelDialogOpen: false,
      projectDelResultDialogOpen: false,
      projectDelResultMessage: '',
    };
    this.getProject = this.getProject.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.passMetadataResponse = this.passMetadataResponse.bind(this);
    this.getProjectFiles = this.getProjectFiles.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.closeProjectDelDialog = this.closeProjectDelDialog.bind(this);
    this.openProjectDelDialog = this.openProjectDelDialog.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
    axios.get(`/api/projects/${this.props.match.params.id}/files`)
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({ storageFiles: res.data });
        }
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

  deleteProject() {
    axios.delete(`/api/admin/project/${this.props.match.params.id}/`).then((res) => {
      if (res.status === 204) {
        this.setState({ id: '' });
        this.showDeletionAlert('Project successfully deleted');
      } else {
        this.showDeletionAlert('Project deletion failed, please try again');
      }
    });
  }

  showDeletionAlert(message) {
    this.setState({ projectDelResultDialogOpen: true, projectDelResultMessage: message });
  }

  handleClose() {
    this.setState({ projectDelResultDialogOpen: false });
    this.closeProjectDelDialog();
    if (this.state.id.length === 0) {
      this.props.history.push('/projects');
    }
  }

  openProjectDelDialog() {
    this.setState({ projectDelDialogOpen: true });
  }

  closeProjectDelDialog() {
    this.setState({ projectDelDialogOpen: false });
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
                      {!this.state.errorMsg && this.props.isAdmin &&
                      <Button aria-label="Delete" onClick={this.openProjectDelDialog} className="secondary-button text-button">
                        <i className="material-icons text-button-icon">delete</i>Delete project
                      </Button>
                      }
                    </div>
                    <div className="table-card-body">
                      {this.state.errorMsg
                        ? <p>{this.state.errorMsg}</p>
                        :
                        <div>
                          <div>
                            <div className="divider-section flex-row">
                              <div className="right-divider">
                                <p className="bold-text">Description:</p>
                                <p className="bold-text">Project started:</p>
                                <p className="bold-text">Project creator:</p>
                              </div>
                              <div className="left-divider">
                                <p>{this.state.description}</p>
                                <p>{new Date(this.state.createdAt).toLocaleString()}</p>
                                <p>{this.state.createdbyEmail}</p>
                              </div>
                            </div>
                            <div className="divider-section flex-row">
                              <div className="right-divider button-container">
                                <p className="bold-text">Project status:</p>
                              </div>
                              <div className="left-divider">
                                <div className="status-row">
                                  <p>{ConvertStatus(this.state.status)}</p>
                                  <ProjectStatusButton
                                    projectId={this.props.match.params.id}
                                    projectStatus={this.state.status}
                                    setStatus={this.setStatus}
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="bold-text">Customer details</p>
                            <div className="divider-section flex-row">
                              <div className="right-divider">
                                <p className="bold-text">Organization:</p>
                                {this.state.invoiceAddress && <p className="bold-text">Invoice address:</p>}
                                {this.state.customerName && <p className="bold-text">Name:</p>}
                                {this.state.customerEmail && <p className="bold-text">Email:</p>}
                                {this.state.customerPhone && <p className="bold-text">Phone number:</p>}
                                {this.state.customerReference && <p className="bold-text">Customer reference:</p>}
                              </div>
                              <div className="left-divider">
                                <p>{this.state.organization}</p>
                                {this.state.invoiceAddress && <p>{this.state.invoiceAddress}</p>}
                                {this.state.customerName && <p>{this.state.customerName}</p>}
                                {this.state.customerEmail && <p>{this.state.customerEmail}</p>}
                                {this.state.customerPhone && <p>{this.state.customerPhone}</p>}
                                {this.state.customerReference &&
                                  <p>{this.state.customerReference}</p>
                                }
                              </div>
                            </div>
                            <div className="divider-section flex-row">
                              <div className="right-divider">
                                {this.state.internalReference && <p className="bold-text">Internal reference:</p>}
                                {this.state.sampleLocation && <p className="bold-text">Sample location:</p>}
                                {this.state.info && <p className="bold-text">Additional information:</p>}
                              </div>
                              <div className="left-divider">
                                {this.state.internalReference &&
                                <p>{this.state.internalReference}</p>
                                }
                                {this.state.sampleLocation && <p>{this.state.sampleLocation}</p>}
                                {this.state.info && <p>{this.state.info}</p>}
                              </div>
                            </div>
                          </div>
                          <ProjectUpdateDialog
                            url={`/api/projects/${this.props.match.params.id}`}
                            updateMainView={this.getProject}
                            parentState={this.state}
                          />
                        </div>
                      }
                    </div>
                  </Card>
                </Grid>
                <Grid item xs={5}>
                  {!this.state.errorMsg &&
                  <div>
                    <CollaboratorList
                      projectId={this.props.match.params.id}
                      projectCreatorEmail={this.state.createdbyEmail}
                      userEmail={this.props.userEmail}
                    />
                    <MetadataSummary
                      showMetadata={this.state.showMetadata}
                      metadataProps={this.state.metadataProps}
                      projectId={this.props.match.params.id}
                      passResponse={this.passMetadataResponse}
                    />
                  </div>
                  }
                </Grid>
              </Grid>
              {!this.state.errorMsg &&
                <div>
                  <div className="page-divider">
                    <ProjectFileList
                      dialogTitle="Result files"
                      isResult
                      buttonText="Add result file"
                      files={this.state.storageFiles.filter(f => f.filetype === 'result')}
                      projectId={this.props.match.params.id}
                      userEmail={this.props.userEmail}
                      updateFileList={this.getProjectFiles}
                    />
                  </div>

                  <div className="page-divider">
                    <ProjectFileList
                      dialogTitle="Files in progress"
                      isResult={false}
                      buttonText="Add file"
                      files={this.state.storageFiles.filter(f => f.filetype !== 'result')}
                      projectId={this.props.match.params.id}
                      userEmail={this.props.userEmail}
                      updateFileList={this.getProjectFiles}
                    />

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

                    <ConfirmDialog
                      dialogOpen={this.state.projectDelDialogOpen}
                      closeDialog={this.closeProjectDelDialog}
                      titleText="Delete project"
                      contentText="Are you sure you want to remove this project and all its files permanently?"
                      action={this.deleteProject}
                      actionButtonText="Confirm"
                    />
                    <Dialog
                      open={this.state.projectDelResultDialogOpen}
                      onClose={this.handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">Alert</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          {this.state.projectDelResultMessage}
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                          Ok
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
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
  history: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default Project;
