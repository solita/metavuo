import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import ProjectListTable from './ProjectListTable';
import '../css/ProjectList.scss';

class ProjectList extends React.Component {
  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={4}>
            <h2>Project list page</h2>
          </Grid>
          <Grid item xs={8} className="button-container">
            <Link to="/projects/new" className="button-link">
              <Button variant="fab" mini>
                <i className="material-icons">add</i>
              </Button>
            </Link>
          </Grid>
        </Grid>
        {<ProjectListTable />}
      </div>
    );
  }
}

export default ProjectList;
