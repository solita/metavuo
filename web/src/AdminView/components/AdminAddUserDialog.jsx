import React from 'react';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import AddUserForm from './AddUserForm';

const AdminAddUserDialog = props => (
  <Dialog
    open={props.dialogOpen}
    onClose={props.closeDialog}
    disableBackdropClick
  >
    <DialogActions>
      <Button onClick={props.closeDialog}>
        Close<i className="material-icons icon-right">close</i>
      </Button>
    </DialogActions>
    <DialogTitle>Add user</DialogTitle>
    <DialogContent>
      <AddUserForm closeForm={props.closeForm} />
    </DialogContent>
  </Dialog>
);

AdminAddUserDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
};

export default AdminAddUserDialog;
