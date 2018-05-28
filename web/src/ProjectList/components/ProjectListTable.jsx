import React from 'react';
import { withRouter } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import ProjectListTableHead from './ProjectListTableHead';
import convertStatus from '../../common/util/ProjectStatusConverter';

const ProjectListTable = props => (
  <Table>
    <ProjectListTableHead />
    <TableBody>
      {props.projects.map(project => (
        <TableRow key={project.ID} hover onClick={() => props.history.push(`/projects/${project.ID}`)}>
          <TableCell>{project.project_id}</TableCell>
          <TableCell>{project.project_name}</TableCell>
          <TableCell>{new Date(Date.parse(project.Created)).toLocaleDateString()}</TableCell>
          <TableCell>{project.project_description} </TableCell>
          <TableCell>{convertStatus(project.project_status)} </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

ProjectListTable.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    project_id: PropTypes.string.isRequired,
    project_name: PropTypes.string.isRequired,
    Created: PropTypes.string.isRequired,
    project_description: PropTypes.string.isRequired,
    project_status: PropTypes.number.isRequired,
  })).isRequired,
};

export default withRouter(ProjectListTable);
