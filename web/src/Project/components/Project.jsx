import React from 'react';
import axios from 'axios';
import Paper from 'material-ui/Paper';
import { CircularProgress } from 'material-ui/Progress';
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
    };
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

              <Paper className="upload-container">
                <FileUpload heading="Metadata file upload" url="/api/projects/metadata" />
              </Paper>
            </div>
          }
        </div>
        }
      </div>
    );
  }
}

export default Project;
