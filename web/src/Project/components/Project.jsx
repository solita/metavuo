import React from 'react';
import axios from 'axios';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import PropTypes from 'prop-types';
import ProjectStatusButton from './ProjectStatusButton';
import MetadataSummary from './MetadataSummary';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import UploadDialog from '../../common/components/UploadDialog';
import ConvertStatus from '../../common/components/ProjectStatusConverter';

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

    };
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
    this.discardMetadata = this.discardMetadata.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.discardMetadataClick = this.discardMetadataClick.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
  }

  componentDidMount() {
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
        if (err.response.status === 404) {
          this.setState({ errorMsg: 'no such project', fetching: false });
        } else {
          this.setState({ errorMsg: 'unknown error', fetching: false });
        }
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
    axios.delete(`/api/projects/metadata/${this.props.match.params.id}`)
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

  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={6}>
            <h1>Project page</h1>
          </Grid>
          <Grid item xs={6}>
            {!this.state.fetching && !this.state.errorMsg &&
              <ProjectStatusButton
                projectId={this.props.match.params.id}
                projectStatus={this.state.status}
                setStatus={this.setStatus}
              />}
          </Grid>
        </Grid>

        {this.state.fetching ? <CircularProgress /> :
        <div>
          {this.state.errorMsg
            ? <p>{this.state.errorMsg}</p>
            :
            <div>
              <p>Name: {this.state.name}</p>
              <p>Id: {this.state.id}</p>
              <p>Description: {this.state.description}</p>
              <p>Project started: {new Date(this.state.createdAt).toLocaleString()}</p>
              <p>Project creator: {this.state.createdbyEmail}</p>
              <p>Project status: {ConvertStatus(this.state.status)}</p>

              {this.state.showMetadata
                ? <MetadataSummary
                  rowCount={this.state.metadataProps.rowCount}
                  headers={this.state.metadataProps.headers.slice(4)}
                  uploadedat={this.state.metadataProps.uploadedat}
                  uploadedby={this.state.metadataProps.uploadedby}
                  metadataError={this.state.metadataError}
                  discardMetadata={this.discardMetadataClick}
                />
                :
                <Button variant="raised" color="primary" onClick={this.openDialog}>
                  <i className="material-icons icon-left">add_circle</i>Add metadata file
                </Button>
              }

              <UploadDialog
                dialogOpen={this.state.dialogOpen}
                projectId={this.props.match.params.id}
                titleText="Metadata file upload"
                url="/api/projects/metadata"
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
};

export default Project;
