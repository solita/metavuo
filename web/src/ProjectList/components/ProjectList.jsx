import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import ProjectListTable from './ProjectListTable';
import '../css/ProjectList.scss';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      fetching: true,
      message: '',
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
      .catch(() => {
        this.setState({ message: 'Something went wrong.', fetching: false });
      });
  }

  render() {
    return (
      <div>
        <div className="flex-row">
          <h2>Projects</h2>
          <Link to="/projects/new" className="project-button-link">
            <Button variant="fab" mini>
              <i className="material-icons">add</i>
            </Button>
          </Link>
        </div>
        {this.state.fetching
          ? <CircularProgress />
          :
          <div>
            <p>{this.state.message}</p>
            {this.state.projects.length > 0 ? <ProjectListTable projects={this.state.projects} /> : '' }
          </div>
        }
      </div>
    );
  }
}

export default ProjectList;
