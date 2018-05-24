import React from 'react';
import axios from 'axios';
import Card from 'material-ui/Card';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import AdminAddUserDialog from './AdminAddUserDialog';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDialogOpen: false,
      users: [],
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

  deleteUser(e, userId, userName) {
    e.preventDefault();
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
    this.closeUserDialog();
    setTimeout(() => {
      this.getUsers();
    }, 500);
  }

  closeDelDialog() {
    this.setState({ delDialogOpen: false, removeUserId: '', removeUser: '' });
  }

  render() {
    return (
      <div>
        <Card className="table-card">
          <div className="table-card-head">
            <h2>Users</h2>
            <Button variant="raised" className="primary-button text-button" onClick={this.openUserDialog}>
              <i className="material-icons text-button-icon">add_circle_outline</i>Add user
            </Button>
          </div>
          <div className="table-card-body">
            {this.state.message && <p>{this.state.message}</p>}
            {this.state.users.length > 0
            ?
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Added</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.users.map(user => (
                    <TableRow key={user.email}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.organization}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Tooltip title="Delete" placement="right">
                          <Button
                            className="transparent-button"
                            onClick={e => this.deleteUser(e, user.user_id, user.name)}
                            disabled={this.state.deleting}
                          >
                            <i className="material-icons">delete</i>
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            : <p>No users added</p>
            }
          </div>
        </Card>

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
      </div>
    );
  }
}

export default UserList;
