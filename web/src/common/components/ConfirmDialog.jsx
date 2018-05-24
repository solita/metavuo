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
  >
    <DialogTitle className="dialog-header">
      <i className="material-icons text-button-icon">error</i>{props.titleText}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {props.contentText}
      </DialogContentText>
      <DialogActions>
        <Button onClick={props.closeDialog} className="secondary-button text-button" autoFocus>
          <i className="material-icons text-button-icon">close</i>Cancel
        </Button>
        <Button onClick={props.action} className="primary-button text-button">
          <i className="material-icons text-button-icon">done</i>{props.actionButtonText}
        </Button>
      </DialogActions>
    </DialogContent>
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
