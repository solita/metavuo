import React from 'react';
import ProjectListTable from './ProjectListTable';


class ProjectList extends React.Component {
  render() {
    return (
      <div>
        <h2>Project list page</h2>
        {<ProjectListTable />}
      </div>
    );
  }
}

export default ProjectList;
