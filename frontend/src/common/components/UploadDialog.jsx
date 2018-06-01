import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import PropTypes from 'prop-types';
import FileUpload from './FileUpload';

const UploadDialog = props => (
  <Dialog
    open={props.dialogOpen}
    onClose={props.closeDialog}
    disableBackdropClick
  >
    <DialogTitle className="dialog-header">{props.titleText}</DialogTitle>
    <DialogContent>
      <FileUpload
        url={props.url}
        passResponse={props.passResponse}
        closeDialog={props.closeDialog}
      />
    </DialogContent>
  </Dialog>
);

UploadDialog.propTypes = {
  titleText: PropTypes.string,
  url: PropTypes.string.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  passResponse: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  titleText: '',
};

export default UploadDialog;
