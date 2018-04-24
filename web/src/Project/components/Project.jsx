import React from 'react';
import axios from 'axios';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import { CircularProgress } from 'material-ui/Progress';
import PropTypes from 'prop-types';
import FileUpload from '../../common/components/FileUpload';
import '../css/Project.scss';

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
      metadataProps: '',
      dialogOpen: '',
    };
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
  }

  componentDidMount() {
    axios.get(`/api/projects/${this.props.match.params.id}`)
      .then((res) => {
        console.log(res);
        const project = res.data;
        this.setState({
          id: project.project_id,
          name: project.project_name,
          description: project.project_description,
          createdAt: res.data.Created,
          createdbyEmail: res.data.createdby_email,
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

  openDialog() {
    this.setState({ dialogOpen: true });
  }

  closeDialog() {
    this.setState({ dialogOpen: false });
  }

  passResponse(res) {
    this.closeDialog();
    this.setState({ metadataProps: res });
    // TODO set upload button disabled
  }

  render() {
    return (
      <div>
        <h1>Project page</h1>

        {this.state.fetching ? <CircularProgress /> :
        <div>
          {this.state.errorMsg
            ? <p>{this.state.errorMsg}</p>
            :
            <div>
              <p>Name: {this.state.name}</p>
              <p>Id: {this.state.id}</p>
              <p>Description: {this.state.description}</p>
              <p>Project started: {this.state.createdAt}</p>
              <p>Project creator: {this.state.createdbyEmail}</p>

              <Button variant="raised" color="primary" onClick={this.openDialog}>
                Upload metadata file.
              </Button>

              {this.state.metadataProps
                ?
                  <div>
                    <p>Metadata file metadata:</p>
                    <p>{JSON.stringify(this.state.metadataProps)}</p>
                    <Button variant="raised">Accept</Button><Button variant="raised">Discard</Button>
                  </div>
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
