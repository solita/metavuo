import React from 'react';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import PropTypes from 'prop-types';
import AddUserForm from './AddUserForm';

const AdminAddUserDialog = props => (
  <Dialog
    open={props.dialogOpen}
    onClose={props.closeDialog}
    disableBackdropClick
  >
    <DialogTitle className="dialog-header">Add user</DialogTitle>
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
