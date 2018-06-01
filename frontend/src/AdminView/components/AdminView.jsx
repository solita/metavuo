import React from 'react';
import Button from '@material-ui/core/Button';
import UserList from './UserList';
import UpdateInfoDialog from './UpdateInfoDialog';

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoDialogOpen: false,
    };
    this.openInfoDialog = this.openInfoDialog.bind(this);
    this.closeInfoDialog = this.closeInfoDialog.bind(this);
  }

  openInfoDialog() {
    this.setState({ infoDialogOpen: true });
  }

  closeInfoDialog() {
    this.setState({ infoDialogOpen: false });
  }

  render() {
    return (
      <div>
        <h1>Admin panel</h1>
        <div className="page-divider">
          <UserList />
        </div>
        <Button variant="raised" className="primary-button text-button" onClick={this.openInfoDialog}>
          <i className="material-icons text-button-icon">update</i>Update info text
        </Button>
        <UpdateInfoDialog
          dialogOpen={this.state.infoDialogOpen}
          closeDialog={this.closeInfoDialog}
        />
      </div>
    );
  }
}

export default AdminView;
