import React from 'react';
import axios from 'axios';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import { CircularProgress } from 'material-ui/Progress';
import PropTypes from 'prop-types';
import FileUpload from '../../common/components/FileUpload';
import '../css/Project.scss';
import ProjectStatusButton from './ProjectStatusButton';
import MetadataSummary from './MetadataSummary';

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      name: '',
      description: '',
      createdAt: '',
      createdbyEmail: '',
      fetching: true,
      errorMsg: '',
      showMetadata: false,
      metadataProps: {},
      dialogOpen: false,
      uploadDisabled: false,
      status: '',
    };
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
    this.discardMetadata = this.discardMetadata.bind(this);
    this.handler = this.handler.bind(this);
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
      })
      .catch((err) => {
        if (err.response.status === 404) {
          this.setState({ errorMsg: 'no such project', fetching: false });
        } else {
          this.setState({ errorMsg: 'unknown error', fetching: false });
        }
      });
  }

  handler(value) {
    this.setState({ status: value });
  }


  openDialog() {
    this.setState({ dialogOpen: true });
  }

  closeDialog() {
    this.setState({ dialogOpen: false });
  }

  passResponse(res) {
    this.closeDialog();
    console.log(res);
    this.setState({ metadataProps: res, showMetadata: true, uploadDisabled: true });
  }

  discardMetadata() {
    this.setState({ uploadDisabled: false, showMetadata: false });
  }

  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={6}>
            <h1>Project page</h1>
          </Grid>
          <Grid item xs={6}>
            {!this.state.fetching && !this.state.errorMsg
              ? <ProjectStatusButton
                id={this.props.match.params.id}
                projectStatus={this.state.status}
                buttonText={this.state.status.text}
                handler={this.handler}
              />
              : ''}
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
              <p>Project status: {this.state.status.text}</p>

              <Button
                variant="raised"
                color="primary"
                onClick={this.openDialog}
                disabled={this.state.uploadDisabled}
              >
                <i className="material-icons icon-left">add_circle</i>Add metadata file
              </Button>

              {this.state.showMetadata
                ? <MetadataSummary
                  rows={this.state.metadataProps.rows}
                  cols={this.state.metadataProps.cols}
                  headers={this.state.metadataProps.headers.slice(4)}
                  discardMetadata={this.discardMetadata}
                />
                : ''
              }

              <Dialog
                open={this.state.dialogOpen}
                onClose={this.closeDialog}
                disableBackdropClick
              >
                <div className="upload-container">
                  <Button onClick={this.closeDialog}>
                    Close<i className="material-icons icon-right">close</i>
                  </Button>
                  <FileUpload
                    heading="Metadata file upload"
                    url="/api/projects/metadata"
                    id={this.props.match.params.id}
                    passResponse={this.passResponse}
                  />
                </div>
              </Dialog>
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
