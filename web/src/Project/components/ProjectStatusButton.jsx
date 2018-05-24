import React from 'react';
import Button from 'material-ui/Button';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/Menu/MenuItem';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../css/ProjectStatusButton.scss';

const options = [
  'Change status:',
  'In Progress',
  'Complete',
  'Archived',
];

class ProjectStatusButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleSubmit(event, index) {
    event.preventDefault();
    if (index !== this.props.projectStatus) {
      const data = new FormData();
      data.append('status', index);
      axios.post(`/api/projects/${this.props.projectId}/status`, data)
        .then((res) => {
          this.props.setStatus(res.data);
        });
    }
    this.setState({ anchorEl: null });
  }
  render() {
    return (
      <div>
        <Button
          variant="raised"
          className="primary-button text-button"
          onClick={this.handleClick}
        >
          <i className="material-icons text-button-icon">update</i>Change
        </Button>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option}
              disabled={index === 0}
              onClick={event => this.handleSubmit(event, index)}
            >
              {this.props.projectStatus === index ? <span className="selected-item">{option}</span> : option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

ProjectStatusButton.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectStatus: PropTypes.number.isRequired,
  setStatus: PropTypes.func.isRequired,
};

export default ProjectStatusButton;
