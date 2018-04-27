import { Paper, Table, TableBody, TableCell, TableRow } from 'material-ui';
import { Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios/index';
import ProjectListTableHead from './ProjectListTableHead';


class ProjectListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
    };
  }

  componentDidMount() {
    axios.get('/api/projects')
      .then((res) => {
        this.setState({ projects: res.data.projects });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    if (!this.state.projects || this.state.projects.length === 0) {
      return (<p>Loading</p>);
    }
    return (
      <div>
        <Paper>
          <Table>
            <ProjectListTableHead headerData={this.state.projects} />
            <TableBody>
              {this.state.projects.map(project => (
                <TableRow key={project.ID}>
                  <TableCell>{project.project_id}</TableCell>
                  <TableCell>
                    <Link to={`/projects/${project.ID}`}>{project.project_name}</Link>
                  </TableCell>
                  <TableCell>{new Date(Date.parse(project.Created)).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{project.project_description} </TableCell>
                  <TableCell>{project.project_status.text} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>

    );
  }
}


export default ProjectListTable;
