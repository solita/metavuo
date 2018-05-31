import React from 'react';
import { withRouter } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import ProjectListTableHead from './ProjectListTableHead';
import convertStatus from '../../common/util/ProjectStatusConverter';
import LocaleConverter from '../../common/util/LocaleConverter';
import '../css/ProjectListTable.scss';

const ProjectListTable = props => (
  <div>
    <Table>
      <ProjectListTableHead />
      <TableBody>
        {props.projects.map(project => (
          <TableRow key={project.ID} hover onClick={() => props.history.push(`/projects/${project.ID}`)}>
            <TableCell>{project.project_id}</TableCell>
            <Tooltip id="name-tooltip" title={project.project_name} palecemnt="bottom">
              <TableCell className="projectlist-td">{project.project_name}</TableCell>
            </Tooltip>
            <TableCell>{LocaleConverter(project.created_at)}</TableCell>
            <Tooltip id="description-tooltip" title={project.project_description} palecemnt="bottom">
              <TableCell className="projectlist-td">{project.project_description} </TableCell>
            </Tooltip>
            <TableCell>{convertStatus(project.project_status)} </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

ProjectListTable.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    project_id: PropTypes.string.isRequired,
    project_name: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    project_description: PropTypes.string.isRequired,
    project_status: PropTypes.number.isRequired,
  })).isRequired,
};

export default withRouter(ProjectListTable);
