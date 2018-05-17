import React from 'react';
import axios from 'axios';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import { Button, FormControl, Select, MenuItem, InputLabel } from 'material-ui';
import PropTypes from 'prop-types';
import '../css/CollaboratorListAdd.scss';

class CollaboratorListAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isOpen: false,
      userId: '',
      message: '',
    };
    this.openCollaboratorDialog = this.openCollaboratorDialog.bind(this);
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
          this.setState({ users: res.data });
        }
      })
      .catch(() => {
        this.setState({ message: 'Problem getting users' });
      });
  }

  openCollaboratorDialog() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData();
    data.append('id', this.props.projectId);
    data.append('user_id', this.state.userId);
    axios.post(`/api/projects/${this.props.projectId}/collaborators`, data)
      .then((res) => {
        console.log(res);
        this.setState({ isOpen: false });
      })
      .catch(() => {
        this.setState({ message: 'Problem adding collaborator' });
      });
  }

  render() {
    return (
      <div>
        {this.state.message && <p>{this.state.message}</p>}
        <Button
          variant="fab"
          onClick={this.openCollaboratorDialog}
        >
          <i className="material-icons">add</i>
        </Button>
        <Dialog
          open={this.state.isOpen}
          onClose={this.handleClose}
          onEnter={this.getUsers}
        >
          <DialogTitle>Add collaborator</DialogTitle>
          <DialogContent>
            <FormControl>
              <InputLabel htmlFor="user-select">User</InputLabel>
              <Select
                value={this.state.userId}
                onChange={this.handleChange}
                name="userId"
                id="user-select"
                displayEmpty
              >
                <MenuItem value="" />
                {this.state.users.map(user => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    {user.name}, {user.email}, {user.organization}
                  </MenuItem>
                ))
                }
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button type="submit" id="submit-project" variant="raised" color="primary" onClick={this.handleSubmit}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CollaboratorListAdd.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default CollaboratorListAdd;
