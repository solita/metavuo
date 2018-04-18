import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
    };
  }

  componentDidMount() {
    axios.get('/api/projects')
      .then((res) => {
        console.log(res.data);
        this.setState({ projects: res.data.projects });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <h2>Project list page</h2>
        <ul>
          {this.state.projects.map(project => <li><Link to={`/projects/${project}`}>{project}</Link></li>)}
        </ul>
      </div>
    );
  }
}

export default ProjectList;
