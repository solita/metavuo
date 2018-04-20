import React from 'react';
import { TableCell, TableHead, TableRow} from 'material-ui';

class ProjectListTableHead extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TableHead>
        <TableRow>
          <TableCell>
              Project ID
          </TableCell>
          <TableCell>
                Project Name
          </TableCell>
          <TableCell>
                Creation Date
          </TableCell>
          <TableCell>
                Description
          </TableCell>
          <TableCell>
                Project Status
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }
}

export default ProjectListTableHead;

