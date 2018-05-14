import React from 'react';
import axios from 'axios';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import ConfirmDialog from '../../common/components/ConfirmDialog';

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDialogOpen: false,
      users: [],
      message: '',
      removeUserId: '',
      removeUser: '',
      delDialogOpen: false,
      deleting: false,
    };
    this.openUserDialog = this.openUserDialog.bind(this);
    this.closeUserDialog = this.closeUserDialog.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.deleteUserClick = this.deleteUserClick.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
  }

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    axios.get('/api/admin/users')
      .then((res) => {
        if (res.data !== null) {
          this.setState({ users: res.data, deleting: false });
        }
      })
      .catch(() => {
        this.setState({ message: 'Could not get users', deleting: false });
      });
  }

  deleteUserClick(userId, userName) {
    this.setState({ delDialogOpen: true, removeUserId: userId, removeUser: userName });
  }

  deleteUser(userId, userName) {
    console.log(`deleting user ${userId} ${userName}`);
    this.setState({ delDialogOpen: false });
    axios.delete(`/api/admin/users/${userId}`)
      .then((res) => {
        if (res.status === 204) {
          this.setState({ deleting: true });
          setTimeout(() => {
            this.getUsers();
          }, 500);
        }
      })
      .catch(() => {
        this.setState({ message: `User ${userName} couldn't be removed.` });
      });
  }

  openUserDialog() {
    this.setState({ userDialogOpen: true });
  }

  closeUserDialog() {
    this.setState({ userDialogOpen: false });
  }

  closeForm() {
    setTimeout(() => {
      this.closeUserDialog();
      this.getUsers();
    }, 500);
  }

  closeDelDialog() {
    this.setState({ delDialogOpen: false, removeUserId: '', removeUser: '' });
  }

  render() {
    return (
      <div>
        <h2>Admin panel</h2>
        <p>{this.state.message}</p>
        <Button variant="raised" color="primary" onClick={this.openUserDialog}>
          <i className="material-icons icon-left">add</i>Add user
        </Button>

        {this.state.users.length > 0
          ? <UserList
            users={this.state.users}
            deleteUser={this.deleteUserClick}
            deleting={this.state.deleting}
          />
          : <p>No users added</p>
        }

        <Dialog
          open={this.state.userDialogOpen}
          onClose={this.closeUserDialog}
          disableBackdropClick
        >
          <DialogActions>
            <Button onClick={this.closeUserDialog}>
              Close<i className="material-icons icon-right">close</i>
            </Button>
          </DialogActions>
          <DialogTitle>Add user</DialogTitle>
          <DialogContent>
            <AddUserForm
              closeForm={this.closeForm}
            />
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          dialogOpen={this.state.delDialogOpen}
          closeDialog={this.closeDelDialog}
          titleText="Remove user"
          contentText={`Are you sure you want to remove user ${this.state.removeUser} permanently?`}
          action={() => this.deleteUser(this.state.removeUserId, this.state.removeUser)}
          actionButtonText="Delete user"
        />
      </div>
    );
  }
}

export default AdminView;
