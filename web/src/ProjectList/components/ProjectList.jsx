import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from 'material-ui/Card';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import ProjectListTable from './ProjectListTable';

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
    axios.get('/api/projects')
      .then((res) => {
        if (res.data.projects !== null) {
        // sort newest first
          const projects = res.data.projects
            .sort((a, b) => new Date(b.Created) - new Date(a.Created));
          this.setState({ projects, fetching: false });
        } else {
          this.setState({ message: 'No projects found.', fetching: false });
        }
      })
      .catch((err) => {
        if (err.response.status === 403) {
          this.setState({ message: 'Access denied', fetching: false, hideContent: true });
        } else {
          this.setState({ message: 'Something went wrong.', fetching: false });
        }
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
                <Link to="/projects/new" className="button-link">
                  <Button variant="raised" className="primary-button text-button">
                    <i className="material-icons text-button-icon">add_circle_outline</i>Add project
                  </Button>
                </Link>
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
