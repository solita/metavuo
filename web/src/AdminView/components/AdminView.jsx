import React from 'react';
import axios from 'axios';
import Button from 'material-ui/Button';
import UserList from './UserList';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import AdminAddUserDialog from './AdminAddUserDialog';
import UpdateInfoDialog from './UpdateInfoDialog';

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
      infoDialogOpen: false,
    };
    this.openUserDialog = this.openUserDialog.bind(this);
    this.closeUserDialog = this.closeUserDialog.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.deleteUserClick = this.deleteUserClick.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
    this.openInfoDialog = this.openInfoDialog.bind(this);
    this.closeInfoDialog = this.closeInfoDialog.bind(this);
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

  openInfoDialog() {
    this.setState({ infoDialogOpen: true });
  }

  closeInfoDialog() {
    this.setState({ infoDialogOpen: false });
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
        <Button variant="raised" color="primary" style={{ margin: 12 }} onClick={this.openUserDialog}>
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

        <Button variant="raised" color="primary" style={{ margin: 12 }} onClick={this.openInfoDialog}>
          <i className="material-icons icon-left">update</i>Update info text
        </Button>

        <AdminAddUserDialog
          dialogOpen={this.state.userDialogOpen}
          closeDialog={this.closeUserDialog}
          closeForm={this.closeForm}
        />

        <ConfirmDialog
          dialogOpen={this.state.delDialogOpen}
          closeDialog={this.closeDelDialog}
          titleText="Remove user"
          contentText={`Are you sure you want to remove user ${this.state.removeUser} permanently?`}
          action={() => this.deleteUser(this.state.removeUserId, this.state.removeUser)}
          actionButtonText="Delete user"
        />

        <UpdateInfoDialog
          dialogOpen={this.state.infoDialogOpen}
          closeDialog={this.closeInfoDialog}
        />
      </div>
    );
  }
}

export default AdminView;
