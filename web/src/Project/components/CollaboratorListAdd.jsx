import React from 'react';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import PropTypes from 'prop-types';

class CollaboratorListAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isOpen: false,
      userEmail: '',
      message: '',
    };
    this.openAddCollaboratorDialog = this.openAddCollaboratorDialog.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  getUsers() {
    this.setState({ message: '' });
    axios.get('/api/users')
      .then((res) => {
        if (res.data !== null) {
          let users = res.data;
          users = users.filter(user => (
            this.props.collaborators.every(u2 => user.email !== u2.email)));
          this.setState({ users });
        }
      })
      .catch(() => {
        this.setState({ message: 'Problem getting users' });
      });
  }

  openAddCollaboratorDialog() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    this.setState({ message: '' });
    event.preventDefault();
    const data = new FormData();
    data.append('email', this.state.userEmail);
    axios.post(`/api/projects/${this.props.projectId}/collaborators`, data)
      .then(() => {
        this.setState({ isOpen: false });
        this.props.collaboratorAddSuccess();
      })
      .catch(() => {
        this.setState({ message: 'Problem adding collaborator' });
      });
  }

  render() {
    return (
      <div>
        {this.state.message && <p>{this.state.message}</p>}
        <Button variant="raised" className="primary-button text-button" onClick={this.openAddCollaboratorDialog}>
          <i className="material-icons text-button-icon">add_circle_outline</i>Add collaborator
        </Button>
        <p className="message-errors">{this.props.message}</p>
        <Dialog
          open={this.state.isOpen}
          onClose={this.handleClose}
          onEnter={this.getUsers}
          disableBackdropClick
        >
          <DialogTitle className="dialog-header">Add collaborator</DialogTitle>
          <DialogContent>
            <FormControl>
              <InputLabel htmlFor="user-select">User</InputLabel>
              <Select
                value={this.state.userEmail}
                onChange={this.handleChange}
                name="userEmail"
                id="user-select"
                autoWidth
              >
                <MenuItem value="" disabled />
                {this.state.users.map(user => (
                  <MenuItem key={user.email} value={user.email}>
                    {user.name}, {user.email}, {user.organization}
                  </MenuItem>
                ))
                }
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button className="secondary-button text-button" onClick={this.handleClose}>
              <i className="material-icons text-button-icon">close</i>Cancel
            </Button>
            <Button
              type="submit"
              variant="raised"
              className="primary-button text-button"
              onClick={this.handleSubmit}
            >
              <i className="material-icons text-button-icon">add_circle_outline</i>Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CollaboratorListAdd.propTypes = {
  projectId: PropTypes.string.isRequired,
  collaborators: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
  })),
  collaboratorAddSuccess: PropTypes.func.isRequired,
  message: PropTypes.string,
};

CollaboratorListAdd.defaultProps = {
  collaborators: [],
  message: '',
};

export default CollaboratorListAdd;
