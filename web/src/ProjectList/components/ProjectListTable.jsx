import React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import PropTypes from 'prop-types';
import ProjectListTableHead from './ProjectListTableHead';
import convertStatus from '../../common/util/ProjectStatusConverter';

const ProjectListTable = props => (
  <div>
    <Paper>
      <Table>
        <ProjectListTableHead />
        <TableBody>
          {props.projects.map(project => (
            <TableRow key={project.ID}>
              <TableCell>{project.project_id}</TableCell>
              <TableCell>
                <Link to={`/projects/${project.ID}`}>{project.project_name}</Link>
              </TableCell>
              <TableCell>{new Date(Date.parse(project.Created)).toLocaleDateString()}
              </TableCell>
              <TableCell>{project.project_description} </TableCell>
              <TableCell>{convertStatus(project.project_status)} </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </div>
);

ProjectListTable.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default ProjectListTable;
