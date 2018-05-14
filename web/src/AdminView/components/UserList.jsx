import React from 'react';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.deleteUser = this.deleteUser.bind(this);
  }

  deleteUser(userId, userName) {
    this.props.deleteUser(userId, userName);
  }

  render() {
    return (
      <div>
        <h3>Users</h3>
        <Paper>
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
              {this.props.users.map(user => (
                <TableRow key={user.email}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.organization}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => this.deleteUser(user.user_id, user.name)}
                      disabled={this.props.deleting}
                    >
                      <i className="material-icons">delete</i>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  })),
  deleteUser: PropTypes.func.isRequired,
  deleting: PropTypes.bool.isRequired,
};

UserList.defaultProps = {
  users: [],
};

export default UserList;
