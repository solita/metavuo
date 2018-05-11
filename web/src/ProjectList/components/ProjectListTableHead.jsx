import React from 'react';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

const ProjectListTableHead = () => (
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

export default ProjectListTableHead;

