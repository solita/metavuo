import React from 'react';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import ProjectListTable from './ProjectListTable';
import CreateProjectDialog from '../../CreateProject/components/CreateProjectDialog';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      fetching: true,
      message: '',
      hideContent: false,
    };
  }

  componentDidMount() {
    this.recursiveGet('/api/projects', [])
      .then((res) => {
        if (res !== null && res.length > 0) {
          // sort newest first
          const projects = res
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          this.setState({ projects, fetching: false });
        } else {
          this.setState({ message: 'No projects found.', fetching: false });
        }
      }).catch((err) => {
        if (err.response.status === 403) {
          this.setState({ message: 'Access denied', fetching: false, hideContent: true });
        } else {
          this.setState({ message: 'Something went wrong.', fetching: false });
        }
      });
  }

  recursiveGet(url, projects) {
    return axios.get(url)
      .then((res) => {
        if (res.data.projects === null) {
          return projects;
        }
        if (res.data.next) {
          return this.recursiveGet(res.data.next, projects.concat(res.data.projects));
        }
        return projects.concat(res.data.projects);
      })
      .catch((err) => {
        throw err;
      });
  }

  render() {
    return (
      <div>
        {!this.state.hideContent ?
          <Card className="table-card">
            <div className="table-card-head">
              <h2>Projects</h2>
              <div>
                <CreateProjectDialog />
              </div>
            </div>
            <div className="table-card-body">
              {this.state.fetching
                ? <CircularProgress />
                :
                <div>
                  <p>{this.state.message}</p>
                  {this.state.projects.length > 0 ? <ProjectListTable projects={this.state.projects} /> : '' }
                </div>
              }
            </div>
          </Card>
          : <p>Access denied</p>
        }
      </div>
    );
  }
}

export default ProjectList;
