import React from 'react';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

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

