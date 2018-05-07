import React from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogContentText from 'material-ui/Dialog/DialogContentText';
import DialogActions from 'material-ui/Dialog/DialogActions';
import PropTypes from 'prop-types';

const ConfirmDialog = props => (
  <Dialog
    open={props.dialogOpen}
    onClose={props.closeDialog}
    disableBackdropClick
    // disableEscapeKeyDown
  >
    <DialogTitle>{props.titleText}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {props.contentText}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.closeDialog}>
        Cancel
      </Button>
      <Button onClick={props.action} color="secondary">
        {props.actionButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  titleText: PropTypes.string,
  contentText: PropTypes.string,
  action: PropTypes.func.isRequired,
  actionButtonText: PropTypes.string,
};

ConfirmDialog.defaultProps = {
  titleText: '',
  contentText: '',
  actionButtonText: 'OK',
};

export default ConfirmDialog;
