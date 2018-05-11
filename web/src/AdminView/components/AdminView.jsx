import React from 'react';
import axios from 'axios';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import AddUserForm from './AddUserForm';
import UserList from './UserList';

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDialogOpen: false,
      users: [],
      message: '',
    };
    this.openUserDialog = this.openUserDialog.bind(this);
    this.closeUserDialog = this.closeUserDialog.bind(this);
    this.closeForm = this.closeForm.bind(this);
  }

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    axios.get('/api/admin/users')
      .then((res) => {
        if (res.data !== null) {
          this.setState({ users: res.data });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ message: 'Could not get users' });
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
    this.getUsers();
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
          ? <UserList users={this.state.users} />
          : <p>No users added</p>
        }
        <Dialog
          open={this.state.userDialogOpen}
          onClose={this.closeUserDialog}
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
      </div>
    );
  }
}

export default AdminView;
